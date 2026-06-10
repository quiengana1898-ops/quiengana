import { StagingTable } from "@/app/admin/staging/staging-table";
import { getStagedContracts } from "@/lib/queries/admin";

export default async function StagingPage() {
  const contracts = await getStagedContracts(200);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-medium">Staging review</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Ingested contracts, not yet public. Select rows and publish in bulk, or
          publish all. Publishing promotes the contract and its contractor; reject
          removes it. Every action is audited.
        </p>
      </div>
      <StagingTable contracts={contracts} />
    </div>
  );
}
