package com.learnmicroservice.controller;

import com.learnmicroservice.grpc.DemoServiceGrpc;
import com.learnmicroservice.grpc.GreetingRequest;
import com.learnmicroservice.grpc.GreetingResponse;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class DemoController {

    private final RabbitTemplate rabbitTemplate;

    @GrpcClient("demoService")
    private DemoServiceGrpc.DemoServiceBlockingStub demoServiceStub;

    public DemoController(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    @PostMapping
    public String testMicroserviceFlow(@RequestBody Map<String, String> payload) {
        String name = payload.getOrDefault("name", "Người dùng ẩn danh");

        // 1. Gửi message qua RabbitMQ (Bất đồng bộ)
        System.out.println("[Spring] Đang đẩy message lên RabbitMQ...");
        String messageBody = "{\"action\": \"test_event\", \"name\": \"" + name + "\"}";
        rabbitTemplate.convertAndSend("demo_queue", messageBody);

        // 2. Gọi NestJS qua gRPC (Đồng bộ)
        System.out.println("[Spring] Đang gọi NestJS qua gRPC...");
        GreetingRequest request = GreetingRequest.newBuilder().setName(name).build();
        GreetingResponse response = demoServiceStub.getGreeting(request);

        return "Kết quả trả về cho Postman:\n" +
               "- Trạng thái RabbitMQ: Đã push thành công!\n" +
               "- Phản hồi từ NestJS gRPC: " + response.getMessage();
    }
}
