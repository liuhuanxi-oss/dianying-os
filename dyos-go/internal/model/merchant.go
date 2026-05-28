package model

import "encoding/json"

// PaymentMerchant 随行付支付商户（真实数据表 payment_merchants）
type PaymentMerchant struct {
	ID                  uint   `gorm:"primaryKey" json:"id"`
	MerchantID          *uint  `gorm:"column:merchant_id" json:"merchant_id"`
	Channel             string `gorm:"column:channel" json:"channel"`
	ChannelMerchantCode string `gorm:"column:channel_merchant_code" json:"channel_merchant_code"`
	Status              string `gorm:"column:status" json:"status"`
	ApplyData           string `gorm:"column:apply_data" json:"apply_data"`
	ApplyTime           string `gorm:"column:apply_time" json:"apply_time"`
	ResponseData        string `gorm:"column:response_data" json:"response_data"`
	ResponseTime        string `gorm:"column:response_time" json:"response_time"`
	TotalTxns           int    `gorm:"column:total_txns" json:"total_txns"`
	TotalAmount         float64 `gorm:"column:total_amount" json:"total_amount"`
	LastTxnTime         string  `gorm:"column:last_txn_time" json:"last_txn_time"`
	CreatedAt           string  `gorm:"column:created_at" json:"created_at"`
	UpdatedAt           string  `gorm:"column:updated_at" json:"updated_at"`
}

func (PaymentMerchant) TableName() string { return "payment_merchants" }

// ApplyInfo 解析 apply_data JSON 后的商户信息
type ApplyInfo struct {
	Mno           string `json:"商户编号"`
	ShortName     string `json:"商户简称"`
	Contact       string `json:"联系人"`
	Industry      string `json:"行业大类"`
	Category      string `json:"类别名称"`
	Address       string `json:"经营地址"`
	AddressDetail string `json:"经营地址街道"`
	RegName       string `json:"注册名称"`
	LegalPerson   string `json:"法人姓名"`
	LicenseType   string `json:"资质类型"`
	BizType       string `json:"经营类型"`
	OrgName       string `json:"归属机构"`
	Salesman      string `json:"业务员"`
	CreateTime    string `json:"创建时间"`
	ReviewStatus  string `json:"复核状态"`
	Tags          string `json:"商户标签"`
	WxSubMchID    string `json:"微信子商户号"`
	AliSubMchID   string `json:"支付宝子商户号"`
	UnionSubMchID string `json:"银联子商户号"`
	SettleType    string `json:"结算类型"`
	SettleMethod  string `json:"结算方式"`
	BankName      string `json:"开户行名称"`
	WxRate        string `json:"微信费率(借/贷)"`
	AliRate       string `json:"支付宝费率(借/贷)"`
}

// ParseApplyData 解析商户JSON数据
func (m *PaymentMerchant) ParseApplyData() *ApplyInfo {
	if m.ApplyData == "" {
		return &ApplyInfo{}
	}
	var info ApplyInfo
	if err := json.Unmarshal([]byte(m.ApplyData), &info); err != nil {
		return &ApplyInfo{ShortName: m.ChannelMerchantCode}
	}
	return &info
}

// Merchant 商户列表展示模型（兼容前端）
type Merchant struct {
	ID           uint   `json:"id"`
	Name         string `json:"name"`
	Industry     string `json:"industry"`
	Category     string `json:"category"`
	Contact      string `json:"contact"`
	Status       string `json:"status"`
	Mno          string `json:"mno"`
	OrgName      string `json:"org_name"`
	Salesman     string `json:"salesman"`
	CreateTime   string `json:"create_time"`
	TotalTxns    int    `json:"total_txns"`
	TotalAmount  float64 `json:"total_amount"`
	Channel      string `json:"channel"`
	WxSubMchID   string `json:"wx_sub_mch_id"`
	AliSubMchID  string `json:"ali_sub_mch_id"`
	SettleType   string `json:"settle_type"`
	SettleMethod string `json:"settle_method"`
}
