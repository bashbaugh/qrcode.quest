-- CreateEnum
CREATE TYPE "VictoryFulfillmentType" AS ENUM ('CLAIM_CODE', 'COLLECT_EMAIL');

-- CreateTable
CREATE TABLE "User" (
    "uid" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "Quest" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "enableQuest" BOOLEAN NOT NULL DEFAULT true,
    "victoryFulfillment" "VictoryFulfillmentType" NOT NULL DEFAULT E'CLAIM_CODE',
    "enableConfetti" BOOLEAN NOT NULL DEFAULT true,
    "completionNote" TEXT NOT NULL DEFAULT E'',
    "completionsCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Quest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Code" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "questId" INTEGER,
    "order" INTEGER NOT NULL,
    "scans" INTEGER NOT NULL,
    "name" TEXT,
    "note" TEXT,

    CONSTRAINT "Code_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClaimCode" (
    "id" SERIAL NOT NULL,
    "code" INTEGER NOT NULL,
    "claimed" BOOLEAN NOT NULL,
    "questId" INTEGER NOT NULL,

    CONSTRAINT "ClaimCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClaimEmail" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "questId" INTEGER NOT NULL,

    CONSTRAINT "ClaimEmail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Quest_slug_key" ON "Quest"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Code_slug_key" ON "Code"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ClaimCode_questId_code_key" ON "ClaimCode"("questId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "ClaimEmail_questId_email_key" ON "ClaimEmail"("questId", "email");

-- AddForeignKey
ALTER TABLE "Quest" ADD CONSTRAINT "Quest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Code" ADD CONSTRAINT "Code_questId_fkey" FOREIGN KEY ("questId") REFERENCES "Quest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimCode" ADD CONSTRAINT "ClaimCode_questId_fkey" FOREIGN KEY ("questId") REFERENCES "Quest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimEmail" ADD CONSTRAINT "ClaimEmail_questId_fkey" FOREIGN KEY ("questId") REFERENCES "Quest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
