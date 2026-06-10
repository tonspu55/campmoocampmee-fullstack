-- Enable Row Level Security on all Better Auth tables.
-- No policies are created, so the Supabase Data API (anon/authenticated roles)
-- is denied all access by default. Prisma connects via the postgres role and
-- bypasses RLS, so the application is unaffected.

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Verification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
