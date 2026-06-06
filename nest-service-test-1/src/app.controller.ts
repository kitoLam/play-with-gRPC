import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { GetUserProfileRequest, GetUserProfileResponse, UserServiceController, UserServiceControllerMethods } from './generated/disnote/user/v1/user';
@Controller()
@UserServiceControllerMethods()
export class AppController implements UserServiceController {
  getUserProfile(request: GetUserProfileRequest): GetUserProfileResponse {
    console.log('Nhận request userId:', request.userId);
    // Hardcode tạm để test
    return {
      fullName: 'Nguyen Van A',
    };
  }
}
