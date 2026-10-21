import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { AppConfigService } from './config/app-config.service.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = app.get(AppConfigService);
  app.enableCors({
    origin: config.corsOrigin === '*' ? true : config.corsOrigin.split(',').map((o) => o.trim()),
  });

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
