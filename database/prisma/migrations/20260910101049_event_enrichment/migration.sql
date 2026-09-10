-- AlterTable
ALTER TABLE "events" ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "contactPhone" TEXT,
ADD COLUMN     "endTime" TEXT,
ADD COLUMN     "ministryId" TEXT,
ADD COLUMN     "organizer" TEXT,
ADD COLUMN     "registrationLimit" INTEGER,
ADD COLUMN     "startTime" TEXT;

-- CreateIndex
CREATE INDEX "events_ministryId_idx" ON "events"("ministryId");

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_ministryId_fkey" FOREIGN KEY ("ministryId") REFERENCES "ministries"("id") ON DELETE SET NULL ON UPDATE CASCADE;
