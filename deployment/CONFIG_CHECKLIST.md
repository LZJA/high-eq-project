# 📋 生产环境配置修改清单

> 部署到生产环境前，必须修改以下配置。

## 📁 需要修改的文件

### 1️⃣ 后端配置

#### 文件：`high-eq-backend/.env.production`

这是后端**生产环境**的配置文件，**必须修改**以下内容：

| 配置项 | 当前值 | 修改为 | 说明 |
|--------|--------|--------|------|
| `MYSQL_PASSWORD` | CHANGE_THIS_TO_STRONG_PASSWORD | 随机强密码 | MySQL 用户密码 |
| `MYSQL_ROOT_PASSWORD` | CHANGE_THIS_TO_STRONG_ROOT_PASSWORD | 随机强密码 | MySQL root 密码 |
| `JWT_SECRET` | CHANGE_THIS_TO_STRONG_JWT_SECRET... | 随机密钥 | JWT 签名密钥 |
| `DEEPSEEK_API_KEY` | sk-CHANGE_THIS... | 真实 API Key | DeepSeek API 密钥 |

**创建和修改步骤：**

```bash
# 1. 复制生产环境模板
cd high-eq-backend
cp .env.production.example .env.production

# 2. 生成强密码
openssl rand -base64 16 | tr -d "=+/" | cut -c1-16

# 3. 生成 JWT 密钥
openssl rand -base64 32

# 4. 编辑文件
nano .env.production
```

**注意：**生产环境使用 `.env.production`，本地开发使用 `.env`，两者分离互不影响。

---

### 2️⃣ 前端配置

#### 文件：`high-eq-front/.env.production`

这是前端生产环境配置文件，**必须修改** API 地址：

| 配置项 | 修改为 | 说明 |
|--------|--------|------|
| `VITE_API_URL` | https://your-domain.com/api | 你的后端 API 地址 |

**修改示例：**
```bash
# 创建生产环境配置
nano high-eq-front/.env.production
```

**内容：**
```bash
VITE_API_URL=https://your-domain.com/api
VITE_APP_TITLE=高情商回复助手
VITE_API_TIMEOUT=30000
```

---

### 3️⃣ CORS 配置（可选）

如果你的前端和后端不在同一域名，需要配置 CORS：

#### 文件：`high-eq-backend/.env`

添加以下配置：
```bash
# 允许的前端域名（多个用逗号分隔）
CORS_ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

---

## 🔧 部署脚本配置

### 文件：`deployment/nginx.conf`

Nginx 配置文件需要修改域名：

**查找并替换：**
```bash
# 将所有 your-domain.com 替换为你的域名
sed -i 's/your-domain.com/your-actual-domain.com/g' deployment/nginx.conf
```

**需要修改的位置：**
1. `server_name your-domain.com www.your-domain.com;`
2. `ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;`
3. `ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;`
4. `ssl_trusted_certificate /etc/letsencrypt/live/your-domain.com/chain.pem;`

---

## ✅ 配置检查清单

部署前，请逐项检查：

### 后端检查

- [ ] `.env` 文件已创建
- [ ] `MYSQL_PASSWORD` 已改为强密码
- [ ] `MYSQL_ROOT_PASSWORD` 已改为强密码
- [ ] `JWT_SECRET` 已改为随机密钥（至少 32 位）
- [ ] `DEEPSEEK_API_KEY` 已填入真实值
- [ ] 密码已妥善保存（建议使用密码管理器）

### 前端检查

- [ ] `.env.production` 文件已创建
- [ ] `VITE_API_URL` 已改为正确的域名
- [ ] API 地址可以通过浏览器访问

### 域名检查

- [ ] 域名已解析到服务器 IP
- [ ] 解析已生效（ping 域名返回正确的 IP）

### 服务器检查

- [ ] 服务器已购买并可连接
- [ ] Docker 已安装
- [ ] 防火墙已开放 80、443 端口

---

## 🚀 快速配置命令

如果你熟悉命令行，可以使用以下命令快速配置：

```bash
# 1. 生成密码和密钥
MYSQL_PASS=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-16)
MYSQL_ROOT_PASS=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-16)
JWT_SECRET=$(openssl rand -base64 32)

# 2. 显示生成的密码（请保存！）
echo "MySQL 密码: $MYSQL_PASS"
echo "MySQL Root 密码: $MYSQL_ROOT_PASS"
echo "JWT 密钥: $JWT_SECRET"

# 3. 创建 .env 文件
cat > high-eq-backend/.env << EOF
MYSQL_USER=root
MYSQL_PASSWORD=$MYSQL_PASS
MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASS
MYSQL_DATABASE=higheq
JWT_SECRET=$JWT_SECRET
DEEPSEEK_API_KEY=sk-your-actual-api-key-here
EOF

# 4. 提醒编辑 API Key
echo "⚠️  请编辑 high-eq-backend/.env 文件，填入真实的 DEEPSEEK_API_KEY"
```

---

## 📝 配置文件对照表

| 环境 | 文件 | 说明 |
|------|------|------|
| 本地开发 | `high-eq-backend/.env` | 本地开发环境变量 |
| 本地开发 | `high-eq-front/.env` | 本地开发环境变量 |
| 生产环境 | `high-eq-backend/.env` | 生产环境环境变量 |
| 生产环境 | `high-eq-front/.env.production` | 生产环境环境变量 |
| 生产配置 | `application-prod.yml` | 生产环境 Spring 配置 |
| 生产配置 | `CorsProdConfig.java` | 生产环境 CORS 配置 |

---

## ⚠️ 重要提醒

1. **不要提交敏感信息到 Git**
   - `.env` 文件已在 `.gitignore` 中
   - 不要把包含真实密码的文件提交到代码仓库

2. **保存好密码**
   - 建议使用密码管理器（如 1Password、Bitwarden）
   - 不要用简单密码（如 123456、password）

3. **定期更换密钥**
   - JWT 密钥建议每 3-6 个月更换一次
   - 数据库密码建议每 3-6 个月更换一次

4. **测试配置**
   - 部署前先在测试环境验证
   - 确保所有配置项都正确

---

## 🆘 配置问题排查

### 问题 1：API 无法访问

**检查：**
```bash
# 检查后端服务状态
curl http://localhost:8080/api/actuator/health

# 检查环境变量
docker exec high-eq-backend-prod env | grep MYSQL
```

### 问题 2：CORS 错误

**检查：**
```bash
# 检查 CORS 配置
# 确保 CORS_ALLOWED_ORIGINS 包含你的前端域名
```

### 问题 3：数据库连接失败

**检查：**
```bash
# 检查数据库容器状态
docker ps | grep mysql

# 检查数据库连接
docker exec -it high-eq-mysql-prod mysql -uroot -p
```

---

## 📞 需要帮助？

如果配置过程中遇到问题：

1. 查看 [BEGINNER_GUIDE.md](BEGINNER_GUIDE.md) 详细部署指南
2. 检查日志文件排查问题
3. 联系技术支持

祝你部署顺利！🎉
