import { get as httpsGet } from "node:https";

/**
 * GET a URL via Node's built-in https (NOT global fetch/undici). GDELT's TLS
 * handshake often runs ~11s, past undici's fixed 10s connectTimeout, which can't
 * be raised without importing undici (not installed). https honors a plain socket
 * timeout and follows redirects (some feeds 30x). Shared by every El Cable source.
 */
export function httpGetText(
  url: string,
  opts: { timeoutMs?: number; redirects?: number } = {},
): Promise<{ status: number; text: string }> {
  const { timeoutMs = 30000, redirects = 3 } = opts;
  return new Promise((resolve, reject) => {
    const req = httpsGet(
      url,
      {
        headers: {
          "User-Agent": "quien-gana/1.0 (+https://quien-gana.vercel.app)",
        },
        timeout: timeoutMs,
      },
      (res) => {
        const status = res.statusCode ?? 0;
        const loc = res.headers.location;
        if (status >= 300 && status < 400 && loc && redirects > 0) {
          res.resume(); // drain the socket before following
          resolve(
            httpGetText(new URL(loc, url).toString(), {
              timeoutMs,
              redirects: redirects - 1,
            }),
          );
          return;
        }
        let data = "";
        res.setEncoding("utf8");
        res.on("data", (c) => (data += c));
        res.on("end", () => resolve({ status, text: data }));
      },
    );
    req.on("timeout", () =>
      req.destroy(new Error(`socket timeout after ${timeoutMs}ms`)),
    );
    req.on("error", reject);
  });
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
