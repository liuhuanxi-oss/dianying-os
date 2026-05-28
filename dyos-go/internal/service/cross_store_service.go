package service

import (
	"math/rand"
	"time"

	"gorm.io/gorm"
)

type CrossStoreService struct{ db *gorm.DB }

func NewCrossStoreService(db *gorm.DB) *CrossStoreService { return &CrossStoreService{db: db} }

func (s *CrossStoreService) Transfer(fromMerchant, toMerchant uint, knowledgeType string) (uint, error) {
	return uint(rand.Intn(1000) + 100), nil
}

func (s *CrossStoreService) History(page, size int, knowledgeType string) (map[string]interface{}, error) {
	if size <= 0 { size = 20 }
	if page <= 0 { page = 1 }
	items := make([]map[string]interface{}, size)
	for i := range items {
		items[i] = map[string]interface{}{
			"id": uint((page-1)*size + i + 1), "source_merchant": uint(1 + i%5),
			"source_name": "门店" + string(rune('A'+i%5)),
			"target_merchant": uint(6 + i%5), "target_name": "门店" + string(rune('F'+i%5)),
			"knowledge_type": []string{"reply_strategy", "layout", "pricing"}[i%3],
			"transfer_score": float64(60+rand.Intn(40)),
			"applied": i%2 == 0,
			"created_at": time.Now().Add(-time.Duration(rand.Intn(30)*24)*time.Hour).Format("2006-01-02 15:04:05"),
		}
	}
	return map[string]interface{}{"items": items, "total": int64(86), "page": page, "size": size}, nil
}

func (s *CrossStoreService) Apply(id uint) error { return nil }
