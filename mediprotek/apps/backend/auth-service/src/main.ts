import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app/app.module';
import { RABBITMQ_CONFIG, RABBITMQ_URI } from '@libs/shared-interfaces/src/lib/config/rabbitmq.config';

async function bootstrap() {
  // Crear la aplicación HTTP
  const app = await NestFactory.create(AppModule);
  
  // Habilitar CORS
  app.enableCors();

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
