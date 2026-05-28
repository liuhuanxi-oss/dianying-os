package tianque

import (
	"crypto"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha1"
	"crypto/sha256"
	"crypto/x509"
	"encoding/base64"
	"encoding/json"
	"encoding/pem"
	"errors"
	"fmt"
	"sort"
	"strings"
)

type RSACrypto struct {
	privateKey *rsa.PrivateKey
	publicKey  *rsa.PublicKey
	algorithm  string
}

func NewRSACrypto(privateKey string, publicKey string, algorithm string) (*RSACrypto, error) {
	if algorithm == "" {
		algorithm = "SHA1withRSA"
	}
	c := &RSACrypto{algorithm: algorithm}
	if privateKey != "" {
		key, err := parsePrivateKey(privateKey)
		if err != nil {
			return nil, err
		}
		c.privateKey = key
	}
	if publicKey != "" {
		key, err := parsePublicKey(publicKey)
		if err != nil {
			return nil, err
		}
		c.publicKey = key
	}
	return c, nil
}

func (c *RSACrypto) Sign(data string) (string, error) {
	if c.privateKey == nil {
		return "", errors.New("私钥未加载")
	}
	hashed, hashType := c.hash([]byte(data))
	signature, err := rsa.SignPKCS1v15(rand.Reader, c.privateKey, hashType, hashed)
	if err != nil {
		return "", err
	}
	return base64.StdEncoding.EncodeToString(signature), nil
}

func (c *RSACrypto) Verify(data string, signature string) bool {
	if c.publicKey == nil || signature == "" {
		return false
	}
	sig, err := base64.StdEncoding.DecodeString(signature)
	if err != nil {
		return false
	}
	hashed, hashType := c.hash([]byte(data))
	return rsa.VerifyPKCS1v15(c.publicKey, hashType, hashed, sig) == nil
}

func (c *RSACrypto) hash(data []byte) ([]byte, crypto.Hash) {
	if c.algorithm == "SHA256withRSA" {
		sum := sha256.Sum256(data)
		return sum[:], crypto.SHA256
	}
	sum := sha1.Sum(data)
	return sum[:], crypto.SHA1
}

func BuildSignString(data map[string]interface{}) string {
	keys := make([]string, 0, len(data))
	for key, value := range data {
		if key == "sign" || value == nil {
			continue
		}
		// 排除空字符串（保留数字0）
		if s, ok := value.(string); ok && s == "" {
			continue
		}
		keys = append(keys, key)
	}
	sort.Strings(keys)
	parts := make([]string, 0, len(keys))
	for _, key := range keys {
		parts = append(parts, key+"="+valueToString(data[key]))
	}
	return strings.Join(parts, "&")
}

func valueToString(value interface{}) string {
	switch v := value.(type) {
	case string:
		return v
	case map[string]interface{}, []interface{}, []map[string]interface{}, []map[string]string:
		// 紧凑JSON，不转义HTML/中文
		var buf strings.Builder
		enc := json.NewEncoder(&buf)
		enc.SetEscapeHTML(false)
		_ = enc.Encode(v)
		// Encode在末尾加了\n，去掉
		return strings.TrimSpace(buf.String())
	default:
		return fmt.Sprint(v)
	}
}

func parsePrivateKey(value string) (*rsa.PrivateKey, error) {
	data, err := normalizeKey(value, "RSA PRIVATE KEY")
	if err != nil {
		return nil, err
	}
	if block, _ := pem.Decode(data); block != nil {
		data = block.Bytes
	}
	if key, err := x509.ParsePKCS1PrivateKey(data); err == nil {
		return key, nil
	}
	key, err := x509.ParsePKCS8PrivateKey(data)
	if err != nil {
		return nil, err
	}
	rsaKey, ok := key.(*rsa.PrivateKey)
	if !ok {
		return nil, errors.New("不是 RSA 私钥")
	}
	return rsaKey, nil
}

func parsePublicKey(value string) (*rsa.PublicKey, error) {
	data, err := normalizeKey(value, "PUBLIC KEY")
	if err != nil {
		return nil, err
	}
	if block, _ := pem.Decode(data); block != nil {
		data = block.Bytes
	}
	if cert, err := x509.ParseCertificate(data); err == nil {
		if key, ok := cert.PublicKey.(*rsa.PublicKey); ok {
			return key, nil
		}
	}
	key, err := x509.ParsePKIXPublicKey(data)
	if err != nil {
		return nil, err
	}
	rsaKey, ok := key.(*rsa.PublicKey)
	if !ok {
		return nil, errors.New("不是 RSA 公钥")
	}
	return rsaKey, nil
}

func normalizeKey(value string, keyType string) ([]byte, error) {
	trimmed := strings.TrimSpace(value)
	if strings.HasPrefix(trimmed, "-----BEGIN") {
		return []byte(trimmed), nil
	}
	decoded, err := base64.StdEncoding.DecodeString(trimmed)
	if err == nil {
		return decoded, nil
	}
	pemValue := "-----BEGIN " + keyType + "-----\n" + wrapBase64(trimmed) + "\n-----END " + keyType + "-----"
	return []byte(pemValue), nil
}

func wrapBase64(value string) string {
	var b strings.Builder
	for i := 0; i < len(value); i += 64 {
		end := i + 64
		if end > len(value) {
			end = len(value)
		}
		if i > 0 {
			b.WriteByte('\n')
		}
		b.WriteString(value[i:end])
	}
	return b.String()
}
