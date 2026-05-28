package model

type Role struct {
	ID          uint   `gorm:"primaryKey;column:id" json:"id"`
	Name        string `gorm:"column:name" json:"name"`
	Level       string `gorm:"column:level" json:"level"`
	Permissions string `gorm:"column:permissions" json:"permissions"`
	Users       int    `gorm:"column:users" json:"users"`
}

func (Role) TableName() string { return "roles" }

type OperationLog struct {
	ID       uint   `gorm:"primaryKey;column:id" json:"id"`
	Operator string `gorm:"column:operator" json:"operator"`
	Type     string `gorm:"column:type" json:"type"`
	Object   string `gorm:"column:object" json:"target"`
	Action   string `gorm:"column:action" json:"action"`
	Time     string `gorm:"column:time" json:"time"`
	IP       string `gorm:"column:ip" json:"ip"`
}

func (OperationLog) TableName() string { return "operation_logs" }

type Pricing struct {
	Version       string  `gorm:"primaryKey;column:version" json:"version"`
	Price         float64 `gorm:"column:price" json:"price"`
	OriginalPrice float64 `gorm:"column:original_price" json:"original_price"`
	Period        string  `gorm:"column:period" json:"period"`
	Features      string  `gorm:"column:features" json:"features"`
}

func (Pricing) TableName() string { return "pricing" }

type Notification struct {
	ID         uint   `json:"id"`
	Title      string `json:"title"`
	Content    string `json:"content"`
	Type       string `json:"type"`
	Status     string `json:"status"`
	CreateTime string `json:"create_time"`
}
