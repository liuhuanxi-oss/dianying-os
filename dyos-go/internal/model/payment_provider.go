package model

import "time"

// PaymentProvider 支付服务商配置（支持多服务商号自助管理）
type PaymentProvider struct {
	ID             uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Platform       string    `gorm:"size:20;not null;index" json:"platform"`   // wechat_pay / alipay
	ProviderName   string    `gorm:"size:100;not null" json:"provider_name"`   // 自定义名称，如"主服务商号"
	MchID          string    `gorm:"size:32;not null;index" json:"mch_id"`     // 商户号/服务商号
	MchName        string    `gorm:"size:100" json:"mch_name"`                 // 商户名称
	AppID          string    `gorm:"size:32" json:"app_id"`                    // 微信appid / 支付宝appid
	APIKey         string    `gorm:"size:128" json:"api_key"`                  // APIv3密钥(微信) / 支付宝密钥
	SerialNo       string    `gorm:"size:64" json:"serial_no"`                 // 证书序列号(微信)
	PrivateKey     string    `gorm:"type:text" json:"private_key"`             // 商户私钥（PEM,加密存储）
	PublicKey      string    `gorm:"type:text" json:"public_key"`              // 商户公钥（PEM）
	PlatformCert   string    `gorm:"type:text" json:"platform_cert"`           // 平台证书（PEM）
	PlatformCertNo string    `gorm:"size:64" json:"platform_cert_no"`          // 平台证书序列号
	WebhookSecret  string    `gorm:"size:128" json:"webhook_secret"`           // 回调通知密钥
	MerchantNo     string    `gorm:"size:64" json:"merchant_no"`               // 天阙随行付商户号
	Status         string    `gorm:"size:10;default:active;index" json:"status"` // active/disabled
	Remark         string    `gorm:"size:255" json:"remark"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

func (PaymentProvider) TableName() string { return "payment_providers" }

// RiskMerchant 风险商户记录
type RiskMerchant struct {
	ID               uint       `gorm:"primaryKey;autoIncrement" json:"id"`
	ProviderID       uint       `gorm:"index;not null" json:"provider_id"`            // 关联服务商
	Platform         string     `gorm:"size:20;index;not null" json:"platform"`       // wechat_pay / alipay
	MchID            string     `gorm:"size:32;index" json:"mch_id"`                  // 商户号
	MchName          string     `gorm:"size:100" json:"mch_name"`                     // 商户名称
	RiskType         string     `gorm:"size:32;index;not null" json:"risk_type"`      // 风险类型
	RiskLevel        string     `gorm:"size:10;index;not null" json:"risk_level"`     // high/medium/low
	RiskDetail       string     `gorm:"type:text" json:"risk_detail"`                 // 风险详情
	ComplaintRate    float64    `gorm:"default:0" json:"complaint_rate"`              // 投诉率
	ComplaintCount   int        `gorm:"default:0" json:"complaint_count"`             // 投诉量
	TransactionAmount float64   `gorm:"default:0" json:"transaction_amount"`          // 交易金额
	PunishmentType   string     `gorm:"size:64" json:"punishment_type"`               // 处罚类型
	PunishmentDetail string     `gorm:"type:text" json:"punishment_detail"`           // 处罚详情
	HandleStatus     string     `gorm:"size:20;index;default:pending" json:"handle_status"` // pending/processing/resolved
	HandleRemark     string     `gorm:"size:500" json:"handle_remark"`
	DetectedAt       time.Time  `gorm:"index" json:"detected_at"`
	HandledAt        *time.Time `json:"handled_at"`
	CreatedAt        time.Time  `json:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at"`
}

func (RiskMerchant) TableName() string { return "risk_merchants" }
