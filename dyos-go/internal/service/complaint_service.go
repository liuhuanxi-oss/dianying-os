package service

import (
	"fmt"
	"math/rand"
	"time"

	"dyos-go/internal/model"

	"gorm.io/gorm"
)

type ComplaintService struct {
	db *gorm.DB
}

func NewComplaintService(db *gorm.DB) *ComplaintService { return &ComplaintService{db: db} }

func (s *ComplaintService) List(merchantID uint, platform, urgency, status string, page, size int) (map[string]interface{}, error) {
	if size <= 0 {
		size = 20
	}
	if page <= 0 {
		page = 1
	}
	if s.db == nil {
		return s.mockList(merchantID, platform, urgency, status, page, size), nil
	}
	var items []model.Complaint
	var total int64
	q := s.db.Model(&model.Complaint{})
	if merchantID > 0 {
		q = q.Where("merchant_id = ?", merchantID)
	}
	if platform != "" {
		q = q.Where("platform = ?", platform)
	}
	if urgency != "" {
		q = q.Where("urgency = ?", urgency)
	}
	if status != "" {
		q = q.Where("status = ?", status)
	}
	q.Count(&total)
	q.Order("id DESC").Offset((page - 1) * size).Limit(size).Find(&items)
	return map[string]interface{}{"items": items, "total": total, "page": page, "size": size}, nil
}

// CheckOwnership 验证投诉是否属于指定商户，merchantID=0表示admin跳过检查
func (s *ComplaintService) CheckOwnership(id uint, merchantID uint) (bool, error) {
	if merchantID == 0 { return true, nil }
	if s.db == nil { return true, nil }
	var count int64
	err := s.db.Model(&model.Complaint{}).Where("id = ? AND merchant_id = ?", id, merchantID).Count(&count).Error
	return count > 0, err
}

func (s *ComplaintService) GetByID(id uint) (map[string]interface{}, error) {
	if s.db == nil {
		return s.mockDetail(id), nil
	}
	var item model.Complaint
	if err := s.db.First(&item, id).Error; err != nil {
		return nil, err
	}
	return map[string]interface{}{"complaint": item}, nil
}

func (s *ComplaintService) GetStats(merchantID uint) map[string]interface{} {
	if s.db == nil {
		return s.mockStats(merchantID)
	}
	var total, pending, processing, resolved, escalated int64
	baseQ := s.db.Model(&model.Complaint{})
	if merchantID > 0 {
		baseQ = baseQ.Where("merchant_id = ?", merchantID)
	}

	baseQ.Count(&total)
	s.db.Model(&model.Complaint{}).Where("merchant_id = ?", merchantID).Where("status = 'pending'").Count(&pending)
	s.db.Model(&model.Complaint{}).Where("merchant_id = ?", merchantID).Where("status = 'processing'").Count(&processing)
	s.db.Model(&model.Complaint{}).Where("merchant_id = ?", merchantID).Where("status = 'resolved'").Count(&resolved)
	s.db.Model(&model.Complaint{}).Where("merchant_id = ?", merchantID).Where("status = 'escalated'").Count(&escalated)

	// 平台维度统计
	var wechatPayCnt, alipayCnt int64
	s.db.Model(&model.Complaint{}).Where("merchant_id = ?", merchantID).Where("platform = ?", "wechat_pay").Count(&wechatPayCnt)
	s.db.Model(&model.Complaint{}).Where("merchant_id = ?", merchantID).Where("platform = ?", "alipay").Count(&alipayCnt)

	var criticalCnt, highCnt, normalCnt int64
	s.db.Model(&model.Complaint{}).Where("merchant_id = ?", merchantID).Where("urgency = ?", "critical").Count(&criticalCnt)
	s.db.Model(&model.Complaint{}).Where("merchant_id = ?", merchantID).Where("urgency = ?", "high").Count(&highCnt)
	s.db.Model(&model.Complaint{}).Where("merchant_id = ?", merchantID).Where("urgency = ?", "normal").Count(&normalCnt)

	// AI自动处理率：resolved状态且handler_type为ai_auto的占比
	var aiResolved int64
	s.db.Model(&model.Complaint{}).Where("merchant_id = ?", merchantID).Where("status IN ?", []string{"resolved", "closed"}).Where("handler_type = ?", "ai_auto").Count(&aiResolved)
	autoHandleRate := float64(0)
	if resolved > 0 {
		autoHandleRate = float64(aiResolved) / float64(resolved)
	}

	// 平均处理时长：resolved中 handled_at - created_at 的平均值
	var avgHandleHours float64
	row := s.db.Model(&model.Complaint{}).Where("merchant_id = ?", merchantID).Where("status IN ?", []string{"resolved", "closed"}).Where("handled_at IS NOT NULL").Select("AVG(TIMESTAMPDIFF(MINUTE, created_at, handled_at))").Row()
	if row != nil {
		var avgMinutes *float64
		row.Scan(&avgMinutes)
		if avgMinutes != nil {
			avgHandleHours = *avgMinutes / 60.0
		}
	}

	return map[string]interface{}{
		"merchant_id":       merchantID,
		"total":             total,
		"pending":           pending,
		"processing":        processing,
		"resolved":          resolved,
		"escalated":         escalated,
		"by_platform":       map[string]int64{"wechat_pay": wechatPayCnt, "alipay": alipayCnt},
		"by_urgency":        map[string]int64{"critical": criticalCnt, "high": highCnt, "normal": normalCnt},
		"auto_handle_rate":  autoHandleRate,
		"avg_handle_time_h": avgHandleHours,
	}
}

func (s *ComplaintService) RiskAlerts(merchantID uint) []map[string]interface{} {
	return []map[string]interface{}{
		{"id": 1, "type": "群体投诉风险", "level": "critical", "merchant_name": "有味餐厅", "complaint_count": 8, "trend": "rising", "suggested_action": "建议立即暂停该商户部分功能并人工介入"},
		{"id": 2, "type": "大额争议", "level": "high", "merchant_name": "鲜味火锅", "amount": 12800.00, "complaint_id": "WC240001", "suggested_action": "涉及金额较大，建议优先处理并核实交易凭证"},
		{"id": 3, "type": "商户号降级风险", "level": "warning", "merchant_name": "美味烤肉", "complaint_rate": "8.5%", "threshold": "5%", "suggested_action": "投诉率超过阈值，继续上升可能触发微信商户号降级"},
		{"id": 4, "type": "重复投诉", "level": "info", "merchant_name": "甜品屋", "complaint_count": 5, "same_payer": true, "suggested_action": "同一用户多次投诉，建议直接联系用户了解真实诉求"},
	}
}

func (s *ComplaintService) UpdateStatus(id uint, status, handlerType string) error {
	if s.db == nil {
		return nil
	}
	updates := map[string]interface{}{"status": status}
	if handlerType != "" {
		updates["handler_type"] = handlerType
	}
	if status == "resolved" || status == "closed" {
		now := time.Now()
		updates["handled_at"] = &now
	}
	return s.db.Model(&model.Complaint{}).Where("id = ?", id).Updates(updates).Error
}

func (s *ComplaintService) SaveReply(id uint, reply string) error {
	if s.db == nil {
		return nil
	}
	return s.db.Model(&model.Complaint{}).Where("id = ?", id).Updates(map[string]interface{}{
		"ai_reply": reply, "status": "processing",
	}).Error
}

func (s *ComplaintService) SaveAnalysis(id uint, analysis string, urgency, refundDecision string) error {
	if s.db == nil {
		return nil
	}
	updates := map[string]interface{}{"ai_analysis": analysis}
	if urgency != "" {
		updates["urgency"] = urgency
	}
	if refundDecision != "" {
		updates["refund_decision"] = refundDecision
	}
	return s.db.Model(&model.Complaint{}).Where("id = ?", id).Updates(updates).Error
}

func (s *ComplaintService) mockList(merchantID uint, platform, urgency, status string, page, size int) map[string]interface{} {
	platforms := []string{"wechat_pay", "alipay"}
	types := []string{"food_safety", "duplicate_charge", "no_service", "service_attitude", "other"}
	urgencies := []string{"critical", "high", "normal"}
	statuses := []string{"pending", "processing", "resolved", "escalated", "closed"}
	decisions := []string{"auto_refund", "manual_review", "escalate", "reject"}

	items := make([]map[string]interface{}, size)
	for i := 0; i < size; i++ {
		items[i] = map[string]interface{}{
			"id":              (page-1)*size + i + 1,
			"merchant_id":     merchantID + uint(rand.Intn(5)),
			"merchant_no":     fmt.Sprintf("399%d%04d", rand.Intn(9999), rand.Intn(9999)),
			"platform":        platforms[rand.Intn(2)],
			"complaint_id":    fmt.Sprintf("WC%06d", rand.Intn(999999)),
			"transaction_id":  fmt.Sprintf("420000%d", rand.Intn(99999999)),
			"complaint_type":  types[rand.Intn(len(types))],
			"content":         fmt.Sprintf("顾客投诉示例内容#%d", i+1),
			"complaint_detail": fmt.Sprintf("详细投诉内容：商品质量不满意，要求退款处理。#%d", i+1),
			"complaint_amount": float64(rand.Intn(30000)+1000) / 100.0,
			"urgency":         urgencies[rand.Intn(3)],
			"refund_decision": decisions[rand.Intn(len(decisions))],
			"refund_amount":   float64(rand.Intn(20000)+500) / 100.0,
			"status":          statuses[rand.Intn(len(statuses))],
			"handler_type":    "ai_auto",
			"complaint_time":  time.Now().Add(-time.Duration(rand.Intn(168)) * time.Hour).Format("2006-01-02 15:04:05"),
			"created_at":      time.Now().Add(-time.Duration(rand.Intn(24)) * time.Hour).Format("2006-01-02 15:04:05"),
		}
	}
	mockTotal := int64(42)
	return map[string]interface{}{"items": items, "total": mockTotal, "page": page, "size": size}
}

func (s *ComplaintService) mockDetail(id uint) map[string]interface{} {
	return map[string]interface{}{
		"complaint": map[string]interface{}{
			"id":               id,
			"merchant_id":      1,
			"merchant_no":      "3991234567",
			"platform":         "wechat_pay",
			"complaint_id":     "WC2003301202505240123456789",
			"transaction_id":   "4200002564202505240123456789",
			"complaint_type":   "no_service",
			"content":          "下单后2小时未收到商品，联系商家客服无人回应",
			"complaint_detail": "订单明细：招牌火锅套餐x1，实付198元。投诉诉求：要求全额退款并赔偿。已上传支付截图和聊天记录。",
			"complaint_amount": 198.00,
			"urgency":          "high",
			"refund_decision":  "auto_refund",
			"refund_amount":    198.00,
			"ai_analysis":      `{"category":"未收到服务","urgency":"high","sentiment_score":-0.72,"refund_suggested":true,"confidence":0.91}`,
			"ai_reply":         "尊敬的顾客，非常抱歉给您带来不便。我们已核实您的订单，将在24小时内为您全额退款。同时我们会加强客服管理，感谢您的反馈。",
			"status":           "processing",
			"handler_type":     "ai_auto",
			"complaint_time":   time.Now().Add(-6 * time.Hour).Format("2006-01-02 15:04:05"),
			"created_at":       time.Now().Add(-6 * time.Hour).Format("2006-01-02 15:04:05"),
			"handled_at":       nil,
		},
	}
}

func (s *ComplaintService) mockStats(merchantID uint) map[string]interface{} {
	return map[string]interface{}{
		"merchant_id":      merchantID,
		"total":            int64(42),
		"pending":          int64(12),
		"processing":       int64(8),
		"resolved":         int64(18),
		"escalated":        int64(4),
		"by_platform":      map[string]int64{"wechat_pay": 28, "alipay": 14},
		"by_urgency":       map[string]int64{"critical": 5, "high": 12, "normal": 25},
		"auto_handle_rate": 0.68,
		"avg_handle_time_h": 2.3,
	}
}
