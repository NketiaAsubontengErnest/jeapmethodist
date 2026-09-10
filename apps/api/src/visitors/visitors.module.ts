import { Module } from '@nestjs/common';
import { VisitorsService } from './visitors.service';
import { VisitorsController } from './visitors.controller';
import { AuditModule } from '../audit/audit.module';
import { MembersModule } from '../members/members.module';

@Module({
  imports: [AuditModule, MembersModule],
  controllers: [VisitorsController],
  providers: [VisitorsService],
  exports: [VisitorsService],
})
export class VisitorsModule {}
