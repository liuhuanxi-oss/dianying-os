package model

type PlatformAdapter struct {
	ID          uint   `gorm:"primaryKey;column:id" json:"id"`
	Platform    string `gorm:"column:platform;uniqueIndex" json:"platform"`
	Name        string `gorm:"column:name" json:"name"`
	Type        string `gorm:"column:type" json:"type"`
	APIKey      string `gorm:"column:api_key" json:"-"`
	APISecret   string `gorm:"column:api_secret" json:"-"`
	BaseURL     string `gorm:"column:base_url" json:"base_url"`
	UseMock     bool   `gorm:"column:use_mock;default:true" json:"use_mock"`
	Enabled     bool   `gorm:"column:enabled;default:true" json:"enabled"`
	SyncStatus  string `gorm:"column:sync_status" json:"sync_status"`
	LastSyncAt  string `gorm:"column:last_sync_at" json:"last_sync_at"`
	SyncedCount int    `gorm:"column:synced_count;default:0" json:"synced_count"`
}

func (PlatformAdapter) TableName() string { return "platform_adapters" }

type CalendarEvent struct {
	ID        uint   `gorm:"primaryKey;column:id" json:"id"`
	Title     string `gorm:"column:title" json:"title"`
	Date      string `gorm:"column:date" json:"date"`
	Type      string `gorm:"column:type" json:"type"`
	RemindAt  string `gorm:"column:remind_at" json:"remind_at"`
	MerchantID uint  `gorm:"column:merchant_id;index" json:"merchant_id"`
	Status    string `gorm:"column:status;default:active" json:"status"`
	CreatedAt string `gorm:"column:created_at" json:"created_at"`
}

func (CalendarEvent) TableName() string { return "calendar_events" }

type InventoryAlert struct {
	ID          uint   `gorm:"primaryKey;column:id" json:"id"`
	SKU         string `gorm:"column:sku" json:"sku"`
	Merchant    string `gorm:"column:merchant" json:"merchant"`
	CurrentStock int   `gorm:"column:current_stock" json:"current_stock"`
	MinStock    int    `gorm:"column:min_stock" json:"min_stock"`
	Suggested   int    `gorm:"column:suggested" json:"suggested"`
	Urgency     string `gorm:"column:urgency" json:"urgency"`
	CreatedAt   string `gorm:"column:created_at" json:"created_at"`
}

func (InventoryAlert) TableName() string { return "inventory_alerts" }

type Member struct {
	ID         uint    `gorm:"primaryKey;column:id" json:"id"`
	Name       string  `gorm:"column:name" json:"name"`
	Phone      string  `gorm:"column:phone" json:"phone"`
	Level      string  `gorm:"column:level" json:"level"`
	Points     int     `gorm:"column:points" json:"points"`
	TotalSpent float64 `gorm:"column:total_spent" json:"total_spent"`
	Tags       string  `gorm:"column:tags" json:"tags"`
	MerchantID uint    `gorm:"column:merchant_id;index" json:"merchant_id"`
	JoinDate   string  `gorm:"column:join_date" json:"join_date"`
	LastVisit  string  `gorm:"column:last_visit" json:"last_visit"`
}

func (Member) TableName() string { return "members" }

type MemberLevelRule struct {
	ID          uint    `gorm:"primaryKey;column:id" json:"id"`
	Name        string  `gorm:"column:name" json:"name"`
	MinSpent    float64 `gorm:"column:min_spent" json:"min_spent"`
	MinPoints   int     `gorm:"column:min_points" json:"min_points"`
	Discount    float64 `gorm:"column:discount" json:"discount"`
	Icon        string  `gorm:"column:icon" json:"icon"`
}

func (MemberLevelRule) TableName() string { return "member_level_rules" }

type PointsRecord struct {
	ID       uint   `gorm:"primaryKey;column:id" json:"id"`
	MemberID uint   `gorm:"column:member_id;index" json:"member_id"`
	Amount   int    `gorm:"column:amount" json:"amount"`
	Reason   string `gorm:"column:reason" json:"reason"`
	CreatedAt string `gorm:"column:created_at" json:"created_at"`
}

func (PointsRecord) TableName() string { return "points_records" }

type Employee struct {
	ID         uint    `gorm:"primaryKey;column:id" json:"id"`
	Name       string  `gorm:"column:name" json:"name"`
	Position   string  `gorm:"column:position" json:"position"`
	Store      string  `gorm:"column:store" json:"store"`
	MerchantID uint    `gorm:"column:merchant_id;index" json:"merchant_id"`
	Score      float64 `gorm:"column:score" json:"score"`
	Rank       int     `gorm:"column:rank" json:"rank"`
	Metric     string  `gorm:"column:metric" json:"metric"`
}

func (Employee) TableName() string { return "employees" }

type StoreInspection struct {
	ID         uint   `gorm:"primaryKey;column:id" json:"id"`
	Store      string `gorm:"column:store" json:"store"`
	MerchantID uint   `gorm:"column:merchant_id;index" json:"merchant_id"`
	TemplateID uint   `gorm:"column:template_id" json:"template_id"`
	Score      float64 `gorm:"column:score" json:"score"`
	Inspector  string `gorm:"column:inspector" json:"inspector"`
	Status     string `gorm:"column:status" json:"status"`
	Notes      string `gorm:"column:notes;type:text" json:"notes"`
	CreatedAt  string `gorm:"column:created_at" json:"created_at"`
}

func (StoreInspection) TableName() string { return "store_inspections" }

type InspectionTemplate struct {
	ID     uint   `gorm:"primaryKey;column:id" json:"id"`
	Name   string `gorm:"column:name" json:"name"`
	Items  string `gorm:"column:items;type:text" json:"items"`
	MaxScore int  `gorm:"column:max_score;default:100" json:"max_score"`
}

func (InspectionTemplate) TableName() string { return "inspection_templates" }

type StoreLayout struct {
	ID         uint   `gorm:"primaryKey;column:id" json:"id"`
	Store      string `gorm:"column:store" json:"store"`
	MerchantID uint   `gorm:"column:merchant_id;index" json:"merchant_id"`
	LayoutData string `gorm:"column:layout_data;type:mediumtext" json:"layout_data"`
	HeatmapURL string `gorm:"column:heatmap_url" json:"heatmap_url"`
	ModelURL   string `gorm:"column:model_url" json:"model_url"`
	CreatedAt  string `gorm:"column:created_at" json:"created_at"`
}

func (StoreLayout) TableName() string { return "store_layouts" }

type KnowledgeTransfer struct {
	ID             uint    `gorm:"primaryKey" json:"id"`
	SourceMerchant uint    `gorm:"column:source_merchant;index" json:"source_merchant"`
	SourceName     string  `gorm:"column:source_name" json:"source_name"`
	TargetMerchant uint    `gorm:"column:target_merchant;index" json:"target_merchant"`
	TargetName     string  `gorm:"column:target_name" json:"target_name"`
	KnowledgeType  string  `gorm:"column:knowledge_type" json:"knowledge_type"`
	TransferScore  float64 `gorm:"column:transfer_score;default:0" json:"transfer_score"`
	Applied        bool    `gorm:"column:applied;default:false" json:"applied"`
	CreatedAt      string  `gorm:"column:created_at" json:"created_at"`
}

func (KnowledgeTransfer) TableName() string { return "knowledge_transfers" }
