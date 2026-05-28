#!/bin/bash
# ============================================================
# 店赢OS - 防火墙配置脚本（仅允许本地访问8081）
# 适用于 AlmaLinux 8.10 / firewalld
# ============================================================

echo "配置防火墙..."

# 方式1: firewalld (AlmaLinux 默认)
if command -v firewall-cmd &>/dev/null && systemctl is-active --quiet firewalld 2>/dev/null; then
    echo "使用 firewalld..."

    # 确保默认 zone 是 public
    firewall-cmd --set-default-zone=public 2>/dev/null || true

    # 80/443 对外开放
    firewall-cmd --permanent --zone=public --add-service=http  2>/dev/null || true
    firewall-cmd --permanent --zone=public --add-service=https 2>/dev/null || true

    # 8081 仅允许本地访问（放到 trusted zone）
    firewall-cmd --permanent --zone=trusted --add-port=8081/tcp 2>/dev/null || true
    firewall-cmd --permanent --zone=trusted --add-source=127.0.0.1 2>/dev/null || true

    # 重载
    firewall-cmd --reload
    echo "firewalld 配置完成"
fi

# 方式2: iptables（备用）
if command -v iptables &>/dev/null && ! systemctl is-active --quiet firewalld 2>/dev/null; then
    echo "使用 iptables..."

    # 允许已建立连接
    iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT 2>/dev/null || true

    # 本地回环
    iptables -A INPUT -i lo -j ACCEPT 2>/dev/null || true

    # 80/443 对外开放
    iptables -A INPUT -p tcp --dport 80  -j ACCEPT 2>/dev/null || true
    iptables -A INPUT -p tcp --dport 443 -j ACCEPT 2>/dev/null || true

    # 8081 仅本地
    iptables -A INPUT -p tcp -s 127.0.0.1 --dport 8081 -j ACCEPT 2>/dev/null || true
    iptables -A INPUT -p tcp --dport 8081 -j DROP 2>/dev/null || true

    # 保存
    service iptables save 2>/dev/null || iptables-save > /etc/sysconfig/iptables 2>/dev/null || true
    echo "iptables 配置完成"
fi

# 验证
echo ""
echo "验证端口监听状态:"
ss -tlnp | grep -E ':(80|443|8081)' || true
echo ""
echo "防火墙配置完成!"
echo "  - 80/443: 对外开放（Nginx）"
echo "  - 8081:  仅本地 127.0.0.1 访问（dyos-server）"
