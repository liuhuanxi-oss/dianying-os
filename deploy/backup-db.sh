#!/bin/bash
# ============================================================
# 店赢OS - 数据库备份脚本
# 宝塔定时任务: 每天凌晨 3:00 执行
# 定时任务命令: bash /www/wwwroot/os.detian.xin/scripts/backup-db.sh
# ============================================================
set -euo pipefail

BACKUP_DIR="/www/wwwroot/os.detian.xin/backups/db"
RETENTION_DAYS=30
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# 数据库信息（从宝塔获取或配置）
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-3306}"
DB_USER="${DB_USER:-root}"
DB_PASS="${DB_PASS:-}"
DB_NAME="${DB_NAME:-dyos}"

mkdir -p "${BACKUP_DIR}"

echo "[$(date)] 开始备份数据库 ${DB_NAME}..."

# 备份
mysqldump -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" -p"${DB_PASS}" \
    --single-transaction \
    --quick \
    --lock-tables=false \
    --routines \
    --triggers \
    --events \
    "${DB_NAME}" | gzip > "${BACKUP_DIR}/${DB_NAME}_${TIMESTAMP}.sql.gz"

# 验证备份
if [ -f "${BACKUP_DIR}/${DB_NAME}_${TIMESTAMP}.sql.gz" ]; then
    BACKUP_SIZE=$(du -h "${BACKUP_DIR}/${DB_NAME}_${TIMESTAMP}.sql.gz" | cut -f1)
    echo "[$(date)] 备份成功: ${DB_NAME}_${TIMESTAMP}.sql.gz (${BACKUP_SIZE})"
else
    echo "[$(date)] 备份失败!"
    exit 1
fi

# 清理过期备份
DELETED=$(find "${BACKUP_DIR}" -name "${DB_NAME}_*.sql.gz" -mtime +${RETENTION_DAYS} -delete -print | wc -l)
if [ "${DELETED}" -gt 0 ]; then
    echo "[$(date)] 清理了 ${DELETED} 个过期备份"
fi

echo "[$(date)] 备份完成"
