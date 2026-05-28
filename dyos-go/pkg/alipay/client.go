package alipay

import (
	"crypto"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"crypto/x509"
	"encoding/base64"
	"encoding/json"
	"encoding/pem"
	"fmt"
	"io"
	"math/rand"
	"net/http"
	"net/url"
	"sort"
	"strings"
	"time"
)

// Client 支付宝开放平台客户端
type Client struct {
	AppID      string
	PrivateKey *rsa.PrivateKey
	PublicKey  *rsa.PublicKey
	BaseURL    string
	isMock     bool
	client     *http.Client
}

// NewClient 创建支付宝客户端
func NewClient(appID string, privateKey *rsa.PrivateKey, publicKey *rsa.PublicKey) *Client {
	return &Client{
		AppID:      appID,
		PrivateKey: privateKey,
		PublicKey:  publicKey,
		BaseURL:    "https://openapi.alipay.com/gateway.do",
		client:     &http.Client{Timeout: 30 * time.Second},
	}
}

// NewMockClient 创建Mock客户端
func NewMockClient() *Client {
	return &Client{
		AppID:  "mock_app_id",
		BaseURL: "mock://alipay",
		isMock: true,
	}
}

func (c *Client) IsMock() bool { return c.isMock || c.PrivateKey == nil }

// CallAPI 调用支付宝API
func (c *Client) CallAPI(method string, bizContent map[string]interface{}) (map[string]interface{}, error) {
	bizJSON, _ := json.Marshal(bizContent)
	params := map[string]string{
		"app_id":      c.AppID,
		"method":      method,
		"format":      "JSON",
		"charset":     "utf-8",
		"sign_type":   "RSA2",
		"timestamp":   time.Now().Format("2006-01-02 15:04:05"),
		"version":     "1.0",
		"biz_content": string(bizJSON),
	}
	params["sign"] = c.sign(params)

	form := url.Values{}
	for k, v := range params {
		form.Add(k, v)
	}

	resp, err := c.client.PostForm(c.BaseURL, form)
	if err != nil {
		return nil, fmt.Errorf("支付宝请求失败: %w", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	var result map[string]interface{}
	json.Unmarshal(body, &result)
	return result, nil
}

func (c *Client) sign(params map[string]string) string {
	if c.PrivateKey == nil {
		return "MOCK_SIGN"
	}
	keys := make([]string, 0, len(params))
	for k := range params {
		if k == "sign" {
			continue
		}
		keys = append(keys, k)
	}
	sort.Strings(keys)

	var parts []string
	for _, k := range keys {
		v := params[k]
		if v == "" {
			continue
		}
		parts = append(parts, k+"="+v)
	}
	signStr := strings.Join(parts, "&")

	hashed := sha256.Sum256([]byte(signStr))
	sig, err := rsa.SignPKCS1v15(rand.Reader, c.PrivateKey, crypto.SHA256, hashed[:])
	if err != nil {
		return ""
	}
	return base64.StdEncoding.EncodeToString(sig)
}

// LoadPrivateKey 加载PEM格式私钥
func LoadPrivateKey(pemData string) (*rsa.PrivateKey, error) {
	if pemData == "" {
		return nil, fmt.Errorf("私钥为空")
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

// LoadPublicKey 加载PEM格式公钥
func LoadPublicKey(pemData string) (*rsa.PublicKey, error) {
	if pemData == "" {
		return nil, fmt.Errorf("公钥为空")
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

// ========== 消费者投诉相关API ==========

// ComplaintQueryParams 投诉查询参数
type ComplaintQueryParams struct {
	MerchantID   string `json:"merchant_id,omitempty"`
	Status       string `json:"status,omitempty"`
	BeginDate    string `json:"begin_date,omitempty"`
	EndDate      string `json:"end_date,omitempty"`
	PageNum      int    `json:"page_num"`
	PageSize     int    `json:"page_size"`
}

// AlipayComplaint 支付宝投诉记录
type AlipayComplaint struct {
	ComplaintID     string `json:"complaint_id"`
	TradeNo         string `json:"trade_no"`
	MerchantID      string `json:"merchant_id"`
	MerchantName    string `json:"merchant_name"`
	ComplaintType   string `json:"complaint_type"`
	ComplaintDetail string `json:"complaint_detail"`
	ComplaintAmount string `json:"complaint_amount"`
	Status          string `json:"status"`
	ComplaintTime   string `json:"complaint_time"`
	PayerPhone      string `json:"payer_phone"`
}

// QueryComplaints 查询消费者投诉列表
func (c *Client) QueryComplaints(params ComplaintQueryParams) ([]AlipayComplaint, int64, error) {
	if c.IsMock() {
		return c.mockComplaints(params.PageNum, params.PageSize)
	}

	biz := map[string]interface{}{
		"page_num":  params.PageNum,
		"page_size": params.PageSize,
	}
	if params.MerchantID != "" {
		biz["merchant_id"] = params.MerchantID
	}
	if params.Status != "" {
		biz["status"] = params.Status
	}
	if params.BeginDate != "" {
		biz["begin_date"] = params.BeginDate
	}
	if params.EndDate != "" {
		biz["end_date"] = params.EndDate
	}

	resp, err := c.CallAPI("alipay.merchant.complaint.query", biz)
	if err != nil {
		return nil, 0, err
	}

	// 解析响应
	respKey := "alipay_merchant_complaint_query_response"
	respData, ok := resp[respKey].(map[string]interface{})
	if !ok {
		return nil, 0, fmt.Errorf("解析响应失败")
	}

	total := int64(0)
	if t, ok := respData["total_count"].(float64); ok {
		total = int64(t)
	}

	items := []AlipayComplaint{}
	if list, ok := respData["complaint_list"].([]interface{}); ok {
		for _, item := range list {
			if m, ok := item.(map[string]interface{}); ok {
				items = append(items, mapToComplaint(m))
			}
		}
	}
	return items, total, nil
}

// ReplyComplaint 回复投诉
func (c *Client) ReplyComplaint(complaintID, replyContent string) error {
	if c.IsMock() {
		return nil
	}
	biz := map[string]interface{}{
		"complaint_id":   complaintID,
		"reply_content":  replyContent,
	}
	_, err := c.CallAPI("alipay.merchant.complaint.reply", biz)
	return err
}

func mapToComplaint(m map[string]interface{}) AlipayComplaint {
	return AlipayComplaint{
		ComplaintID:     strVal(m, "complaint_id"),
		TradeNo:         strVal(m, "trade_no"),
		MerchantID:      strVal(m, "merchant_id"),
		MerchantName:    strVal(m, "merchant_name"),
		ComplaintType:   strVal(m, "complaint_type"),
		ComplaintDetail: strVal(m, "complaint_detail"),
		ComplaintAmount: strVal(m, "complaint_amount"),
		Status:          strVal(m, "status"),
		ComplaintTime:   strVal(m, "complaint_time"),
		PayerPhone:      strVal(m, "payer_phone"),
	}
}

func strVal(m map[string]interface{}, key string) string {
	if v, ok := m[key].(string); ok {
		return v
	}
	return ""
}

func (c *Client) mockComplaints(page, size int) ([]AlipayComplaint, int64, error) {
	types := []string{"SERVICE_COMPLAINT", "GOODS_COMPLAINT", "FRAUD_COMPLAINT"}
	statuses := []string{"PENDING", "PROCESSING", "RESOLVED"}

	items := make([]AlipayComplaint, size)
	for i := 0; i < size; i++ {
		items[i] = AlipayComplaint{
			ComplaintID:     fmt.Sprintf("ALI%d%06d", time.Now().Unix()%1000000, i),
			TradeNo:         fmt.Sprintf("202405%d%08d", rand.Intn(9999), rand.Intn(99999999)),
			MerchantID:      fmt.Sprintf("2088%d%06d", rand.Intn(9999), rand.Intn(999999)),
			MerchantName:    "测试商户-" + fmt.Sprintf("%d", i+1),
			ComplaintType:   types[rand.Intn(len(types))],
			ComplaintDetail: fmt.Sprintf("支付宝投诉内容示例#%d：商品质量不满意/服务体验差", i+1),
			ComplaintAmount: fmt.Sprintf("%.2f", float64(rand.Intn(50000)+1000)/100.0),
			Status:          statuses[rand.Intn(len(statuses))],
			ComplaintTime:   time.Now().Add(-time.Duration(rand.Intn(168)) * time.Hour).Format("2006-01-02 15:04:05"),
			PayerPhone:      fmt.Sprintf("139****%04d", rand.Intn(9999)),
		}
	}
	return items, int64(42), nil
}
