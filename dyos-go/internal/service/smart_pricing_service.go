package service

import (
	"math/rand"
	"time"

	"dyos-go/internal/model"

	"gorm.io/gorm"
)

type SmartPricingService struct{ db *gorm.DB }

func NewSmartPricingService(db *gorm.DB) *SmartPricingService { return &SmartPricingService{db: db} }

func (s *SmartPricingService) GetSuggestions(merchantID uint) []map[string]interface{} {
	suggestions := []map[string]interface{}{
		{"dish_name": "招牌麻辣锅底", "cur_price": 68.0, "suggested": 78.0, "min_price": 58.0, "max_price": 88.0, "reason": "近30天销量增长15%，竞品均价¥75，有提价空间", "confidence": 0.85},
		{"dish_name": "肥牛卷", "cur_price": 38.0, "suggested": 42.0, "min_price": 32.0, "max_price": 48.0, "reason": "原材料成本上涨10%，建议小幅调价", "confidence": 0.72},
		{"dish_name": "冰粉", "cur_price": 12.0, "suggested": 15.0, "min_price": 10.0, "max_price": 18.0, "reason": "该品类整体价格带在15-20元，当前偏低", "confidence": 0.78},
	}
	return suggestions
}

func (s *SmartPricingService) GetAnalysis(merchantID uint) map[string]interface{} {
	return map[string]interface{}{
		"merchant_id": merchantID, "avg_price": 42.5, "industry_avg": 38.0,
		"price_segments": map[string]int{"<20": 8, "20-50": 22, "50-100": 10, ">100": 4},
		"elasticity":     "中等弹性，提价3%预计不会显著影响销量",
		"recommendation": "建议对明星单品提价5-8%，长尾菜品保持现有价格",
	}
}

func (s *SmartPricingService) GetTrustLevel(merchantID uint) map[string]interface{} {
	level := 1 + rand.Intn(5)
	levelNames := map[int]string{1: "基础信任", 2: "普通信任", 3: "良好信任", 4: "高信任", 5: "完全信任"}
	features := map[int][]string{1: {"basic_ai", "basic_stats"}, 2: {"basic_ai", "basic_stats", "marketing"}, 3: {"all_basic", "priority_support", "auto_reply"}, 4: {"all_features", "api_access", "custom_model"}, 5: {"unlimited"}}
	return map[string]interface{}{
		"merchant_id": merchantID, "level": level, "level_name": levelNames[level],
		"score": 60 + rand.Float64()*40, "allowed_features": features[level],
		"factors": map[string]float64{"交易诚信": 92, "评价表现": 86, "合规记录": 95, "活跃度": 78},
		"next_upgrade": map[string]string{"requirement": "评价表现达90分", "estimated": time.Now().AddDate(0, 1, 0).Format("2006-01-02")},
	}
}

func (s *SmartPricingService) ListTrustLevels(page, size int) (map[string]interface{}, error) {
	if size <= 0 { size = 20 }
	items := make([]model.TrustLevel, size)
	for i := range items {
		items[i] = model.TrustLevel{
			ID: uint((page-1)*size + i + 1), Merchant: "有味餐厅",
			Level: 1 + i%5, Score: 60 + rand.Float64()*40,
			Factors: "{\"交易诚信\":92,\"评价表现\":86}", UpdatedAt: time.Now().Add(-time.Duration(rand.Intn(30)*24)*time.Hour).Format("2006-01-02"),
		}
	}
	return map[string]interface{}{"items": items, "total": int64(268), "page": page, "size": size}, nil
}

func (s *SmartPricingService) UpdateTrustLevel(merchantID uint, level int) error {
	if s.db == nil { return nil }
	return s.db.Model(&model.TrustLevel{}).Where("merchant_id = ?", merchantID).Updates(map[string]interface{}{"level": level, "updated_at": time.Now().Format("2006-01-02 15:04:05")}).Error
}
