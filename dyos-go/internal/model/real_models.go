package model

import "time"

// User 用户表
type User struct {
	ID           uint   `gorm:"primaryKey" json:"id"`
	Username     string `gorm:"column:username" json:"username"`
	PasswordHash string `gorm:"column:password_hash" json:"-"`
	Phone        string `gorm:"column:phone" json:"phone"`
	Email        string `gorm:"column:email" json:"email"`
	Role         string `gorm:"column:role" json:"role"`
	Name         string `gorm:"column:name" json:"name"`
	Avatar       string `gorm:"column:avatar" json:"avatar"`
	Status       int    `gorm:"column:status" json:"status"`
	MerchantID   uint   `gorm:"column:merchant_id;default:0" json:"merchant_id"`
	AgentID      uint   `gorm:"column:agent_id;default:0" json:"agent_id"`
	CreatedAt    string `gorm:"column:created_at" json:"created_at"`
	UpdatedAt    string `gorm:"column:updated_at" json:"updated_at"`
}

func (User) TableName() string { return "users" }

// Store 门店表
type Store struct {
	ID          uint    `gorm:"primaryKey" json:"id"`
	Name        string  `gorm:"column:name" json:"name"`
	Address     string  `gorm:"column:address" json:"address"`
	Phone       string  `gorm:"column:phone" json:"phone"`
	Category    string  `gorm:"column:category" json:"category"`
	Description string  `gorm:"column:description" json:"description"`
	Logo        string  `gorm:"column:logo" json:"logo"`
	Rating      float64 `gorm:"column:rating" json:"rating"`
	ReviewCount int     `gorm:"column:review_count" json:"review_count"`
	OrderCount  int     `gorm:"column:order_count" json:"order_count"`
	Status      int     `gorm:"column:status" json:"status"`
	OwnerID     uint    `gorm:"column:owner_id" json:"owner_id"`
	MerchantID  uint    `gorm:"column:merchant_id;default:0" json:"merchant_id"`
	AgentID     uint    `gorm:"column:agent_id;default:0" json:"agent_id"`
	CreatedAt   string  `gorm:"column:created_at" json:"created_at"`
	UpdatedAt   string  `gorm:"column:updated_at" json:"updated_at"`
}

func (Store) TableName() string { return "stores" }

// Order 订单表
type Order struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	OrderNo        string    `gorm:"column:order_no" json:"order_no"`
	StoreID        *int      `gorm:"column:store_id" json:"store_id"`
	MerchantID     uint      `gorm:"column:merchant_id;default:0" json:"merchant_id"`
	AgentID        uint      `gorm:"column:agent_id;default:0" json:"agent_id"`
	UserName       string    `gorm:"column:user_name" json:"user_name"`
	UserPhone      string    `gorm:"column:user_phone" json:"user_phone"`
	TotalAmount    float64   `gorm:"column:total_amount" json:"total_amount"`
	DiscountAmount float64   `gorm:"column:discount_amount" json:"discount_amount"`
	FinalAmount    float64   `gorm:"column:final_amount" json:"final_amount"`
	Status         string    `gorm:"column:status" json:"status"`
	PaymentMethod  string    `gorm:"column:payment_method" json:"payment_method"`
	PaymentTime    string    `gorm:"column:payment_time" json:"payment_time"`
	CreatedAt      time.Time `gorm:"column:created_at" json:"created_at"`
	UpdatedAt      time.Time `gorm:"column:updated_at" json:"updated_at"`
}

func (Order) TableName() string { return "orders" }

// StatsDaily 每日统计
type StatsDaily struct {
	ID            uint    `gorm:"primaryKey" json:"id"`
	Date          string  `gorm:"column:date" json:"date"`
	StoreID       int     `gorm:"column:store_id" json:"store_id"`
	MerchantID    uint    `gorm:"column:merchant_id;default:0" json:"merchant_id"`
	AgentID       uint    `gorm:"column:agent_id;default:0" json:"agent_id"`
	OrderCount    int     `gorm:"column:order_count" json:"order_count"`
	OrderAmount   float64 `gorm:"column:order_amount" json:"order_amount"`
	ReviewCount   int     `gorm:"column:review_count" json:"review_count"`
	NewUserCount  int     `gorm:"column:new_user_count" json:"new_user_count"`
	AvgRating     float64 `gorm:"column:avg_rating" json:"avg_rating"`
	PositiveCount int     `gorm:"column:positive_count" json:"positive_count"`
	NegativeCount int     `gorm:"column:negative_count" json:"negative_count"`
	CreatedAt     string  `gorm:"column:created_at" json:"created_at"`
	UpdatedAt     string  `gorm:"column:updated_at" json:"updated_at"`
}

func (StatsDaily) TableName() string { return "stats_daily" }
