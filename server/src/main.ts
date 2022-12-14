import '@shared/config/crud.config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    credentials: true,
    origin: true,
  });
  app.use(cookieParser());
  await app.listen(3000);
}
bootstrap();
