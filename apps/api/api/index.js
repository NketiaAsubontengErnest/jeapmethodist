require('reflect-metadata');
const { NestFactory } = require('@nestjs/core');
const { ExpressAdapter } = require('@nestjs/platform-express');
const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { ValidationPipe } = require('@nestjs/common');

const NEON_DB_URL =
  'postgresql://neondb_owner:npg_s2WxlqNdyV7k@ep-morning-moon-ax9bp8gw-pooler.c-4.us-east-2.aws.neon.tech/jeap-church-db?sslmode=require&connect_timeout=15&pgbouncer=true';

if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('localhost')) {
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

const { AppModule } = require('../dist/src/app.module');
const { AllExceptionsFilter } = require('../dist/src/common/filters/http-exception.filter');

const server = express();
let isAppInitialized = false;

async function bootstrap() {
  if (isAppInitialized) return server;

  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(server),
  );

  const apiPrefix = process.env.API_PREFIX || 'api/v1';
  const rawCorsOrigin = process.env.CORS_ORIGIN;
  const corsOrigin = rawCorsOrigin && rawCorsOrigin !== '*'
    ? rawCorsOrigin.split(',').map((o) => o.trim())
    : true;

  app.setGlobalPrefix(apiPrefix);
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cookieParser());
  app.enableCors({ origin: corsOrigin, credentials: true });

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
  isAppInitialized = true;
  return server;
}

module.exports = async function handler(req, res) {
  try {
    await bootstrap();
    server(req, res);
  } catch (err) {
    console.error('Vercel Serverless Bootstrap Error:', err);
    res.status(500).json({
      statusCode: 500,
      message: err?.message || 'Internal Server Error during serverless bootstrap',
      error: err?.name || 'BootstrapError',
      stack: err?.stack,
    });
  }
};
