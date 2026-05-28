package model

import "time"

type AIAgentTask struct {
	ID        uint      `gorm:"primaryKey;column:id" json:"id"`
	AgentType string    `gorm:"column:agent_type;index" json:"agent_type"`
	Title     string    `gorm:"column:title" json:"title"`
	Status    string    `gorm:"column:status;default:pending" json:"status"`
	Progress  int       `gorm:"column:progress;default:0" json:"progress"`
	Params    string    `gorm:"column:params;type:text" json:"params"`
	Result    string    `gorm:"column:result;type:mediumtext" json:"result"`
	Error     string    `gorm:"column:error;type:text" json:"error"`
	StartTime string    `gorm:"column:start_time" json:"start_time"`
	EndTime   string    `gorm:"column:end_time" json:"end_time"`
	CreatedAt time.Time `gorm:"column:created_at" json:"created_at"`
}

func (AIAgentTask) TableName() string { return "ai_agent_tasks" }

type AIAgentConfig struct {
	ID           uint   `gorm:"primaryKey;column:id" json:"id"`
	AgentType    string `gorm:"column:agent_type;uniqueIndex" json:"agent_type"`
	Enabled      bool   `gorm:"column:enabled;default:true" json:"enabled"`
	Schedule     string `gorm:"column:schedule" json:"schedule"`
	MaxRetries   int    `gorm:"column:max_retries;default:3" json:"max_retries"`
	TimeoutSecs  int    `gorm:"column:timeout_secs;default:300" json:"timeout_secs"`
	Priority     int    `gorm:"column:priority;default:0" json:"priority"`
	ModelName    string `gorm:"column:model_name" json:"model_name"`
	SystemPrompt string `gorm:"column:system_prompt;type:text" json:"system_prompt"`
}

func (AIAgentConfig) TableName() string { return "ai_agent_configs" }
