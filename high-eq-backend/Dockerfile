# 使用多阶段构建优化镜像大小

# 阶段1: 构建阶段
FROM maven:3.9.12-eclipse-temurin-17 AS builder

# 配置 DNS 服务器（解决容器内 DNS 解析问题）
RUN echo "nameserver 8.8.8.8" > /etc/resolv.conf && \
    echo "nameserver 114.114.114.114" >> /etc/resolv.conf

# 设置工作目录
WORKDIR /app

# 复制 pom.xml 和源代码
COPY pom.xml .
COPY src ./src

# 构建 Maven 项目（跳过测试以加快构建速度）
RUN mvn clean package -DskipTests

# 阶段2: 运行阶段
FROM eclipse-temurin:17-jre-alpine

# 添加非 root 用户以提高安全性
RUN addgroup -S spring && adduser -S spring -G spring

# 设置工作目录
WORKDIR /app

# 从构建阶段复制 JAR 文件
COPY --from=builder /app/target/*.jar app.jar

# 修改文件权限
RUN chown -R spring:spring /app

# 切换到非 root 用户
USER spring

# 暴露端口
EXPOSE 8080

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# 启动应用
ENTRYPOINT ["java", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-jar", \
  "app.jar"]
