#!/bin/bash
# ============================================================
# 店赢OS - 生产部署脚本
# 用法: bash deploy.sh
# 环境: AlmaLinux 8.10 / 宝塔面板
# ============================================================
set -euo pipefail

DEPLOY_DIR="/www/wwwroot/os.detian.xin"
LOGS_DIR="${DEPLOY_DIR}/logs"
BACKUP_DIR="${DEPLOY_DIR}/backups"
SERVICE_NAME="dyos-server"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "=========================================="
echo "  店赢OS 部署脚本"
echo "  时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "=========================================="

# ---- 1. 创建必要目录 ----
echo "[1/7] 创建目录结构..."
mkdir -p "${LOGS_DIR}" "${BACKUP_DIR}"

# ---- 2. 备份旧版本 ----
echo "[2/7] 备份旧版本..."
if [ -f "${DEPLOY_DIR}/${SERVICE_NAME}" ]; then
    cp "${DEPLOY_DIR}/${SERVICE_NAME}" "${BACKUP_DIR}/dyos-server.${TIMESTAMP}"
    echo "  旧版已备份到: ${BACKUP_DIR}/dyos-server.${TIMESTAMP}"
    # 保留最近5个备份
    ls -t "${BACKUP_DIR}"/dyos-server.* 2>/dev/null | tail -n +6 | xargs -r rm -f
fi

# ---- 3. 停止旧服务 ----
echo "[3/7] 停止旧服务..."
if systemctl is-active --quiet "${SERVICE_NAME}" 2>/dev/null; then
    systemctl stop "${SERVICE_NAME}"
    echo "  旧服务已停止"
fi
# 兼容宝塔进程守护管理器（Supervisor）
if command -v supervisorctl &>/dev/null; then
    supervisorctl stop "${SERVICE_NAME}" 2>/dev/null || true
fi
# 确保8081端口释放
sleep 2

# ---- 4. 复制新二进制 ----
echo "[4/7] 部署新二进制..."
# 假设 dyos-server 已上传到 /tmp/ 或当前目录
NEW_BIN="${1:-/tmp/dyos-server}"
if [ ! -f "${NEW_BIN}" ]; then
    echo "  错误: 找不到新二进制文件: ${NEW_BIN}"
    echo "  用法: bash deploy.sh /path/to/dyos-server"
    exit 1
fi
cp "${NEW_BIN}" "${DEPLOY_DIR}/dyos-server"
chmod +x "${DEPLOY_DIR}/dyos-server"
chown www:www "${DEPLOY_DIR}/dyos-server"
echo "  新版本已部署: $(stat -c %y ${DEPLOY_DIR}/dyos-server)"

# ---- 5. 安装/重载 systemd 服务 ----
echo "[5/7] 配置进程守护..."
if [ -f "/tmp/dyos-server.service" ]; then
    cp /tmp/dyos-server.service /etc/systemd/system/dyos-server.service
fi
systemctl daemon-reload
systemctl enable "${SERVICE_NAME}"

# ---- 6. 启动新服务 ----
echo "[6/7] 启动新服务..."
systemctl start "${SERVICE_NAME}"
sleep 3

# ---- 7. 健康检查 ----
echo "[7/7] 健康检查..."
for i in 1 2 3 4 5; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8081/api/health 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "200" ]; then
        echo "  健康检查通过! HTTP ${HTTP_CODE}"
        echo ""
        echo "=========================================="
        echo "  部署成功!"
        echo "  健康检查: https://os.detian.xin/api/health"
        echo "  日志: journalctl -u ${SERVICE_NAME} -f"
        echo "  回滚: bash ${DEPLOY_DIR}/rollback.sh"
        echo "=========================================="
        exit 0
    fi
    echo "  等待服务启动... (${i}/5)"
    sleep 2
done

echo "  错误: 服务启动失败!"
echo "  查看日志: journalctl -u ${SERVICE_NAME} -n 50"
systemctl status "${SERVICE_NAME}" || true
exit 1
