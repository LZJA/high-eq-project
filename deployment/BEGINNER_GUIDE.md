# 🚀 服务器部署完全指南 - 小白专用

> 本指南专为第一次部署服务器的用户准备，每个步骤都有详细说明。

## 📚 目录

1. [准备工作](#1-准备工作)
2. [购买服务器](#2-购买服务器)
3. [域名配置](#3-域名配置)
4. [服务器连接](#4-服务器连接)
5. [代码配置修改](#5-代码配置修改)
6. [上传代码](#6-上传代码)
7. [一键部署](#7-一键部署)
8. [验证部署](#8-验证部署)
9. [常见问题](#9-常见问题)

---

## 1. 准备工作

### 你需要准备：

- [ ] 一台电脑（Windows/Mac/Linux 都可以）
- [ ] 一个域名（如：example.com）
- [ ] 一个服务器（推荐：阿里云、腾讯云、华为云）
- [ ] 一个 SSH 客户端软件
  - Windows: [MobaXterm](https://mobaxterm.mobatek.net/)（推荐）或 PuTTY
  - Mac/Linux: 自带终端即可
- [ ] 一个 FTP 工具（可选，用于上传文件）
  - 推荐使用：[FileZilla](https://filezilla-project.org/)
- [ ] 你的代码文件

### 名词解释：

| 名词 | 解释 | 例子 |
|------|------|------|
| **服务器** | 一台 24 小时运行的远程电脑 | 阿里云 ECS 服务器 |
| **域名** | 网站的网址，方便记忆 | baidu.com, google.com |
| **SSH** | 远程连接服务器的方式 | 像远程桌面一样控制服务器 |
| **Docker** | 容器技术，让应用运行更简单 | 像一个独立的小盒子 |
| **Nginx** | 网页服务器，处理访问请求 | 像网站的门卫 |
| **SSL 证书** | 让网站变成 HTTPS，更安全 | 网址前面有小绿锁 🔒 |

---

## 2. 购买服务器

### 推荐配置：

| 项目 | 最低配置 | 推荐配置 |
|------|---------|---------|
| CPU | 2 核 | 2-4 核 |
| 内存 | 2GB | 4GB |
| 硬盘 | 40GB | 40-80GB |
| 系统 | Ubuntu 20.04+ | Ubuntu 22.04 LTS |
| 带宽 | 1Mbps | 3-5Mbps |

### 购买步骤（以阿里云为例）：

1. 访问 [阿里云官网](https://www.aliyun.com/)
2. 注册/登录账号
3. 选择「产品」→「云服务器 ECS」
4. 点击「创建实例」
5. 选择配置：
   - 付费方式：包年包月（第一次建议买 1-3 个月测试）
   - 地域：选择离你用户最近的
   - 实例规格：选择 2 核 4GB
   - 镜像：Ubuntu 22.04 64 位
6. 设置密码：**记住这个密码！**（root 用户密码）
7. 确认订单并付款

### 购买后你会得到：

- **公网 IP**：类似 `47.100.100.100` 这样的数字
- **SSH 密码**：刚才设置的 root 密码

---

## 3. 域名配置

### 什么是域名？

- IP 地址：`47.100.100.100`（难记）
- 域名：`your-site.com`（好记）

### 域名解析（重要！）：

1. 登录你的域名服务商（阿里云/腾讯云等）
2. 找到「域名管理」→「解析设置」
3. 添加以下记录：

| 类型 | 主机记录 | 记录值 | TTL |
|------|---------|--------|-----|
| A 记录 | @ | 你的服务器 IP | 600 |
| A 记录 | www | 你的服务器 IP | 600 |

**示例：**
- 你的域名：`example.com`
- 你的 IP：`47.100.100.100`
- 配置后：`example.com` 和 `www.example.com` 都会指向你的服务器

4. 等待生效（通常 10 分钟左右）

### 验证解析：

在你的电脑上打开命令行，输入：
```bash
ping your-domain.com
```
如果返回你的服务器 IP，说明解析成功。

---

## 4. 服务器连接

### Windows 用户（使用 MobaXterm）：

1. 下载并安装 [MobaXterm](https://mobaxterm.mobatek.net/)
2. 打开 MobaXterm
3. 点击「Session」→「SSH」
4. 填写信息：
   - Remote host：你的服务器 IP
   - Specify username：root
   - Port：22
5. 点击 OK
6. 输入密码（购买服务器时设置的）
7. 点击保存，下次直接连接

### Mac/Linux 用户：

打开终端，输入：
```bash
ssh root@你的服务器IP
```
输入密码后回车。

### 连接成功标志：

你会看到类似这样的提示：
```bash
root@iZj6cxxxxxx:~#
```
恭喜！你现在可以控制远程服务器了。

---

## 5. 代码配置修改

在部署前，**必须**修改以下配置。

### 📝 需要修改的文件清单：

#### 5.1 后端配置

**文件：`high-eq-backend/.env`**

```bash
# 复制配置模板
cp high-eq-backend/.env.example high-eq-backend/.env

# 编辑配置
nano high-eq-backend/.env
```

**必须修改的内容：**

```bash
# 1. MySQL 密码（改成强密码）
MYSQL_PASSWORD=YourStrongPassword123!@#

# 2. MySQL root 密码（改成强密码）
MYSQL_ROOT_PASSWORD=YourRootPassword123!@#

# 3. 数据库名（可以不改，也可以改成你喜欢的）
MYSQL_DATABASE=higheq

# 4. JWT 密钥（必须改成随机的！）
# 生成方法：openssl rand -base64 32
JWT_SECRET=这里填入生成的随机密钥

# 5. DeepSeek API Key（必须填入真实的）
DEEPSEEK_API_KEY=sk-你的真实API密钥
```

**生成 JWT 密钥的命令：**
```bash
openssl rand -base64 32
```
复制输出的一串字符，粘贴到 `JWT_SECRET=` 后面。

#### 5.2 前端配置

**文件：`high-eq-front/.env.production`**

```bash
# 创建生产环境配置
nano high-eq-front/.env.production
```

**必须修改的内容：**

```bash
# API 地址（改成你的域名）
VITE_API_URL=https://your-domain.com/api
```

**注意：**
- 如果前端和后端在同一域名下，使用 `/api`
- 如果分开部署，使用完整地址 `https://api.your-domain.com`

#### 5.3 CORS 配置（如果需要限制访问）

如果你的前端和后端不在同一域名，需要修改 CORS 配置：

**文件：`high-eq-backend/.env`**

添加：
```bash
# 允许的前端域名（多个用逗号分隔）
CORS_ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

---

## 6. 上传代码

### 方法一：使用 Git（推荐）

```bash
# 在服务器上执行
cd /opt
sudo git clone https://github.com/your-username/high-eq-project.git
```

### 方法二：使用 FTP 上传

1. 打开 FileZilla
2. 填写连接信息：
   - 主机：你的服务器 IP
   - 用户名：root
   - 密码：你的服务器密码
   - 端口：22
3. 连接后，把本地代码上传到 `/opt/high-eq-project`

### 方法三：使用 SCP（Mac/Linux）

```bash
# 在本地电脑执行
scp -r high-eq-project root@你的服务器IP:/opt/
```

---

## 7. 一键部署

### 🚀 开始部署

```bash
# 进入项目目录
cd /opt/high-eq-project

# 给脚本添加执行权限
chmod +x deployment/deploy-production.sh

# 运行部署脚本
sudo ./deployment/deploy-production.sh your-domain.com your@email.com
```

**替换说明：**
- `your-domain.com` → 你的域名
- `your@email.com` → 你的邮箱（用于 SSL 证书）

### 部署过程（约 5-10 分钟）：

脚本会自动完成以下步骤：

1. ✅ 检查服务器环境
2. ✅ 配置防火墙
3. ✅ 安装必要软件
4. ✅ 获取 SSL 证书
5. ✅ 配置 Nginx
6. ✅ 启动 Docker 服务
7. ✅ 配置自动备份

### 如果自动部署失败，请查看「手动部署」部分。

---

## 8. 验证部署

### 8.1 检查服务状态

```bash
cd /opt/high-eq-project/high-eq-backend

# 查看容器状态
sudo docker-compose -f docker-compose.prod.yml ps
```

**正常状态应该是：**
```
NAME                    STATUS
high-eq-mysql-prod      Up X minutes
high-eq-backend-prod    Up X minutes
```

### 8.2 检查日志

```bash
# 查看所有日志
sudo docker-compose -f docker-compose.prod.yml logs

# 查看后端日志
sudo docker-compose -f docker-compose.prod.yml logs -f backend
```

### 8.3 测试网站

在浏览器中访问：

1. **HTTP 访问**：`http://your-domain.com`
   - 应该自动跳转到 HTTPS

2. **HTTPS 访问**：`https://your-domain.com`
   - 应该看到你的网站
   - 浏览器地址栏有小绿锁 🔒

3. **API 测试**：`https://your-domain.com/api/actuator/health`
   - 应该返回：`{"status":"UP"}`

### 8.4 测试 SSL 证书

访问：[https://www.ssllabs.com/ssltest/](https://www.ssllabs.com/ssltest/)

输入你的域名，如果得到 A 或 A+ 评分，说明 SSL 配置正确。

---

## 9. 常见问题

### ❌ 问题 1：SSH 连接不上

**可能原因：**
1. 服务器没开机
2. IP 地址错误
3. 密码错误

**解决方法：**
- 检查服务器控制台，确认服务器运行状态
- 重新输入 IP 和密码
- 如果忘记密码，在服务器控制台重置密码

### ❌ 问题 2：域名解析不生效

**解决方法：**
```bash
# 在本地电脑执行
ping your-domain.com
```
如果返回的 IP 不是你的服务器 IP：
- 等待 10-30 分钟（DNS 生效需要时间）
- 检查域名解析设置是否正确
- 清除本地 DNS 缓存：`ipconfig /flushdns`（Windows）

### ❌ 问题 3：SSL 证书申请失败

**可能原因：**
- 域名解析未生效
- 80 端口被占用
- 防火墙未开放 80 端口

**解决方法：**
```bash
# 1. 检查域名解析
ping your-domain.com

# 2. 检查 80 端口
sudo netstat -tlnp | grep :80

# 3. 开放防火墙
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### ❌ 问题 4：Docker 服务启动失败

**查看错误日志：**
```bash
cd /opt/high-eq-project/high-eq-backend
sudo docker-compose -f docker-compose.prod.yml logs
```

**常见错误：**

1. **端口被占用**
   ```bash
   # 检查端口占用
   sudo netstat -tlnp | grep :8080
   # 停止占用端口的服务
   sudo systemctl stop nginx
   ```

2. **内存不足**
   ```bash
   # 检查内存
   free -h
   # 如果内存不够，考虑升级服务器配置
   ```

3. **环境变量错误**
   ```bash
   # 检查 .env 文件
   cat .env
   # 确保 DEEPSEEK_API_KEY 等配置正确
   ```

### ❌ 问题 5：网站可以访问，但 API 报错

**检查方法：**
```bash
# 1. 检查后端服务
curl http://localhost:8080/api/actuator/health

# 2. 检查 Nginx 配置
sudo nginx -t

# 3. 查看 Nginx 日志
sudo tail -f /var/log/nginx/high-eq-backend-error.log
```

---

## 📞 获取帮助

### 日志位置：

```bash
# Docker 日志
cd /opt/high-eq-project/high-eq-backend
sudo docker-compose -f docker-compose.prod.yml logs

# Nginx 日志
sudo tail -f /var/log/nginx/high-eq-backend-error.log
sudo tail -f /var/log/nginx/high-eq-backend-access.log

# 系统日志
sudo journalctl -u docker -f
```

### 重启服务：

```bash
cd /opt/high-eq-project/high-eq-backend

# 重启所有服务
sudo docker-compose -f docker-compose.prod.yml restart

# 只重启后端
sudo docker-compose -f docker-compose.prod.yml restart backend

# 只重启数据库
sudo docker-compose -f docker-compose.prod.yml restart mysql
```

### 更新代码：

```bash
cd /opt/high-eq-project

# 拉取最新代码
sudo git pull

# 重新部署
cd high-eq-backend
sudo docker-compose -f docker-compose.prod.yml up -d --build
```

---

## ✅ 部署完成检查清单

部署完成后，请确认以下项目：

- [ ] 网站可以通过域名访问
- [ ] HTTPS 正常工作（小绿锁）
- [ ] API 接口正常响应
- [ ] 用户可以注册和登录
- [ ] AI 回复功能正常
- [ ] SSL 证书自动续期已配置
- [ ] 数据库自动备份已配置
- [ ] 防火墙已正确配置
- [ ] 日志正常记录

---

## 🎉 恭喜！

如果你完成了以上所有步骤，你的网站已经成功部署到生产环境了！

**维护建议：**
1. 定期查看日志
2. 定期备份数据
3. 及时更新系统安全补丁
4. 监控服务器资源使用

**下一步：**
- 配置 CDN 加速（可选）
- 配置监控告警（可选）
- 优化性能（可选）

祝你部署顺利！🚀
