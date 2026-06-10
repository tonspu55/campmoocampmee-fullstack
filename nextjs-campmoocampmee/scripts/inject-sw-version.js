#!/usr/bin/env node
/**
 * Inject build timestamp into service worker for cache invalidation.
 * Run via `next build` postbuild hook — see package.json "postbuild" script.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SW_PATH = join(process.cwd(), "public", "sw.js");
const PLACEHOLDER = '"__SW_BUILD_TIMESTAMP__"';

try {
  const swContent = readFileSync(SW_PATH, "utf-8");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const injected = swContent.replace(PLACEHOLDER, `"${timestamp}"`);
  writeFileSync(SW_PATH, injected, "utf-8");
  console.log(`[SW] Cache version injected: ${timestamp}`);
} catch (err) {
  console.error("[SW] Failed to inject timestamp:", err.message);
  // Don't block build — SW will still work with placeholder
}
