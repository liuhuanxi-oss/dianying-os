package service

import (
	"fmt"
	"math/rand"
	"time"

	"dyos-go/internal/model"

	"gorm.io/gorm"
)

type MiniAppService struct {
	db *gorm.DB
}

func NewMiniAppService(db *gorm.DB) *MiniAppService { return &MiniAppService{db: db} }

func (s *MiniAppService) KPI(merchantID uint) map[string]interface{} {
	return map[string]interface{}{
		"merchant_id": merchantID,
		"today":       map[string]interface{}{"gmv": 28600, "orders": 128, "avg_amount": 223.4, "ai_calls": 42, "rating": 4.3},
		"trend":       []map[string]interface{}{{"date": "05-18", "gmv": 25300}, {"date": "05-19", "gmv": 26800}, {"date": "05-20", "gmv": 24500}, {"date": "05-21", "gmv": 29200}, {"date": "05-22", "gmv": 27800}, {"date": "05-23", "gmv": 30500}, {"date": "05-24", "gmv": 28600}},
	}
}

func (s *MiniAppService) ReviewSummary(merchantID uint) map[string]interface{} {
	return map[string]interface{}{
		"merchant_id": merchantID, "total": 486, "avg_rating": 4.3,
		"sentiment":       map[string]int{"positive": 392, "neutral": 68, "negative": 26},
		"top_keywords":    []string{"味道好", "服务棒", "环境干净", "性价比高"},
		"latest_negative": map[string]interface{}{"content": "等了一个小时才上菜，服务员态度还差", "time": time.Now().Add(-2*time.Hour).Format("15:04:05"), "rating": 1},
	}
}

func (s *MiniAppService) RealTimeAlerts() []map[string]interface{} {
	return []map[string]interface{}{
		{"id": 1, "type": "差评预警", "level": "warning", "content": "大众点评新增1条1星差评", "time": time.Now().Add(-15*time.Minute).Format("15:04:05")},
		{"id": 2, "type": "经营提醒", "level": "info", "content": "今日午市翻台率达到峰值3.8次", "time": time.Now().Add(-1*time.Hour).Format("15:04:05")},
	}
}

func (s *MiniAppService) StoreReport(merchantID uint) map[string]interface{} {
	return map[string]interface{}{
		"merchant_id": merchantID, "generated_at": time.Now().Format("2006-01-02 15:04:05"),
		"summary":      "经营状况良好，午市翻台率接近上限建议扩位",
		"kpi":          s.KPI(merchantID),
		"reviews":      s.ReviewSummary(merchantID),
		"qr_code":      s.GenerateQRCode(merchantID, fmt.Sprintf("store_report:%d", merchantID)),
	}
}

func (s *MiniAppService) GenerateQRCode(merchantID uint, data string) map[string]interface{} {
	return map[string]interface{}{
		"merchant_id": merchantID, "payload": data,
		"qr_url":    fmt.Sprintf("/qrcodes/mp_%d_%d.png", merchantID, time.Now().Unix()),
		"created_at": time.Now().Format("2006-01-02 15:04:05"),
	}
}

func (s *MiniAppService) ListReports(merchantID uint, page, size int) (map[string]interface{}, error) {
	if size <= 0 { size = 10 }
	if page <= 0 { page = 1 }
	if s.db == nil { return s.mockReports(merchantID, page, size), nil }
	var items []model.MiniAppReport
	var total int64
	q := s.db.Model(&model.MiniAppReport{})
	if merchantID > 0 { q = q.Where("merchant_id = ?", merchantID) }
	q.Count(&total)
	q.Order("id DESC").Offset((page-1)*size).Limit(size).Find(&items)
	return map[string]interface{}{"items": items, "total": total, "page": page, "size": size}, nil
}

func (s *MiniAppService) mockReports(merchantID uint, page, size int) map[string]interface{} {
	items := make([]map[string]interface{}, size)
	for i := 0; i < size; i++ {
		items[i] = map[string]interface{}{
			"id": (page-1)*size + i + 1, "title": fmt.Sprintf("周报-第%d周", 20+i),
			"type": []string{"weekly", "monthly"}[i%2], "merchant": "有味餐厅",
			"qr_code_url": fmt.Sprintf("/qrcodes/mp_report_%d.png", i), "views": 100 + rand.Intn(500),
			"created_at": time.Now().Add(-time.Duration(rand.Intn(14)*24) * time.Hour).Format("2006-01-02"),
		}
	}
	return map[string]interface{}{"items": items, "total": int64(12), "page": page, "size": size}
}
