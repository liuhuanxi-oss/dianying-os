package middleware

import (
	"net/http"
	"os"

	jwtpkg "dyos-go/pkg/jwt"
	"dyos-go/pkg/response"

	"github.com/gin-gonic/gin"
)

func init() {
	if key := os.Getenv("JWT_SECRET"); key != "" {
		jwtpkg.SetSecret(key)
	}
}

func AdminAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		claims := extractClaims(c)
		if claims == nil {
			response.Error(c, http.StatusUnauthorized, response.CodeUnauthorized, "请先登录")
			c.Abort()
			return
		}
		if claims.Role != "admin" && claims.Role != "agent" {
			response.Error(c, http.StatusForbidden, response.CodeForbidden, "无管理员权限")
			c.Abort()
			return
		}
		c.Set("role", claims.Role)
		c.Set("user_id", claims.UserID)
		c.Set("name", claims.Name)
		if claims.Role == "agent" {
			c.Set("agent_id", claims.AgentID)
		}
		c.Next()
	}
}

func AgentAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		claims := extractClaims(c)
		if claims == nil {
			response.Error(c, http.StatusUnauthorized, response.CodeUnauthorized, "请先登录")
			c.Abort()
			return
		}
		if claims.Role != "agent" {
			response.Error(c, http.StatusForbidden, response.CodeForbidden, "无代理商权限")
			c.Abort()
			return
		}
		if claims.AgentID == 0 {
			response.Error(c, http.StatusForbidden, response.CodeForbidden, "代理商身份无效")
			c.Abort()
			return
		}
		c.Set("role", "agent")
		c.Set("user_id", claims.UserID)
		c.Set("agent_id", claims.AgentID)
		c.Set("name", claims.Name)
		c.Next()
	}
}

func MerchantAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		claims := extractClaims(c)
		if claims == nil {
			response.Error(c, http.StatusUnauthorized, response.CodeUnauthorized, "请先登录")
			c.Abort()
			return
		}
		if claims.Role != "merchant" {
			response.Error(c, http.StatusForbidden, response.CodeForbidden, "无商户权限")
			c.Abort()
			return
		}
		if claims.MerchantID == 0 {
			response.Error(c, http.StatusForbidden, response.CodeForbidden, "商户身份无效")
			c.Abort()
			return
		}
		c.Set("role", "merchant")
		c.Set("user_id", claims.UserID)
		c.Set("merchant_id", claims.MerchantID)
		c.Set("name", claims.Name)
		c.Next()
	}
}

func extractClaims(c *gin.Context) *jwtpkg.Claims {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		return nil
	}
	claims, err := jwtpkg.ExtractFromHeader(authHeader)
	if err != nil {
		return nil
	}
	return claims
}
