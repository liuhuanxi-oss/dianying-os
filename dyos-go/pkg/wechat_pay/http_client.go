package wechat_pay

import (
	"bytes"
	"crypto"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

// HTTPClient 微信支付V3 HTTP客户端
type HTTPClient struct {
	mchID      string
	serialNo   string
	privateKey *rsa.PrivateKey
	baseURL    string
	client     *http.Client
}

func NewHTTPClient(mchID, serialNo string, privateKey *rsa.PrivateKey) *HTTPClient {
	return &HTTPClient{
		mchID:      mchID,
		serialNo:   serialNo,
		privateKey: privateKey,
		baseURL:    "https://api.mch.weixin.qq.com",
		client:     &http.Client{Timeout: 30 * time.Second},
	}
}

func (c *HTTPClient) Get(path string, result interface{}) error {
	return c.do("GET", path, nil, result)
}

func (c *HTTPClient) Post(path string, body interface{}, result interface{}) error {
	return c.do("POST", path, body, result)
}

func (c *HTTPClient) do(method, path string, body interface{}, result interface{}) error {
	var bodyBytes []byte
	if body != nil {
		var err error
		bodyBytes, err = json.Marshal(body)
		if err != nil {
			return fmt.Errorf("JSON序列化失败: %w", err)
		}
	}

	req, err := http.NewRequest(method, c.baseURL+path, bytes.NewReader(bodyBytes))
	if err != nil {
		return fmt.Errorf("构造请求失败: %w", err)
	}

	timestamp := fmt.Sprintf("%d", time.Now().Unix())
	nonce := newNonce()
	signStr := fmt.Sprintf("%s\n%s\n%s\n%s\n%s\n", method, path, timestamp, nonce, string(bodyBytes))

	hashed := sha256.Sum256([]byte(signStr))
	sig, err := rsa.SignPKCS1v15(rand.Reader, c.privateKey, crypto.SHA256, hashed[:])
	if err != nil {
		return fmt.Errorf("签名失败: %w", err)
	}
	signature := base64.StdEncoding.EncodeToString(sig)

	auth := fmt.Sprintf(`WECHATPAY2-SHA256-RSA2048 mchid="%s",nonce_str="%s",timestamp="%s",serial_no="%s",signature="%s"`,
		c.mchID, nonce, timestamp, c.serialNo, signature)

	req.Header.Set("Authorization", auth)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	req.Header.Set("User-Agent", "DYOS-Go/2.0")

	resp, err := c.client.Do(req)
	if err != nil {
		return fmt.Errorf("请求失败: %w", err)
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)

	if resp.StatusCode >= 400 {
		var errResp struct {
			Code    string `json:"code"`
			Message string `json:"message"`
		}
		json.Unmarshal(respBody, &errResp)
		return fmt.Errorf("微信支付API错误 [%d]: %s - %s", resp.StatusCode, errResp.Code, errResp.Message)
	}

	if result != nil && len(respBody) > 0 {
		return json.Unmarshal(respBody, result)
	}
	return nil
}

func newNonce() string {
	b := make([]byte, 16)
	rand.Read(b)
	return strings.ToUpper(fmt.Sprintf("%x", b))
}
