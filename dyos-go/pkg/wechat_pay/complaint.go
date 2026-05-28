package wechat_pay

import (
	"fmt"
	"math/rand"
	"time"
)

// WXComplaintListResponse 微信投诉列表响应
type WXComplaintListResponse struct {
	Offset     int                   `json:"offset"`
	Limit      int                   `json:"limit"`
	TotalCount int64                 `json:"total_count"`
	Data       []WXComplaintListItem `json:"data"`
}

// WXComplaintListItem 微信投诉列表项
type WXComplaintListItem struct {
	ComplaintID      string `json:"complaint_id"`
	TransactionID    string `json:"transaction_id"`
	ComplaintTime    string `json:"complaint_time"`
	ComplaintType    string `json:"complaint_type"`
	ComplaintDetail  string `json:"complaint_detail"`
	ComplaintAmount  string `json:"complaint_amount"`
	ComplaintState   string `json:"complaint_state"`
	PayerPhone       string `json:"payer_phone"`
	ProblemDescription string `json:"problem_description"`
}

// WXComplaintDetailResponse 微信投诉详情响应
type WXComplaintDetailResponse struct {
	WXComplaintListItem
	ComplaintMediaList     []string             `json:"complaint_media_list"`
	ComplaintOrderList     []WXComplaintOrder   `json:"complaint_order_list"`
	ServiceOrderInfo       []WXServiceOrder     `json:"service_order_info"`
	ComplaintHandleHistory []WXHandleHistory    `json:"complaint_handle_history"`
}

// WXComplaintOrder 投诉关联订单
type WXComplaintOrder struct {
	TransactionID string `json:"transaction_id"`
	Amount        string `json:"amount"`
	OrderTime     string `json:"order_time"`
	OrderDesc     string `json:"order_desc"`
}

// WXServiceOrder 服务订单
type WXServiceOrder struct {
	OrderID     string `json:"order_id"`
	ServiceName string `json:"service_name"`
	OrderStatus string `json:"order_status"`
}

// WXHandleHistory 处理历史
type WXHandleHistory struct {
	HandleTime   string `json:"handle_time"`
	HandleType   string `json:"handle_type"`
	HandleDetail string `json:"handle_detail"`
}

// ListComplaints 查询投诉列表（真实API + mock降级）
func (c *Client) ListComplaints(merchantID string, offset, limit int, beginDate, endDate string) ([]ComplaintListItem, int64, error) {
	if c.IsMock() {
		return c.mockComplaintList(offset, limit)
	}

	httpClient := NewHTTPClient(c.MchID, c.SerialNo, c.PrivateKey)
	path := fmt.Sprintf("/v3/merchant-service/complaints-v2?offset=%d&limit=%d", offset, limit)
	if beginDate != "" {
		path += "&begin_date=" + beginDate
	}
	if endDate != "" {
		path += "&end_date=" + endDate
	}
	if merchantID != "" {
		path += "&complainted_mchid=" + merchantID
	}

	var resp WXComplaintListResponse
	if err := httpClient.Get(path, &resp); err != nil {
		return nil, 0, fmt.Errorf("查询投诉列表失败: %w", err)
	}

	items := make([]ComplaintListItem, len(resp.Data))
	for i, item := range resp.Data {
		items[i] = ComplaintListItem{
			ComplaintID:     item.ComplaintID,
			TransactionID:   item.TransactionID,
			ComplaintType:   item.ComplaintType,
			ComplaintDetail: item.ComplaintDetail,
			ComplaintAmount: parseAmount(item.ComplaintAmount),
			ComplaintState:  item.ComplaintState,
			PayerPhone:      item.PayerPhone,
		}
		if t, err := time.Parse(time.RFC3339, item.ComplaintTime); err == nil {
			items[i].ComplaintTime = t
		}
	}
	return items, resp.TotalCount, nil
}

// GetComplaintDetail 查询投诉详情
func (c *Client) GetComplaintDetail(complaintID string) (*ComplaintDetail, error) {
	if c.IsMock() {
		return c.mockComplaintDetail(complaintID)
	}

	httpClient := NewHTTPClient(c.MchID, c.SerialNo, c.PrivateKey)
	var resp WXComplaintDetailResponse
	if err := httpClient.Get("/v3/merchant-service/complaints-v2/"+complaintID, &resp); err != nil {
		return nil, fmt.Errorf("查询投诉详情失败: %w", err)
	}

	detail := &ComplaintDetail{
		ComplaintListItem: ComplaintListItem{
			ComplaintID:     resp.ComplaintID,
			TransactionID:   resp.TransactionID,
			ComplaintType:   resp.ComplaintType,
			ComplaintDetail: resp.ComplaintDetail,
			ComplaintAmount: parseAmount(resp.ComplaintAmount),
			ComplaintState:  resp.ComplaintState,
			PayerPhone:      resp.PayerPhone,
		},
		ComplaintMediaList: resp.ComplaintMediaList,
	}
	if t, err := time.Parse(time.RFC3339, resp.ComplaintTime); err == nil {
		detail.ComplaintTime = t
	}
	for _, order := range resp.ComplaintOrderList {
		detail.ComplaintOrderList = append(detail.ComplaintOrderList, ComplaintOrder{
			TransactionID: order.TransactionID,
			Amount:        parseAmount(order.Amount),
			OrderTime:     order.OrderTime,
			OrderDesc:     order.OrderDesc,
		})
	}
	for _, svc := range resp.ServiceOrderInfo {
		detail.ServiceOrderInfo = append(detail.ServiceOrderInfo, ServiceOrder{
			OrderID:     svc.OrderID,
			ServiceName: svc.ServiceName,
			OrderStatus: svc.OrderStatus,
		})
	}
	for _, h := range resp.ComplaintHandleHistory {
		detail.HistoryReplyList = append(detail.HistoryReplyList, HistoryReply{
			ReplyContent: h.HandleDetail,
			ReplyTime:    h.HandleTime,
			Replyer:      h.HandleType,
		})
	}
	return detail, nil
}

// ReplyComplaint 回复投诉
func (c *Client) ReplyComplaint(complaintID, replyContent string, replyMedia []string) error {
	if c.IsMock() {
		return nil
	}
	httpClient := NewHTTPClient(c.MchID, c.SerialNo, c.PrivateKey)
	body := map[string]interface{}{
		"complainted_mchid": c.MchID,
		"response_content":  replyContent,
	}
	if len(replyMedia) > 0 {
		body["response_media"] = replyMedia
	}
	return httpClient.Post("/v3/merchant-service/complaints-v2/"+complaintID+"/response", body, nil)
}

// CompleteComplaint 完成投诉处理
func (c *Client) CompleteComplaint(complaintID string) error {
	if c.IsMock() {
		return nil
	}
	httpClient := NewHTTPClient(c.MchID, c.SerialNo, c.PrivateKey)
	body := map[string]string{"complainted_mchid": c.MchID}
	return httpClient.Post("/v3/merchant-service/complaints-v2/"+complaintID+"/complete", body, nil)
}

// UpdateRefundProgress 更新退款进度
func (c *Client) UpdateRefundProgress(complaintID, action, refundAmount string) error {
	if c.IsMock() {
		return nil
	}
	httpClient := NewHTTPClient(c.MchID, c.SerialNo, c.PrivateKey)
	body := map[string]interface{}{
		"action":             action,
		"launch_refund_day":  3,
		"complainted_mchid":  c.MchID,
	}
	if refundAmount != "" {
		body["refund_amount"] = refundAmount
	}
	return httpClient.Post("/v3/merchant-service/complaints-v2/"+complaintID+"/update-refund-progress", body, nil)
}

func parseAmount(s string) float64 {
	var f float64
	fmt.Sscanf(s, "%f", &f)
	return f
}

// ========== Mock 实现（开发环境降级） ==========

func (c *Client) mockComplaintList(offset, limit int) ([]ComplaintListItem, int64, error) {
	types := []string{"food_safety", "duplicate_charge", "no_service", "service_attitude", "other"}
	states := []string{"PENDING", "PROCESSING", "RESOLVED", "CLOSED"}
	mockTotal := int64(42)

	items := make([]ComplaintListItem, 0)
	count := min(limit, 10)
	for i := 0; i < count; i++ {
		idx := offset + i
		items = append(items, ComplaintListItem{
			ComplaintID:     fmt.Sprintf("WC%d%06d", time.Now().Unix()%100000000, idx),
			TransactionID:   fmt.Sprintf("420000%d%05d", time.Now().Unix()%1000, idx),
			ComplaintType:   types[rand.Intn(len(types))],
			ComplaintDetail: fmt.Sprintf("顾客投诉内容示例#%d：商品质量问题/服务体验差", idx+1),
			ComplaintAmount: float64(rand.Intn(50000)+1000) / 100.0,
			ComplaintState:  states[rand.Intn(len(states))],
			ComplaintTime:   time.Now().Add(-time.Duration(rand.Intn(72)) * time.Hour),
			PayerPhone:      fmt.Sprintf("138****%04d", rand.Intn(9999)),
		})
	}
	return items, mockTotal, nil
}

func (c *Client) mockComplaintDetail(complaintID string) (*ComplaintDetail, error) {
	types := []string{"food_safety", "duplicate_charge", "no_service", "service_attitude"}
	return &ComplaintDetail{
		ComplaintListItem: ComplaintListItem{
			ComplaintID:     complaintID,
			TransactionID:   fmt.Sprintf("420000%d", rand.Intn(99999999)),
			ComplaintType:   types[rand.Intn(len(types))],
			ComplaintDetail: "顾客反馈：下单后迟迟未收到商品，联系客服无回应，要求退款并赔偿",
			ComplaintAmount: float64(rand.Intn(50000)+1000) / 100.0,
			ComplaintState:  "PROCESSING",
			ComplaintTime:   time.Now().Add(-6 * time.Hour),
			PayerPhone:      "138****5678",
		},
		ComplaintMediaList: []string{"https://mock/wxpay/img/complaint_1.jpg"},
		ComplaintOrderList: []ComplaintOrder{
			{TransactionID: fmt.Sprintf("420000%d", rand.Intn(99999999)), Amount: 128.50, OrderTime: time.Now().Add(-8 * time.Hour).Format("2006-01-02 15:04:05"), OrderDesc: "招牌火锅套餐"},
		},
	}, nil
}
