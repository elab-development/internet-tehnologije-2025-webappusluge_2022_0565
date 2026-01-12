/*
  Warnings:

  - A unique constraint covering the columns `[providerId,name]` on the table `services` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "services_providerId_name_key" ON "services"("providerId", "name");
