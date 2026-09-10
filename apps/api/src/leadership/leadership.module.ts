import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { LeadershipController } from './leadership.controller';
import { LeadershipService } from './leadership.service';

@Module({
  imports: [AuditModule],
  controllers: [LeadershipController],
  providers: [LeadershipService],
  exports: [LeadershipService],
})
export class LeadershipModule {}
