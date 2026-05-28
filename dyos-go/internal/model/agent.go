package model

type Agent struct {
	ID         uint    `gorm:"primaryKey;column:id" json:"id"`
	Name       string  `gorm:"column:name" json:"name"`
	Level      string  `gorm:"column:level" json:"level"`
	Merchants  int     `gorm:"column:merchants" json:"merchants"`
	MonthlyGMV float64 `gorm:"column:monthly_gmv" json:"monthly_gmv"`
	Status     string  `gorm:"column:status" json:"status"`
	JoinTime   string  `gorm:"column:join_time" json:"join_time"`
	Contact    string  `gorm:"column:contact" json:"contact"`
	Region     string  `gorm:"column:region" json:"region"`
}

func (Agent) TableName() string { return "agents" }

type SettlementRecord struct {
	Agent      string  `gorm:"primaryKey;column:agent" json:"agent"`
	Month      string  `gorm:"column:month" json:"month"`
	Payable    float64 `gorm:"column:payable" json:"payable"`
	Actual     float64 `gorm:"column:actual" json:"actual"`
	Status     string  `gorm:"column:status" json:"status"`
	SettleTime string  `gorm:"column:settle_time" json:"settle_time"`
}

func (SettlementRecord) TableName() string { return "settlement_records" }

type ServiceProvider struct {
	ID            uint   `gorm:"primaryKey;column:id" json:"id"`
	Name          string `gorm:"column:name" json:"name"`
	Scope         string `gorm:"column:scope" json:"scope"`
	Region        string `gorm:"column:region" json:"region"`
	Qualification string `gorm:"column:qualification" json:"qualification"`
	Merchants     int    `gorm:"column:merchants" json:"merchants"`
}

func (ServiceProvider) TableName() string { return "service_providers" }
