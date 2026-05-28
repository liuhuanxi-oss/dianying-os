package service

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"time"

	"dyos-go/internal/model"

	"gorm.io/gorm"
)

type ReportService struct {
	db *gorm.DB
}

func NewReportService(db *gorm.DB) *ReportService {
	return &ReportService{db: db}
}

func (s *ReportService) ListReports(page, size int, reportType string) (map[string]interface{}, error) {
	if size <= 0 { size = 20 }
	if page <= 0 { page = 1 }
	if s.db == nil {
		return s.mockReports(page, size, reportType), nil
	}
	var items []model.Report
	var total int64
	q := s.db.Model(&model.Report{})
	if reportType != "" { q = q.Where("type = ?", reportType) }
	q.Count(&total)
	if err := q.Order("id DESC").Offset((page-1)*size).Limit(size).Find(&items).Error; err != nil {
		return nil, err
	}
	return map[string]interface{}{"items": items, "total": total, "page": page, "size": size}, nil
}

func (s *ReportService) GetReport(id uint) (*model.Report, error) {
	if s.db == nil { r := s.mockReportItem(int(id)); return &r, nil }
	var r model.Report
	if err := s.db.First(&r, id).Error; err != nil { return nil, err }
	return &r, nil
}

func (s *ReportService) CreateReport(r *model.Report) error {
	r.CreatedAt = time.Now().Format("2006-01-02 15:04:05")
	r.Status = "draft"
	if s.db == nil { return fmt.Errorf("数据库不可用") }
	return s.db.Create(r).Error
}

func (s *ReportService) UpdateReport(id uint, updates map[string]interface{}) error {
	if s.db == nil { return fmt.Errorf("数据库不可用") }
	return s.db.Model(&model.Report{}).Where("id = ?", id).Updates(updates).Error
}

func (s *ReportService) DeleteReport(id uint) error {
	if s.db == nil { return fmt.Errorf("数据库不可用") }
	return s.db.Delete(&model.Report{}, id).Error
}

func (s *ReportService) GenerateReport(id uint) (map[string]interface{}, error) {
	if s.db != nil {
		s.db.Model(&model.Report{}).Where("id = ?", id).Updates(map[string]interface{}{"last_run": time.Now().Format("2006-01-02 15:04:05"), "status": "generated"})
	}
	return s.mockReportData(), nil
}

func (s *ReportService) ExportReport(id uint, format string) (map[string]interface{}, error) {
	if format == "" { format = "pdf" }
	url := fmt.Sprintf("/exports/report_%d_%d.%s", id, time.Now().Unix(), format)
	return map[string]interface{}{"url": url, "format": format, "filename": fmt.Sprintf("report_%d.%s", id, format), "size": 1024 * (100 + rand.Intn(900))}, nil
}

func (s *ReportService) ListTemplates(category string) ([]model.ReportTemplate, error) {
	if s.db == nil { return s.mockTemplates(), nil }
	var items []model.ReportTemplate
	q := s.db.Model(&model.ReportTemplate{})
	if category != "" { q = q.Where("category = ?", category) }
	if err := q.Order("use_count DESC").Find(&items).Error; err != nil { return nil, err }
	if len(items) == 0 { items = s.mockTemplates() }
	return items, nil
}

func (s *ReportService) CreateTemplate(t *model.ReportTemplate) error {
	t.CreatedAt = time.Now().Format("2006-01-02 15:04:05")
	if s.db == nil { return fmt.Errorf("数据库不可用") }
	return s.db.Create(t).Error
}

func (s *ReportService) DeleteTemplate(id uint) error {
	if s.db == nil { return fmt.Errorf("数据库不可用") }
	return s.db.Delete(&model.ReportTemplate{}, id).Error
}

func (s *ReportService) ListSchedules() ([]model.ReportSchedule, error) {
	if s.db == nil { return s.mockSchedules(), nil }
	var items []model.ReportSchedule
	if err := s.db.Order("id DESC").Find(&items).Error; err != nil { return nil, err }
	return items, nil
}

func (s *ReportService) CreateSchedule(sc *model.ReportSchedule) error {
	sc.CreatedAt = time.Now().Format("2006-01-02 15:04:05")
	sc.NextRun = time.Now().Add(24 * time.Hour).Format("2006-01-02 15:04:05")
	if s.db == nil { return fmt.Errorf("数据库不可用") }
	return s.db.Create(sc).Error
}

func (s *ReportService) UpdateSchedule(id uint, updates map[string]interface{}) error {
	if s.db == nil { return fmt.Errorf("数据库不可用") }
	return s.db.Model(&model.ReportSchedule{}).Where("id = ?", id).Updates(updates).Error
}

func (s *ReportService) DeleteSchedule(id uint) error {
	if s.db == nil { return fmt.Errorf("数据库不可用") }
	return s.db.Delete(&model.ReportSchedule{}, id).Error
}

func (s *ReportService) mockReports(page, size int, reportType string) map[string]interface{} {
	items := make([]model.Report, 0, size)
	for i := 0; i < size; i++ {
		idx := (page-1)*size + i
		r := s.mockReportItem(idx)
		if reportType != "" && r.Type != reportType { continue }
		items = append(items, r)
	}
	return map[string]interface{}{"items": items, "total": int64(12), "page": page, "size": size}
}

func (s *ReportService) mockReportItem(idx int) model.Report {
	types := []string{"daily", "weekly", "monthly", "custom"}
	names := []string{"日报-当日经营概况", "周报-门店周度分析", "月报-月度财务报表", "月报-营销效果分析", "日报-异常交易监控", "周报-AI使用统计", "月报-代理商佣金结算", "季度报-Q1经营总结"}
	return model.Report{
		ID: uint(idx + 1), Name: names[idx%len(names)], Type: types[idx%len(types)],
		Description: fmt.Sprintf("自动生成的%s报告", names[idx%len(names)]),
		TemplateID: uint(idx%4 + 1), Status: "generated",
		LastRun: time.Now().Add(-time.Duration(idx*6) * time.Hour).Format("2006-01-02 15:04:05"),
		CreatedAt: time.Now().Add(-time.Duration(idx*72) * time.Hour).Format("2006-01-02"),
	}
}

func (s *ReportService) mockTemplates() []model.ReportTemplate {
	return []model.ReportTemplate{
		{ID: 1, Name: "标准日报模板", Type: "daily", Category: "经营", PreviewURL: "/previews/daily-report.png", UseCount: 1280},
		{ID: 2, Name: "标准周报模板", Type: "weekly", Category: "经营", PreviewURL: "/previews/weekly-report.png", UseCount: 856},
		{ID: 3, Name: "财务报表模板", Type: "monthly", Category: "财务", PreviewURL: "/previews/finance-report.png", UseCount: 642},
		{ID: 4, Name: "营销分析模板", Type: "monthly", Category: "营销", PreviewURL: "/previews/marketing-report.png", UseCount: 520},
		{ID: 5, Name: "AI效能报告模板", Type: "custom", Category: "AI", PreviewURL: "/previews/ai-report.png", UseCount: 315},
	}
}

func (s *ReportService) mockSchedules() []model.ReportSchedule {
	return []model.ReportSchedule{
		{ID: 1, ReportID: 1, ReportName: "日报-当日经营概况", Cron: "0 8 * * *", Channel: "email", Recipients: "admin@detian.xin", Format: "pdf", Enabled: true, LastSent: time.Now().Add(-12 * time.Hour).Format("2006-01-02 15:04:05"), NextRun: time.Now().Add(12 * time.Hour).Format("2006-01-02 15:04:05")},
		{ID: 2, ReportID: 2, ReportName: "周报-门店周度分析", Cron: "0 9 * * 1", Channel: "wecom", Recipients: "运营团队群", Format: "pdf", Enabled: true, LastSent: time.Now().Add(-72 * time.Hour).Format("2006-01-02 15:04:05"), NextRun: time.Now().Add(96 * time.Hour).Format("2006-01-02 15:04:05")},
		{ID: 3, ReportID: 3, ReportName: "月报-月度财务报表", Cron: "0 10 1 * *", Channel: "email", Recipients: "finance@detian.xin", Format: "excel", Enabled: false},
	}
}

func (s *ReportService) mockReportData() map[string]interface{} {
	data, _ := json.Marshal(map[string]interface{}{
		"generated_at": time.Now().Format("2006-01-02 15:04:05"),
		"summary":      "报告周期内平台经营状况良好，核心指标均达成预期目标。",
		"kpi": map[string]interface{}{
			"total_gmv": 8562300, "total_orders": 32800,
			"avg_order_amount": 261.0, "active_merchants": 219,
			"new_merchants": 12, "churn_rate": 3.2,
			"ai_task_completed": 28600, "pay_success_rate": 99.2,
		},
		"charts": []map[string]interface{}{
			{"type": "line", "title": "GMV趋势", "data": []int{680, 720, 695, 810, 856, 890, 920}},
			{"type": "bar", "title": "各行业订单分布", "data": map[string]int{"餐饮": 18600, "零售": 9800, "休闲娱乐": 4400}},
			{"type": "pie", "title": "支付渠道占比", "data": map[string]int{"微信支付": 52, "支付宝": 30, "银行卡": 12, "其他": 6}},
		},
		"insights": []string{
			"餐饮类目GMV环比增长8.2%，建议加大午市推广力度",
			"华东区3家门店连续2周订单下滑，需重点关注",
			"AI客服回复率达92%，节省人工成本约¥18,000",
		},
	})
	return map[string]interface{}{"report_data": json.RawMessage(data)}
}
