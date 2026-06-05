import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UserServiceControllerMethods } from './generated/disnote/user/v1/user';
@Controller()
@UserServiceControllerMethods()
export class AppController {
  getUserProfile(data: { userId: string }) {
    console.log('Nhận request userId:', data.userId);
    
    // Hardcode tạm để test
    return {
      fullName: 'Nguyen Van A',
    };
  }
}
