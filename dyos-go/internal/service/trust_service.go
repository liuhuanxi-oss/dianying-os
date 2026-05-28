package service

import "gorm.io/gorm"

type TrustService struct{ db *gorm.DB }

func NewTrustService(db *gorm.DB) *TrustService { return &TrustService{db: db} }

func (s *TrustService) Get(merchantID uint) map[string]interface{} {
	return map[string]interface{}{
		"merchant_id": merchantID, "level": "B", "level_name": "良好",
		"auto_reply_enabled": true, "auto_sync_enabled": false,
		"max_daily_ai_actions": 50, "review_required": false,
		"updated_at": "2026-05-24",
		"rules": []map[string]interface{}{
			{"level": "A", "name": "优秀", "auto_reply": true, "auto_sync": true, "max_ai_actions": 0, "review_required": false},
			{"level": "B", "name": "良好", "auto_reply": true, "auto_sync": false, "max_ai_actions": 50, "review_required": false},
			{"level": "C", "name": "一般", "auto_reply": false, "auto_sync": false, "max_ai_actions": 20, "review_required": true},
			{"level": "D", "name": "关注", "auto_reply": false, "auto_sync": false, "max_ai_actions": 10, "review_required": true},
			{"level": "E", "name": "预警", "auto_reply": false, "auto_sync": false, "max_ai_actions": 5, "review_required": true},
		},
	}
}

func (s *TrustService) Update(merchantID uint, level string) error { return nil }

func (s *TrustService) Permissions(level string) map[string]interface{} {
	levels := map[string]map[string]interface{}{
		"A": {"auto_reply": true, "auto_sync": true, "max_ai_actions": "unlimited", "review_required": false, "can_export": true},
		"B": {"auto_reply": true, "auto_sync": false, "max_ai_actions": 50, "review_required": false, "can_export": true},
		"C": {"auto_reply": false, "auto_sync": false, "max_ai_actions": 20, "review_required": true, "can_export": true},
		"D": {"auto_reply": false, "auto_sync": false, "max_ai_actions": 10, "review_required": true, "can_export": false},
		"E": {"auto_reply": false, "auto_sync": false, "max_ai_actions": 5, "review_required": true, "can_export": false},
	}
	if p, ok := levels[level]; ok { return p }
	return levels["C"]
}
