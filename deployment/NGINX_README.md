# Nginx 配置文件

本目录包含生产环境Nginx配置文件。

## 文件说明

| 文件 | 用途 | 部署位置 |
|------|------|----------|
| `nginx-front.conf` | 前端+API代理 | `/etc/nginx/conf.d/high-eq-front.conf` |
| `nginx-api.conf` | API子域名 | `/etc/nginx/conf.d/api.higheq.top.conf` |

## 部署命令

```bash
# 前端配置
scp deployment/nginx-front.conf root@8.136.193.199:/etc/nginx/conf.d/high-eq-front.conf

# API配置
scp deployment/nginx-api.conf root@8.136.193.199:/etc/nginx/conf.d/api.higheq.top.conf

# 重载Nginx
ssh root@8.136.193.199 "nginx -t && systemctl reload nginx"
```

## 配置说明

### 前端配置 (nginx-front.conf)
- HTTP重定向到HTTPS
- HTTPS服务（监听443端口）
- 前端静态文件托管
- `/api/` 路径代理到后端8080端口
- SPA路由支持

### API配置 (nginx-api.conf)
- API子域名 `api.higheq.top`
- 使用Let's Encrypt证书
- 所有请求代理到后端8080端口

## 注意事项

1. 证书路径：
   - 主域名：`/etc/letsencrypt/live/higheq.top/`
   - API子域名：`/root/.acme.sh/api.higheq.top_ecc/`

2. 备案前临时配置：
   - 使用IP访问：`https://8.136.193.199`
   - 前端配置设置了 `default_server` 确保IP访问时使用前端配置

3. 备案后切换：
   - 前端：`https://higheq.top`
   - API：`https://api.higheq.top`
