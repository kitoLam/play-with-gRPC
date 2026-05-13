import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Cài đặt gRPC Microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'demo',
      protoPath: join(__dirname, 'demo.proto'),
      url: '0.0.0.0:50051',
    },
  });

  // 2. Cài đặt RabbitMQ Microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://admin:secret@localhost:5672'],
      queue: 'demo_queue',
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(3000);
  console.log('NestJS đang chạy. HTTP: 3000 | gRPC: 50051');
}
bootstrap();
