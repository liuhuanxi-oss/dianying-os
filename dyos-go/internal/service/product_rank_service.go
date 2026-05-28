package service

import (
	"math/rand"

	"gorm.io/gorm"
)

type ProductRankService struct{ db *gorm.DB }

func NewProductRankService(db *gorm.DB) *ProductRankService { return &ProductRankService{db: db} }

func (s *ProductRankService) Rank(page, size int, period, category string) (map[string]interface{}, error) {
	if size <= 0 { size = 20 }
	if page <= 0 { page = 1 }
	products := []string{"麻辣锅底", "肥牛卷", "虾滑", "毛肚", "鸭血", "金针菇", "牛肉丸", "豆皮", "藕片", "生菜"}
	items := make([]map[string]interface{}, size)
	for i := range items {
		items[i] = map[string]interface{}{
			"id": uint((page-1)*size + i + 1), "product_name": products[i%len(products)],
			"category": []string{"锅底", "荤菜", "素菜"}[i%3],
			"sales_count": 100 + rand.Intn(5000), "revenue": float64(1000 + rand.Intn(50000)),
			"profit": float64(500 + rand.Intn(25000)),
			"repurchase_rate": float64(int(30+rand.Float64()*50)) / 100,
			"rank": (page-1)*size + i + 1, "period": period,
		}
	}
	return map[string]interface{}{"items": items, "total": int64(128), "page": page, "size": size}, nil
}

func (s *ProductRankService) Repurchase(page, size int, period string) (map[string]interface{}, error) {
	if size <= 0 { size = 20 }
	if page <= 0 { page = 1 }
	items := make([]map[string]interface{}, size)
	for i := range items {
		items[i] = map[string]interface{}{
			"product_name": []string{"麻辣锅底", "肥牛卷", "虾滑", "毛肚", "鸭血"}[i%5],
			"repurchase_rate": float64(int(20+rand.Float64()*60)) / 100,
			"industry_avg": float64(int(30+rand.Float64()*30)) / 100,
			"trend": []string{"up", "stable", "down"}[i%3],
		}
	}
	return map[string]interface{}{"items": items, "total": int64(128), "page": page, "size": size}, nil
}

func (s *ProductRankService) Correlation(productID uint) []map[string]interface{} {
	return []map[string]interface{}{
		{"product": "肥牛卷", "correlation": 0.85, "lift": 3.2},
		{"product": "虾滑", "correlation": 0.72, "lift": 2.8},
		{"product": "金针菇", "correlation": 0.68, "lift": 2.5},
		{"product": "毛肚", "correlation": 0.61, "lift": 2.1},
		{"product": "豆皮", "correlation": 0.55, "lift": 1.8},
	}
}

func (s *ProductRankService) Feedback(page, size int, productName string) (map[string]interface{}, error) {
	if size <= 0 { size = 20 }
	if page <= 0 { page = 1 }
	items := make([]map[string]interface{}, size)
	for i := range items {
		items[i] = map[string]interface{}{
			"id": uint((page-1)*size + i + 1), "product": productName,
			"sentiment": []string{"positive", "positive", "neutral", "negative"}[i%4],
			"keyword": []string{"好吃", "新鲜", "份量足", "偏贵"}[i%4],
			"count": 5 + rand.Intn(50),
		}
	}
	return map[string]interface{}{"items": items, "total": int64(256), "page": page, "size": size}, nil
}
