package handler

import (
	"crypto/sha256"
	"fmt"
	"os"
	"strings"

	"golang.org/x/crypto/bcrypt"

	"dyos-go/internal/model"
	jwtpkg "dyos-go/pkg/jwt"
	"dyos-go/pkg/response"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type AuthHandler struct {
	db *gorm.DB
}

func NewAuthHandler(db *gorm.DB) *AuthHandler {
	return &AuthHandler{db: db}
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, 400, response.CodeBadRequest, "请输入用户名和密码")
		return
	}

	var user model.User
	// Demo logins are opt-in for local development only.
	demoMode := os.Getenv("DYOS_ENV") == "development" && os.Getenv("DYOS_ALLOW_DEMO_LOGIN") == "true"
	if demoMode && h.db == nil {
		if req.Password != "123456" {
			response.Error(c, 401, response.CodeUnauthorized, "用户名或密码错误")
			return
		}
		user = model.User{ID: 1, Username: req.Username, Role: "admin", Name: "管理员", Status: 1}
	} else {
		if h.db == nil {
			response.Error(c, 503, response.CodeServerError, "认证服务不可用")
			return
		}
		if err := h.db.Where("username = ?", req.Username).First(&user).Error; err != nil {
			response.Error(c, 401, response.CodeUnauthorized, "用户名或密码错误")
			return
		}
		if user.Status != 1 {
			response.Error(c, 403, response.CodeForbidden, "账号已被禁用")
			return
		}
		// Accounts without a password hash must complete a secure password reset.
		if user.PasswordHash == "" || !checkPassword(user.PasswordHash, req.Password) {
			response.Error(c, 401, response.CodeUnauthorized, "用户名或密码错误")
			return
		}
		// Seamlessly migrate legacy SHA-256 hashes after successful authentication.
		if !strings.HasPrefix(user.PasswordHash, "$2") {
			newHash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
			if err != nil {
				response.Error(c, 500, response.CodeServerError, "密码安全升级失败")
				return
			}
			if err := h.db.Model(&user).Update("password_hash", string(newHash)).Error; err != nil {
				response.Error(c, 500, response.CodeServerError, "密码安全升级失败")
				return
			}
		}
	}

	claims := jwtpkg.Claims{
		UserID:     user.ID,
		Role:       user.Role,
		MerchantID: user.MerchantID,
		AgentID:    user.AgentID,
		Name:       user.Name,
	}
	token, err := jwtpkg.Sign(claims)
	if err != nil {
		response.Error(c, 500, response.CodeServerError, "生成token失败")
		return
	}

	response.Success(c, gin.H{
		"token": token,
		"user": gin.H{
			"id":          user.ID,
			"username":    user.Username,
			"name":        user.Name,
			"role":        user.Role,
			"merchant_id": user.MerchantID,
			"agent_id":    user.AgentID,
			"phone":       user.Phone,
			"email":       user.Email,
		},
	})
}

func checkPassword(hash, password string) bool {
	if strings.HasPrefix(hash, "$2") { return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)) == nil }
	if strings.HasPrefix(hash, "sha256:") {
		expected := "sha256:" + fmt.Sprintf("%x", sha256.Sum256([]byte(password)))
		return hash == expected
	}
	// 简单hash比对
	expected := fmt.Sprintf("%x", sha256.Sum256([]byte(password)))
	return hash == expected
}
