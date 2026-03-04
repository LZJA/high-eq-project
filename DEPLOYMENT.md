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

创建 Nginx 配置文件 `/etc/nginx/sites-available/high-eq.conf`：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/high-eq/dist;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # 前端静态文件
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "public, max-age=3600";
    }

    # 代理后端 API
    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # CORS 头
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "Authorization, Content-Type";
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

启用站点：

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/high-eq.conf /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重载 Nginx
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

## Docker 部署（可选）

### Dockerfile

```dockerfile
# 多阶段构建
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 生产镜像
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 构建和运行

```bash
# 构建镜像
docker build -t high-eq-front:latest .

# 运行容器
docker run -d -p 80:80 --name high-eq-front high-eq-front:latest
```

## 常见问题

### 1. 路由刷新 404

确保 Nginx 配置中有 `try_files $uri $uri/ /index.html;`

### 2. API 请求跨域

使用 Nginx 代理 `/api` 到后端，不要在前端直接请求后端地址。

### 3. 静态资源 404

检查 `root` 路径是否正确指向构建产物目录。
