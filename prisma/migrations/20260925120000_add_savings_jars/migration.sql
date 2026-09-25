-- CreateEnum
CREATE TYPE "JarMovementType" AS ENUM ('DEPOSIT', 'WITHDRAW');

-- CreateTable
CREATE TABLE "SavingsJar" (
    "id" TEXT NOT NULL,
    "household_id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "target_amount" DECIMAL(10,2),
    "color" TEXT,
    "icon" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavingsJar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JarMovement" (
    "id" TEXT NOT NULL,
    "jar_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "JarMovementType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JarMovement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SavingsJar_household_id_idx" ON "SavingsJar"("household_id");

-- CreateIndex
CREATE INDEX "SavingsJar_account_id_idx" ON "SavingsJar"("account_id");

-- CreateIndex
CREATE INDEX "JarMovement_jar_id_idx" ON "JarMovement"("jar_id");

-- AddForeignKey
ALTER TABLE "SavingsJar" ADD CONSTRAINT "SavingsJar_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "Household"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavingsJar" ADD CONSTRAINT "SavingsJar_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavingsJar" ADD CONSTRAINT "SavingsJar_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JarMovement" ADD CONSTRAINT "JarMovement_jar_id_fkey" FOREIGN KEY ("jar_id") REFERENCES "SavingsJar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JarMovement" ADD CONSTRAINT "JarMovement_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
