"use server";

import { revalidatePath } from "next/cache";

import {
  promoteContract,
  promoteContracts,
  promoteEntity,
  rejectContractRow,
  rejectEntityRow,
} from "@/lib/admin/mutations";
import { getModeratorContext } from "@/lib/auth";

// Each action re-verifies moderator/admin server-side — never trusts the layout.
async function requireModerator() {
  const ctx = await getModeratorContext();
  if (!ctx) throw new Error("Not authorized");
  return ctx;
}

export async function publishContract(id: string) {
  const ctx = await requireModerator();
  await promoteContract(ctx.userId, id);
  revalidatePath("/admin/staging");
  return { ok: true };
}

export async function publishContracts(ids: string[]) {
  const ctx = await requireModerator();
  const count = await promoteContracts(ctx.userId, ids);
  revalidatePath("/admin/staging");
  return { ok: true, count };
}

export async function rejectContract(id: string) {
  const ctx = await requireModerator();
  await rejectContractRow(ctx.userId, id);
  revalidatePath("/admin/staging");
  return { ok: true };
}

export async function publishEntity(id: string) {
  const ctx = await requireModerator();
  await promoteEntity(ctx.userId, id);
  revalidatePath("/admin/staging");
  return { ok: true };
}

export async function rejectEntity(id: string) {
  const ctx = await requireModerator();
  await rejectEntityRow(ctx.userId, id);
  revalidatePath("/admin/staging");
  return { ok: true };
}
