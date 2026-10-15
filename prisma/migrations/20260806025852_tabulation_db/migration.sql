/*
  Warnings:

  - `photoUrl` is being moved to `cosplayPictureUrl` so existing reference images are preserved.

*/
-- Preserve the existing image URL before removing the legacy column.
ALTER TABLE "contestants" ADD COLUMN "cosplayPictureUrl" TEXT;
UPDATE "contestants" SET "cosplayPictureUrl" = "photoUrl" WHERE "photoUrl" IS NOT NULL;
ALTER TABLE "contestants" DROP COLUMN "photoUrl";

-- Temporary name retained for the following migration, which renames it to
-- characterName.
ALTER TABLE "contestants" ADD COLUMN "cosplay" TEXT;
