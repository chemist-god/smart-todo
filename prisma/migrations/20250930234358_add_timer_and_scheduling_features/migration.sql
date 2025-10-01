-- CreateEnum
CREATE TYPE "public"."TimerStatus" AS ENUM ('STOPPED', 'RUNNING', 'PAUSED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "public"."TimerSessionType" AS ENUM ('FOCUS', 'BREAK', 'POMODORO', 'DEEP_WORK', 'REVIEW');

-- CreateEnum
CREATE TYPE "public"."RecurrencePattern" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "public"."GoalType" AS ENUM ('TASKS_COMPLETED', 'POINTS_EARNED', 'STREAK_DAYS', 'NOTES_CREATED', 'ACHIEVEMENTS_UNLOCKED', 'CUSTOM');

-- CreateEnum
CREATE TYPE "public"."StakeType" AS ENUM ('SELF_STAKE', 'SOCIAL_STAKE', 'CHALLENGE_STAKE', 'TEAM_STAKE', 'CHARITY_STAKE');

-- CreateEnum
CREATE TYPE "public"."StakeStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'FAILED', 'CANCELLED', 'EXPIRED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "public"."RewardType" AS ENUM ('SELF_REWARD', 'POOL_REWARD', 'PENALTY_REWARD', 'FRIEND_REWARD', 'STREAK_BONUS', 'ACHIEVEMENT_BONUS', 'COMPLETION', 'SUPPORT', 'REFUND');

-- CreateEnum
CREATE TYPE "public"."InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED');

-- AlterTable
ALTER TABLE "public"."Todo" ADD COLUMN     "actualDuration" INTEGER,
ADD COLUMN     "breakDuration" INTEGER,
ADD COLUMN     "estimatedDuration" INTEGER,
ADD COLUMN     "focusMode" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isRecurring" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pomodoroSessions" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "recurrencePattern" "public"."RecurrencePattern",
ADD COLUMN     "reminderSettings" JSONB,
ADD COLUMN     "scheduledEndTime" TIMESTAMP(3),
ADD COLUMN     "scheduledStartTime" TIMESTAMP(3),
ADD COLUMN     "timeZone" TEXT,
ADD COLUMN     "timerStartTime" TIMESTAMP(3),
ADD COLUMN     "timerStatus" "public"."TimerStatus" NOT NULL DEFAULT 'STOPPED',
ADD COLUMN     "totalTimeSpent" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "public"."TimerSession" (
    "id" TEXT NOT NULL,
    "todoId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "duration" INTEGER,
    "sessionType" "public"."TimerSessionType" NOT NULL DEFAULT 'FOCUS',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TimerSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Goal" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "public"."GoalType" NOT NULL,
    "target" INTEGER NOT NULL,
    "current" INTEGER NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Milestone" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "target" INTEGER NOT NULL,
    "current" INTEGER NOT NULL DEFAULT 0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "goalId" TEXT NOT NULL,

    CONSTRAINT "Milestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Stake" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "stakeType" "public"."StakeType" NOT NULL,
    "status" "public"."StakeStatus" NOT NULL DEFAULT 'ACTIVE',
    "category" TEXT,
    "difficulty" TEXT,
    "tags" TEXT[],
    "popularity" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "joinCount" INTEGER NOT NULL DEFAULT 0,
    "shareCount" INTEGER NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "userStake" DECIMAL(10,2) NOT NULL,
    "friendStakes" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "penaltyAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "taskId" TEXT,
    "deadline" TIMESTAMP(3) NOT NULL,
    "completionProof" TEXT,
    "rewardAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "penaltyPool" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,

    CONSTRAINT "Stake_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StakeParticipant" (
    "id" TEXT NOT NULL,
    "stakeId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "participantName" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "isSupporter" BOOLEAN NOT NULL DEFAULT true,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StakeParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Reward" (
    "id" TEXT NOT NULL,
    "stakeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "rewardType" "public"."RewardType" NOT NULL,
    "description" TEXT,
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Penalty" (
    "id" TEXT NOT NULL,
    "stakeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Penalty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserWallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "balance" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalEarned" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalLost" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalStaked" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "completionRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "rank" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserWallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WalletTransaction" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "description" TEXT NOT NULL,
    "referenceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalletTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StakeInvitation" (
    "id" TEXT NOT NULL,
    "stakeId" TEXT NOT NULL,
    "inviterId" TEXT NOT NULL,
    "inviteeEmail" TEXT NOT NULL,
    "message" TEXT,
    "status" "public"."InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "securityCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "lastViewedAt" TIMESTAMP(3),
    "viewCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "StakeInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TimerSession_todoId_idx" ON "public"."TimerSession"("todoId");

-- CreateIndex
CREATE INDEX "TimerSession_startTime_idx" ON "public"."TimerSession"("startTime");

-- CreateIndex
CREATE INDEX "TimerSession_sessionType_idx" ON "public"."TimerSession"("sessionType");

-- CreateIndex
CREATE INDEX "Goal_userId_idx" ON "public"."Goal"("userId");

-- CreateIndex
CREATE INDEX "Goal_isActive_idx" ON "public"."Goal"("isActive");

-- CreateIndex
CREATE INDEX "Goal_type_idx" ON "public"."Goal"("type");

-- CreateIndex
CREATE INDEX "Milestone_goalId_idx" ON "public"."Milestone"("goalId");

-- CreateIndex
CREATE INDEX "Stake_userId_idx" ON "public"."Stake"("userId");

-- CreateIndex
CREATE INDEX "Stake_status_idx" ON "public"."Stake"("status");

-- CreateIndex
CREATE INDEX "Stake_stakeType_idx" ON "public"."Stake"("stakeType");

-- CreateIndex
CREATE INDEX "Stake_deadline_idx" ON "public"."Stake"("deadline");

-- CreateIndex
CREATE INDEX "Stake_category_idx" ON "public"."Stake"("category");

-- CreateIndex
CREATE INDEX "Stake_difficulty_idx" ON "public"."Stake"("difficulty");

-- CreateIndex
CREATE INDEX "Stake_popularity_idx" ON "public"."Stake"("popularity");

-- CreateIndex
CREATE INDEX "StakeParticipant_stakeId_idx" ON "public"."StakeParticipant"("stakeId");

-- CreateIndex
CREATE INDEX "StakeParticipant_participantId_idx" ON "public"."StakeParticipant"("participantId");

-- CreateIndex
CREATE INDEX "Reward_userId_idx" ON "public"."Reward"("userId");

-- CreateIndex
CREATE INDEX "Reward_stakeId_idx" ON "public"."Reward"("stakeId");

-- CreateIndex
CREATE INDEX "Penalty_userId_idx" ON "public"."Penalty"("userId");

-- CreateIndex
CREATE INDEX "Penalty_stakeId_idx" ON "public"."Penalty"("stakeId");

-- CreateIndex
CREATE UNIQUE INDEX "UserWallet_userId_key" ON "public"."UserWallet"("userId");

-- CreateIndex
CREATE INDEX "UserWallet_userId_idx" ON "public"."UserWallet"("userId");

-- CreateIndex
CREATE INDEX "UserWallet_rank_idx" ON "public"."UserWallet"("rank");

-- CreateIndex
CREATE INDEX "UserWallet_completionRate_idx" ON "public"."UserWallet"("completionRate");

-- CreateIndex
CREATE INDEX "WalletTransaction_walletId_idx" ON "public"."WalletTransaction"("walletId");

-- CreateIndex
CREATE INDEX "WalletTransaction_userId_idx" ON "public"."WalletTransaction"("userId");

-- CreateIndex
CREATE INDEX "WalletTransaction_type_idx" ON "public"."WalletTransaction"("type");

-- CreateIndex
CREATE INDEX "WalletTransaction_createdAt_idx" ON "public"."WalletTransaction"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "StakeInvitation_securityCode_key" ON "public"."StakeInvitation"("securityCode");

-- CreateIndex
CREATE INDEX "StakeInvitation_inviteeEmail_idx" ON "public"."StakeInvitation"("inviteeEmail");

-- CreateIndex
CREATE INDEX "StakeInvitation_stakeId_idx" ON "public"."StakeInvitation"("stakeId");

-- CreateIndex
CREATE INDEX "StakeInvitation_status_idx" ON "public"."StakeInvitation"("status");

-- CreateIndex
CREATE INDEX "StakeInvitation_securityCode_idx" ON "public"."StakeInvitation"("securityCode");

-- CreateIndex
CREATE INDEX "Todo_scheduledStartTime_idx" ON "public"."Todo"("scheduledStartTime");

-- CreateIndex
CREATE INDEX "Todo_scheduledEndTime_idx" ON "public"."Todo"("scheduledEndTime");

-- CreateIndex
CREATE INDEX "Todo_timerStatus_idx" ON "public"."Todo"("timerStatus");

-- CreateIndex
CREATE INDEX "Todo_isRecurring_idx" ON "public"."Todo"("isRecurring");

-- AddForeignKey
ALTER TABLE "public"."TimerSession" ADD CONSTRAINT "TimerSession_todoId_fkey" FOREIGN KEY ("todoId") REFERENCES "public"."Todo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Goal" ADD CONSTRAINT "Goal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Milestone" ADD CONSTRAINT "Milestone_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "public"."Goal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Stake" ADD CONSTRAINT "Stake_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StakeParticipant" ADD CONSTRAINT "StakeParticipant_stakeId_fkey" FOREIGN KEY ("stakeId") REFERENCES "public"."Stake"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reward" ADD CONSTRAINT "Reward_stakeId_fkey" FOREIGN KEY ("stakeId") REFERENCES "public"."Stake"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reward" ADD CONSTRAINT "Reward_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Penalty" ADD CONSTRAINT "Penalty_stakeId_fkey" FOREIGN KEY ("stakeId") REFERENCES "public"."Stake"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Penalty" ADD CONSTRAINT "Penalty_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserWallet" ADD CONSTRAINT "UserWallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WalletTransaction" ADD CONSTRAINT "WalletTransaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "public"."UserWallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WalletTransaction" ADD CONSTRAINT "WalletTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StakeInvitation" ADD CONSTRAINT "StakeInvitation_stakeId_fkey" FOREIGN KEY ("stakeId") REFERENCES "public"."Stake"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StakeInvitation" ADD CONSTRAINT "StakeInvitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
