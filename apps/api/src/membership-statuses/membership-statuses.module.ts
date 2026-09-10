import { Module } from '@nestjs/common';
import { MembershipStatusesService } from './membership-statuses.service';
import { MembershipStatusesController } from './membership-statuses.controller';

@Module({
  controllers: [MembershipStatusesController],
  providers: [MembershipStatusesService],
  exports: [MembershipStatusesService],
})
export class MembershipStatusesModule {}
