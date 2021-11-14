-- DropForeignKey
ALTER TABLE "ClaimCode" DROP CONSTRAINT "ClaimCode_questId_fkey";

-- DropForeignKey
ALTER TABLE "ClaimEmail" DROP CONSTRAINT "ClaimEmail_questId_fkey";

-- AddForeignKey
ALTER TABLE "ClaimCode" ADD CONSTRAINT "ClaimCode_questId_fkey" FOREIGN KEY ("questId") REFERENCES "Quest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimEmail" ADD CONSTRAINT "ClaimEmail_questId_fkey" FOREIGN KEY ("questId") REFERENCES "Quest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
