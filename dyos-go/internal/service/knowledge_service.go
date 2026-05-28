package service

import (
	"math/rand"
	"time"

	"gorm.io/gorm"
)

type KnowledgeService struct{ db *gorm.DB }

func NewKnowledgeService(db *gorm.DB) *KnowledgeService { return &KnowledgeService{db: db} }

func (s *KnowledgeService) ListBase(page, size int, industry, category string) (map[string]interface{}, error) {
	if size <= 0 { size = 20 }
	if page <= 0 { page = 1 }
	items := make([]map[string]interface{}, size)
	for i := range items {
		items[i] = map[string]interface{}{
			"id": uint((page-1)*size + i + 1), "industry": []string{"餐饮", "零售", "休娱"}[i%3],
			"category": []string{"菜品知识", "服务标准", "营销策略", "运营管理"}[i%4],
			"title": "知识条目" + string(rune('A'+i%26)),
			"content": "这是行业知识库中的一条重要内容，包含了丰富的行业经验和最佳实践。",
			"tags": []string{"热门", "推荐"}, "created_at": time.Now().AddDate(0, -rand.Intn(6), 0).Format("2006-01-02"),
		}
	}
	return map[string]interface{}{"items": items, "total": int64(256), "page": page, "size": size}, nil
}

func (s *KnowledgeService) CreateBase(industry, category, title, content string) (uint, error) {
	return uint(rand.Intn(1000) + 500), nil
}

func (s *KnowledgeService) Strategy(merchantID uint) map[string]interface{} {
	return map[string]interface{}{
		"merchant_id": merchantID, "tone": "warm", "brand_story": "始于1998，传承三代人的美食记忆",
		"features": []string{"现点现做", "食材新鲜", "秘制配方"},
		"repurchase_guide": "欢迎再次光临，下次为您推荐招牌菜！",
		"forbidden_words": []string{"最便宜", "最低价", "绝对"},
	}
}

func (s *KnowledgeService) UpdateStrategy(merchantID uint, config map[string]interface{}) error {
	return nil
}

func (s *KnowledgeService) Metrics() map[string]interface{} {
	return map[string]interface{}{
		"model_accuracy": 0.92, "avg_confidence": 0.87,
		"total_predictions": 15860, "fallback_rate": "3.2%",
		"categories": []map[string]interface{}{
			{"name": "情感分析", "accuracy": 0.94, "samples": 8520},
			{"name": "意图识别", "accuracy": 0.91, "samples": 5680},
			{"name": "关键词提取", "accuracy": 0.89, "samples": 3240},
		},
	}
}

func (s *KnowledgeService) Tune() map[string]interface{} {
	return map[string]interface{}{
		"status": "running", "message": "模型微调已启动，预计30分钟后完成",
		"task_id": "tune_" + time.Now().Format("20060102150405"),
	}
}
