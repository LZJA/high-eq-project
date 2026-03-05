# 🎯 部署准备完成总结

> 你现在拥有所有部署所需的文件和文档。请按照以下顺序阅读和操作。

## 📚 文档导航

### 第一次部署？从这里开始：

1. **[BEGINNER_GUIDE.md](BEGINNER_GUIDE.md)** ⭐ 必读
   - 小白专用完整部署指南
   - 从购买服务器到部署成功的每一步
   - 包含常见问题解决方案

2. **[CONFIG_CHECKLIST.md](CONFIG_CHECKLIST.md)** ⭐ 必读
   - 部署前必须修改的配置文件清单
   - 每个配置项的详细说明
   - 快速配置命令

### 已经有经验？直接看：

3. **[README.md](README.md)** - 部署文件夹说明
4. **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - 详细检查清单
5. **[COMMANDS.md](COMMANDS.md)** - 常用命令速查表

---

## 🔧 部署文件说明

### deployment/ 目录结构

```
deployment/
├── README.md                    # 部署说明文档
├── BEGINNER_GUIDE.md           # ⭐ 小白完整指南
├── CONFIG_CHECKLIST.md         # ⭐ 配置修改清单
├── COMMANDS.md                 # 常用命令速查
├── DEPLOYMENT_CHECKLIST.md     # 详细检查清单
├── deploy-production.sh        # ⭐ 一键部署脚本
├── setup-ssl.sh                # SSL 证书配置脚本
└── nginx.conf                  # Nginx 反向代理配置
```

### 后端生产配置

```
high-eq-backend/
├── Dockerfile                  # Docker 镜像配置
├── docker-compose.yml          # 开发环境编排
├── docker-compose.prod.yml     # ⭐ 生产环境编排
├── .env.example               # 环境变量模板
├── src/main/resources/
│   ├── application.yml        # 默认配置
│   └── application-prod.yml   # ⭐ 生产环境配置
└── src/main/java/com/highiq/config/
    └── CorsProdConfig.java    # ⭐ 生产环境 CORS
```

### 前端生产配置

```
high-eq-front/
├── .env                       # 本地开发配置
├── .env.production           # ⭐ 生产环境配置
├── vite.config.ts            # Vite 配置
└── package.json              # 构建脚本
```

---

## ⚠️ 部署前必须修改的配置

### 1. 后端环境变量 (.env)

```bash
# 复制模板
cp high-eq-backend/.env.example high-eq-backend/.env

# 必须修改以下内容：
MYSQL_PASSWORD=你的强密码
MYSQL_ROOT_PASSWORD=你的强密码
JWT_SECRET=$(openssl rand -base64 32)  # 生成随机密钥
DEEPSEEK_API_KEY=你的真实API密钥
```

### 2. 前端生产配置 (.env.production)

```bash
# 创建生产环境配置
cat > high-eq-front/.env.production << EOF
VITE_API_URL=https://你的域名.com/api
VITE_APP_TITLE=高情商回复助手
VITE_API_TIMEOUT=30000
EOF
```

### 3. Nginx 配置 (nginx.conf)

```bash
# 替换域名
sed -i 's/your-domain.com/你的域名.com/g' deployment/nginx.conf
```

---

## 🚀 快速部署流程

### 步骤 1：准备服务器

```bash
# 连接服务器
ssh root@你的服务器IP

# 安装 Docker（如果没有）
curl -fsSL https://get.docker.com | sh

# 添加用户到 docker 组
usermod -aG docker $USER
```

### 步骤 2：上传代码

```bash
# 方式 A：使用 Git（推荐）
cd /opt
git clone https://github.com/你的用户名/high-eq-project.git

# 方式 B：使用 SCP
scp -r high-eq-project root@你的服务器IP:/opt/
```

### 步骤 3：修改配置

```bash
cd /opt/high-eq-project

# 1. 修改后端配置
nano high-eq-backend/.env

# 2. 修改前端配置
nano high-eq-front/.env.production

# 3. 修改 Nginx 配置中的域名
sed -i 's/your-domain.com/你的域名/g' deployment/nginx.conf
```

### 步骤 4：一键部署

```bash
cd /opt/high-eq-project

# 运行部署脚本
sudo ./deployment/deploy-production.sh 你的域名.com your@email.com
```

### 步骤 5：验证部署

```bash
# 检查服务状态
cd /opt/high-eq-project/high-eq-backend
sudo docker-compose -f docker-compose.prod.yml ps

# 检查日志
sudo docker-compose -f docker-compose.prod.yml logs -f
```

在浏览器访问：
- HTTP: `http://你的域名.com`（应跳转 HTTPS）
- HTTPS: `https://你的域名.com`
- API: `https://你的域名.com/api/actuator/health`

---

## 📋 部署检查清单

部署前，请确保：

### 服务器准备

- [ ] 服务器已购买并可连接
- [ ] Docker 已安装
- [ ] 防火墙已开放 80、443 端口
- [ ] 域名已解析到服务器 IP

### 配置文件

- [ ] `.env` 文件已创建
- [ ] MySQL 密码已改为强密码
- [ ] JWT_SECRET 已改为随机密钥
- [ ] DEEPSEEK_API_KEY 已填入真实值
- [ ] 前端 `.env.production` 已创建
- [ ] API 地址已改为正确域名

### 域名和 SSL

- [ ] 域名解析已生效（ping 测试通过）
- [ ] SSL 证书已成功获取
- [ ] HTTPS 访问正常

---

## 🎉 部署成功后

### 服务管理

```bash
# 查看服务状态
cd /opt/high-eq-project/high-eq-backend
sudo docker-compose -f docker-compose.prod.yml ps

# 查看日志
sudo docker-compose -f docker-compose.prod.yml logs -f

# 重启服务
sudo docker-compose -f docker-compose.prod.yml restart
```

### 数据备份

备份位置：`/opt/backups/`

自动备份时间：每天凌晨 2 点

手动备份：
```bash
docker-compose -f docker-compose.prod.yml exec mysql \
    mysqldump -uroot -p${MYSQL_PASSWORD} higheq > backup.sql
```

### SSL 证书续期

自动续期：每天凌晨 3 点

手动续期：
```bash
sudo certbot renew
```

---

## 🆘 遇到问题？

### 1. 查看 [BEGINNER_GUIDE.md](BEGINNER_GUIDE.md) 的「常见问题」章节

### 2. 检查日志

```bash
# Docker 日志
cd /opt/high-eq-project/high-eq-backend
sudo docker-compose -f docker-compose.prod.yml logs

# Nginx 日志
sudo tail -f /var/log/nginx/high-eq-backend-error.log

# 系统日志
sudo journalctl -u docker -f
```

### 3. 常用排查命令

```bash
# 检查端口占用
sudo netstat -tlnp | grep :8080

# 检查容器状态
docker ps -a

# 检查防火墙
sudo ufw status

# 检查域名解析
ping 你的域名.com
```

---

## 📞 需要更多帮助？

- 查看 [COMMANDS.md](COMMANDS.md) 了解常用命令
- 查看 [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) 了解详细步骤
- 查看代码中的注释了解更多细节

---

## ✅ 最后检查

部署完成后，请确认：

- [ ] 网站可以通过域名访问
- [ ] HTTPS 正常工作（小绿锁 🔒）
- [ ] API 接口正常响应
- [ ] 用户可以注册和登录
- [ ] AI 回复功能正常
- [ ] SSL 证书自动续期已配置
- [ ] 数据库自动备份已配置

---

**祝你部署顺利！🎉**

如有问题，请仔细阅读相关文档或查看日志排查。
