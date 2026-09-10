import { Module } from '@nestjs/common';
import { OfferingSessionsService } from './offering-sessions.service';
import { OfferingSessionsController } from './offering-sessions.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [OfferingSessionsController],
  providers: [OfferingSessionsService],
  exports: [OfferingSessionsService],
})
export class OfferingSessionsModule {}
