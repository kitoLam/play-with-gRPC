package com.learnmicroservice.service;

import com.learnmicroservice.grpc.JavaDataRequest;
import com.learnmicroservice.grpc.JavaDataResponse;
import com.learnmicroservice.grpc.SpringServiceGrpc;
import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;

@GrpcService
public class SpringGrpcService extends SpringServiceGrpc.SpringServiceImplBase {

    @Override
    public void fetchDataFromJava(JavaDataRequest request, StreamObserver<JavaDataResponse> responseObserver) {
        System.out.println("[gRPC Server] Spring Boot nhận request lấy data từ NestJS, ID: " + request.getId());
        
        String data = "Dữ liệu được xử lý bởi Spring Boot cho ID: " + request.getId();
        
        JavaDataResponse response = JavaDataResponse.newBuilder()
                .setData(data)
                .build();
                
        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }
}
