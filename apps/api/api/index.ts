import 'reflect-metadata';

const NEON_DB_URL =
  'postgresql://neondb_owner:npg_s2WxlqNdyV7k@ep-morning-moon-ax9bp8gw-pooler.c-4.us-east-2.aws.neon.tech/jeap-church-db?sslmode=require&connect_timeout=15&pgbouncer=true';

const isPostgresUrl = (url?: string) =>
  Boolean(url && (url.startsWith('postgresql://') || url.startsWith('postgres://')) && !url.includes('localhost'));

if (!isPostgresUrl(process.env.DATABASE_URL)) {
  process.env.DATABASE_URL = NEON_DB_URL;
}
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET =
    'YRhmE7bE_jUWddqWhtAIJER0YCRUfSse9xQ09mevXDDS1xWVguoWiFnXJtFilgLT';
}
if (!process.env.JWT_REFRESH_SECRET) {
  process.env.JWT_REFRESH_SECRET =
    'KvajkTpgSTQJMV3asuqkNU3ftED2iu7tWYbEq7Luh3YhxJ7aB_GBrmU_16RGfPBQ';
}

let cachedServer: any;

async function bootstrap() {
  if (cachedServer) return cachedServer;

  const { NestFactory } = await import('@nestjs/core');
  const { ValidationPipe } = await import('@nestjs/common');
  const helmet = (await import('helmet')).default;
  const cookieParser = (await import('cookie-parser')).default;
  const { AppModule } = await import('../src/app.module');
  const { AllExceptionsFilter } = await import('../src/common/filters/http-exception.filter');

  const app = await NestFactory.create(AppModule);

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);

  const apiPrefix = process.env.API_PREFIX || 'api/v1';
  const rawCorsOrigin = process.env.CORS_ORIGIN;
  const configuredOrigins = rawCorsOrigin && rawCorsOrigin !== '*'
    ? rawCorsOrigin.split(',').map((o) => o.trim())
    : [];

  const defaultOrigins = [
    'https://jeapmethodist.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:4000',
  ];

  const allowedOrigins = Array.from(new Set([...defaultOrigins, ...configuredOrigins]));

  app.setGlobalPrefix(apiPrefix);
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cookieParser());
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin) {
        return callback(null, true);
      }
      if (
        rawCorsOrigin === '*' ||
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.init();
  cachedServer = expressApp;
  return cachedServer;
}

export default async function handler(req: any, res: any) {
  try {
    const server = await bootstrap();
    return server(req, res);
  } catch (err: any) {
    console.error('Vercel Serverless Bootstrap Error:', err);
    res.status(500).json({
      statusCode: 500,
      message: err?.message || 'Internal Server Error during serverless bootstrap',
      error: err?.name || 'BootstrapError',
      stack: err?.stack,
    });
  }
}
