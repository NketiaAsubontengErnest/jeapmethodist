import { Module } from '@nestjs/common';
import { ProgrammeTypesService } from './programme-types.service';
import { ProgrammeTypesController } from './programme-types.controller';

@Module({
  controllers: [ProgrammeTypesController],
  providers: [ProgrammeTypesService],
  exports: [ProgrammeTypesService],
})
export class ProgrammeTypesModule {}
