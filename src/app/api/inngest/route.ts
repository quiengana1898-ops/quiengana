import { serve } from "inngest/next";

import { inngest } from "@/lib/inngest/client";
import { functions } from "@/lib/inngest/functions";

// Inngest endpoint. Excluded from locale routing by the proxy matcher (api/*).
export const { GET, POST, PUT } = serve({ client: inngest, functions });
