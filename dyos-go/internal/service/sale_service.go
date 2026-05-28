package service

import (
	"math/rand"
	"time"

	"dyos-go/internal/model"

	"gorm.io/gorm"
)

type SaleService struct{ db *gorm.DB }

func NewSaleService(db *gorm.DB) *SaleService { return &SaleService{db: db} }

func (s *SaleService) List(page, size int, status, region string) (map[string]interface{}, error) {
	if size <= 0 { size = 20 }
	if page <= 0 { page = 1 }
	regions := []string{"华东", "华南", "华北", "西南", "华中"}
	items := make([]model.Sale, size)
	for i := range items {
		items[i] = model.Sale{
			ID: uint((page-1)*size + i + 1), Name: "业务员" + string(rune('A'+i%26)),
			Phone: "139****" + string(rune('0'+i%10)), Region: regions[i%len(regions)],
			Status: []string{"active", "active", "active", "inactive"}[i%4],
			Customers: 5 + rand.Intn(30), ThisMonthSign: rand.Intn(5),
		}
	}
	return map[string]interface{}{"items": items, "total": int64(89), "page": page, "size": size}, nil
}

func (s *SaleService) Stats() map[string]interface{} {
	return map[string]interface{}{
		"total_sales": 89, "active_sales": 72, "total_customers": 1856,
		"this_month_sign": 42, "avg_customers": 20.8,
	}
}

func (s *SaleService) Get(id uint) (*model.Sale, error) {
	if s.db == nil {
		return &model.Sale{ID: id, Name: "示例业务员", Phone: "13900001111", Region: "华东", Status: "active", Customers: 25, ThisMonthSign: 3}, nil
	}
	var sale model.Sale
	if err := s.db.First(&sale, id).Error; err != nil { return nil, err }
	return &sale, nil
}

func (s *SaleService) Create(sale *model.Sale) error {
	if s.db == nil { return nil }
	return s.db.Create(sale).Error
}

func (s *SaleService) Update(id uint, updates map[string]interface{}) error {
	if s.db == nil { return nil }
	return s.db.Model(&model.Sale{}).Where("id = ?", id).Updates(updates).Error
}

func (s *SaleService) Delete(id uint) error {
	if s.db == nil { return nil }
	return s.db.Delete(&model.Sale{}, id).Error
}

func (s *SaleService) Assignments(page, size int) (map[string]interface{}, error) {
	if size <= 0 { size = 20 }
	if page <= 0 { page = 1 }
	items := make([]model.CustomerAssign, size)
	for i := range items {
		items[i] = model.CustomerAssign{
			ID: uint((page-1)*size + i + 1), CustomerID: uint(1000 + i),
			CustomerName: "客户" + string(rune('A'+i%26)), CurrentOwner: "业务员" + string(rune('A'+i%5)),
			NewOwner: "业务员" + string(rune('B'+i%5)),
			AssignTime: time.Now().Add(-time.Duration(rand.Intn(30)*24)*time.Hour).Format("2006-01-02 15:04:05"),
		}
	}
	return map[string]interface{}{"items": items, "total": int64(245), "page": page, "size": size}, nil
}

func (s *SaleService) Assign(customerID uint, newOwner string) (uint, error) { return uint(rand.Intn(500) + 500), nil }

func (s *SaleService) Visits(page, size int, saleID string) (map[string]interface{}, error) {
	if size <= 0 { size = 20 }
	if page <= 0 { page = 1 }
	items := make([]model.VisitRecord, size)
	for i := range items {
		items[i] = model.VisitRecord{
			ID: uint((page-1)*size + i + 1),
			Merchant: []string{"旗舰店", "分店A", "分店B", "分店C"}[i%4],
			Salesman: "业务员" + string(rune('A'+i%5)),
			Type: []string{"电话拜访", "上门拜访", "线上会议", "活动邀约"}[i%4],
			Content: "沟通了新功能使用情况，商户表示满意",
			Time: time.Now().Add(-time.Duration(rand.Intn(14)*24)*time.Hour).Format("2006-01-02 15:04:05"),
			NextVisit: time.Now().Add(time.Duration(rand.Intn(7)*24)*time.Hour).Format("2006-01-02"),
		}
	}
	return map[string]interface{}{"items": items, "total": int64(520), "page": page, "size": size}, nil
}

func (s *SaleService) CreateVisit(v *model.VisitRecord) error {
	if s.db == nil { return nil }
	return s.db.Create(v).Error
}

func (s *SaleService) Performance(page, size int) (map[string]interface{}, error) {
	if size <= 0 { size = 20 }
	if page <= 0 { page = 1 }
	items := make([]map[string]interface{}, size)
	for i := range items {
		items[i] = map[string]interface{}{
			"id": uint((page-1)*size + i + 1), "name": "业务员" + string(rune('A'+i%26)),
			"customers": 15 + rand.Intn(30), "sign_this_month": rand.Intn(8),
			"gmv_this_month": float64(30000 + rand.Intn(200000)),
			"rank": i + 1, "score": float64(70 + rand.Intn(30)),
		}
	}
	return map[string]interface{}{"items": items, "total": int64(89), "page": page, "size": size}, nil
}
