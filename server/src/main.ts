import '@shared/config/crud.config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import { YemotRouterService } from '@shared/utils/yemot/v2/yemot-router.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useLogger(app.get(Logger));
  app.useGlobalInterceptors(new LoggerErrorInterceptor());

  const config = new DocumentBuilder()
    .setTitle('react-admin-nestjs')
    .setDescription('Demo website description')
    .setVersion('1.0')
    .addTag('demo')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const allowedOrigins = [
    new RegExp('http(s?)://' + process.env.DOMAIN_NAME),
    process.env.IP_ADDRESS && new RegExp('http(s?)://' + process.env.IP_ADDRESS + ':[\d]*'),
  ];

  if (process.env.NODE_ENV === 'development') {
    allowedOrigins.push(new RegExp('http(s?)://localhost:[\d]*'));
    allowedOrigins.push(new RegExp('http(s?)://127.0.0.1:[\d]*'));
  }

  app.enableCors({
    credentials: true,
    origin: allowedOrigins
  });
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  app.use(cookieParser());

  const yemotRouterSvc = app.get(YemotRouterService);
  app.use('/yemot/handle-call', yemotRouterSvc.getRouter());

  await app.listen(3000);
}
bootstrap();
