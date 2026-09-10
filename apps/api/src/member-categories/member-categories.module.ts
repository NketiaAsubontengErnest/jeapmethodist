import { Module } from '@nestjs/common';
import { MemberCategoriesService } from './member-categories.service';
import { MemberCategoriesController } from './member-categories.controller';

@Module({
  controllers: [MemberCategoriesController],
  providers: [MemberCategoriesService],
  exports: [MemberCategoriesService],
})
export class MemberCategoriesModule {}
