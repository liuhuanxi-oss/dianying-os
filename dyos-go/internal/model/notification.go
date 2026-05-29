package model

// 通知渠道配置（商户级别）
type NotificationChannel struct {
	ID         uint   `gorm:"primaryKey" json:"id"`
	MerchantID uint   `gorm:"column:merchant_id;index" json:"merchant_id"`
	Channel    string `gorm:"column:channel;size:32" json:"channel"`    // wecom_bot / feishu_bot / dingtalk_bot / wechat_oa / sms / email
	Name       string `gorm:"column:name;size:64" json:"name"`
	WebhookURL string `gorm:"column:webhook_url;size:512" json:"webhook_url"`
	Secret     string `gorm:"column:secret;size:256" json:"-"`          // 签名密钥
	Enabled    bool   `gorm:"column:enabled;default:true" json:"enabled"`
	CreatedAt  string `gorm:"column:created_at" json:"created_at"`
	UpdatedAt  string `gorm:"column:updated_at" json:"updated_at"`
}

func (NotificationChannel) TableName() string { return "notification_channels" }

// 通知规则（商户级别，控制哪些事件发送到哪些渠道）
type NotificationRule struct {
	ID         uint   `gorm:"primaryKey" json:"id"`
	MerchantID uint   `gorm:"column:merchant_id;index" json:"merchant_id"`
	EventType  string `gorm:"column:event_type;size:64" json:"event_type"`
	EventName  string `gorm:"column:event_name;size:64" json:"event_name"`
	Channels   string `gorm:"column:channels;size:256" json:"channels"` // 逗号分隔: wecom_bot,feishu_bot
	Enabled    bool   `gorm:"column:enabled;default:true" json:"enabled"`
	CreatedAt  string `gorm:"column:created_at" json:"created_at"`
	UpdatedAt  string `gorm:"column:updated_at" json:"updated_at"`
}

func (NotificationRule) TableName() string { return "notification_rules" }

// 通知发送记录
type NotificationLog struct {
	ID         uint   `gorm:"primaryKey" json:"id"`
	MerchantID uint   `gorm:"column:merchant_id;index" json:"merchant_id"`
	EventType  string `gorm:"column:event_type;size:64" json:"event_type"`
	Channel    string `gorm:"column:channel;size:32" json:"channel"`
	Title      string `gorm:"column:title;size:256" json:"title"`
	Content    string `gorm:"column:content;type:text" json:"content"`
	Status     string `gorm:"column:status;size:16;default:success" json:"status"` // success / failed
	ErrorMsg   string `gorm:"column:error_msg;size:512" json:"error_msg"`
	CreatedAt  string `gorm:"column:created_at" json:"created_at"`
}

func (NotificationLog) TableName() string { return "notification_logs" }
