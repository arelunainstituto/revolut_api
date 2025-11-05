import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import { ValidationPipe, INestApplication } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import express, { Express, Request, Response } from "express";
import { AppModule } from "../src/app.module";

let cachedServer: Express | null = null;

async function bootstrap(): Promise<Express> {
  if (cachedServer) {
    return cachedServer;
  }

  const expressApp = express();
  const adapter = new ExpressAdapter(expressApp);
  const app = await NestFactory.create(AppModule, adapter);

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || "*",
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
  app.setGlobalPrefix("api");

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle("Revolut API Integration")
    .setDescription("AreLuna Revolut Business API Integration")
    .setVersion("1.0.0")
    .addTag("revolut", "Revolut API endpoints")
    .addTag("auth", "Authentication endpoints")
    .addTag("webhooks", "Webhook endpoints")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  await app.init();

  cachedServer = expressApp;
  return expressApp;
}

export default async (req: Request, res: Response) => {
  const server = await bootstrap();
  server(req, res);
};
