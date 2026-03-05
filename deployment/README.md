# 生产环境部署指南

本目录包含生产环境部署所需的所有配置和脚本。

## 📁 文件说明

| 文件 | 说明 |
|------|------|
| `deploy-production.sh` | 一键部署脚本（推荐） |
| `setup-ssl.sh` | SSL 证书配置脚本 |
| `nginx.conf` | Nginx 反向代理配置 |
| `DEPLOYMENT_CHECKLIST.md` | 详细部署检查清单 |

## 🚀 快速部署

### 前置条件

- 服务器已安装 Docker 和 Docker Compose
- 域名已解析到服务器 IP
- 服务器开放端口：22, 80, 443

### 一键部署

```bash
# 下载部署脚本
wget https://raw.githubusercontent.com/your-repo/main/deployment/deploy-production.sh

# 添加执行权限
chmod +x deploy-production.sh

# 运行部署（替换为你的域名和邮箱）
sudo ./deploy-production.sh your-domain.com admin@example.com
```

或从代码仓库部署：

```bash
sudo ./deploy-production.sh your-domain.com admin@example.com https://github.com/your-username/high-eq-project.git
```

## 📋 手动部署步骤

如果你想手动控制每一步，请参考 `DEPLOYMENT_CHECKLIST.md` 文件。

### 1. 配置 SSL 证书

```bash
sudo ./setup-ssl.sh your-domain.com admin@example.com
```

### 2. 配置 Nginx

```bash
# 复制配置文件
sudo cp nginx.conf /etc/nginx/sites-available/high-eq-backend

# 修改配置中的域名
sudo sed -i 's/your-domain.com/你的域名/g' /etc/nginx/sites-available/high-eq-backend

# 启用配置
sudo ln -s /etc/nginx/sites-available/high-eq-backend /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重载 Nginx
sudo systemctl reload nginx
```

### 3. 启动 Docker 服务

```bash
cd /path/to/high-eq-backend

# 使用生产配置启动
sudo docker-compose -f docker-compose.prod.yml up -d

# 查看状态
sudo docker-compose -f docker-compose.prod.yml ps
```

## 🔧 配置说明

### Nginx 配置

Nginx 配置文件包含以下功能：

- HTTP 到 HTTPS 自动重定向
- SSL/TLS 安全配置
- 反向代理到后端服务
- 安全头部设置
- 静态资源缓存
- WebSocket 支持

修改配置后记得测试并重载：

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Docker Compose 配置

生产环境配置文件 `docker-compose.prod.yml` 包含：

- MySQL 数据库（不对外暴露端口）
- Spring Boot 后端服务
- 健康检查
- 资源限制
- 日志轮转
- 自动重启

## 🔐 安全建议

1. **修改默认密码**
   - 在 `.env` 文件中使用强密码
   - 定期更换密码

2. **启用防火墙**
   ```bash
   sudo ufw enable
   ```

3. **配置 Fail2ban**
   ```bash
   sudo apt install fail2ban
   ```

4. **定期更新**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

5. **定期备份**
   - 备份已配置在 crontab 中
   - 备份位置：`/opt/backups`

## 📊 监控和维护

### 查看服务状态

```bash
# Docker 服务
cd /opt/high-eq-project/high-eq-backend
sudo docker-compose -f docker-compose.prod.yml ps

# Nginx 状态
sudo systemctl status nginx
```

### 查看日志

```bash
# Docker 日志
sudo docker-compose -f docker-compose.prod.yml logs -f

# Nginx 日志
sudo tail -f /var/log/nginx/high-eq-backend-*.log
```

### 更新部署

```bash
cd /opt/high-eq-project/high-eq-backend

# 拉取最新代码
sudo git pull

# 重新构建并启动
sudo docker-compose -f docker-compose.prod.yml up -d --build

# 清理旧镜像
sudo docker image prune -a -f
```

## 🔄 SSL 证书续期

SSL 证书已配置自动续期（每天凌晨 3 点检查），你也可以手动续期：

```bash
sudo certbot renew
```

查看证书状态：

```bash
sudo certbot certificates
```

## 🆘 故障处理

### 服务无法启动

```bash
# 查看容器日志
sudo docker-compose -f docker-compose.prod.yml logs

# 检查端口占用
sudo netstat -tlnp | grep :8080
```

### SSL 证书问题

```bash
# 手动续期
sudo certbot renew

# 测试配置
sudo nginx -t

# 重载 Nginx
sudo systemctl reload nginx
```

### 数据库连接问题

```bash
# 进入 MySQL 容器
sudo docker-compose -f docker-compose.prod.yml exec mysql bash

# 测试连接
mysql -u${MYSQL_USER} -p${MYSQL_PASSWORD}
```

## 📞 技术支持

如遇到问题，请：

1. 查看 `DEPLOYMENT_CHECKLIST.md` 详细检查清单
2. 检查日志文件排查问题
3. 联系技术支持：support@example.com

## 📝 更新日志

- 2024-03-04: 初始版本
  - 添加一键部署脚本
  - 添加 SSL 证书配置
  - 添加 Nginx 配置
  - 添加部署检查清单
