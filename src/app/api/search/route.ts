import { searchActors } from "@/lib/queries/search";

// Typeahead endpoint for the homepage actor search. Reads live data per request.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q") ?? "";
  const results = await searchActors(q, 8);
  return Response.json({ results });
}
