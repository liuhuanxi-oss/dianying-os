package model

type Transaction struct {
	ID       string  `gorm:"primaryKey;column:id" json:"id"`
	Merchant string  `gorm:"column:merchant" json:"merchant"`
	Amount   float64 `gorm:"column:amount" json:"amount"`
	Type     string  `gorm:"column:type" json:"type"`
	Status   string  `gorm:"column:status" json:"status"`
	Time     string  `gorm:"column:time" json:"time"`
}

func (Transaction) TableName() string { return "transactions" }

type Refund struct {
	ID       uint    `gorm:"primaryKey;column:id" json:"id"`
	Merchant string  `gorm:"column:merchant" json:"merchant"`
	Amount   float64 `gorm:"column:amount" json:"amount"`
	Reason   string  `gorm:"column:reason" json:"reason"`
	Time     string  `gorm:"column:time" json:"time"`
	Status   string  `gorm:"column:status" json:"status"`
}

func (Refund) TableName() string { return "refunds" }

type Invoice struct {
	ID        uint    `gorm:"primaryKey;column:id" json:"id"`
	Merchant  string  `gorm:"column:merchant" json:"merchant"`
	Type      string  `gorm:"column:type" json:"type"`
	Amount    float64 `gorm:"column:amount" json:"amount"`
	Status    string  `gorm:"column:status" json:"status"`
	ApplyTime string  `gorm:"column:apply_time" json:"apply_time"`
}

func (Invoice) TableName() string { return "invoices" }
