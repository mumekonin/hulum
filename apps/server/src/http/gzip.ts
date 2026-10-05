import type { RequestHandler } from "express";
import { gzipSync } from "node:zlib";

const MIN_BYTES = 1024;

/**
 * Gzip JSON bodies the browser said it can decode. Small payloads stay uncompressed.
 */
export function gzipJsonMiddleware(): RequestHandler {
  return (req, res, next) => {
    const accept = req.headers["accept-encoding"];
    if (typeof accept !== "string" || !/\bgzip\b/i.test(accept)) {
      next();
      return;
    }

    const sendJson = res.json.bind(res);
    res.json = ((body: unknown) => {
      try {
        const raw = Buffer.from(JSON.stringify(body));
        if (raw.length < MIN_BYTES) {
          return sendJson(body);
        }
        const compressed = gzipSync(raw);
        if (compressed.length >= raw.length) {
          return sendJson(body);
        }
        res.setHeader("Content-Encoding", "gzip");
        res.append("Vary", "Accept-Encoding");
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.setHeader("Content-Length", String(compressed.length));
        return res.end(compressed);
      } catch {
        return sendJson(body);
      }
    }) as typeof res.json;

    next();
  };
}
