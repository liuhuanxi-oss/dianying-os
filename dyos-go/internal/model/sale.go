package model

type Sale struct {
	ID            uint   `gorm:"primaryKey;column:id" json:"id"`
	Name          string `gorm:"column:name" json:"name"`
	Phone         string `gorm:"column:phone" json:"phone"`
	Region        string `gorm:"column:region" json:"region"`
	Status        string `gorm:"column:status" json:"status"`
	Customers     int    `gorm:"column:customers" json:"customers"`
	ThisMonthSign int    `gorm:"column:this_month_sign" json:"this_month_sign"`
}

func (Sale) TableName() string { return "sales" }

type CustomerAssign struct {
	ID           uint   `gorm:"primaryKey;column:id" json:"id"`
	CustomerID   uint   `gorm:"column:customer_id" json:"customer_id"`
	CustomerName string `gorm:"column:customer_name" json:"customer_name"`
	CurrentOwner string `gorm:"column:current_owner" json:"current_owner"`
	NewOwner     string `gorm:"column:new_owner" json:"new_owner"`
	AssignTime   string `gorm:"column:assign_time" json:"assign_time"`
}

func (CustomerAssign) TableName() string { return "customer_assigns" }

type VisitRecord struct {
	ID        uint   `gorm:"primaryKey;column:id" json:"id"`
	Merchant  string `gorm:"column:merchant" json:"merchant"`
	Salesman  string `gorm:"column:salesman" json:"salesman"`
	Type      string `gorm:"column:type" json:"type"`
	Content   string `gorm:"column:content" json:"content"`
	Time      string `gorm:"column:time" json:"time"`
	NextVisit string `gorm:"column:next_visit" json:"next_visit"`
}

func (VisitRecord) TableName() string { return "visit_records" }
