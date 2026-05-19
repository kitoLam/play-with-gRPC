package com.learnmicroservice.service;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
public class DemoListener {

    @RabbitListener(queues = "java_queue")
    public void receiveMessage(String message) {
        System.out.println("\n---> [RabbitMQ] Spring Boot nhận message từ NestJS:");
        System.out.println("Nội dung: " + message);
    }
}
