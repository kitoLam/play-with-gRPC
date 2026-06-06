package com.disnote.controller;

import com.disnote.grpc.user.v1.GetUserProfileRequest;
import com.disnote.grpc.user.v1.GetUserProfileResponse;
import com.disnote.grpc.user.v1.UserServiceGrpc;
import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;

@GrpcService
public class UserControllerGRPC extends UserServiceGrpc.UserServiceImplBase{
  @Override
  public void getUserProfile(GetUserProfileRequest request, StreamObserver<GetUserProfileResponse> responseObserver) {
    System.out.println(request.toString());
    GetUserProfileResponse res = GetUserProfileResponse.newBuilder().setFullName("Minh Lam").build();
    responseObserver.onNext(res);
    responseObserver.onCompleted();
  }
}
