package service

import (
	"fmt"
	"time"

	"dyos-go/internal/model"

	"gorm.io/gorm"
)

type RiskMerchantService struct {
	db *gorm.DB
}

func NewRiskMerchantService(db *gorm.DB) *RiskMerchantService {
	return &RiskMerchantService{db: db}
}

func (s *RiskMerchantService) List(platform, riskLevel, handleStatus string, page, size int) (map[string]interface{}, error) {
	if size <= 0 {
		size = 20
	}
	if page <= 0 {
		page = 1
	}
	if s.db == nil {
		return s.mockList(page, size), nil
	}
	var items []model.RiskMerchant
	var total int64
	q := s.db.Model(&model.RiskMerchant{})
	if platform != "" {
		q = q.Where("platform = ?", platform)
	}
	if riskLevel != "" {
		q = q.Where("risk_level = ?", riskLevel)
	}
	if handleStatus != "" {
		q = q.Where("handle_status = ?", handleStatus)
	}
	q.Count(&total)
	q.Order("id DESC").Offset((page - 1) * size).Limit(size).Find(&items)
	return map[string]interface{}{"items": items, "total": total, "page": page, "size": size}, nil
}

func (s *RiskMerchantService) GetStats() map[string]interface{} {
	if s.db == nil {
		return s.mockStats()
	}
	var total, pending, high, medium int64
	s.db.Model(&model.RiskMerchant{}).Count(&total)
	s.db.Model(&model.RiskMerchant{}).Where("handle_status = ?", "pending").Count(&pending)
	s.db.Model(&model.RiskMerchant{}).Where("risk_level = ?", "high").Count(&high)
	s.db.Model(&model.RiskMerchant{}).Where("risk_level = ?", "medium").Count(&medium)
	return map[string]interface{}{
		"total":   total,
		"pending": pending,
		"high":    high,
		"medium":  medium,
	}
}

func (s *RiskMerchantService) Handle(id uint, action, remark string) error {
	if s.db == nil {
		return nil
	}
	updates := map[string]interface{}{
		"handle_status": action,
		"handle_remark": remark,
	}
	if action == "resolved" {
		now := time.Now()
		updates["handled_at"] = &now
	}
	return s.db.Model(&model.RiskMerchant{}).Where("id = ?", id).Updates(updates).Error
}

func (s *RiskMerchantService) Create(r *model.RiskMerchant) error {
	if s.db == nil {
		return nil
	}
	return s.db.Create(r).Error
}

// SyncRiskMerchants 从投诉数据自动检测风险商户
func (s *RiskMerchantService) SyncRiskMerchants(providerID uint, platform string) (int, error) {
	if s.db == nil {
		return 0, nil
	}
	// 按商户号和平台分组统计投诉数据
	type statsRow struct {
		MerchantNo string
		Platform   string
		Total      int64
		Amount     float64
	}
	var rows []statsRow
	s.db.Model(&model.Complaint{}).
		Select("merchant_no, platform, COUNT(*) as total, SUM(complaint_amount) as amount").
		Where("created_at > ?", time.Now().AddDate(0, 0, -30)).
		Group("merchant_no, platform").
		Having("COUNT(*) >= 3"). // 30天内投诉>=3条
		Find(&rows)

	count := 0
	for _, row := range rows {
		// 检查是否已存在未处理的风险记录
		var existing int64
		s.db.Model(&model.RiskMerchant{}).
			Where("mch_id = ? AND platform = ? AND handle_status = ?", row.MerchantNo, row.Platform, "pending").
			Count(&existing)
		if existing > 0 {
			continue
		}
		level := "medium"
		if row.Total >= 10 {
			level = "high"
		} else if row.Total < 5 {
			level = "low"
		}
		r := &model.RiskMerchant{
			ProviderID:      providerID,
			Platform:        row.Platform,
			MchID:           row.MerchantNo,
			RiskType:        "投诉超标",
			RiskLevel:       level,
			RiskDetail:      "近30天投诉量" + fmtInt(row.Total) + "条，涉及金额" + fmt.Sprintf("%.2f", row.Amount) + "元",
			ComplaintCount:  int(row.Total),
			ComplaintRate:   float64(row.Total) / 30.0,
			TransactionAmount: row.Amount,
			HandleStatus:    "pending",
			DetectedAt:      time.Now(),
		}
		if err := s.db.Create(r).Error; err == nil {
			count++
		}
	}
	return count, nil
}

func fmtInt(n int64) string {
	return fmt.Sprintf("%d", n)
}

func (s *RiskMerchantService) mockList(page, size int) map[string]interface{} {
	items := []map[string]interface{}{
		{"id": 1, "platform": "wechat_pay", "mch_id": "399220409632651", "mch_name": "有味餐厅", "risk_type": "投诉超标", "risk_level": "high", "complaint_count": 12, "complaint_rate": 8.5, "handle_status": "pending"},
		{"id": 2, "platform": "alipay", "mch_id": "399220409025850", "mch_name": "鲜味火锅", "risk_type": "欺诈风险", "risk_level": "high", "complaint_count": 5, "complaint_rate": 3.2, "handle_status": "pending"},
		{"id": 3, "platform": "wechat_pay", "mch_id": "399220412272561", "mch_name": "甜品屋", "risk_type": "投诉超标", "risk_level": "medium", "complaint_count": 6, "complaint_rate": 5.1, "handle_status": "processing"},
	}
	total := int64(len(items))
	return map[string]interface{}{"items": items, "total": total, "page": page, "size": size}
}

func (s *RiskMerchantService) mockStats() map[string]interface{} {
	return map[string]interface{}{"total": int64(3), "pending": int64(2), "high": int64(2), "medium": int64(1)}
}
