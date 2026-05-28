# 店赢OS 生产部署手册

> 环境: AlmaLinux 8.10 + 宝塔面板  
> 域名: os.detian.xin  
> 后端: dyos-server Go二进制, 端口8081  
> 日期: 2026-05-25

---

## 前置准备

将以下文件上传到服务器的 `/tmp/` 目录：
- `dyos-server` (新编译的 Linux amd64 二进制)
- `deploy/` 目录下所有配置文件

```bash
# 在本地执行（或通过宝塔文件管理器上传）
scp dyos-server root@你的服务器IP:/tmp/
scp deploy/*.sh deploy/*.conf deploy/*.service root@你的服务器IP:/tmp/
```

---

## 一、备份与上传

### 1.1 SSH登录服务器

```bash
ssh root@你的服务器IP
```

### 1.2 创建目录结构

```bash
mkdir -p /www/wwwroot/os.detian.xin/{logs,backups,backups/db,scripts}
```

### 1.3 备份旧版

```bash
cd /www/wwwroot/os.detian.xin
# 如果旧版正在运行，先查看进程
ps aux | grep dyos-server
# 备份旧二进制
cp dyos-server backups/dyos-server.$(date +%Y%m%d_%H%M%S) 2>/dev/null || echo "无旧版本"
```

### 1.4 部署新版本

```bash
cp /tmp/dyos-server /www/wwwroot/os.detian.xin/dyos-server
chmod +x /www/wwwroot/os.detian.xin/dyos-server
chown www:www /www/wwwroot/os.detian.xin/dyos-server
# 验证可执行
file /www/wwwroot/os.detian.xin/dyos-server
# 应输出: ELF 64-bit LSB executable, x86-64...
```

---

## 二、进程守护配置

### 方式A: systemd（推荐，AlmaLinux 8.10 原生支持）

```bash
# 安装服务文件
cp /tmp/dyos-server.service /etc/systemd/system/dyos-server.service
systemctl daemon-reload
systemctl enable dyos-server
systemctl start dyos-server
systemctl status dyos-server
```

常用命令：
```bash
systemctl start dyos-server     # 启动
systemctl stop dyos-server      # 停止
systemctl restart dyos-server   # 重启
systemctl status dyos-server    # 状态
journalctl -u dyos-server -f    # 实时日志
```

### 方式B: 宝塔进程守护管理器（Supervisor）

在宝塔面板 → 软件商店 → 进程守护管理器 → 添加：

| 配置项 | 值 |
|--------|-----|
| 名称 | dyos-server |
| 启动目录 | /www/wwwroot/os.detian.xin |
| 启动命令 | ./dyos-server --env=release |
| 进程数 | 1 |
| 用户 | www |

---

## 三、Nginx反向代理配置

### 3.1 宝塔面板操作

1. 进入 **网站** → os.detian.xin → **配置文件**
2. 备份当前配置（宝塔面板有「保存」按钮，先点保存）
3. 将下方配置合并进去（或参考 `/tmp/nginx-os.detian.xin.conf`）

### 3.2 核心配置片段

在 `server` 块内添加：

```nginx
# ==================== API 反向代理 ====================
location /api/ {
    limit_req zone=api_limit burst=50 nodelay;
    limit_conn conn_limit 10;
    proxy_pass http://127.0.0.1:8081;
    proxy_http_version 1.1;
    proxy_set_header Host              $host;
    proxy_set_header X-Real-IP         $remote_addr;
    proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_connect_timeout 30s;
    proxy_send_timeout    60s;
    proxy_read_timeout    60s;
    proxy_hide_header X-Powered-By;
}

# 登录接口单独限流
location ~ ^/api/(login|auth/login) {
    limit_req zone=login_limit burst=3 nodelay;
    proxy_pass http://127.0.0.1:8081;
    proxy_http_version 1.1;
    proxy_set_header Host              $host;
    proxy_set_header X-Real-IP         $remote_addr;
    proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# WebSocket
location /ws/ {
    proxy_pass http://127.0.0.1:8081;
    proxy_http_version 1.1;
    proxy_set_header Upgrade           $http_upgrade;
    proxy_set_header Connection        "upgrade";
    proxy_set_header Host              $host;
    proxy_set_header X-Real-IP         $remote_addr;
    proxy_read_timeout 86400s;
}

# 健康检查（不限流）
location = /api/health {
    proxy_pass http://127.0.0.1:8081;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    access_log off;
}

# 安全加固：禁止隐藏文件和备份文件
location ~ /\. {
    deny all;
}
location ~* \.(old|bak|backup|sql|tar|gz|zip)$ {
    deny all;
}
```

### 3.3 Nginx 全局配置（http块）

在宝塔 Nginx 配置的 `http {}` 块中添加（如果尚未存在）：

```nginx
# WebSocket 升级支持
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

# 限流区域
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=30r/s;
limit_req_zone $binary_remote_addr zone=login_limit:10m rate=5r/m;
limit_conn_zone $binary_remote_addr zone=conn_limit:10m;
```

宝塔面板中，http块配置在：**软件商店 → Nginx → 配置修改**

### 3.4 验证与重载

```bash
nginx -t                    # 检查配置语法
nginx -s reload             # 重载（热更新，不中断服务）
```

---

## 四、生产级优化

### 4.1 防火墙（8081端口仅本地访问）

```bash
# 执行防火墙配置
bash /tmp/firewall-setup.sh
# 验证
curl http://127.0.0.1:8081/api/health     # 本机能通
curl http://你的公网IP:8081/api/health     # 外部不通 ✓
```

### 4.2 日志轮转

```bash
cp /tmp/logrotate-dyos.conf /etc/logrotate.d/dyos-server
# 手动测试一次
logrotate -vf /etc/logrotate.d/dyos-server
```

### 4.3 数据库备份脚本

```bash
cp /tmp/backup-db.sh /www/wwwroot/os.detian.xin/scripts/backup-db.sh
chmod +x /www/wwwroot/os.detian.xin/scripts/backup-db.sh
# 编辑数据库密码
vi /www/wwwroot/os.detian.xin/scripts/backup-db.sh
# 修改 DB_PASS="你的数据库密码"
# 手动测试
bash /www/wwwroot/os.detian.xin/scripts/backup-db.sh
```

### 4.4 宝塔定时任务

进入宝塔 → 计划任务，添加以下4个任务：

| 任务名 | 周期 | 命令 |
|--------|------|------|
| dyos-日志轮转 | 每天 2:00 | `/usr/sbin/logrotate -v /etc/logrotate.d/dyos-server` |
| dyos-数据库备份 | 每天 3:00 | `bash /www/wwwroot/os.detian.xin/scripts/backup-db.sh` |
| dyos-服务监控 | 每5分钟 | 见 `cron-tasks.txt` 中的监控脚本 |
| dyos-清理备份 | 每天 4:00 | `find /www/wwwroot/os.detian.xin/backups/ -type f -mtime +30 -delete` |

---

## 五、零停机切换流程

### 5.1 启动新服务

```bash
# 此时旧版 dyos-server 仍在运行
systemctl start dyos-server
# systemd 或 supervisor 启动新的 dyos-server (监听 8081)
```

### 5.2 验证新服务

```bash
# 1. 检查进程
ps aux | grep dyos-server
# 2. 健康检查
curl -s http://127.0.0.1:8081/api/health | python3 -m json.tool
# 3. 登录接口
curl -s -X POST http://127.0.0.1:8081/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
# 4. 获取token后测试后台接口
curl -s http://127.0.0.1:8081/api/admin/ping \
  -H "Authorization: Bearer <token>"
```

### 5.3 Nginx切换流量

Nginx 已配置 `proxy_pass http://127.0.0.1:8081`，重载后流量自动切到新服务：

```bash
nginx -t && nginx -s reload
```

### 5.4 停止旧版进程

```bash
# 查看旧版 dyos-server 的 PID
ps aux | grep dyos-server
# 杀掉旧进程（如果旧版用的是其他端口或进程管理方式）
kill -SIGTERM <旧版PID>
```

### 5.5 最终验证

浏览器访问：`https://os.detian.xin/api/health`

应返回：
```json
{
  "code": 0,
  "data": {
    "status": "healthy",
    "service": "dyos-go",
    "version": "2.0.0",
    "database": "connected"
  }
}
```

---

## 六、回滚步骤

如果新版本出现故障，一键回滚：

```bash
# 方式1: 使用回滚脚本
bash /www/wwwroot/os.detian.xin/rollback.sh

# 方式2: 手动回滚
systemctl stop dyos-server
cp /www/wwwroot/os.detian.xin/backups/dyos-server.20260525_XXXXXX /www/wwwroot/os.detian.xin/dyos-server
chmod +x /www/wwwroot/os.detian.xin/dyos-server
systemctl start dyos-server
# 验证
curl http://127.0.0.1:8081/api/health
```

---

## 七、验证清单

部署完成后逐项检查：

### 基础设施
- [ ] `curl http://127.0.0.1:8081/api/health` 返回 200
- [ ] `curl https://os.detian.xin/api/health` 返回 200（通过Nginx）
- [ ] `curl http://公网IP:8081/api/health` **不可达**（防火墙生效）
- [ ] `systemctl status dyos-server` 显示 active (running)
- [ ] 服务器重启后服务自动恢复: `systemctl is-enabled dyos-server`

### 认证安全
- [ ] 无token访问 `/api/admin/ping` 返回 401
- [ ] 伪造 `X-Role: admin` 请求头 + 无token，返回 401（Header绕过已修复）
- [ ] 伪造 `X-Merchant-ID: 1` + 无token，返回 401
- [ ] 正确登录获取token，访问后台正常
- [ ] 商户token访问admin接口返回 403

### 多租户隔离
- [ ] 商户A的token访问商户B的评价 → 返回 403（跨租户拦截）
- [ ] 商户A的token访问商户B的投诉 → 返回 403
- [ ] 管理员可查看所有商户数据

### 业务功能
- [ ] 登录 `/api/login` 正常
- [ ] 数据大屏 API 正常
- [ ] 评价管理列表/详情正常
- [ ] 投诉管理列表/详情正常
- [ ] AI内容生成正常
- [ ] 商户端 overview 正常

### 前端页面
- [ ] `https://os.detian.xin/` 首页正常显示（静态文件不动）
- [ ] 后台管理页面正常
- [ ] 数据大屏页面正常

### 运维
- [ ] 日志文件正常写入 `/www/wwwroot/os.detian.xin/logs/`
- [ ] Nginx日志正常
- [ ] 定时任务已添加
- [ ] 数据库备份能正常生成

---

## 八、常见故障排查

| 症状 | 检查 |
|------|------|
| 502 Bad Gateway | `systemctl status dyos-server` 查看Go服务是否运行 |
| 健康检查超时 | `ss -tlnp \| grep 8081` 确认端口监听 |
| 数据库连接失败 | 检查 `.env` 或环境变量中数据库配置 |
| 401 Unauthorized | 确认JWT token有效期，重新登录 |
| 首页打不开 | 检查Nginx静态文件root路径是否正确 |
| WebSocket断开 | 检查Nginx `proxy_read_timeout` 和 `Connection upgrade` |
