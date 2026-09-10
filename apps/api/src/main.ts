import { join } from 'path';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  // Uploaded media is served as plain static files, outside the versioned
  // API prefix and outside Nest's guard pipeline (it's public by design —
  // the whole point is to be embeddable on the public website).
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

  const nodeEnv = configService.get<string>('nodeEnv') ?? 'development';
  const apiPrefix = configService.get<string>('apiPrefix') ?? 'api/v1';
  const rawCorsOrigin = configService.get<string>('corsOrigin');
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
  const port = configService.get<number>('port') ?? 4000;

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

  if (nodeEnv !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Methodist Church Ghana — Church Management API')
      .setDescription(
        'REST API for member management, attendance, finance, events and more.',
      )
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(`${apiPrefix}/docs`, app, document);
  }

  await app.listen(port);
  Logger.log(
    `API listening on http://localhost:${port}/${apiPrefix}`,
    'Bootstrap',
  );
  if (nodeEnv !== 'production') {
    Logger.log(
      `Swagger docs at http://localhost:${port}/${apiPrefix}/docs`,
      'Bootstrap',
    );
  }
}

bootstrap();
