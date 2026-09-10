import { Module } from '@nestjs/common';
import { SermonsController } from './sermons.controller';
import { SermonsService } from './sermons.service';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [SermonsController],
  providers: [SermonsService],
  exports: [SermonsService],
})
export class SermonsModule {}
