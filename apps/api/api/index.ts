import 'reflect-metadata';
import '../src/env';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/http-exception.filter';

let cachedServer: any;

async function bootstrap() {
  if (cachedServer) return cachedServer;

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
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));
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
