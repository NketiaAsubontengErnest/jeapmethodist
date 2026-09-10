import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { MinistriesController } from './ministries.controller';
import { MinistriesService } from './ministries.service';

@Module({
  imports: [AuditModule],
  controllers: [MinistriesController],
  providers: [MinistriesService],
  exports: [MinistriesService],
})
export class MinistriesModule {}
