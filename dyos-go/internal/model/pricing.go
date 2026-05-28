package model

type PricingSuggestion struct {
	ID         uint   `gorm:"primaryKey;column:id" json:"id"`
	DishName   string `gorm:"column:dish_name" json:"dish_name"`
	MerchantID uint   `gorm:"column:merchant_id" json:"merchant_id"`
	CurPrice   float64 `gorm:"column:cur_price" json:"cur_price"`
	Suggested  float64 `gorm:"column:suggested" json:"suggested"`
	MinPrice   float64 `gorm:"column:min_price" json:"min_price"`
	MaxPrice   float64 `gorm:"column:max_price" json:"max_price"`
	Reason     string `gorm:"column:reason" json:"reason"`
	Confidence float64 `gorm:"column:confidence" json:"confidence"`
}

func (PricingSuggestion) TableName() string { return "pricing_suggestions" }

type TrustLevel struct {
	ID         uint   `gorm:"primaryKey;column:id" json:"id"`
	MerchantID uint   `gorm:"column:merchant_id;uniqueIndex" json:"merchant_id"`
	Merchant   string `gorm:"column:merchant" json:"merchant"`
	Level      int    `gorm:"column:level;default:1" json:"level"`
	Score      float64 `gorm:"column:score" json:"score"`
	Factors    string `gorm:"column:factors" json:"factors"`
	Restricted []string `gorm:"-" json:"restricted"`
	UpdatedAt  string `gorm:"column:updated_at" json:"updated_at"`
}

func (TrustLevel) TableName() string { return "trust_levels" }

type Command struct {
	ID       uint   `gorm:"primaryKey;column:id" json:"id"`
	Name     string `gorm:"column:name" json:"name"`
	Category string `gorm:"column:category" json:"category"`
	Keywords string `gorm:"column:keywords" json:"keywords"`
	Action   string `gorm:"column:action" json:"action"`
	Hotkey   string `gorm:"column:hotkey" json:"hotkey"`
}

func (Command) TableName() string { return "commands" }

type OnboardingStep struct {
	ID       uint   `gorm:"primaryKey;column:id" json:"id"`
	Step     int    `gorm:"column:step" json:"step"`
	Title    string `gorm:"column:title" json:"title"`
	Content  string `gorm:"column:content;type:text" json:"content"`
	Target   string `gorm:"column:target" json:"target"`
	ImageURL string `gorm:"column:image_url" json:"image_url"`
}

func (OnboardingStep) TableName() string { return "onboarding_steps" }

type Changelog struct {
	ID        uint   `gorm:"primaryKey;column:id" json:"id"`
	Version   string `gorm:"column:version" json:"version"`
	Title     string `gorm:"column:title" json:"title"`
	Content   string `gorm:"column:content;type:text" json:"content"`
	Type      string `gorm:"column:type" json:"type"`
	CreatedAt string `gorm:"column:created_at" json:"created_at"`
}

func (Changelog) TableName() string { return "changelogs" }

type DecisionLog struct {
	ID        uint   `gorm:"primaryKey;column:id" json:"id"`
	Title     string `gorm:"column:title" json:"title"`
	Input     string `gorm:"column:input;type:text" json:"input"`
	Output    string `gorm:"column:output;type:text" json:"output"`
	Model     string `gorm:"column:model" json:"model"`
	CreatedAt string `gorm:"column:created_at" json:"created_at"`
}

func (DecisionLog) TableName() string { return "decision_logs" }

type AIDailyReport struct {
	ID        uint   `gorm:"primaryKey;column:id" json:"id"`
	Date      string `gorm:"column:date" json:"date"`
	Title     string `gorm:"column:title" json:"title"`
	Content   string `gorm:"column:content;type:mediumtext" json:"content"`
	Highlights string `gorm:"column:highlights" json:"highlights"`
	MerchantID uint  `gorm:"column:merchant_id;index" json:"merchant_id"`
	CreatedAt string `gorm:"column:created_at" json:"created_at"`
}

func (AIDailyReport) TableName() string { return "ai_daily_reports" }
