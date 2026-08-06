/*
  Warnings:

  - You are about to drop the column `photoUrl` on the `contestants` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "contestants" DROP COLUMN "photoUrl",
ADD COLUMN     "cosplay" TEXT,
ADD COLUMN     "cosplayPictureUrl" TEXT;
