package service

import (
	"math/rand"
	"time"

	"gorm.io/gorm"
)

type SentimentService struct{ db *gorm.DB }

func NewSentimentService(db *gorm.DB) *SentimentService { return &SentimentService{db: db} }

func (s *SentimentService) Overview(merchantID uint) map[string]interface{} {
	return map[string]interface{}{
		"positive": 392, "neutral": 68, "negative": 26,
		"positive_rate": "80.7%", "trend": []map[string]interface{}{
			{"date": "05-18", "positive": 56, "negative": 3},
			{"date": "05-19", "positive": 62, "negative": 2},
			{"date": "05-20", "positive": 48, "negative": 5},
			{"date": "05-21", "positive": 59, "negative": 4},
			{"date": "05-22", "positive": 55, "negative": 6},
			{"date": "05-23", "positive": 64, "negative": 3},
			{"date": "05-24", "positive": 48, "negative": 3},
		},
		"top_keywords": []string{"口味好", "服务热情", "环境干净", "价格实惠", "上菜快"},
	}
}

func (s *SentimentService) Detail(page, size int, sentiment, source string) (map[string]interface{}, error) {
	if size <= 0 { size = 20 }
	if page <= 0 { page = 1 }
	sources := []string{"美团", "饿了么", "大众点评", "抖音"}
	sentiments := []string{"positive", "neutral", "negative"}
	items := make([]map[string]interface{}, size)
	for i := range items {
		items[i] = map[string]interface{}{
			"id": uint((page-1)*size + i + 1), "merchant": []string{"旗舰店", "分店A", "分店B"}[i%3],
			"platform": sources[i%len(sources)], "sentiment": sentiments[i%len(sentiments)],
			"content": "这家店味道不错，服务也很好，下次还会再来。",
			"score": float64(60 + rand.Intn(40)), "keywords": []string{"味道好", "服务好"},
			"created_at": time.Now().Add(-time.Duration(rand.Intn(7)*24)*time.Hour).Format("2006-01-02 15:04:05"),
		}
	}
	return map[string]interface{}{"items": items, "total": int64(486), "page": page, "size": size}, nil
}

func (s *SentimentService) Alerts() []map[string]interface{} {
	return []map[string]interface{}{
		{"id": 1, "name": "差评激增预警", "level": "red", "condition": "24小时内差评>3条", "enabled": true, "notify_channel": "企业微信"},
		{"id": 2, "name": "评分下降预警", "level": "orange", "condition": "7天评分下降>0.5", "enabled": true, "notify_channel": "短信"},
		{"id": 3, "name": "关键词预警", "level": "yellow", "condition": "出现\"食品安全\"关键词", "enabled": true, "notify_channel": "企业微信"},
	}
}

func (s *SentimentService) UpdateAlert(id uint, updates map[string]interface{}) error { return nil }

func (s *SentimentService) Incidents(page, size int, level, status string) (map[string]interface{}, error) {
	if size <= 0 { size = 20 }
	if page <= 0 { page = 1 }
	items := make([]map[string]interface{}, size)
	for i := range items {
		items[i] = map[string]interface{}{
			"id": uint((page-1)*size + i + 1), "merchant": []string{"旗舰店", "分店A", "分店B"}[i%3],
			"level": []string{"red", "orange", "yellow"}[i%3],
			"status": []string{"open", "assigned", "resolved", "closed"}[i%4],
			"description": "用户投诉食品质量问题，涉诉金额较大",
			"assignee": "运营" + string(rune('A'+i%3)),
			"created_at": time.Now().Add(-time.Duration(rand.Intn(14)*24)*time.Hour).Format("2006-01-02 15:04:05"),
		}
	}
	return map[string]interface{}{"items": items, "total": int64(32), "page": page, "size": size}, nil
}

func (s *SentimentService) SOP() []map[string]interface{} {
	return []map[string]interface{}{
		{"level": "red", "name": "红色预警", "actions": []string{"立即通知店长", "30分钟内联系客户", "2小时内制定处理方案", "24小时内完成处理"}, "escalate_time": "2小时"},
		{"level": "orange", "name": "橙色预警", "actions": []string{"通知值班经理", "2小时内核实情况", "6小时内回复客户", "48小时内完成处理"}, "escalate_time": "6小时"},
		{"level": "yellow", "name": "黄色预警", "actions": []string{"记录事件", "24小时内制定处理方案", "72小时内完成处理"}, "escalate_time": "24小时"},
	}
}

func (s *SentimentService) Appeal(incidentID uint) map[string]interface{} {
	return map[string]interface{}{
		"incident_id": incidentID, "suggestion": "建议提供消费凭证和监控录像，向平台提交申诉材料",
		"template": "尊敬的审核人员：关于***订单的投诉，我们已核实相关情况...",
		"success_rate": "65%",
	}
}
