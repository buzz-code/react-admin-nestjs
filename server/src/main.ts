import '@shared/config/crud.config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    credentials: true,
    origin: new RegExp('http(s?)://' + process.env.DOMAIN_NAME),
  });
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  app.use(cookieParser());
  await app.listen(3000);
}
bootstrap();
