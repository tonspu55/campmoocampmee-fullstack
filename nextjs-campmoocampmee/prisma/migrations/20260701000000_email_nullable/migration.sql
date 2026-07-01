-- Phone-only users have no email; allow NULL. The @unique index still permits
-- multiple NULLs in Postgres, so many phone users can coexist without an email.
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL;
