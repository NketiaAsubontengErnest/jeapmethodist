-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'SEPARATED');

-- CreateEnum
CREATE TYPE "FamilyRole" AS ENUM ('HEAD', 'SPOUSE', 'CHILD', 'DEPENDANT', 'OTHER');

-- CreateEnum
CREATE TYPE "AgeCategory" AS ENUM ('CHILD', 'TEEN', 'YOUNG_ADULT', 'ADULT', 'SENIOR');

-- CreateEnum
CREATE TYPE "VisitorFollowUpStatus" AS ENUM ('NEW', 'CONTACTED', 'FOLLOW_UP_SCHEDULED', 'INTERESTED', 'JOINED', 'NOT_INTERESTED', 'COULD_NOT_REACH');

-- CreateTable
CREATE TABLE "member_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membership_statuses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "countsAsActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "membership_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "members" (
    "id" TEXT NOT NULL,
    "membershipNumber" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "lastName" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "phone" TEXT,
    "whatsappNumber" TEXT,
    "email" TEXT,
    "residentialAddress" TEXT,
    "digitalAddress" TEXT,
    "ghanaRegion" TEXT,
    "ghanaDistrict" TEXT,
    "occupation" TEXT,
    "maritalStatus" "MaritalStatus",
    "marriageDate" TIMESTAMP(3),
    "emergencyContactName" TEXT,
    "emergencyContactPhone" TEXT,
    "emergencyContactRelationship" TEXT,
    "dateJoinedChurch" TIMESTAMP(3),
    "baptized" BOOLEAN NOT NULL DEFAULT false,
    "baptismDate" TIMESTAMP(3),
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "confirmationDate" TIMESTAMP(3),
    "membershipStatusId" TEXT NOT NULL,
    "memberCategoryId" TEXT NOT NULL,
    "localSociety" TEXT,
    "skills" TEXT,
    "notes" TEXT,
    "profilePhotoUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_families" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "familyPhone" TEXT,
    "familyAddress" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_families_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "family_members" (
    "id" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "role" "FamilyRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "family_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visitors" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "whatsappNumber" TEXT,
    "email" TEXT,
    "gender" "Gender",
    "ageCategory" "AgeCategory",
    "howHeard" TEXT,
    "dateVisited" TIMESTAMP(3) NOT NULL,
    "programmeAttended" TEXT,
    "address" TEXT,
    "interestedInJoining" BOOLEAN NOT NULL DEFAULT false,
    "followUpStatus" "VisitorFollowUpStatus" NOT NULL DEFAULT 'NEW',
    "assignedToUserId" TEXT,
    "notes" TEXT,
    "convertedMemberId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visitors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visitor_follow_ups" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "userId" TEXT,
    "status" "VisitorFollowUpStatus" NOT NULL,
    "notes" TEXT,
    "contactedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "visitor_follow_ups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "member_categories_name_key" ON "member_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "membership_statuses_name_key" ON "membership_statuses"("name");

-- CreateIndex
CREATE UNIQUE INDEX "members_membershipNumber_key" ON "members"("membershipNumber");

-- CreateIndex
CREATE INDEX "members_membershipStatusId_idx" ON "members"("membershipStatusId");

-- CreateIndex
CREATE INDEX "members_memberCategoryId_idx" ON "members"("memberCategoryId");

-- CreateIndex
CREATE INDEX "members_lastName_firstName_idx" ON "members"("lastName", "firstName");

-- CreateIndex
CREATE INDEX "family_members_memberId_idx" ON "family_members"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "family_members_familyId_memberId_key" ON "family_members"("familyId", "memberId");

-- CreateIndex
CREATE UNIQUE INDEX "visitors_convertedMemberId_key" ON "visitors"("convertedMemberId");

-- CreateIndex
CREATE INDEX "visitors_followUpStatus_idx" ON "visitors"("followUpStatus");

-- CreateIndex
CREATE INDEX "visitors_assignedToUserId_idx" ON "visitors"("assignedToUserId");

-- CreateIndex
CREATE INDEX "visitor_follow_ups_visitorId_idx" ON "visitor_follow_ups"("visitorId");

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_membershipStatusId_fkey" FOREIGN KEY ("membershipStatusId") REFERENCES "membership_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_memberCategoryId_fkey" FOREIGN KEY ("memberCategoryId") REFERENCES "member_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_members" ADD CONSTRAINT "family_members_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "member_families"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_members" ADD CONSTRAINT "family_members_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitors" ADD CONSTRAINT "visitors_assignedToUserId_fkey" FOREIGN KEY ("assignedToUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitors" ADD CONSTRAINT "visitors_convertedMemberId_fkey" FOREIGN KEY ("convertedMemberId") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitor_follow_ups" ADD CONSTRAINT "visitor_follow_ups_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "visitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitor_follow_ups" ADD CONSTRAINT "visitor_follow_ups_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
