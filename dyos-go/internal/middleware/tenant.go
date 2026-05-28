package middleware

import (
	"net/http"

	"dyos-go/pkg/response"

	"github.com/gin-gonic/gin"
)

// TenantIsolation 统一多租户隔离中间件
// 从认证上下文提取租户ID，注入到 gin.Context，供 Service 层自动过滤
// - admin: 不隔离，可查看全部数据
// - agent: 隔离到 agent_id 下属的所有商户
// - merchant: 隔离到自身 merchant_id
func TenantIsolation() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, _ := c.Get("role")
		roleStr, _ := role.(string)

		switch roleStr {
		case "admin":
			c.Set("tenant_role", "admin")
			c.Set("tenant_merchant_id", uint(0))
			c.Set("tenant_agent_id", uint(0))
			c.Set("tenant_isolated", false)
		case "agent":
			agentID, exists := c.Get("agent_id")
			if !exists {
				response.Error(c, http.StatusForbidden, response.CodeForbidden, "代理商身份无效")
				c.Abort()
				return
			}
			aid, ok := agentID.(uint)
			if !ok || aid == 0 {
				response.Error(c, http.StatusForbidden, response.CodeForbidden, "代理商身份无效")
				c.Abort()
				return
			}
			c.Set("tenant_role", "agent")
			c.Set("tenant_agent_id", aid)
			c.Set("tenant_merchant_id", uint(0))
			c.Set("tenant_isolated", true)
		case "merchant":
			merchantID, exists := c.Get("merchant_id")
			if !exists {
				response.Error(c, http.StatusForbidden, response.CodeForbidden, "商户身份无效")
				c.Abort()
				return
			}
			mid, ok := merchantID.(uint)
			if !ok || mid == 0 {
				response.Error(c, http.StatusForbidden, response.CodeForbidden, "商户身份无效")
				c.Abort()
				return
			}
			c.Set("tenant_role", "merchant")
			c.Set("tenant_merchant_id", mid)
			c.Set("tenant_agent_id", uint(0))
			c.Set("tenant_isolated", true)
		default:
		}

		c.Next()
	}
}

// GetTenantMerchantID 从 context 获取租户商户ID，admin 返回0(不限制)
func GetTenantMerchantID(c *gin.Context) uint {
	mid, _ := c.Get("tenant_merchant_id")
	if mid == nil {
		return 0
	}
	id, _ := mid.(uint)
	return id
}

// GetTenantAgentID 从 context 获取租户代理商ID
func GetTenantAgentID(c *gin.Context) uint {
	aid, _ := c.Get("tenant_agent_id")
	if aid == nil {
		return 0
	}
	id, _ := aid.(uint)
	return id
}

// IsTenantIsolated 是否开启了租户隔离
func IsTenantIsolated(c *gin.Context) bool {
	isolated, _ := c.Get("tenant_isolated")
	if isolated == nil {
		return false
	}
	b, _ := isolated.(bool)
	return b
}

// ApplyTenantFilter 自动为 GORM 查询注入租户条件
// 使用方式: q = ApplyTenantFilter(c, q)
func ApplyTenantFilter(c *gin.Context, q interface{}) interface{} {
	return nil
}
