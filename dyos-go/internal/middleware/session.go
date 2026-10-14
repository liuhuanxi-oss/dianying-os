package middleware

import (
    "net/http"
    "errors"

    "dyos-go/internal/model"
    "dyos-go/pkg/response"

    "github.com/gin-gonic/gin"
    "gorm.io/gorm"
)

// RevalidateSession checks the current authoritative user record on every
// protected request, so disabling an account or changing its role/tenant
// immediately invalidates JWT claims issued before the change.
//
// This complements JWT signature verification. It does not itself revoke
// tokens after password resets; a token version/session table is still needed.
func RevalidateSession(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        if db == nil {
            response.Error(c, http.StatusServiceUnavailable, response.CodeServerError, "身份验证服务暂时不可用")
            c.Abort()
            return
        }
        uid := c.GetUint("user_id")
        role := c.GetString("role")
        if uid == 0 || role == "" {
            response.Error(c, http.StatusUnauthorized, response.CodeUnauthorized, "登录状态无效")
            c.Abort()
            return
        }
        var user model.User
        err := db.Select("id", "status", "role", "merchant_id", "agent_id").First(&user, uid).Error
        if err != nil {
            // Treat missing/deleted accounts as unauthenticated. Do not
            // allow queries to proceed on transient database errors either.
            if errors.Is(err, gorm.ErrRecordNotFound) {
                response.Error(c, http.StatusUnauthorized, response.CodeUnauthorized, "登录状态已失效")
            } else {
                response.Error(c, http.StatusServiceUnavailable, response.CodeServerError, "身份验证服务暂时不可用")
            }
            c.Abort()
            return
        }
        if user.Status != 1 {
            response.Error(c, http.StatusUnauthorized, response.CodeUnauthorized, "账号已禁用或登录状态失效")
            c.Abort()
            return
        }
        if user.Role != role {
            response.Error(c, http.StatusForbidden, response.CodeForbidden, "账户权限已变更，请重新登录")
            c.Abort()
            return
        }
        switch role {
        case "merchant":
            if user.MerchantID == 0 || user.MerchantID != c.GetUint("merchant_id") {
                response.Error(c, http.StatusForbidden, response.CodeForbidden, "商户权限已变更，请重新登录")
                c.Abort()
                return
            }
        case "agent":
            if user.AgentID == 0 || user.AgentID != c.GetUint("agent_id") {
                response.Error(c, http.StatusForbidden, response.CodeForbidden, "代理商权限已变更，请重新登录")
                c.Abort()
                return
            }
        case "admin":
            // No tenant is associated with the platform administrator role.
        default:
            response.Error(c, http.StatusForbidden, response.CodeForbidden, "无权访问")
            c.Abort()
            return
        }
        c.Next()
    }
}
