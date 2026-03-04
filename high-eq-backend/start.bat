@echo off
REM ========================================
REM HighEQ 后端启动脚本 (Windows)
REM ========================================

echo 🚀 启动 HighEQ 后端服务...

REM 检查 .env 文件是否存在
if not exist .env (
    echo ⚠️  警告: .env 文件不存在！
    echo.
    echo 请先创建 .env 文件：
    echo   copy .env.example .env
    echo   然后编辑 .env 文件，填入真实的配置值
    echo.
    exit /b 1
)

echo ✅ 配置文件检查通过
echo.

REM 检查 Java 版本
echo 📋 检查 Java 版本...
java -version
echo.

echo 🔧 使用 Maven 启动服务...
echo.

REM 使用 Spring Boot Maven 插件启动
mvn spring-boot:run
