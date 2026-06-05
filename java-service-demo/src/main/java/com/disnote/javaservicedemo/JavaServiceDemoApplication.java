package com.disnote.javaservicedemo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@org.springframework.context.annotation.ComponentScan(basePackages = "com.disnote")
public class JavaServiceDemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(JavaServiceDemoApplication.class, args);
    }

}
