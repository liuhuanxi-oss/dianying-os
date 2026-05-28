package model

type Report struct {
	ID          uint   `gorm:"primaryKey;column:id" json:"id"`
	Name        string `gorm:"column:name" json:"name"`
	Type        string `gorm:"column:type" json:"type"`
	Description string `gorm:"column:description" json:"description"`
	TemplateID  uint   `gorm:"column:template_id" json:"template_id"`
	Config      string `gorm:"column:config;type:text" json:"config"`
	LastRun     string `gorm:"column:last_run" json:"last_run"`
	Status      string `gorm:"column:status;default:draft" json:"status"`
	CreatedBy   string `gorm:"column:created_by" json:"created_by"`
	CreatedAt   string `gorm:"column:created_at" json:"created_at"`
}

func (Report) TableName() string { return "reports" }

type ReportTemplate struct {
	ID          uint   `gorm:"primaryKey;column:id" json:"id"`
	Name        string `gorm:"column:name" json:"name"`
	Type        string `gorm:"column:type" json:"type"`
	Category    string `gorm:"column:category" json:"category"`
	PreviewURL  string `gorm:"column:preview_url" json:"preview_url"`
	Config      string `gorm:"column:config;type:text" json:"config"`
	UseCount    int    `gorm:"column:use_count;default:0" json:"use_count"`
	CreatedAt   string `gorm:"column:created_at" json:"created_at"`
}

func (ReportTemplate) TableName() string { return "report_templates" }

type ReportSchedule struct {
	ID        uint   `gorm:"primaryKey;column:id" json:"id"`
	ReportID  uint   `gorm:"column:report_id" json:"report_id"`
	ReportName string `gorm:"-" json:"report_name,omitempty"`
	Cron      string `gorm:"column:cron" json:"cron"`
	Channel   string `gorm:"column:channel" json:"channel"`
	Recipients string `gorm:"column:recipients" json:"recipients"`
	Format    string `gorm:"column:format;default:pdf" json:"format"`
	Enabled   bool   `gorm:"column:enabled;default:true" json:"enabled"`
	LastSent  string `gorm:"column:last_sent" json:"last_sent"`
	NextRun   string `gorm:"column:next_run" json:"next_run"`
	CreatedAt string `gorm:"column:created_at" json:"created_at"`
}

func (ReportSchedule) TableName() string { return "report_schedules" }
