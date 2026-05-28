package model

type GeneratedContent struct {
	ID         uint   `gorm:"primaryKey;column:id" json:"id"`
	Title      string `gorm:"column:title" json:"title"`
	Platform   string `gorm:"column:platform" json:"platform"`
	Type       string `gorm:"column:type" json:"type"`
	Content    string `gorm:"column:content;type:mediumtext" json:"content"`
	Hashtags   string `gorm:"column:hashtags" json:"hashtags"`
	Status     string `gorm:"column:status;default:draft" json:"status"`
	MerchantID uint   `gorm:"column:merchant_id" json:"merchant_id"`
	CreatedAt  string `gorm:"column:created_at" json:"created_at"`
}

func (GeneratedContent) TableName() string { return "generated_contents" }

type IndustryKnowledge struct {
	ID       uint   `gorm:"primaryKey;column:id" json:"id"`
	Industry string `gorm:"column:industry;index" json:"industry"`
	Title    string `gorm:"column:title" json:"title"`
	Content  string `gorm:"column:content;type:text" json:"content"`
	Category string `gorm:"column:category" json:"category"`
	Source   string `gorm:"column:source" json:"source"`
}

func (IndustryKnowledge) TableName() string { return "industry_knowledge" }
