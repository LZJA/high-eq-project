# 📝 服务器常用命令速查表

> 部署和管理服务器时常用的命令，方便快速查找。

## 🔌 连接服务器

```bash
# SSH 连接
ssh root@你的服务器IP

# 使用密钥连接
ssh -i /path/to/key.pem user@your-server-ip
```

## 🐳 Docker 命令

### 服务管理

```bash
# 进入项目目录
cd /opt/high-eq-project/high-eq-backend

# 启动服务
sudo docker-compose -f docker-compose.prod.yml up -d

# 停止服务
sudo docker-compose -f docker-compose.prod.yml down

# 重启服务
sudo docker-compose -f docker-compose.prod.yml restart

# 查看服务状态
sudo docker-compose -f docker-compose.prod.yml ps

# 查看日志
sudo docker-compose -f docker-compose.prod.yml logs -f

# 查看特定服务日志
sudo docker-compose -f docker-compose.prod.yml logs -f backend
sudo docker-compose -f docker-compose.prod.yml logs -f mysql
```

### 容器操作

```bash
# 查看所有容器
docker ps -a

# 进入容器
docker exec -it high-eq-backend-prod bash
docker exec -it high-eq-mysql-prod bash

# 查看容器资源使用
docker stats

# 清理未使用的镜像
docker image prune -a

# 清理未使用的容器
docker container prune
```

## 🗄️ 数据库命令

```bash
# 进入 MySQL
docker exec -it high-eq-mysql-prod mysql -uroot -p

# 备份数据库
docker exec high-eq-mysql-prod mysqldump -uroot -p higheq > backup.sql

# 恢复数据库
docker exec -i high-eq-mysql-prod mysql -uroot -p higheq < backup.sql

# 查看数据库大小
docker exec high-eq-mysql-prod mysql -uroot -p -e "
SELECT table_schema AS 'Database',
ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables
GROUP BY table_schema;"
```

## 🌐 Nginx 命令

```bash
# 测试配置
sudo nginx -t

# 重新加载配置
sudo nginx -s reload

# 重启 Nginx
sudo systemctl restart nginx

# 查看 Nginx 状态
sudo systemctl status nginx

# 查看 Nginx 日志
sudo tail -f /var/log/nginx/high-eq-backend-error.log
sudo tail -f /var/log/nginx/high-eq-backend-access.log
```

## 🔒 SSL 证书命令

```bash
# 查看 SSL 证书状态
sudo certbot certificates

# 手动续期
sudo certbot renew

# 测试续期
sudo certbot renew --dry-run

# 强制续期
sudo certbot renew --force-renewal

# 撤销证书
sudo certbot revoke --cert-path /etc/letsencrypt/live/your-domain.com/cert.pem

# 删除证书
sudo certbot delete --cert-name your-domain.com
```

## 📊 系统监控命令

```bash
# 查看系统资源使用
htop

# 或者用 top
top

# 查看内存使用
free -h

# 查看磁盘使用
df -h

# 查看磁盘 IO
iotop

# 查看网络连接
netstat -tlnp

# 查看系统日志
sudo journalctl -f

# 查看 Docker 日志
sudo journalctl -u docker -f
```

## 📁 文件操作命令

```bash
# 进入项目目录
cd /opt/high-eq-project

# 查看文件
ls -la

# 编辑文件
nano filename
vim filename

# 复制文件
cp source dest

# 移动文件
mv source dest

# 删除文件
rm filename

# 删除目录
rm -rf directory

# 查找文件
find / -name filename

# 查看文件内容
cat filename
less filename

# 压缩文件
tar -czf archive.tar.gz directory/

# 解压文件
tar -xzf archive.tar.gz
```

## 🔍 日志查看命令

```bash
# 实时查看日志
tail -f filename

# 查看最后 100 行
tail -n 100 filename

# 搜索日志
grep "keyword" filename

# 查看系统日志
sudo journalctl

# 查看特定服务的日志
sudo journalctl -u nginx
sudo journalctl -u docker

# 查看昨天的日志
sudo journalctl --since yesterday

# 查看最近 1 小时的日志
sudo journalctl --since "1 hour ago"
```

## 🔄 更新和升级

```bash
# 更新系统
sudo apt update
sudo apt upgrade -y

# 更新代码
cd /opt/high-eq-project
sudo git pull

# 重新构建和启动
cd high-eq-backend
sudo docker-compose -f docker-compose.prod.yml up -d --build
```

## 🔥 防火墙命令

```bash
# Ubuntu/Debian (UFW)
sudo ufw enable
sudo ufw status
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload

# CentOS/RHEL (firewalld)
sudo firewall-cmd --list-all
sudo firewall-cmd --add-service=http --permanent
sudo firewall-cmd --add-service=https --permanent
sudo firewall-cmd --reload
```

## 🛠️ 故障排查命令

```bash
# 检查端口占用
sudo netstat -tlnp | grep :8080

# 检查进程
ps aux | grep java

# 杀死进程
kill PID
kill -9 PID

# 查看系统负载
uptime

# 查看最近登录
last

# 查看当前用户
who

# 查看系统时间
date
timedatectl
```

## 📱 快捷命令别名

在 `~/.bashrc` 或 `~/.bash_aliases` 中添加：

```bash
# 项目别名
alias higheq='cd /opt/high-eq-project'
alias higheq-log='cd /opt/high-eq-project/high-eq-backend && sudo docker-compose -f docker-compose.prod.yml logs -f'
alias higheq-restart='cd /opt/high-eq-project/high-eq-backend && sudo docker-compose -f docker-compose.prod.yml restart'
alias nginx-reload='sudo nginx -t && sudo nginx -s reload'
alias ssl-renew='sudo certbot renew'
```

使别名生效：
```bash
source ~/.bashrc
```

## 🆘 紧急命令

```bash
# 立即停止所有服务
cd /opt/high-eq-project/high-eq-backend
sudo docker-compose -f docker-compose.prod.yml down

# 清理所有 Docker 资源（危险！）
docker system prune -a --volumes

# 重启服务器
sudo reboot

# 关闭服务器
sudo shutdown now
```

## 📞 获取帮助

```bash
# 命令帮助
command --help

# 手册页
man command

# Docker 帮助
docker --help
docker-compose --help

# Nginx 帮助
nginx -h
```

---

💡 **提示**：将此文件加入书签，方便随时查阅！
