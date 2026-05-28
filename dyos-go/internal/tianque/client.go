package tianque

import (
	"bytes"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"dyos-go/internal/config"
)

type Client struct {
	orgID      string
	baseURL    string
	timeout    time.Duration
	retryTimes int
	useMock    bool
	crypto     *RSACrypto
	httpClient *http.Client
}

func NewClient(cfg config.TianqueConfig) (*Client, error) {
	publicKey := firstNonEmpty(cfg.SuixingpayPublicKey, cfg.PublicKey)
	cryptoClient, err := NewRSACrypto(cfg.PrivateKey, publicKey, cfg.SignAlgorithm)
	if err != nil {
		return nil, err
	}
	timeout := time.Duration(cfg.TimeoutSeconds) * time.Second
	if timeout <= 0 {
		timeout = 30 * time.Second
	}
	retryTimes := cfg.RetryTimes
	if retryTimes <= 0 {
		retryTimes = 3
	}
	baseURL := cfg.BaseURL
	if baseURL == "" {
		baseURL = "https://openapi-test.suixingpay.com"
	}
	return &Client{
		orgID:      cfg.OrgID,
		baseURL:    strings.TrimRight(baseURL, "/"),
		timeout:    timeout,
		retryTimes: retryTimes,
		useMock:    cfg.UseMock,
		crypto:     cryptoClient,
		httpClient: &http.Client{Timeout: timeout},
	}, nil
}

func (c *Client) Post(uri string, data map[string]interface{}) (map[string]interface{}, error) {
	return c.Request(http.MethodPost, uri, data)
}

func (c *Client) Get(uri string, data map[string]interface{}) (map[string]interface{}, error) {
	return c.Request(http.MethodGet, uri, data)
}

func (c *Client) Request(method string, uri string, data map[string]interface{}) (map[string]interface{}, error) {
	if c.useMock {
		return c.mockResponse(uri, data), nil
	}
	body, err := c.buildRequest(data)
	if err != nil {
		return nil, err
	}
	payload, err := json.Marshal(body)
	if err != nil {
		return nil, err
	}

	var lastErr error
	for attempt := 0; attempt < c.retryTimes; attempt++ {
		resp, err := c.do(method, uri, payload)
		if err == nil {
			return resp, nil
		}
		lastErr = err
	}
	return map[string]interface{}{
		"code":           "NETWORK_ERROR",
		"msg":            lastErr.Error(),
		"_http_status":   0,
		"_verify_passed": false,
	}, nil
}

func (c *Client) buildRequest(data map[string]interface{}) (map[string]interface{}, error) {
	if data == nil {
		data = map[string]interface{}{}
	}
	reqID := newReqID()
	// 天阙timestamp格式: yyyyMMddHHmmss（北京时间）
	timestamp := time.Now().Format("20060102150405")

	body := map[string]interface{}{
		"signType":  "RSA",
		"version":   "1.0",
		"orgId":     c.orgID,
		"reqId":     reqID,
		"timestamp": timestamp,
		"reqData":   data,
	}

	sign, err := c.crypto.Sign(BuildSignString(body))
	if err != nil {
		return nil, err
	}
	body["sign"] = sign
	return body, nil
}

func (c *Client) do(method string, uri string, payload []byte) (map[string]interface{}, error) {
	request, err := http.NewRequest(method, c.baseURL+uri, bytes.NewReader(payload))
	if err != nil {
		return nil, err
	}
	request.Header.Set("Content-Type", "application/json; charset=utf-8")
	request.Header.Set("User-Agent", "DYOS-Go/1.0")

	response, err := c.httpClient.Do(request)
	if err != nil {
		return nil, err
	}
	defer response.Body.Close()

	content, err := io.ReadAll(response.Body)
	if err != nil {
		return nil, err
	}
	result := map[string]interface{}{}
	if len(content) > 0 {
		if err := json.Unmarshal(content, &result); err != nil {
			result["raw_response"] = string(content)
		}
	}
	result["_http_status"] = response.StatusCode
	result["_verify_passed"] = c.verifyResponse(result)
	return result, nil
}

func (c *Client) verifyResponse(response map[string]interface{}) bool {
	sign, ok := response["sign"].(string)
	if !ok || sign == "" {
		return true
	}
	return c.crypto.Verify(BuildSignString(response), sign)
}

func (c *Client) mockResponse(uri string, data map[string]interface{}) map[string]interface{} {
	respData := map[string]interface{}{}
	switch uri {
	case "/merchant/income":
		respData = map[string]interface{}{"mno": fmt.Sprintf("399%d", time.Now().Unix()%100000000), "auditStatus": "03", "auditMsg": "入驻成功"}
	case "/merchant/incomeQuery", "/merchant/merchantInfoQuery", "/merchant/auditStatusQuery":
		respData = map[string]interface{}{"mno": valueFromMap(data, "mno", "YOUR_MERCHANT_NO"), "auditStatus": "03", "auditMsg": "审核通过", "merName": "测试商户"}
	case "/order/activePlusScan":
		respData = map[string]interface{}{"uuid": newReqID(), "ordNo": valueFromMap(data, "ordNo", fmt.Sprintf("T%d", time.Now().UnixMilli())), "payUrl": "https://qr.alipay.com/xxx", "expireTime": "300"}
	case "/query/tradeQuery":
		respData = map[string]interface{}{"uuid": newReqID(), "ordNo": valueFromMap(data, "ordNo", "T1234567890"), "status": "01", "amt": valueFromMap(data, "amt", "0.01")}
	case "/order/refund":
		respData = map[string]interface{}{"refundUuid": newReqID(), "refundStatus": "01", "refundAmt": valueFromMap(data, "amt", "0.01")}
	case "/query/settleQuery":
		respData = map[string]interface{}{"settleList": []map[string]interface{}{{"settleDate": "20240501", "settleAmt": "1000.00", "status": "01"}}, "totalCount": 1}
	case "/reconcile/downloadFile":
		respData = map[string]interface{}{"fileUrl": "https://osscdn.suixingpay.com/reconcile/20240501.csv", "fileName": "reconcile_20240501.csv"}
	default:
		respData = copyMap(data)
	}
	return map[string]interface{}{"code": "0000", "msg": "交易成功", "reqId": newReqID(), "respData": respData, "_mock": true}
}

func newReqID() string {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return fmt.Sprintf("%d", time.Now().UnixNano())
	}
	return hex.EncodeToString(b)
}

func copyMap(source map[string]interface{}) map[string]interface{} {
	result := map[string]interface{}{}
	for key, value := range source {
		result[key] = value
	}
	return result
}

func valueFromMap(source map[string]interface{}, key string, fallback interface{}) interface{} {
	if source == nil {
		return fallback
	}
	if value, ok := source[key]; ok && value != nil && value != "" {
		return value
	}
	return fallback
}

func firstNonEmpty(values ...string) string {
	for _, value := range values {
		if value != "" {
			return value
		}
	}
	return ""
}
