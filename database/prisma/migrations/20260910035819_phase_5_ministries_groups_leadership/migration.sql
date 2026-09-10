-- CreateTable
CREATE TABLE "ministries" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "meetingSchedule" TEXT,
    "meetingVenue" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "leaderMemberId" TEXT,
    "assistantLeaderMemberId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ministries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ministry_members" (
    "id" TEXT NOT NULL,
    "ministryId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "roleInMinistry" TEXT NOT NULL DEFAULT 'Member',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ministry_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "church_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "meetingSchedule" TEXT,
    "meetingVenue" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "leaderMemberId" TEXT,
    "assistantLeaderMemberId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "church_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_members" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "roleInGroup" TEXT NOT NULL DEFAULT 'Member',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "group_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "church_positions" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Lay Leadership',
    "description" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "church_positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "church_leadership" (
    "id" TEXT NOT NULL,
    "positionId" TEXT NOT NULL,
    "memberId" TEXT,
    "name" TEXT,
    "photoUrl" TEXT,
    "bio" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "church_leadership_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ministries_name_key" ON "ministries"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ministries_slug_key" ON "ministries"("slug");

-- CreateIndex
CREATE INDEX "ministry_members_memberId_idx" ON "ministry_members"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "ministry_members_ministryId_memberId_key" ON "ministry_members"("ministryId", "memberId");

-- CreateIndex
CREATE UNIQUE INDEX "church_groups_name_key" ON "church_groups"("name");

-- CreateIndex
CREATE UNIQUE INDEX "church_groups_slug_key" ON "church_groups"("slug");

-- CreateIndex
CREATE INDEX "group_members_memberId_idx" ON "group_members"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "group_members_groupId_memberId_key" ON "group_members"("groupId", "memberId");

-- CreateIndex
CREATE UNIQUE INDEX "church_positions_title_key" ON "church_positions"("title");

-- CreateIndex
CREATE INDEX "church_leadership_positionId_idx" ON "church_leadership"("positionId");

-- CreateIndex
CREATE INDEX "church_leadership_memberId_idx" ON "church_leadership"("memberId");

-- AddForeignKey
ALTER TABLE "ministries" ADD CONSTRAINT "ministries_leaderMemberId_fkey" FOREIGN KEY ("leaderMemberId") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ministries" ADD CONSTRAINT "ministries_assistantLeaderMemberId_fkey" FOREIGN KEY ("assistantLeaderMemberId") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ministry_members" ADD CONSTRAINT "ministry_members_ministryId_fkey" FOREIGN KEY ("ministryId") REFERENCES "ministries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ministry_members" ADD CONSTRAINT "ministry_members_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "church_groups" ADD CONSTRAINT "church_groups_leaderMemberId_fkey" FOREIGN KEY ("leaderMemberId") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "church_groups" ADD CONSTRAINT "church_groups_assistantLeaderMemberId_fkey" FOREIGN KEY ("assistantLeaderMemberId") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "church_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "church_leadership" ADD CONSTRAINT "church_leadership_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "church_positions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "church_leadership" ADD CONSTRAINT "church_leadership_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;
