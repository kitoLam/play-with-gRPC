package com.disnote.controller;

import com.disnote.grpc.user.v1.GetUserProfileRequest;
import com.disnote.grpc.user.v1.GetUserProfileResponse;
import com.disnote.grpc.user.v1.UserServiceGrpc;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @GrpcClient("user-service")
    private UserServiceGrpc.UserServiceBlockingStub userStub;

    @GetMapping("/{userId}")
    public ResponseEntity<String> getProfile(@PathVariable String userId) {
        GetUserProfileRequest request = GetUserProfileRequest.newBuilder()
                .setUserId(userId)
                .build();

        GetUserProfileResponse response = userStub.getUserProfile(request);

        return ResponseEntity.ok(response.getFullName());
    }
}
