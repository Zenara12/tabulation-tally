-- Preserve existing contestant images while introducing the new field names.
ALTER TABLE "contestants" RENAME COLUMN "photoUrl" TO "cosplayPictureUrl";
ALTER TABLE "contestants" ADD COLUMN "cosplay" TEXT;
