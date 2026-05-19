import { Controller, Get, Inject, OnModuleInit } from '@nestjs/common';
import { ClientProxy, Ctx, EventPattern, GrpcMethod, Payload, RmqContext } from '@nestjs/microservices';
import type { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

interface SpringService {
  fetchDataFromJava(data: { id: string }): import('rxjs').Observable<{ data: string }>;
}

@Controller()
export class AppController implements OnModuleInit {
  private springService: SpringService;

  constructor(
    @Inject('RABBITMQ_SERVICE') private readonly rabbitClient: ClientProxy,
    @Inject('SPRING_GRPC_SERVICE') private readonly grpcClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.springService = this.grpcClient.getService<SpringService>('SpringService');
  }

  @Get('test-grpc-to-java')
  async testGrpcToJava() {
    console.log(`[NestJS] Đang gọi sang Java qua gRPC...`);
    
    // Gọi gRPC method
    const response = await lastValueFrom(this.springService.fetchDataFromJava({ id: '12345' }));
    
    return {
      status: 'success',
      message: 'Đã nhận response từ Spring Boot thông qua gRPC',
      data: response,
    };
  }

  @Get('test-to-java')
  async testToJava() {
    const message = `Hello Spring Boot, tôi là NestJS gửi lúc ${new Date().toISOString()}`;
    console.log(`[NestJS] Đang gửi message sang Java: ${message}`);
    
    // Gửi message qua RabbitMQ (Pattern: java_queue không cần xác định routing key phức tạp nếu emit)
    // Ở đây ta emit một event bất kỳ. Nếu bên Java không dùng @RabbitListener với routing key cụ thể
    // thì ta cần gửi string thẳng hoặc định nghĩa đúng cấu trúc.
    // Dùng emit với pattern tùy ý, spring-amqp mặc định sẽ map tới payload.
    this.rabbitClient.emit('any_routing_key_or_empty', message);
    
    return {
      status: 'success',
      message: 'Đã gửi message qua RabbitMQ tới Spring Boot',
    };
  }

  @GrpcMethod('DemoService', 'GetGreeting')
  getGreeting(data: { name: string }): { message: string } {
    console.log(`\n---> [gRPC] NestJS nhận request GetGreeting. Data:`, data);
    return { 
      message: `Chào ${data.name}, mình là NestJS. Dữ liệu này được truyền qua gRPC!` 
    };
  }

  @EventPattern('*') 
  async handleRabbitMqMessage(@Payload() data: string, @Ctx() context: RmqContext) {
    console.log(`\n---> [RabbitMQ] NestJS nhận message bất đồng bộ:`);
    console.log(`Nội dung:`, data);
  }
}
