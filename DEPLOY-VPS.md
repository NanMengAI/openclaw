# OpenClaw 中国版 VPS 部署步骤

## 前置条件
- VPS服务器（推荐1核2G以上）
- 已安装Docker
- 南梦AI API密钥（访问 https://www.nanmengai.cn 获取）

## 部署步骤

### 1️⃣ 克隆项目

```bash
# 克隆OpenClaw中国版分支
git clone -b v0/hoang46936420ice-7664-8cd5408b https://github.com/NanMengAI/openclaw.git

# 进入项目目录
cd openclaw
```

### 2️⃣ 配置环境变量

```bash
# 复制环境变量模板
cp .env.cn.example .env

# 编辑配置文件
nano .env
```

**最小配置（必填）：**

```bash
# AI模型配置
OPENAI_API_KEY=sk-your-nanmeng-api-key-here
OPENAI_BASE_URL=https://api.nanmengai.cn/v1
DEFAULT_MODEL=gpt-4o

# 网关配置
GATEWAY_PORT=18789
GATEWAY_HOST=0.0.0.0

# 安全令牌（建议随机生成）
GATEWAY_TOKEN=your-secure-random-token
```

### 3️⃣ 启动服务

```bash
# 使用Docker Compose启动
docker compose -f docker-compose.cn.yml up -d

# 查看日志（确认启动成功）
docker compose -f docker-compose.cn.yml logs -f
```

看到类似以下输出表示启动成功：
```
openclaw  | ✓ Gateway started on http://0.0.0.0:18789
openclaw  | ✓ Setup wizard available at http://0.0.0.0:18789/setup
```

按 `Ctrl+C` 退出日志查看。

### 4️⃣ 访问Web界面进行初始化

在浏览器中访问：
```
http://你的服务器IP:18789
```

或使用域名：
```
http://your-domain.com:18789
```

### 5️⃣ 完成Web初始化向导

**步骤1: 配置AI模型**
- 选择"南梦AI"
- 输入您的API密钥
- 选择模型（如：gpt-4o）

**步骤2: 配置消息渠道**
根据需要配置以下渠道（可选）：
- 企业微信：填入 Corp ID、Agent ID、Secret
- 钉钉：填入 App Key、App Secret
- 飞书：填入 App ID、App Secret

**步骤3: 配置安全选项**
- 设置访问令牌（或使用.env中的配置）

**步骤4: 完成设置**
- 检查配置摘要
- 点击"完成设置"

### 6️⃣ 验证部署

```bash
# 检查服务状态
docker compose -f docker-compose.cn.yml ps

# 测试API
curl http://localhost:18789/health
```

---

## 常用命令

### 查看日志
```bash
docker compose -f docker-compose.cn.yml logs -f
```

### 重启服务
```bash
docker compose -f docker-compose.cn.yml restart
```

### 停止服务
```bash
docker compose -f docker-compose.cn.yml down
```

### 更新到最新版
```bash
# 拉取最新代码
git pull origin v0/hoang46936420ice-7664-8cd5408b

# 重新构建并启动
docker compose -f docker-compose.cn.yml up -d --build
```

---

## 防火墙配置

如果无法访问Web界面，需要开放端口：

**Ubuntu/Debian (ufw):**
```bash
sudo ufw allow 18789/tcp
sudo ufw reload
```

**CentOS/RHEL (firewalld):**
```bash
sudo firewall-cmd --permanent --add-port=18789/tcp
sudo firewall-cmd --reload
```

**云服务器:**
- 在云服务商控制台的安全组中开放 18789 端口

---

## 常见问题

### 1. 无法访问Web界面？
- 检查防火墙是否开放18789端口
- 检查Docker容器是否正常运行：`docker compose ps`
- 查看日志查找错误：`docker compose logs`

### 2. 如何获取南梦AI密钥？
1. 访问 https://www.nanmengai.cn
2. 注册账号
3. 在控制台获取API密钥

### 3. 如何修改配置？
```bash
# 编辑环境变量
nano .env

# 重启服务使配置生效
docker compose -f docker-compose.cn.yml restart
```

### 4. 如何查看所有可用模型？
访问南梦AI文档查看500+可用模型列表，支持GPT、Claude、Gemini等主流模型。

---

## 进阶配置

### 使用Nginx反向代理

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
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 配置HTTPS

使用Let's Encrypt免费证书：
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 技术支持

- 文档：查看 `docs/zh-CN/` 目录
- 南梦AI官网：https://www.nanmengai.cn
- GitHub Issues：报告问题和建议

部署完成后，您就可以开始使用OpenClaw与AI助手对话了！
