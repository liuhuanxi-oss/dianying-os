#!/bin/bash
# 店赢OS 璇玑AI NAS 构建脚本
# 输出: dyos-nas (单二进制，内嵌前端+SQLite)
set -e

cd "$(dirname "$0")"

echo "=== 店赢OS 璇玑版构建 ==="

# 1. 复制前端到 embed 目录
echo "[1/3] 准备前端资源..."
rm -rf cmd/server/admin-spa
cp -r admin-spa cmd/server/admin-spa

# 2. 编译 (CGO_ENABLED=1 for SQLite driver)
echo "[2/3] 编译中..."
CGO_ENABLED=1 go build -o dyos-nas -ldflags="-s -w" ./cmd/server/

# 3. 清理
echo "[3/3] 清理临时文件..."
rm -rf cmd/server/admin-spa

echo "=== 构建完成: dyos-nas ==="
echo ""
echo "璇玑AI NAS 部署:"
echo "  ./dyos-nas -config config-nas.yaml"
echo ""
echo "启动后访问 http://<盒子IP>:8081 即可使用管理后台"
