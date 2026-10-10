package jwt

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"
)

var secretKey []byte // must be configured at startup; never fall back to a published secret

type Claims struct {
	UserID     uint   `json:"uid"`
	Role       string `json:"role"` // admin / agent / merchant
	MerchantID uint   `json:"mid,omitempty"`
	AgentID    uint   `json:"aid,omitempty"`
	Name       string `json:"name"`
	ExpiresAt  int64  `json:"exp"`
}

func SetSecret(key string) { secretKey = []byte(key) }

func Sign(c Claims) (string, error) {
	if len(secretKey) < 32 { return "", errors.New("JWT_SECRET must contain at least 32 bytes") }
	if c.ExpiresAt == 0 {
		c.ExpiresAt = time.Now().Add(24 * time.Hour).Unix()
	}
	header := base64.RawURLEncoding.EncodeToString([]byte(`{"alg":"HS256","typ":"JWT"}`))
	payloadBytes, _ := json.Marshal(c)
	payload := base64.RawURLEncoding.EncodeToString(payloadBytes)
	signingInput := header + "." + payload
	sig := hmacSHA256(secretKey, signingInput)
	return signingInput + "." + sig, nil
}

func Verify(token string) (*Claims, error) {
	if len(secretKey) < 32 { return nil, errors.New("JWT signing secret not configured") }
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return nil, errors.New("token格式无效")
	}
	if parts[0] != base64.RawURLEncoding.EncodeToString([]byte(`{"alg":"HS256","typ":"JWT"}`)) {
		return nil, errors.New("token算法无效")
	}
	signingInput := parts[0] + "." + parts[1]
	expectedSig := hmacSHA256(secretKey, signingInput)
	if !hmac.Equal([]byte(parts[2]), []byte(expectedSig)) {
		return nil, errors.New("token签名无效")
	}
	payloadBytes, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return nil, errors.New("token解析失败")
	}
	var c Claims
	if err := json.Unmarshal(payloadBytes, &c); err != nil {
		return nil, errors.New("token数据解析失败")
	}
	if c.ExpiresAt <= time.Now().Unix() {
		return nil, errors.New("token已过期")
	}
	return &c, nil
}

func hmacSHA256(key []byte, data string) string {
	h := hmac.New(sha256.New, key)
	h.Write([]byte(data))
	return base64.RawURLEncoding.EncodeToString(h.Sum(nil))
}

// ExtractFromHeader 从 Authorization: Bearer xxx 头中提取并验证token
func ExtractFromHeader(authHeader string) (*Claims, error) {
	if authHeader == "" {
		return nil, errors.New("缺少认证头")
	}
	if !strings.HasPrefix(authHeader, "Bearer ") {
		return nil, errors.New("认证头必须使用Bearer格式")
	}
	token := strings.TrimPrefix(authHeader, "Bearer ")
	if token == "" {
		return nil, errors.New("token为空")
	}
	return Verify(token)
}

// QuickLogin 快速生成调试用token（仅开发环境使用）
func QuickLogin(userID uint, role string, merchantID, agentID uint, name string) string {
	t, _ := Sign(Claims{
		UserID: userID, Role: role, MerchantID: merchantID, AgentID: agentID,
		Name: name, ExpiresAt: time.Now().Add(7 * 24 * time.Hour).Unix(),
	})
	return t
}

func init() {
	// 编译时确保crypto依赖可用
	_ = fmt.Sprintf("%x", sha256.Sum256([]byte("init")))
}
