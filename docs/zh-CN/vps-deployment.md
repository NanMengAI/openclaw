# OpenClaw VPS 部署指南

> 适用于已安装Docker的VPS服务器，针对中国网络环境优化

## 前置条件

- VPS服务器（1核2G内存以上推荐）
- 已安装Docker和Docker Compose
- 开放端口：18789（Web访问）
- 南梦AI的API密钥（访问 https://www.nanmengai.cn 获取）

## 快速检查Docker

```bash
# 检查Docker版本
docker --version
docker compose version

# 如果没有安装Docker Compose，请安装
sudo apt update
sudo apt install docker-compose-plugin -y
```

---

## 方式一：一键部署（推荐）

### 步骤1：下载并运行部署脚本

```bash
# 克隆项目
git clone https://github.com/NanMengAI/openclaw.git
cd openclaw

# 添加执行权限并运行部署脚本
chmod +x scripts/deploy-cn.sh
./scripts/deploy-cn.sh
```

脚本会自动完成：
- 检查Docker环境
- 配置国内镜像加速
- 安装所有扩展
- 构建并启动容器

### 步骤2：访问Web界面进行初始化

部署完成后，在浏览器访问：

```
http://你的服务器IP:18789
```

按照Web向导完成配置：
1. 配置AI模型（选择南梦AI）
2. 配置消息渠道（企业微信/钉钉/飞书）
3. 设置安全选项
4. 完成初始化

---

## 方式二：手动部署（更灵活）

### 步骤1：克隆项目

```bash
git clone https://github.com/NanMengAI/openclaw.git
cd openclaw
```

### 步骤2：配置环境变量

```bash
# 复制环境变量模板
cp .env.cn.example .env

# 编辑环境变量
nano .env
```

**必填配置项：**

```bash
# ===== AI模型配置（必填）=====
# 访问 https://www.nanmengai.cn 获取API密钥
OPENAI_API_KEY=sk-your-nanmeng-api-key
OPENAI_BASE_URL=https://api.nanmengai.cn/v1
DEFAULT_MODEL=gpt-4o

# ===== 网关配置 =====
GATEWAY_PORT=18789
GATEWAY_HOST=0.0.0.0

# ===== 安全配置（推荐修改）=====
# 生成随机令牌：openssl rand -hex 32
GATEWAY_TOKEN=your-secure-random-token-here
```

**可选配置项（按需添加）：**

```bash
# ===== 企业微信配置 =====
WECOM_CORP_ID=your-corp-id
WECOM_CORP_SECRET=your-corp-secret
WECOM_AGENT_ID=your-agent-id
WECOM_TOKEN=your-wecom-token
WECOM_ENCODING_AES_KEY=your-aes-key

# ===== 钉钉配置 =====
DINGTALK_APP_KEY=your-app-key
DINGTALK_APP_SECRET=your-app-secret
DINGTALK_AGENT_ID=your-agent-id

# ===== 飞书配置 =====
FEISHU_APP_ID=your-app-id
FEISHU_APP_SECRET=your-app-secret
```

保存并退出（Ctrl+X，然后Y，然后Enter）

### 步骤3：配置Docker镜像加速（可选但推荐）

```bash
# 创建Docker配置目录
sudo mkdir -p /etc/docker

# 配置镜像加速
sudo tee /etc/docker/daemon.json <<EOF
{
  "registry-mirrors": [
    "https://docker.1ms.run",
    "https://docker.1panel.live",
    "https://docker.m.daocloud.io"
  ]
}
EOF

# 重启Docker
sudo systemctl daemon-reload
sudo systemctl restart docker
```

### 步骤4：构建并启动服务

```bash
# 使用中国优化版本构建
docker compose -f docker-compose.cn.yml build

# 启动服务
docker compose -f docker-compose.cn.yml up -d

# 查看日志
docker compose -f docker-compose.cn.yml logs -f
```

### 步骤5：验证部署

```bash
# 检查容器状态
docker compose -f docker-compose.cn.yml ps

# 应该看到类似输出：
# NAME                COMMAND             STATUS              PORTS
# openclaw-gateway    "node server.js"    Up 2 minutes        0.0.0.0:18789->18789/tcp

# 检查服务健康状态
curl http://localhost:18789/health

# 应该返回：{"status":"ok"}
```

### 步骤6：访问Web界面

在浏览器访问：`http://你的服务器IP:18789`

---

## 常用管理命令

### 查看服务状态

```bash
cd openclaw
docker compose -f docker-compose.cn.yml ps
```

### 查看日志

```bash
# 查看所有日志
docker compose -f docker-compose.cn.yml logs -f

# 查看最近100行
docker compose -f docker-compose.cn.yml logs --tail=100
```

### 重启服务

```bash
docker compose -f docker-compose.cn.yml restart
```

### 停止服务

```bash
docker compose -f docker-compose.cn.yml down
```

### 停止并删除所有数据（谨慎使用）

```bash
docker compose -f docker-compose.cn.yml down -v
```

### 更新配置后重启

```bash
# 修改.env文件后
nano .env

# 重新构建并重启
docker compose -f docker-compose.cn.yml up -d --build
```

### 查看资源使用情况

```bash
docker stats openclaw-gateway
```

---

## 防火墙配置

如果您的服务器开启了防火墙，需要开放端口：

### Ubuntu/Debian (UFW)

```bash
sudo ufw allow 18789/tcp
sudo ufw status
```

### CentOS/RHEL (firewalld)

```bash
sudo firewall-cmd --permanent --add-port=18789/tcp
sudo firewall-cmd --reload
```

---

## 域名绑定（可选）

如果您想使用域名访问，需要配置反向代理：

### 使用Nginx

```bash
# 安装Nginx
sudo apt install nginx -y

# 创建配置文件
sudo nano /etc/nginx/sites-available/openclaw
```

添加以下内容：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:18789;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# 启用配置
sudo ln -s /etc/nginx/sites-available/openclaw /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 配置SSL（推荐）

```bash
# 安装Certbot
sudo apt install certbot python3-certbot-nginx -y

# 申请SSL证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo systemctl enable certbot.timer
```

---

## 故障排查

### 问题1：无法访问18789端口

**解决方案：**
```bash
# 检查服务是否运行
docker compose -f docker-compose.cn.yml ps

# 检查端口是否监听
netstat -tlnp | grep 18789

# 检查防火墙
sudo ufw status
```

### 问题2：容器启动失败

**解决方案：**
```bash
# 查看详细日志
docker compose -f docker-compose.cn.yml logs

# 检查环境变量
cat .env

# 重新构建
docker compose -f docker-compose.cn.yml build --no-cache
docker compose -f docker-compose.cn.yml up -d
```

### 问题3：连接南梦AI失败

**解决方案：**
```bash
# 测试API连接
curl -H "Authorization: Bearer sk-your-key" \
     https://api.nanmengai.cn/v1/models

# 检查环境变量是否正确
docker compose -f docker-compose.cn.yml exec openclaw-gateway env | grep OPENAI
```

### 问题4：Docker镜像拉取慢

**解决方案：**
```bash
# 使用构建脚本（已包含镜像加速）
chmod +x scripts/build-docker-cn.sh
./scripts/build-docker-cn.sh

# 或手动配置镜像加速（见步骤3）
```

### 问题5：内存不足

**解决方案：**
```bash
# 修改docker-compose.cn.yml，限制内存使用
nano docker-compose.cn.yml

# 在services.openclaw-gateway下添加：
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M
```

---

## 性能优化建议

### 1. 使用SSD硬盘
数据持久化会频繁读写，SSD性能更好

### 2. 增加内存
推荐至少2GB内存，4GB更佳

### 3. 配置日志轮转
```bash
# 限制Docker日志大小
sudo nano /etc/docker/daemon.json
```

添加：
```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

### 4. 定期清理
```bash
# 清理未使用的镜像和容器
docker system prune -a

# 清理未使用的卷
docker volume prune
```

---

## 安全建议

1. **修改默认端口**：在.env中修改`GATEWAY_PORT`
2. **使用强密码**：生成随机的`GATEWAY_TOKEN`
3. **配置SSL**：使用HTTPS访问
4. **定期更新**：`git pull && docker compose up -d --build`
5. **备份数据**：定期备份`/var/lib/docker/volumes/`
6. **限制访问**：使用防火墙限制只允许特定IP访问

---

## 数据备份

```bash
# 备份数据卷
docker run --rm -v openclaw_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/openclaw-backup-$(date +%Y%m%d).tar.gz /data

# 恢复备份
docker run --rm -v openclaw_data:/data -v $(pwd):/backup \
  alpine tar xzf /backup/openclaw-backup-YYYYMMDD.tar.gz -C /
```

---

## 卸载

```bash
cd openclaw

# 停止并删除容器
docker compose -f docker-compose.cn.yml down

# 删除数据卷（谨慎！）
docker compose -f docker-compose.cn.yml down -v

# 删除镜像
docker rmi openclaw:latest

# 删除项目文件
cd ..
rm -rf openclaw
```

---

## 获取帮助

- **南梦AI官网**：https://www.nanmengai.cn
- **项目文档**：查看 `docs/zh-CN/` 目录
- **问题反馈**：GitHub Issues

---

## 快速参考

```bash
# 一键部署
git clone https://github.com/NanMengAI/openclaw.git && cd openclaw && ./scripts/deploy-cn.sh

# 访问地址
http://你的服务器IP:18789

# 查看日志
docker compose -f docker-compose.cn.yml logs -f

# 重启服务
docker compose -f docker-compose.cn.yml restart

# 停止服务
docker compose -f docker-compose.cn.yml down
```

部署完成后，记得访问 https://www.nanmengai.cn 获取API密钥，然后在Web界面完成初始化配置！
