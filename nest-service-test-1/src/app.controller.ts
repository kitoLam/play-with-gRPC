import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, GrpcMethod, Payload, RmqContext } from '@nestjs/microservices';

@Controller()
export class AppController {
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
