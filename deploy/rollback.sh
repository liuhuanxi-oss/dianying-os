#!/bin/bash
# ============================================================
# 店赢OS - 一键回滚脚本
# 用法: bash rollback.sh [备份时间戳]
# ============================================================
set -euo pipefail

DEPLOY_DIR="/www/wwwroot/os.detian.xin"
BACKUP_DIR="${DEPLOY_DIR}/backups"
SERVICE_NAME="dyos-server"

echo "=========================================="
echo "  店赢OS 回滚脚本"
echo "=========================================="

# 列出可用备份
echo "可用备份:"
ls -lt "${BACKUP_DIR}"/dyos-server.* 2>/dev/null | head -10 || {
    echo "  无可用备份!"
    exit 1
}

# 选择备份
if [ $# -ge 1 ]; then
    BACKUP_FILE="${BACKUP_DIR}/dyos-server.${1}"
else
    BACKUP_FILE=$(ls -t "${BACKUP_DIR}"/dyos-server.* 2>/dev/null | head -1)
fi

if [ ! -f "${BACKUP_FILE}" ]; then
    echo "  错误: 备份文件不存在: ${BACKUP_FILE}"
    exit 1
fi

echo "回滚到: ${BACKUP_FILE}"
echo ""
read -p "确认回滚? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "已取消"
    exit 0
fi

# 停止服务
echo "[1/4] 停止当前服务..."
systemctl stop "${SERVICE_NAME}" 2>/dev/null || true
sleep 2

# 恢复旧版
echo "[2/4] 恢复旧版本..."
cp "${BACKUP_FILE}" "${DEPLOY_DIR}/dyos-server"
chmod +x "${DEPLOY_DIR}/dyos-server"
chown www:www "${DEPLOY_DIR}/dyos-server"

# 启动服务
echo "[3/4] 启动服务..."
systemctl start "${SERVICE_NAME}"
sleep 3

# 验证
echo "[4/4] 验证服务..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8081/api/health 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo "  回滚成功! 服务正常运行"
else
    echo "  警告: 健康检查返回 ${HTTP_CODE}，请检查日志"
    journalctl -u "${SERVICE_NAME}" -n 20
fi
