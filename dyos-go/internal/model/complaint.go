package model

import "time"

// Complaint 支付投诉
type Complaint struct {
	ID               uint       `gorm:"primaryKey;autoIncrement" json:"id"`
	MerchantID       uint       `gorm:"index;not null" json:"merchant_id"`
	MerchantNo       string     `gorm:"size:20;index" json:"merchant_no"`
	Platform         string     `gorm:"size:20;not null;index" json:"platform"`
	ComplaintID      string     `gorm:"size:64;not null" json:"complaint_id"`
	TransactionID    string     `gorm:"size:64" json:"transaction_id"`
	ComplaintType    string     `gorm:"size:32" json:"complaint_type"`
	Content          string     `gorm:"type:text" json:"content"`
	ComplaintDetail  string     `gorm:"type:text" json:"complaint_detail"`
	ComplaintAmount  float64    `gorm:"default:0" json:"complaint_amount"`
	Urgency          string     `gorm:"size:20;not null;default:normal;index" json:"urgency"`
	RefundDecision   string     `gorm:"size:20;default:manual_review" json:"refund_decision"`
	RefundAmount     float64    `gorm:"default:0" json:"refund_amount"`
	AIAnalysis       string     `gorm:"type:json" json:"ai_analysis"`
	AIReply          string     `gorm:"type:text" json:"ai_reply"`
	Status           string     `gorm:"size:20;not null;default:pending;index" json:"status"`
	HandlerType      string     `gorm:"size:20;default:ai_auto" json:"handler_type"`
	ComplaintTime    time.Time  `gorm:"index" json:"complaint_time"`
	HandledAt        *time.Time `json:"handled_at"`
	CreatedAt        time.Time  `json:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at"`
}

func (Complaint) TableName() string { return "complaints" }

// ComplaintAnalysis AI投诉分析记录
type ComplaintAnalysis struct {
	ID            uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	ComplaintID   uint      `gorm:"index;not null" json:"complaint_id"`
	ModelUsed     string    `gorm:"size:50" json:"model_used"`
	Category      string    `gorm:"size:32" json:"category"`
	Urgency       string    `gorm:"size:20" json:"urgency"`
	RefundDecision string   `gorm:"size:20" json:"refund_decision"`
	Confidence    float64   `gorm:"default:0" json:"confidence"`
	Reasoning     string    `gorm:"type:text" json:"reasoning"`
	SuggestedReply string   `gorm:"type:text" json:"suggested_reply"`
	FallbackUsed  bool      `gorm:"default:false" json:"fallback_used"`
	CreatedAt     time.Time `json:"created_at"`
}

func (ComplaintAnalysis) TableName() string { return "complaint_analyses" }
