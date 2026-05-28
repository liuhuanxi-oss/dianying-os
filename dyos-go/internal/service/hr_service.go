package service

import (
	"math/rand"
	"time"

	"dyos-go/internal/model"

	"gorm.io/gorm"
)

type HRService struct{ db *gorm.DB }

func NewHRService(db *gorm.DB) *HRService { return &HRService{db: db} }

func (s *HRService) ListEmployees(page, size int) (map[string]interface{}, error) {
	if size <= 0 { size = 20 }
	if page <= 0 { page = 1 }
	positions := []string{"店长", "厨师", "服务员", "收银员", "配送员"}
	stores := []string{"旗舰店", "分店A", "分店B", "分店C"}
	items := make([]model.Employee, size)
	for i := range items {
		score := 70 + rand.Float64()*30
		items[i] = model.Employee{
			ID: uint((page-1)*size + i + 1), Name: "员工" + string(rune('A'+i%26)),
			Position: positions[i%len(positions)], Store: stores[i%len(stores)],
			Score: float64(int(score*10)) / 10, Rank: i + 1,
			Metric: "综合评分",
		}
	}
	return map[string]interface{}{"items": items, "total": int64(86), "page": page, "size": size}, nil
}

func (s *HRService) CreateEmployee(e *model.Employee) error {
	if s.db == nil { return nil }
	return s.db.Create(e).Error
}

func (s *HRService) UpdateEmployee(id uint, updates map[string]interface{}) error {
	if s.db == nil { return nil }
	return s.db.Model(&model.Employee{}).Where("id = ?", id).Updates(updates).Error
}

func (s *HRService) ListInspections(page, size int) (map[string]interface{}, error) {
	if size <= 0 { size = 20 }
	stores := []string{"旗舰店", "分店A", "分店B"}
	items := make([]model.StoreInspection, size)
	for i := range items {
		items[i] = model.StoreInspection{
			ID: uint((page-1)*size + i + 1), Store: stores[i%len(stores)],
			TemplateID: uint(i%3 + 1), Score: 75 + rand.Float64()*25,
			Inspector: "督导" + string(rune('A'+i%3)), Status: []string{"completed", "completed", "in_progress"}[i%3],
			CreatedAt: time.Now().Add(-time.Duration(rand.Intn(30)*24) * time.Hour).Format("2006-01-02 15:04:05"),
		}
	}
	return map[string]interface{}{"items": items, "total": int64(45), "page": page, "size": size}, nil
}

func (s *HRService) CreateInspection(i *model.StoreInspection) error {
	if s.db == nil { return nil }
	i.CreatedAt = time.Now().Format("2006-01-02 15:04:05")
	return s.db.Create(i).Error
}

func (s *HRService) ListTemplates() []model.InspectionTemplate {
	return []model.InspectionTemplate{
		{ID: 1, Name: "卫生巡检", Items: `["厨房清洁","餐具消毒","食材存放","垃圾处理"]`, MaxScore: 100},
		{ID: 2, Name: "服务巡检", Items: `["迎宾","上菜速度","服务态度","结账流程"]`, MaxScore: 100},
		{ID: 3, Name: "安全巡检", Items: `["消防设施","电路检查","燃气检查","应急通道"]`, MaxScore: 100},
	}
}

func (s *HRService) CreateTemplate(t *model.InspectionTemplate) error {
	if s.db == nil { return nil }
	return s.db.Create(t).Error
}

func (s *HRService) PerformanceRanking() []map[string]interface{} {
	return []map[string]interface{}{
		{"rank": 1, "name": "张敏", "position": "店长", "score": 95.2, "store": "旗舰店"},
		{"rank": 2, "name": "李强", "position": "厨师长", "score": 93.8, "store": "旗舰店"},
		{"rank": 3, "name": "王芳", "position": "服务员", "score": 91.5, "store": "分店A"},
		{"rank": 4, "name": "赵磊", "position": "收银员", "score": 89.3, "store": "分店B"},
		{"rank": 5, "name": "陈静", "position": "服务员", "score": 87.6, "store": "分店A"},
	}
}
