package service

import (
	"encoding/json"
	"math/rand"
	"time"

	"dyos-go/internal/model"

	"gorm.io/gorm"
)

type FunnelService struct {
	db *gorm.DB
}

func NewFunnelService(db *gorm.DB) *FunnelService { return &FunnelService{db: db} }

func (s *FunnelService) FunnelData(period string) map[string]interface{} {
	steps := []map[string]interface{}{
		{"stage": "曝光", "count": 125000, "rate": 100.0},
		{"stage": "点击", "count": 38500, "rate": 30.8},
		{"stage": "访问", "count": 15600, "rate": 12.5},
		{"stage": "下单", "count": 4280, "rate": 3.4},
		{"stage": "核销", "count": 3120, "rate": 2.5},
	}
	return map[string]interface{}{"period": period, "funnel": steps, "conversion_rate": 2.5, "industry_avg": 2.1}
}

func (s *FunnelService) ChannelSources() []map[string]interface{} {
	return []map[string]interface{}{
		{"channel": "抖音", "visits": 5200, "orders": 680, "conversion": 13.1, "avg_cost": 12.5},
		{"channel": "大众点评", "visits": 3800, "orders": 860, "conversion": 22.6, "avg_cost": 8.2},
		{"channel": "微信小程序", "visits": 2800, "orders": 540, "conversion": 19.3, "avg_cost": 5.0},
		{"channel": "小红书", "visits": 2100, "orders": 320, "conversion": 15.2, "avg_cost": 18.0},
		{"channel": "美团", "visits": 1800, "orders": 380, "conversion": 21.1, "avg_cost": 10.0},
	}
}

func (s *FunnelService) TopDishes(limit int) ([]map[string]interface{}, error) {
	if limit <= 0 { limit = 10 }
	if s.db == nil { return s.mockTopDishes(limit), nil }
	var dishes []model.Dish
	s.db.Order("sales_count DESC").Limit(limit).Find(&dishes)
	items := make([]map[string]interface{}, len(dishes))
	for i, d := range dishes {
		data, _ := json.Marshal(d); var m map[string]interface{}; json.Unmarshal(data, &m); items[i] = m
	}
	return items, nil
}

func (s *FunnelService) RepurchaseAnalysis() map[string]interface{} {
	return map[string]interface{}{
		"overall_rate": 28.5, "monthly_trend": []float64{26.0, 27.2, 28.0, 29.1, 28.5, 30.2},
		"by_category": []map[string]interface{}{
			{"category": "火锅", "rate": 35.2}, {"category": "快餐", "rate": 22.0}, {"category": "茶饮", "rate": 42.5}, {"category": "烘焙", "rate": 38.0},
		},
		"cross_sell_pairs": []map[string]interface{}{{"dish_a": "麻辣锅底", "dish_b": "肥牛卷", "co_rate": 68}, {"dish_a": "珍珠奶茶", "dish_b": "蛋糕", "co_rate": 45}},
	}
}

func (s *FunnelService) CustomerProfiles(page, size int) (map[string]interface{}, error) {
	if size <= 0 { size = 20 }
	if page <= 0 { page = 1 }
	if s.db == nil { return s.mockProfiles(page, size), nil }
	var items []model.CustomerProfile
	var total int64
	s.db.Model(&model.CustomerProfile{}).Count(&total)
	s.db.Offset((page-1)*size).Limit(size).Find(&items)
	return map[string]interface{}{"items": items, "total": total, "page": page, "size": size}, nil
}

func (s *FunnelService) mockTopDishes(limit int) []map[string]interface{} {
	dishes := []map[string]interface{}{
		{"id": 1, "name": "招牌麻辣锅底", "category": "火锅", "sales_count": 2860, "revenue": 286000.0, "repurchase_rate": 42.0, "rating": 4.8},
		{"id": 2, "name": "精选肥牛卷", "category": "火锅", "sales_count": 2450, "revenue": 147000.0, "repurchase_rate": 38.0, "rating": 4.6},
		{"id": 3, "name": "手工虾滑", "category": "火锅", "sales_count": 1980, "revenue": 99000.0, "repurchase_rate": 35.0, "rating": 4.7},
		{"id": 4, "name": "红糖糍粑", "category": "小吃", "sales_count": 1650, "revenue": 33000.0, "repurchase_rate": 28.0, "rating": 4.5},
		{"id": 5, "name": "冰粉", "category": "饮品", "sales_count": 1420, "revenue": 28400.0, "repurchase_rate": 32.0, "rating": 4.4},
	}
	if limit < len(dishes) { dishes = dishes[:limit] }
	return dishes
}

func (s *FunnelService) mockProfiles(page, size int) map[string]interface{} {
	profiles := make([]model.CustomerProfile, size)
	for i := 0; i < size; i++ {
		profiles[i] = model.CustomerProfile{
			ID: uint((page-1)*size + i + 1), Name: "顾客" + string(rune('A'+i%26)),
			Gender: []string{"男", "女"}[i%2], AgeGroup: []string{"18-25", "26-35", "36-45", "46+"}[i%4],
			Tags: "[\"高频\",\"火锅爱好者\"]", VisitCount: 5 + rand.Intn(30),
			AvgOrderAmount: 60 + rand.Float64()*200, FavCategory: "火锅", LastVisit: time.Now().Add(-time.Duration(rand.Intn(30)*24)*time.Hour).Format("2006-01-02"),
		}
	}
	return map[string]interface{}{"items": profiles, "total": int64(1280), "page": page, "size": size}
}
