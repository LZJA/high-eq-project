package com.highiq;

import io.github.cdimascio.dotenv.Dotenv;
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
        // 在 Spring 启动之前加载 .env 文件
        loadDotenv();
        SpringApplication.run(HighEqApplication.class, args);
    }

    /**
     * 加载 .env 文件并设置系统属性
     * 根据 Spring Profile 自动选择合适的环境文件：
     * - prod profile: .env.production
     * - 其他 profile: .env
     */
    private static void loadDotenv() {
        try {
            // 检测 Spring Profile
            String profile = System.getProperty("spring.profiles.active");
            String envFile = ".env"; // 默认使用 .env

            if ("prod".equals(profile)) {
                envFile = ".env.production";
            }

            Dotenv dotenv = Dotenv.configure()
                    .filename(envFile)
                    .ignoreIfMalformed()
                    .ignoreIfMissing()
                    .load();

            int count = 0;
            for (var entry : dotenv.entries()) {
                String key = entry.getKey();
                String value = entry.getValue();

                // 设置系统属性
                System.setProperty(key, value);

                // 也设置 Spring 属性格式（用于 relaxed binding）
                String springKey = convertToSpringProperty(key);
                if (!springKey.equals(key)) {
                    System.setProperty(springKey, value);
                }

                count++;
            }

            if (count > 0) {
                System.out.println("=== Loaded " + count + " properties from " + envFile + " file ===");
            }
        } catch (Exception e) {
            System.err.println("Warning: Failed to load .env file: " + e.getMessage());
        }
    }

    /**
     * 将环境变量键转换为 Spring 属性键
     */
    private static String convertToSpringProperty(String envKey) {
        return switch (envKey) {
            case "MYSQL_USER" -> "spring.datasource.username";
            case "MYSQL_PASSWORD" -> "spring.datasource.password";
            case "JWT_SECRET" -> "jwt.secret";
            case "JWT_EXPIRATION" -> "jwt.expiration";
            case "JWT_REFRESH_EXPIRATION" -> "jwt.refresh-expiration";
            case "DEEPSEEK_API_KEY" -> "ai.deepseek.api-key";
            default -> envKey.toLowerCase().replace("_", ".");
        };
    }
}
