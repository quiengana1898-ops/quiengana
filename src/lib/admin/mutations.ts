// Admin staging mutations (publish / reject) with audit. Plain module (no
// server-only / no auth) so it's unit-testable; the server actions in
// app/admin/actions.ts wrap these with the role check. NEVER call these without
// having verified the caller is a moderator/admin.
import { eq } from "drizzle-orm";

import { db, schema } from "@/lib/db";

const { entities, federalContracts, recordRevisions } = schema;

type ChangeType = "publish" | "unpublish" | "soft_delete" | "update";

async function audit(
  changedBy: string,
  tableName: string,
  recordId: string,
  changeType: ChangeType,
  reason?: string,
) {
  await db
    .insert(recordRevisions)
    .values({ tableName, recordId, changedBy, changeType, reason });
}

/** Publish a staged contract + its contractor (a contract joins to its contractor). */
export async function promoteContract(userId: string, id: string) {
  const [contract] = await db
    .update(federalContracts)
    .set({ isPublished: true })
    .where(eq(federalContracts.id, id))
    .returning({
      id: federalContracts.id,
      contractorId: federalContracts.contractorId,
    });
  if (!contract) throw new Error("Contract not found");

  await db
    .update(entities)
    .set({ isPublished: true, updatedAt: new Date() })
    .where(eq(entities.id, contract.contractorId));

  await audit(userId, "federal_contracts", contract.id, "publish");
  await audit(userId, "entities", contract.contractorId, "publish", "auto: contractor of published contract");
}

/** Reject a staged contract (never public → hard delete, audited). */
export async function rejectContractRow(userId: string, id: string) {
  await db.delete(federalContracts).where(eq(federalContracts.id, id));
  await audit(userId, "federal_contracts", id, "soft_delete", "rejected in staging review");
}

export async function promoteEntity(userId: string, id: string) {
  await db
    .update(entities)
    .set({ isPublished: true, updatedAt: new Date() })
    .where(eq(entities.id, id));
  await audit(userId, "entities", id, "publish");
}

export async function rejectEntityRow(userId: string, id: string) {
  await db
    .update(entities)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(entities.id, id));
  await audit(userId, "entities", id, "soft_delete", "rejected in staging review");
}
