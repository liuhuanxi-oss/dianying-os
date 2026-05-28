package wechat_pay

import (
	"crypto/rsa"
	"fmt"
	"time"
)

// Client 微信支付V3客户端
type Client struct {
	MchID      string
	SerialNo   string
	PrivateKey *rsa.PrivateKey
	APIv3Key   string
	BaseURL    string
}

// NewClient 创建微信支付V3客户端
func NewClient(mchID, serialNo, apiV3Key string, privateKey *rsa.PrivateKey) *Client {
	return &Client{
		MchID:      mchID,
		SerialNo:   serialNo,
		PrivateKey: privateKey,
		APIv3Key:   apiV3Key,
		BaseURL:    "https://api.mch.weixin.qq.com",
	}
}

// NewMockClient 创建Mock客户端（开发环境使用）
func NewMockClient() *Client {
	return &Client{
		MchID:    "mock_mch_1234567890",
		SerialNo: "MOCK_SERIAL_001",
		APIv3Key: "mock_apiv3_key_for_dev",
		BaseURL:  "mock://wechat_pay",
	}
}

// IsMock 判断是否为Mock模式
func (c *Client) IsMock() bool {
	return c.BaseURL == "mock://wechat_pay" || c.PrivateKey == nil
}

// ComplaintListItem 投诉列表项
type ComplaintListItem struct {
	ComplaintID      string    `json:"complaint_id"`
	TransactionID    string    `json:"transaction_id"`
	ComplaintType    string    `json:"complaint_type"`
	ComplaintDetail  string    `json:"complaint_detail"`
	ComplaintAmount  float64   `json:"complaint_amount"`
	ComplaintState   string    `json:"complaint_state"`
	ComplaintTime    time.Time `json:"complaint_time"`
	PayerPhone       string    `json:"payer_phone"`
}

// ComplaintDetail 投诉详情
type ComplaintDetail struct {
	ComplaintListItem
	ComplaintMediaList []string         `json:"complaint_media_list"`
	ComplaintOrderList []ComplaintOrder `json:"complaint_order_list"`
	ServiceOrderInfo   []ServiceOrder   `json:"service_order_info"`
	HistoryReplyList   []HistoryReply   `json:"history_reply_list"`
}

// ComplaintOrder 投诉关联订单
type ComplaintOrder struct {
	TransactionID  string  `json:"transaction_id"`
	Amount         float64 `json:"amount"`
	OrderTime      string  `json:"order_time"`
	OrderDesc      string  `json:"order_desc"`
}

// ServiceOrder 服务订单
type ServiceOrder struct {
	OrderID        string `json:"order_id"`
	ServiceName    string `json:"service_name"`
	OrderStatus    string `json:"order_status"`
}

// HistoryReply 历史回复
type HistoryReply struct {
	ReplyContent string `json:"reply_content"`
	ReplyTime    string `json:"reply_time"`
	Replyer      string `json:"replyer"`
}

// ComplaintStats 投诉统计
type ComplaintStats struct {
	Total          int64            `json:"total"`
	PendingCount   int64            `json:"pending_count"`
	ProcessingCount int64           `json:"processing_count"`
	ResolvedCount  int64            `json:"resolved_count"`
	ByPlatform     map[string]int64 `json:"by_platform"`
	ByUrgency      map[string]int64 `json:"by_urgency"`
	ByStatus       map[string]int64 `json:"by_status"`
	AvgHandleTime  float64          `json:"avg_handle_time"`
}

// CallbackData 微信支付回调数据
type CallbackData struct {
	ID           string                 `json:"id"`
	CreateTime   string                 `json:"create_time"`
	ResourceType string                 `json:"resource_type"`
	EventType    string                 `json:"event_type"`
	Summary      string                 `json:"summary"`
	Resource     map[string]interface{} `json:"resource"`
}

func (c *CallbackData) String() string {
	return fmt.Sprintf("Event: %s, ID: %s, Type: %s", c.EventType, c.ID, c.ResourceType)
}
