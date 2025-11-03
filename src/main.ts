import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Serve static files from public directory
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/',
  });

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // API prefix
  app.setGlobalPrefix('api');

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Revolut API Integration')
    .setDescription('AreLuna Revolut Business API Integration')
    .setVersion('1.0.0')
    .addTag('revolut', 'Revolut API endpoints')
    .addTag('auth', 'Authentication endpoints')
    .addTag('webhooks', 'Webhook endpoints')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customCss: `
      .swagger-ui .opblock-body .opblock-description-wrapper input,
      .swagger-ui .opblock-body .opblock-description-wrapper textarea,
      .swagger-ui input[type="text"],
      .swagger-ui input[type="password"],
      .swagger-ui input[type="email"],
      .swagger-ui textarea,
      .swagger-ui .parameter__name,
      .swagger-ui input.parameter,
      .swagger-ui .response-col_description textarea,
      .swagger-ui .opblock-body pre,
      .swagger-ui .opblock-body .highlight-code,
      .swagger-ui .auth-btn-wrapper input {
        color: #3b4151 !important;
        background-color: #ffffff !important;
      }
      .swagger-ui .opblock-body pre code,
      .swagger-ui .opblock-body .highlight-code code {
        color: #3b4151 !important;
      }
      .swagger-ui input::placeholder,
      .swagger-ui textarea::placeholder {
        color: #909090 !important;
      }
    `,
    customSiteTitle: 'Revolut API Documentation',
  });

  const port = process.env.PORT || 3006;
  await app.listen(port);

  console.log(`
================================================================================
🚀 Revolut API Server Running
================================================================================
Server:      http://localhost:${port}
API Docs:    http://localhost:${port}/api/docs
Health:      http://localhost:${port}/api/health
Environment: ${process.env.NODE_ENV || 'development'}
================================================================================
  `);
}

bootstrap();
