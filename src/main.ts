import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { updateGlobalConfig } from 'nestjs-paginate';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  updateGlobalConfig({
    defaultLimit: 20,
    defaultMaxLimit: 100,
    defaultOrigin: undefined,
  });

  const config = new DocumentBuilder()
    .setTitle('Restaurant API')
    .setDescription('Restaurant management API documentation')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/doc', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
