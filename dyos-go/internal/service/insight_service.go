package service

import (
	"math/rand"
	"time"

	"dyos-go/internal/model"

	"gorm.io/gorm"
)

type InsightService struct{ db *gorm.DB }

func NewInsightService(db *gorm.DB) *InsightService { return &InsightService{db: db} }

func (s *InsightService) DecisionLogs(page, size int) (map[string]interface{}, error) {
	if size <= 0 { size = 20 }
	if page <= 0 { page = 1 }
	items := make([]model.DecisionLog, size)
	for i := range items {
		items[i] = model.DecisionLog{
			ID: uint((page-1)*size + i + 1),
			Title: []string{"午市提价ROI分析", "新店选址评估", "营销预算分配", "库存优化建议", "员工排班优化"}[i%5],
			Input: "{\"params\": \"...\"}", Output: "{\"suggestion\": \"...\"}",
			Model: []string{"deepseek-v4", "gpt-4o"}[i%2],
			CreatedAt: time.Now().Add(-time.Duration(rand.Intn(72))*time.Hour).Format("2006-01-02 15:04:05"),
		}
	}
	return map[string]interface{}{"items": items, "total": int64(428), "page": page, "size": size}, nil
}

func (s *InsightService) AIDailyReport(date string) map[string]interface{} {
	return map[string]interface{}{
		"date": date, "title": "AI洞察日报 - " + date,
		"summary":    "今日平台运营整体平稳，GMV环比增长3.2%，共处理1286条评价，AI回复率92%。",
		"highlights": []string{"午市时段GMV创新高¥18,600", "AI客服处理156次会话，平均28秒回复", "华东区3家店需关注差评趋势"},
		"risks":      []string{"牛肉卷库存低位（12份）", "某分店连续2周GMV下滑"},
		"actions":    []string{"建议对牛肉卷紧急补货45份", "安排区域经理巡检下滑门店"},
	}
}

func (s *InsightService) ListDailyReports(page, size int) (map[string]interface{}, error) {
	if size <= 0 { size = 10 }
	items := make([]model.AIDailyReport, size)
	for i := range items {
		items[i] = model.AIDailyReport{
			ID: uint((page-1)*size + i + 1),
			Date: time.Now().AddDate(0, 0, -i).Format("2006-01-02"),
			Title: "AI洞察日报 - " + time.Now().AddDate(0, 0, -i).Format("01-02"),
			Highlights: "GMV稳定增长,AI客服高效,评价积极",
			CreatedAt: time.Now().AddDate(0, 0, -i).Format("2006-01-02 08:00:00"),
		}
	}
	return map[string]interface{}{"items": items, "total": int64(30), "page": page, "size": size}, nil
}
