package com.learnmicroservice.config;

import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {
    @Bean
    public Queue demoQueue() {
        return new Queue("demo_queue", true);
    }

    @Bean
    public Queue javaQueue() {
        return new Queue("java_queue", true);
    }
}
