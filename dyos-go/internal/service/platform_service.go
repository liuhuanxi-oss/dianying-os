package service

import (
	"math/rand"
	"time"

	"dyos-go/internal/model"

	"gorm.io/gorm"
)

type PlatformService struct{ db *gorm.DB }

func NewPlatformService(db *gorm.DB) *PlatformService { return &PlatformService{db: db} }

func (s *PlatformService) ListAdapters() ([]map[string]interface{}, error) {
	adapters := []map[string]interface{}{
		{"id": 1, "platform": "meituan", "name": "美团", "type": "review+order", "use_mock": true, "enabled": true, "sync_status": "synced", "last_sync_at": time.Now().Add(-30*time.Minute).Format("2006-01-02 15:04:05"), "synced_count": 486},
		{"id": 2, "platform": "eleme", "name": "饿了么", "type": "review+order", "use_mock": true, "enabled": true, "sync_status": "synced", "last_sync_at": time.Now().Add(-45*time.Minute).Format("2006-01-02 15:04:05"), "synced_count": 312},
		{"id": 3, "platform": "douyin", "name": "抖音", "type": "content", "use_mock": true, "enabled": false, "sync_status": "pending"},
		{"id": 4, "platform": "xiaohongshu", "name": "小红书", "type": "content", "use_mock": true, "enabled": false, "sync_status": "pending"},
		{"id": 5, "platform": "dianping", "name": "大众点评", "type": "review", "use_mock": true, "enabled": false, "sync_status": "pending"},
		{"id": 6, "platform": "shipinhao", "name": "视频号", "type": "content", "use_mock": true, "enabled": false, "sync_status": "pending"},
		{"id": 7, "platform": "gaode", "name": "高德", "type": "location", "use_mock": true, "enabled": false, "sync_status": "pending"},
		{"id": 8, "platform": "koubei", "name": "口碑", "type": "review", "use_mock": true, "enabled": false, "sync_status": "pending"},
	}
	return adapters, nil
}

func (s *PlatformService) UpdateAdapter(platform string, updates map[string]interface{}) map[string]interface{} {
	return map[string]interface{}{"platform": platform, "updated": updates, "status": "ok"}
}

func (s *PlatformService) SyncReviews(platform string) map[string]interface{} {
	return map[string]interface{}{"platform": platform, "synced": 15 + rand.Intn(30), "message": "同步完成", "synced_at": time.Now().Format("2006-01-02 15:04:05")}
}

func (s *PlatformService) ToggleMock(platform string, useMock bool) map[string]interface{} {
	return map[string]interface{}{"platform": platform, "use_mock": useMock, "message": "已切换"}
}

func (s *PlatformService) CalendarEvents(page, size int) (map[string]interface{}, error) {
	if size <= 0 { size = 20 }
	items := make([]model.CalendarEvent, size)
	for i := range items {
		items[i] = model.CalendarEvent{
			ID: uint((page-1)*size + i + 1),
			Title: []string{"情人节活动上线", "新品发布日", "会员日大促", "库存盘点", "卫生检查"}[i%5],
			Date: time.Now().AddDate(0, 0, i*3).Format("2006-01-02"),
			Type: []string{"promotion", "operation", "inspection"}[i%3],
			Status: "active",
		}
	}
	return map[string]interface{}{"items": items, "total": int64(12), "page": page, "size": size}, nil
}

func (s *PlatformService) CreateCalendarEvent(e *model.CalendarEvent) error {
	if s.db == nil { return nil }
	e.CreatedAt = time.Now().Format("2006-01-02 15:04:05")
	return s.db.Create(e).Error
}

func (s *PlatformService) InventoryAlerts() []map[string]interface{} {
	return []map[string]interface{}{
		{"sku": "牛肉卷", "current_stock": 12, "min_stock": 20, "suggested": 45, "urgency": "high", "ai_reason": "周末需求预计45份"},
		{"sku": "生菜", "current_stock": 8, "min_stock": 15, "suggested": 30, "urgency": "medium", "ai_reason": "近7天日均消耗4份"},
		{"sku": "可乐", "current_stock": 45, "min_stock": 30, "suggested": 0, "urgency": "low", "ai_reason": "库存充足"},
	}
}
