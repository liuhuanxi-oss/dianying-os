package service

import (
	"math/rand"
	"sync"
	"time"

	"dyos-go/internal/model"

	"gorm.io/gorm"
)

type ChatService struct {
	db *gorm.DB
}

func NewChatService(db *gorm.DB) *ChatService { return &ChatService{db: db} }

type ChatStreamHub struct {
	clients map[chan string]struct{}
	mu      sync.RWMutex
}

func NewChatStreamHub() *ChatStreamHub { return &ChatStreamHub{clients: make(map[chan string]struct{})} }

func (h *ChatStreamHub) Subscribe() chan string {
	ch := make(chan string, 32)
	h.mu.Lock()
	h.clients[ch] = struct{}{}
	h.mu.Unlock()
	return ch
}

func (h *ChatStreamHub) Unsubscribe(ch chan string) {
	h.mu.Lock()
	delete(h.clients, ch)
	close(ch)
	h.mu.Unlock()
}

func (s *ChatService) ListSessions(page, size int, status string) (map[string]interface{}, error) {
	if size <= 0 { size = 20 }
	if page <= 0 { page = 1 }
	if s.db == nil { return s.mockSessions(page, size), nil }
	var items []model.ChatSession
	var total int64
	q := s.db.Model(&model.ChatSession{})
	if status != "" { q = q.Where("status = ?", status) }
	q.Count(&total)
	q.Order("id DESC").Offset((page-1)*size).Limit(size).Find(&items)
	return map[string]interface{}{"items": items, "total": total, "page": page, "size": size}, nil
}

func (s *ChatService) GetMessages(sessionID uint, page, size int) (map[string]interface{}, error) {
	if size <= 0 { size = 50 }
	if page <= 0 { page = 1 }
	if s.db == nil { return s.mockMessages(sessionID, page, size), nil }
	var items []model.ChatMessage
	var total int64
	s.db.Model(&model.ChatMessage{}).Where("session_id = ?", sessionID).Count(&total)
	s.db.Where("session_id = ?", sessionID).Order("id ASC").Offset((page-1)*size).Limit(size).Find(&items)
	return map[string]interface{}{"items": items, "total": total, "page": page, "size": size}, nil
}

func (s *ChatService) StreamReply(sessionID uint, message string) string {
	replies := []string{
		"您好！感谢您的咨询。根据您店铺的运营数据，本周客流量环比增长8%，建议可以适当增加午市备货量。",
		"关于这个问题，我帮您分析了近30天的数据。目前您的评分是4.3分，高于行业平均的4.1分。主要优势在服务和口味方面。",
		"我已经为您生成了本周的经营报告，GMV较上周增长12%，主要增长来自外卖渠道，建议继续加大该渠道推广力度。",
		"检测到您的库存中牛肉卷库存偏低（剩余12份），建议尽快补货。根据历史数据，周末需求量约为45份。",
	}
	return replies[rand.Intn(len(replies))]
}

func (s *ChatService) SentimentDashboard() map[string]interface{} {
	return map[string]interface{}{
		"today":    map[string]int{"positive": 85, "neutral": 32, "negative": 8},
		"trend_7d": []map[string]interface{}{{"date": "05-18", "positive": 78, "negative": 12}, {"date": "05-19", "positive": 82, "negative": 9}, {"date": "05-20", "positive": 80, "negative": 11}, {"date": "05-21", "positive": 86, "negative": 7}, {"date": "05-22", "positive": 83, "negative": 10}, {"date": "05-23", "positive": 88, "negative": 6}, {"date": "05-24", "positive": 85, "negative": 8}},
		"alert_triggers": []map[string]interface{}{{"level": "critical", "keyword": "食品安全", "count": 2}, {"level": "warning", "keyword": "服务态度", "count": 5}},
	}
}

func (s *ChatService) AlertRules() []map[string]interface{} {
	return []map[string]interface{}{
		{"id": 1, "level": "critical", "keywords": "食品安全,吃坏肚子,异物", "action": "立即通知店长+区域经理", "auto_reply": true},
		{"id": 2, "level": "warning", "keywords": "态度差,等太久,不新鲜", "action": "通知店长", "auto_reply": true},
		{"id": 3, "level": "info", "keywords": "偏咸,量少,环境一般", "action": "记录到日报告", "auto_reply": false},
	}
}

func (s *ChatService) SOP(level string) []map[string]interface{} {
	return []map[string]interface{}{
		{"step": 1, "action": "5分钟内响应客户", "owner": "当班客服"},
		{"step": 2, "action": "了解情况并记录到系统", "owner": "当班客服"},
		{"step": 3, "action": "协调店长给出处理方案", "owner": "门店店长"},
		{"step": 4, "action": "回访客户确认满意度", "owner": "区域经理"},
	}
}

func (s *ChatService) ReplyStats() map[string]interface{} {
	return map[string]interface{}{"avg_reply_secs": 28, "within_30s_pct": 94.2, "total_today": 156, "peak_hour": "12:00-13:00", "avg_msg_per_session": 8.5}
}

func (s *ChatService) mockSessions(page, size int) map[string]interface{} {
	items := make([]model.ChatSession, size)
	for i := 0; i < size; i++ {
		items[i] = model.ChatSession{
			ID: uint((page-1)*size + i + 1), Merchant: "有味餐厅", Customer: "用户" + string(rune('A'+i%26)),
			Channel: []string{"微信", "美团", "抖音"}[i%3], Status: []string{"active", "active", "closed"}[i%3],
			MessageCount: 5 + rand.Intn(20), LastReplyAt: time.Now().Add(-time.Duration(rand.Intn(60))*time.Minute).Format("15:04:05"),
			CreatedAt: time.Now().Add(-time.Duration(rand.Intn(72))*time.Hour).Format("2006-01-02 15:04:05"),
		}
	}
	return map[string]interface{}{"items": items, "total": int64(86), "page": page, "size": size}
}

func (s *ChatService) mockMessages(sessionID uint, page, size int) map[string]interface{} {
	return map[string]interface{}{
		"items": []map[string]interface{}{
			{"id": 1, "role": "user", "content": "你好，我想问下今天有什么优惠吗？", "created_at": "10:30:00"},
			{"id": 2, "role": "assistant", "content": "您好！今天有限时8折优惠，还有新用户专享的满100减20活动哦~", "created_at": "10:30:15"},
			{"id": 3, "role": "user", "content": "好的谢谢！还有一个问题，最近店里的评分怎么样？", "created_at": "10:31:00"},
			{"id": 4, "role": "assistant", "content": "您店铺目前评分4.3分，高于行业平均的4.1分。最近30天好评率92%，表现不错！主要优势是菜品口味和服务态度。", "created_at": "10:31:20"},
		}, "total": int64(4), "session_id": sessionID,
	}
}
