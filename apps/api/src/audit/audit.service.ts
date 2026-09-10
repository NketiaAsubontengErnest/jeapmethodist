import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

export interface RecordAuditLogInput {
  userId?: string | null;
  action: string;
  module: string;
  entityType?: string;
  entityId?: string;
  ipAddress?: string;
  userAgent?: string;
  previousValue?: unknown;
  newValue?: unknown;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Records a sensitive action. Never throws — audit logging must not break
   * the primary request flow if it fails.
   */
  async record(input: RecordAuditLogInput): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: input.userId ?? null,
          action: input.action,
          module: input.module,
          entityType: input.entityType,
          entityId: input.entityId,
          ipAddress: input.ipAddress,
          userAgent: input.userAgent,
          previousValue: input.previousValue as never,
          newValue: input.newValue as never,
        },
      });
    } catch {
      // Intentionally swallowed — audit logging is best-effort and must
      // never fail the request it is observing.
    }
  }

  async findAll(params: {
    page: number;
    pageSize: number;
    module?: string;
    userId?: string;
  }) {
    const { page, pageSize, module, userId } = params;
    const where = {
      ...(module ? { module } : {}),
      ...(userId ? { userId } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
