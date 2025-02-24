import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app/app.module';
import {
  RABBITMQ_CONFIG,
  RABBITMQ_URI,
} from '@libs/shared-interfaces/src/lib/config/rabbitmq.config';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  // Crear la aplicación HTTP
  const app = await NestFactory.create(AppModule);

  // Configurar cookie-parser
  app.use(cookieParser());

  // Configurar CORS para permitir cookies
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  });

  // Configurar prefijo global
  app.setGlobalPrefix('api');

  // Configurar el microservicio RabbitMQ
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URI || RABBITMQ_URI],
      queue: RABBITMQ_CONFIG.queues.authService,
      queueOptions: {
        durable: true,
      },
    },
  });

  // Iniciar ambos servicios
  await app.startAllMicroservices();

  const port = process.env.PORT || 3001;
  await app.listen(port);

  Logger.log(`Auth Service is running on: http://localhost:${port}/api`);
  Logger.log('Auth Microservice (RabbitMQ) is listening');
}

bootstrap();
