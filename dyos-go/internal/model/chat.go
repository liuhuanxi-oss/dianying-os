package model

type ChatSession struct {
	ID         uint   `gorm:"primaryKey;column:id" json:"id"`
	MerchantID uint   `gorm:"column:merchant_id;index" json:"merchant_id"`
	Merchant   string `gorm:"column:merchant" json:"merchant"`
	Customer   string `gorm:"column:customer" json:"customer"`
	Channel    string `gorm:"column:channel" json:"channel"`
	Status     string `gorm:"column:status;default:active" json:"status"`
	MessageCount int  `gorm:"column:message_count" json:"message_count"`
	LastReplyAt string `gorm:"column:last_reply_at" json:"last_reply_at"`
	CreatedAt  string `gorm:"column:created_at" json:"created_at"`
}

func (ChatSession) TableName() string { return "chat_sessions" }

type ChatMessage struct {
	ID        uint   `gorm:"primaryKey;column:id" json:"id"`
	SessionID uint   `gorm:"column:session_id;index" json:"session_id"`
	Role      string `gorm:"column:role" json:"role"`
	Content   string `gorm:"column:content;type:text" json:"content"`
	CreatedAt string `gorm:"column:created_at" json:"created_at"`
}

func (ChatMessage) TableName() string { return "chat_messages" }

type SentimentRecord struct {
	ID        uint   `gorm:"primaryKey;column:id" json:"id"`
	Source    string `gorm:"column:source" json:"source"`
	Score     float64 `gorm:"column:score" json:"score"`
	Level     string `gorm:"column:level" json:"level"`
	Keywords  string `gorm:"column:keywords" json:"keywords"`
	CreatedAt string `gorm:"column:created_at" json:"created_at"`
}

func (SentimentRecord) TableName() string { return "sentiment_records" }
