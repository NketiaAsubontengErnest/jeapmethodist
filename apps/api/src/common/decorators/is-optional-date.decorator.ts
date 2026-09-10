import { applyDecorators } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';

/**
 * Accepts an ISO date/datetime string from the client and transforms it into a
 * real Date instance (Prisma's DateTime fields reject date-only strings like
 * "2026-09-07" — they need a full Date, not a partial ISO string).
 */
export function IsOptionalDate() {
  return applyDecorators(
    IsOptional(),
    Type(() => Date),
    IsDate(),
  );
}
