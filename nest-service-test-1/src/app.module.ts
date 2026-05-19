import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'RABBITMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://admin:secret@rabbitmq:5672'], // Ensure using 'rabbitmq' host in docker compose
          queue: 'java_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
      {
        name: 'SPRING_GRPC_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'demo',
          protoPath: join(__dirname, 'demo.proto'),
          url: process.env.SPRING_GRPC_URL || 'spring-service:9090', // address of Spring Boot gRPC Server
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
