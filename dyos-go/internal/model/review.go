package model

// Review 评价表 (真实MySQL表 reviews)
type Review struct {
	ID            uint   `gorm:"primaryKey" json:"id"`
	OrderID       *int   `gorm:"column:order_id" json:"order_id"`
	StoreID       *int   `gorm:"column:store_id" json:"store_id"`
	MerchantID    uint   `gorm:"column:merchant_id;default:0" json:"merchant_id"`
	AgentID       uint   `gorm:"column:agent_id;default:0" json:"agent_id"`
	UserName      string `gorm:"column:user_name" json:"user_name"`
	Rating        int    `gorm:"column:rating" json:"rating"`
	Content       string `gorm:"column:content" json:"content"`
	Images        string `gorm:"column:images" json:"images"`
	Status        string `gorm:"column:status" json:"status"`
	AiReply       string `gorm:"column:ai_reply" json:"ai_reply"`
	MerchantReply string `gorm:"column:merchant_reply" json:"merchant_reply"`
	ReplyTime     string `gorm:"column:reply_time" json:"reply_time"`
	CreatedAt     string `gorm:"column:created_at" json:"created_at"`
	UpdatedAt     string `gorm:"column:updated_at" json:"updated_at"`
	// 虚拟字段（兼容旧代码，不在DB中）
	Platform    string `gorm:"-" json:"platform"`
	PlatformID  string `gorm:"-" json:"platform_id"`
	Merchant    string `gorm:"-" json:"merchant"`
	User        string `gorm:"-" json:"user"`
	Sentiment   string `gorm:"-" json:"sentiment"`
	Keywords    string `gorm:"-" json:"keywords"`
	Reply       string `gorm:"-" json:"reply"`
	ReplyStatus string `gorm:"-" json:"reply_status"`
	SyncedAt    string `gorm:"-" json:"synced_at"`
	AlertLevel  string `gorm:"-" json:"alert_level"`
}

func (Review) TableName() string { return "reviews" }

type ReviewReplyRule struct {
	ID          uint   `gorm:"primaryKey;column:id" json:"id"`
	Name        string `gorm:"column:name" json:"name"`
	Platform    string `gorm:"column:platform" json:"platform"`
	Condition   string `gorm:"column:condition" json:"condition"`
	MinRating   int    `gorm:"column:min_rating" json:"min_rating"`
	MaxRating   int    `gorm:"column:max_rating" json:"max_rating"`
	Keywords    string `gorm:"column:keywords" json:"keywords"`
	ReplyTmpl   string `gorm:"column:reply_tmpl;type:text" json:"reply_tmpl"`
	AutoApprove bool   `gorm:"column:auto_approve;default:false" json:"auto_approve"`
	Enabled     bool   `gorm:"column:enabled;default:true" json:"enabled"`
	Priority    int    `gorm:"column:priority;default:0" json:"priority"`
}

func (ReviewReplyRule) TableName() string { return "review_reply_rules" }
