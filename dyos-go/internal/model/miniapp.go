package model

type MiniAppReport struct {
	ID         uint   `gorm:"primaryKey;column:id" json:"id"`
	Title      string `gorm:"column:title" json:"title"`
	Type       string `gorm:"column:type" json:"type"`
	MerchantID uint   `gorm:"column:merchant_id;index" json:"merchant_id"`
	Merchant   string `gorm:"column:merchant" json:"merchant"`
	Data       string `gorm:"column:data;type:mediumtext" json:"data"`
	QRCodeURL  string `gorm:"column:qr_code_url" json:"qr_code_url"`
	Views      int    `gorm:"column:views;default:0" json:"views"`
	CreatedAt  string `gorm:"column:created_at" json:"created_at"`
}

func (MiniAppReport) TableName() string { return "miniapp_reports" }
