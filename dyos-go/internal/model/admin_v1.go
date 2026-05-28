package model

type Knowledge struct {
	ID         uint   `gorm:"primaryKey;column:id" json:"id"`
	Title      string `gorm:"column:title" json:"title"`
	Category   string `gorm:"column:category" json:"category"`
	Status     string `gorm:"column:status" json:"status"`
	UpdateTime string `gorm:"column:update_time" json:"update_time"`
	Views      int    `gorm:"column:views" json:"views"`
}

func (Knowledge) TableName() string { return "knowledge" }

type AITemplate struct {
	ID       uint   `gorm:"primaryKey;column:id" json:"id"`
	Name     string `gorm:"column:name" json:"name"`
	Type     string `gorm:"column:type" json:"type"`
	Category string `gorm:"column:category" json:"category"`
	Status   string `gorm:"column:status" json:"status"`
}

func (AITemplate) TableName() string { return "ai_templates" }

type Announcement struct {
	ID         uint   `gorm:"primaryKey;column:id" json:"id"`
	Title      string `gorm:"column:title" json:"title"`
	Content    string `gorm:"column:content" json:"content"`
	Scope      string `gorm:"column:scope" json:"scope"`
	Status     string `gorm:"column:status" json:"status"`
	CreateTime string `gorm:"column:create_time" json:"create_time"`
	Views      int    `gorm:"column:views" json:"views"`
}

func (Announcement) TableName() string { return "announcements" }

type Activity struct {
	ID        uint   `gorm:"primaryKey;column:id" json:"id"`
	Title     string `gorm:"column:title" json:"title"`
	Type      string `gorm:"column:type" json:"type"`
	StartTime string `gorm:"column:start_time" json:"start_time"`
	EndTime   string `gorm:"column:end_time" json:"end_time"`
	Status    string `gorm:"column:status" json:"status"`
}

func (Activity) TableName() string { return "activities" }

type ChurnWarning struct {
	ID          uint   `gorm:"primaryKey;column:id" json:"id"`
	Merchant    string `gorm:"column:merchant" json:"merchant"`
	RiskLevel   string `gorm:"column:risk_level" json:"risk_level"`
	Probability int    `gorm:"column:probability" json:"probability"`
	LastActive  string `gorm:"column:last_active" json:"last_active"`
	Reason      string `gorm:"column:reason" json:"reason"`
	Suggestion  string `gorm:"column:suggestion" json:"suggestion"`
}

func (ChurnWarning) TableName() string { return "churn_warning" }

type PaymentChannel struct {
	Name        string  `gorm:"primaryKey;column:name" json:"name"`
	Status      string  `gorm:"column:status" json:"status"`
	SuccessRate float64 `gorm:"column:success_rate" json:"success_rate"`
	AvgTime     int     `gorm:"column:avg_time" json:"avg_time"`
	TodayVolume float64 `gorm:"column:today_volume" json:"today_volume"`
}

func (PaymentChannel) TableName() string { return "payment_channels" }

type ChannelAnalysis struct {
	Channel   string  `gorm:"primaryKey;column:channel" json:"channel"`
	Leads     int     `gorm:"column:leads" json:"leads"`
	Converted int     `gorm:"column:converted" json:"converted"`
	Rate      float64 `gorm:"column:rate" json:"rate"`
	Cost      float64 `gorm:"column:cost" json:"cost"`
}

func (ChannelAnalysis) TableName() string { return "channel_analysis" }

type Partner struct {
	ID              uint   `gorm:"primaryKey;column:id" json:"id"`
	Name            string `gorm:"column:name" json:"name"`
	Type            string `gorm:"column:type" json:"type"`
	Status          string `gorm:"column:status" json:"status"`
	CooperationTime string `gorm:"column:cooperation_time" json:"cooperation_time"`
	Merchants       int    `gorm:"column:merchants" json:"merchants"`
}

func (Partner) TableName() string { return "partners" }

type Ticket struct {
	ID         string `gorm:"primaryKey;column:id" json:"id"`
	Merchant   string `gorm:"column:merchant" json:"merchant"`
	Type       string `gorm:"column:type" json:"type"`
	Title      string `gorm:"column:title" json:"title"`
	Status     string `gorm:"column:status" json:"status"`
	Priority   string `gorm:"column:priority" json:"priority"`
	CreateTime string `gorm:"column:create_time" json:"create_time"`
	Assignee   string `gorm:"column:assignee" json:"assignee"`
}

func (Ticket) TableName() string { return "tickets" }

type FAQ struct {
	ID       uint   `gorm:"primaryKey;column:id" json:"id"`
	Category string `gorm:"column:category" json:"category"`
	Question string `gorm:"column:question" json:"question"`
	Answer   string `gorm:"column:answer" json:"answer"`
	Status   string `gorm:"column:status" json:"status"`
}

func (FAQ) TableName() string { return "faq" }

type FeatureFlag struct {
	ID         uint   `gorm:"primaryKey;column:id" json:"id"`
	Name       string `gorm:"column:name" json:"name"`
	Status     string `gorm:"column:status" json:"status"`
	Scope      string `gorm:"column:scope" json:"scope"`
	UpdateTime string `gorm:"column:update_time" json:"update_time"`
}

func (FeatureFlag) TableName() string { return "feature_flags" }

type Requirement struct {
	ID       uint   `gorm:"primaryKey;column:id" json:"id"`
	Title    string `gorm:"column:title" json:"title"`
	Merchant string `gorm:"column:merchant" json:"merchant"`
	Votes    int    `gorm:"column:votes" json:"votes"`
	Status   string `gorm:"column:status" json:"status"`
}

func (Requirement) TableName() string { return "requirements" }

type Version struct {
	Version     string `gorm:"primaryKey;column:version" json:"version"`
	Status      string `gorm:"column:status" json:"status"`
	ReleaseTime string `gorm:"column:release_time" json:"release_time"`
	Changes     string `gorm:"column:changes" json:"changes"`
}

func (Version) TableName() string { return "versions" }

type LoginLog struct {
	ID       uint   `gorm:"primaryKey;column:id" json:"id"`
	User     string `gorm:"column:user" json:"user"`
	Type     string `gorm:"column:type" json:"type"`
	Location string `gorm:"column:location" json:"location"`
	Device   string `gorm:"column:device" json:"device"`
	Time     string `gorm:"column:time" json:"time"`
	Status   string `gorm:"column:status" json:"status"`
}

func (LoginLog) TableName() string { return "login_logs" }

type DataMaskingRule struct {
	ID      uint   `json:"id"`
	Field   string `json:"field"`
	Type    string `json:"type"`
	Pattern string `json:"pattern"`
	Enabled bool   `json:"enabled"`
}
