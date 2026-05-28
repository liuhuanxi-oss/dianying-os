package service

import (
	"gorm.io/gorm"
)

type SettingsService struct{ db *gorm.DB }

func NewSettingsService(db *gorm.DB) *SettingsService { return &SettingsService{db: db} }

func (s *SettingsService) Get() map[string]interface{} {
	return map[string]interface{}{
		"store_name": "旗舰店", "store_logo": "/static/logo.png",
		"business_hours": "09:00-22:00", "phone": "400-888-8888",
		"address": "上海市浦东新区陆家嘴金融城",
		"notification_enabled": true, "auto_reply_enabled": true,
	}
}

func (s *SettingsService) Update(updates map[string]interface{}) error { return nil }

func (s *SettingsService) UpdatePassword(oldPwd, newPwd string) error { return nil }
