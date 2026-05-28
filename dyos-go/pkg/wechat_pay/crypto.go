package wechat_pay

import (
	"crypto"
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"crypto/x509"
	"encoding/base64"
	"encoding/pem"
	"fmt"
)

// SignV3 V3签名（SHA256-RSA2048）
func SignV3(method, url, timestamp, nonce, body string, privateKey *rsa.PrivateKey) (string, error) {
	if privateKey == nil {
		return "MOCK_SIGNATURE", nil
	}
	signStr := fmt.Sprintf("%s\n%s\n%s\n%s\n%s\n", method, url, timestamp, nonce, body)
	hashed := sha256.Sum256([]byte(signStr))
	sig, err := rsa.SignPKCS1v15(rand.Reader, privateKey, crypto.SHA256, hashed[:])
	if err != nil {
		return "", fmt.Errorf("签名失败: %w", err)
	}
	return base64.StdEncoding.EncodeToString(sig), nil
}

// VerifySignature 验签（V3回调验证）
func VerifySignature(signature, timestamp, nonce, body string, publicKey *rsa.PublicKey) error {
	if publicKey == nil {
		return nil // Mock模式跳过验签
	}
	signStr := fmt.Sprintf("%s\n%s\n%s\n", timestamp, nonce, body)
	hashed := sha256.Sum256([]byte(signStr))
	sigBytes, err := base64.StdEncoding.DecodeString(signature)
	if err != nil {
		return fmt.Errorf("签名解码失败: %w", err)
	}
	return rsa.VerifyPKCS1v15(publicKey, crypto.SHA256, hashed[:], sigBytes)
}

// DecryptCallback 解密回调数据（AES-256-GCM）
func DecryptCallback(ciphertext, associatedData, nonce, apiV3Key string) (string, error) {
	if apiV3Key == "" || apiV3Key == "mock_apiv3_key_for_dev" {
		return `{"complaint_id":"mock_callback_decrypted"}`, nil
	}
	key := []byte(apiV3Key)
	cipherBytes, err := base64.StdEncoding.DecodeString(ciphertext)
	if err != nil {
		return "", fmt.Errorf("密文解码失败: %w", err)
	}
	block, err := aes.NewCipher(key)
	if err != nil {
		return "", fmt.Errorf("创建AES cipher失败: %w", err)
	}
	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return "", fmt.Errorf("创建GCM失败: %w", err)
	}
	nonceBytes := []byte(nonce)
	plaintext, err := aesGCM.Open(nil, nonceBytes, cipherBytes, []byte(associatedData))
	if err != nil {
		return "", fmt.Errorf("解密失败: %w", err)
	}
	return string(plaintext), nil
}

// LoadPrivateKey 加载PEM格式私钥
func LoadPrivateKey(pemData string) (*rsa.PrivateKey, error) {
	if pemData == "" {
		return nil, nil
	}
	block, _ := pem.Decode([]byte(pemData))
	if block == nil {
		return nil, fmt.Errorf("PEM解码失败")
	}
	key, err := x509.ParsePKCS8PrivateKey(block.Bytes)
	if err != nil {
		return nil, fmt.Errorf("解析私钥失败: %w", err)
	}
	rsaKey, ok := key.(*rsa.PrivateKey)
	if !ok {
		return nil, fmt.Errorf("不是RSA私钥")
	}
	return rsaKey, nil
}

// LoadPublicKey 加载PEM格式公钥（用于验签微信回调）
func LoadPublicKey(pemData string) (*rsa.PublicKey, error) {
	if pemData == "" {
		return nil, nil
	}
	block, _ := pem.Decode([]byte(pemData))
	if block == nil {
		return nil, fmt.Errorf("PEM解码失败")
	}
	key, err := x509.ParsePKIXPublicKey(block.Bytes)
	if err != nil {
		return nil, fmt.Errorf("解析公钥失败: %w", err)
	}
	rsaKey, ok := key.(*rsa.PublicKey)
	if !ok {
		return nil, fmt.Errorf("不是RSA公钥")
	}
	return rsaKey, nil
}
