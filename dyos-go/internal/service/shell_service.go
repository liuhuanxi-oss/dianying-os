package service

import (
	"strings"
	"time"

	"dyos-go/internal/model"

	"gorm.io/gorm"
)

type ShellService struct{ db *gorm.DB }

func NewShellService(db *gorm.DB) *ShellService { return &ShellService{db: db} }

func (s *ShellService) SearchCommands(keyword string) []map[string]interface{} {
	all := []map[string]interface{}{
		{"name": "数据大屏", "category": "监控", "keywords": "大屏,screen,dashboard", "action": "/screen", "hotkey": "Ctrl+D"},
		{"name": "商家管理", "category": "管理", "keywords": "商家,merchant,商户", "action": "/merchants", "hotkey": "Ctrl+M"},
		{"name": "代理商管理", "category": "管理", "keywords": "代理商,agent,代理", "action": "/agents", "hotkey": "Ctrl+A"},
		{"name": "报表中心", "category": "分析", "keywords": "报表,report,分析", "action": "/reports", "hotkey": "Ctrl+R"},
		{"name": "评价管理", "category": "运营", "keywords": "评价,review,回复", "action": "/reviews", "hotkey": "Ctrl+E"},
		{"name": "AI Agent", "category": "AI", "keywords": "ai,agent,智能体,自动化", "action": "/ai-agents", "hotkey": "Ctrl+I"},
		{"name": "AI客服", "category": "AI", "keywords": "客服,chat,对话,回复", "action": "/chat", "hotkey": "Ctrl+H"},
		{"name": "金融中心", "category": "财务", "keywords": "财务,finance,交易,退款", "action": "/finance", "hotkey": "Ctrl+F"},
		{"name": "系统设置", "category": "系统", "keywords": "设置,settings,配置", "action": "/settings", "hotkey": "Ctrl+,"},
	}
	if keyword == "" { return all }
	var result []map[string]interface{}
	kw := strings.ToLower(keyword)
	for _, cmd := range all {
		if strings.Contains(strings.ToLower(cmd["name"].(string)), kw) || strings.Contains(strings.ToLower(cmd["keywords"].(string)), kw) {
			result = append(result, cmd)
		}
	}
	return result
}

func (s *ShellService) OnboardingSteps() []map[string]interface{} {
	return []map[string]interface{}{
		{"step": 1, "title": "完善商家信息", "content": "添加第一个商家门店，完善基本信息和经营品类", "target": "#nav-merchants"},
		{"step": 2, "title": "配置支付渠道", "content": "在支付管理中绑定微信/支付宝收款渠道", "target": "#nav-payment"},
		{"step": 3, "title": "创建AI Agent", "content": "设置你的第一个经营分析Agent，自动分析门店数据", "target": "#nav-ai-agents"},
		{"step": 4, "title": "查看数据大屏", "content": "打开实时数据大屏，监控核心经营指标", "target": "#nav-screen"},
	}
}

func (s *ShellService) ListChangelogs(page, size int) (map[string]interface{}, error) {
	if size <= 0 { size = 20 }
	items := []model.Changelog{
		{ID: 1, Version: "v2.1.0", Title: "AI Agent中心上线", Content: "支持5种AI Agent类型，自动经营分析和策略生成", Type: "feature", CreatedAt: time.Now().Add(-24 * time.Hour).Format("2006-01-02")},
		{ID: 2, Version: "v2.0.0", Title: "数据大屏正式版", Content: "全屏实时数据监控，支持KPI/地图/订单滚动", Type: "feature", CreatedAt: time.Now().Add(-7*24 * time.Hour).Format("2006-01-02")},
		{ID: 3, Version: "v1.9.0", Title: "评价管理优化", Content: "支持多平台评价聚合，AI千人千面回复", Type: "improvement", CreatedAt: time.Now().Add(-14*24 * time.Hour).Format("2006-01-02")},
	}
	return map[string]interface{}{"items": items, "total": int64(len(items)), "page": page, "size": size}, nil
}

func (s *ShellService) CreateChangelog(c *model.Changelog) error {
	if s.db == nil { return nil }
	c.CreatedAt = time.Now().Format("2006-01-02")
	return s.db.Create(c).Error
}
