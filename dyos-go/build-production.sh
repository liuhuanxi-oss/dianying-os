#!/usr/bin/env bash
# Production build for Baota deployment. Only produces a binary; never restarts services.
set -euo pipefail
cd "$(dirname "$0")"
trap 'rm -rf cmd/server/admin-spa' EXIT
npm --prefix admin-spa-vue ci
npm --prefix admin-spa-vue run build
rm -rf cmd/server/admin-spa
mkdir -p cmd/server/admin-spa
cp -a admin-spa-vue/dist/. cmd/server/admin-spa/
go test ./...
CGO_ENABLED=1 go build -trimpath -o dyos-server ./cmd/server/
echo "Build complete: $(pwd)/dyos-server (not deployed)"
