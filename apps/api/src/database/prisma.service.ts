import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const DEFAULT_DB_URL =
  'postgresql://neondb_owner:npg_s2WxlqNdyV7k@ep-morning-moon-ax9bp8gw-pooler.c-4.us-east-2.aws.neon.tech/jeap-church-db?sslmode=require&connect_timeout=15&pgbouncer=true';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const isPostgresUrl = (url?: string) =>
      Boolean(url && (url.startsWith('postgresql://') || url.startsWith('postgres://')) && !url.includes('localhost'));

    const dbUrl = isPostgresUrl(process.env.DATABASE_URL)
      ? process.env.DATABASE_URL!
      : DEFAULT_DB_URL;

    super({
      datasources: {
        db: {
          url: dbUrl,
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
    await this.$disconnect();
  }
}
