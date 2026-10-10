#!/usr/bin/env bash
# Build the single-binary Go + Vue NAS distribution.
set -euo pipefail
cd "$(dirname "$0")"
trap 'rm -rf cmd/server/admin-spa' EXIT
npm --prefix admin-spa-vue ci
npm --prefix admin-spa-vue run build
rm -rf cmd/server/admin-spa
mkdir -p cmd/server/admin-spa
cp -a admin-spa-vue/dist/. cmd/server/admin-spa/
CGO_ENABLED=1 go build -trimpath -ldflags="-s -w" -o dyos-nas ./cmd/server/
echo "Built $(pwd)/dyos-nas"
