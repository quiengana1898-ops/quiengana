import { Inngest } from "inngest";

// Inngest client for Quién Gana ingestion jobs. Event/signing keys come from env
// (INNGEST_EVENT_KEY / INNGEST_SIGNING_KEY) in deployed environments; the local
// Inngest dev server needs neither.
export const inngest = new Inngest({ id: "quien-gana" });
