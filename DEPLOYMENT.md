# HighEQ 前端部署指南

## Nginx 静态托管方案

### 1. 构建前端

```bash
cd high-eq-front
pnpm install
pnpm build
```

构建产物位于 `dist/` 目录。

### 2. 部署到服务器

```bash
# 方式一：直接复制到服务器
scp -r dist/* user@server:/var/www/high-eq/dist/

# 方式二：使用 rsync 同步
rsync -avz --delete dist/ user@server:/var/www/high-eq/dist/
```

### 3. 配置 Nginx

```bash
# 1. 复制配置文件
sudo cp nginx.conf.example /etc/nginx/sites-available/high-eq.conf

# 2. 修改配置中的域名和路径
sudo nano /etc/nginx/sites-available/high-eq.conf

# 3. 创建软链接启用站点
sudo ln -s /etc/nginx/sites-available/high-eq.conf /etc/nginx/sites-enabled/

# 4. 测试配置
sudo nginx -t

# 5. 重载 Nginx
sudo nginx -s reload
```

### 4. 配置 HTTPS（可选）

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取并自动配置 SSL 证书
sudo certbot --nginx -d your-domain.com
```

## 目录结构

```
/var/www/high-eq/
├── dist/                    # 前端构建产物
│   ├── index.html
│   └── assets/
│       ├── index-[hash].js
│       └── index-[hash].css
└── logs/                    # 日志目录（可选）
```

## API 配置

前端默认使用相对路径 `/api` 请求后端，由 Nginx 代理到 `http://localhost:8080`。

如需修改后端地址，在构建时设置环境变量：

```bash
# 自定义后端地址
VITE_API_URL=https://api.example.com pnpm build
```

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `VITE_API_URL` | 后端 API 地址 | `/api` |

## 开发环境

```bash
cd high-eq-front
pnpm dev
```

访问 `http://localhost:3000`

## 常见问题

### 1. 路由刷新 404

确保 Nginx 配置中有 `try_files $uri $uri/ /index.html;`

### 2. API 请求跨域

使用 Nginx 代理 `/api` 到后端，不要在前端直接请求后端地址。

### 3. 静态资源 404

检查 `root` 路径是否正确指向构建产物目录。
