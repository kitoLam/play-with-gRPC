import { Controller, Get, Inject } from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { GetUserProfileRequest, GetUserProfileResponse, USER_SERVICE_NAME, UserServiceClient, UserServiceController, UserServiceControllerMethods } from './generated/disnote/user/v1/user';
import { firstValueFrom } from 'rxjs';
import { USER_GRPC_CLIENT } from './constants/gRPC';
@Controller()
@UserServiceControllerMethods()
export class AppController implements UserServiceController {
  
  private userService!: UserServiceClient;

  constructor(
    @Inject(USER_GRPC_CLIENT) private client: ClientGrpc
  ) {}

  onModuleInit() {
    // Lấy stub gọi đi — tương đương BlockingStub bên Java
    this.userService = this.client.getService<UserServiceClient>(USER_SERVICE_NAME);
  }
  getUserProfile(request: GetUserProfileRequest): GetUserProfileResponse {
    console.log('Nhận request userId:', request.userId);
    // Hardcode tạm để test
    return {
      fullName: 'Nguyen Van A',
    };
  }

  @Get('/test-call-grpc-spring')
  testCall(){
    const userId = "sdf";
    return firstValueFrom(
      this.userService.getUserProfile({
        userId: userId
      })
    );
  }
}
