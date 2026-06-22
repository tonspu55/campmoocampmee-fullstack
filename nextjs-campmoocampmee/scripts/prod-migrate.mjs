// Run `prisma migrate deploy` only on Vercel Production builds.
// Preview deployments and local builds skip it (they shouldn't touch the prod DB).
// VERCEL_ENV is set automatically by Vercel: "production" | "preview" | "development".
import { execSync } from "node:child_process";

const env = process.env.VERCEL_ENV;

if (env === "production") {
  console.log("[prod-migrate] VERCEL_ENV=production → applying migrations");
  execSync("prisma migrate deploy", { stdio: "inherit" });
} else {
  console.log(`[prod-migrate] skipping migrations (VERCEL_ENV=${env ?? "unset"})`);
}
