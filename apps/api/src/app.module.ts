import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { SafeThrottlerGuard } from './common/guards/safe-throttler.guard';
import configuration from './config/configuration';
import { PrismaModule } from './database/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { AuditModule } from './audit/audit.module';
import { MemberCategoriesModule } from './member-categories/member-categories.module';
import { MembershipStatusesModule } from './membership-statuses/membership-statuses.module';
import { MembersModule } from './members/members.module';
import { FamiliesModule } from './families/families.module';
import { VisitorsModule } from './visitors/visitors.module';
import { ProgrammeTypesModule } from './programme-types/programme-types.module';
import { AttendanceModule } from './attendance/attendance.module';
import { MinistriesModule } from './ministries/ministries.module';
import { GroupsModule } from './groups/groups.module';
import { LeadershipModule } from './leadership/leadership.module';
import { SettingsModule } from './settings/settings.module';
import { SermonsModule } from './sermons/sermons.module';
import { EventsModule } from './events/events.module';
import { NewsModule } from './news/news.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { MediaModule } from './media/media.module';
import { AlbumsModule } from './albums/albums.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ReportsModule } from './reports/reports.module';
import { ContactModule } from './contact/contact.module';
import { PrayerRequestsModule } from './prayer-requests/prayer-requests.module';
import { FinanceSettingsModule } from './finance-settings/finance-settings.module';
import { OfferingSessionsModule } from './offering-sessions/offering-sessions.module';
import { FinanceModule } from './finance/finance.module';
import { FundsModule } from './funds/funds.module';
import { LiabilitiesModule } from './liabilities/liabilities.module';
import { BudgetsModule } from './budgets/budgets.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../../.env'],
      load: [configuration],
    }),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60_000, limit: 100 }],
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    RolesModule,
    AuditModule,
    MemberCategoriesModule,
    MembershipStatusesModule,
    MembersModule,
    FamiliesModule,
    VisitorsModule,
    ProgrammeTypesModule,
    AttendanceModule,
    MinistriesModule,
    GroupsModule,
    LeadershipModule,
    SettingsModule,
    SermonsModule,
    EventsModule,
    NewsModule,
    AnnouncementsModule,
    MediaModule,
    AlbumsModule,
    DashboardModule,
    ReportsModule,
    ContactModule,
    PrayerRequestsModule,
    FinanceSettingsModule,
    OfferingSessionsModule,
    FinanceModule,
    FundsModule,
    LiabilitiesModule,
    BudgetsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: SafeThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
})
export class AppModule {}
