package com.highiq;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * 高情商回复生成助手 - 后端应用启动类
 */
@SpringBootApplication
@EnableAsync
public class HighEqApplication {

    public static void main(String[] args) {
        SpringApplication.run(HighEqApplication.class, args);
    }



}
