import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const isPostgresUrl = (url?: string) =>
  Boolean(url && (url.startsWith('postgresql://') || url.startsWith('postgres://')));

if (!isPostgresUrl(process.env.DATABASE_URL)) {
  throw new Error(
    'DATABASE_URL is missing or invalid. Set it to a valid postgresql:// connection string (e.g. your Neon connection string) in the environment configuration.',
  );
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Database connection established');
    } catch (error) {
      this.logger.error('Failed to connect to database', error);
    }
  }

  async onModuleDestroy() {
    if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
      await this.$disconnect();
    }
  }
}
