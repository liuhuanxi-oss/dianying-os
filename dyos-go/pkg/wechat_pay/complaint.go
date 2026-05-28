package wechat_pay

import (
	"fmt"
	"math/rand"
	"time"
)

// ListComplaints 查询投诉列表
func (c *Client) ListComplaints(merchantID string, offset, limit int, beginDate, endDate string) ([]ComplaintListItem, int64, error) {
	if c.IsMock() {
		return c.mockComplaintList(offset, limit)
	}
	// TODO: 真实微信支付V3 API调用 GET /v3/merchant-service/complaints-v2
	return nil, 0, fmt.Errorf("真实微信支付API待对接")
}

// GetComplaintDetail 查询投诉详情
func (c *Client) GetComplaintDetail(complaintID string) (*ComplaintDetail, error) {
	if c.IsMock() {
		return c.mockComplaintDetail(complaintID)
	}
	// TODO: 真实微信支付V3 API调用 GET /v3/merchant-service/complaints-v2/{complaint_id}
	return nil, fmt.Errorf("真实微信支付API待对接")
}

// ReplyComplaint 回复投诉
func (c *Client) ReplyComplaint(complaintID, replyContent string, replyMedia []string) error {
	if c.IsMock() {
		return nil
	}
	// TODO: 真实微信支付V3 API调用 POST /v3/merchant-service/complaints-v2/{complaint_id}/response
	return fmt.Errorf("真实微信支付API待对接")
}

// CompleteComplaint 完成投诉处理
func (c *Client) CompleteComplaint(complaintID string) error {
	if c.IsMock() {
		return nil
	}
	// TODO: 真实微信支付V3 API调用 POST /v3/merchant-service/complaints-v2/{complaint_id}/complete
	return fmt.Errorf("真实微信支付API待对接")
}

// UpdateRefundProgress 更新退款进度
func (c *Client) UpdateRefundProgress(complaintID, action, refundAmount string) error {
	if c.IsMock() {
		return nil
	}
	// TODO: 真实微信支付V3 API调用 POST /v3/merchant-service/complaints-v2/{complaint_id}/update-refund-progress
	return fmt.Errorf("真实微信支付API待对接")
}

// mockComplaintList Mock投诉列表
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

// mockComplaintDetail Mock投诉详情
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
