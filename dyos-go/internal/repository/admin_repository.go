package repository

import (
	"errors"

	"dyos-go/internal/model"

	"gorm.io/gorm"
)

type PageResult[T any] struct {
	Items []T   `json:"items"`
	Total int64 `json:"total"`
	Page  int   `json:"page,omitempty"`
	Size  int   `json:"size,omitempty"`
}

var errDatabaseUnavailable = errors.New("数据库连接不可用")

type AdminRepository struct {
	db *gorm.DB
}

func NewAdminRepository(db *gorm.DB) *AdminRepository {
	return &AdminRepository{db: db}
}

func (r *AdminRepository) database() (*gorm.DB, error) {
	if r == nil || r.db == nil {
		return nil, errDatabaseUnavailable
	}
	return r.db, nil
}

func (r *AdminRepository) ListAgents(page int, size int, level string, status string, keyword string) (PageResult[model.Agent], error) {
	query := r.db.Model(&model.Agent{})
	if level != "" {
		query = query.Where("level = ?", level)
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}
	if keyword != "" {
		query = query.Where("name LIKE ?", "%"+keyword+"%")
	}
	return pageFind[model.Agent](query, page, size, "id DESC")
}

func (r *AdminRepository) AgentStats() (map[string]interface{}, error) {
	db, err := r.database()
	if err != nil {
		return nil, err
	}
	var stats struct {
		Total          int64   `gorm:"column:total"`
		TotalMerchants int64   `gorm:"column:total_merchants"`
		TotalGMV       float64 `gorm:"column:total_gmv"`
	}
	if err := db.Model(&model.Agent{}).Select("COUNT(*) as total, COALESCE(SUM(merchants), 0) as total_merchants, COALESCE(SUM(monthly_gmv), 0) as total_gmv").Scan(&stats).Error; err != nil {
		return nil, err
	}
	return map[string]interface{}{"total": stats.Total, "total_merchants": stats.TotalMerchants, "total_gmv": stats.TotalGMV}, nil
}

func (r *AdminRepository) GetAgent(id uint) (*model.Agent, error) {
	var item model.Agent
	if err := r.db.First(&item, id).Error; err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *AdminRepository) CreateAgent(item *model.Agent) error { return r.db.Create(item).Error }
func (r *AdminRepository) UpdateAgent(id uint, updates map[string]interface{}) error {
	return r.db.Model(&model.Agent{}).Where("id = ?", id).Updates(updates).Error
}
func (r *AdminRepository) DeleteAgent(id uint) error { return r.db.Delete(&model.Agent{}, id).Error }

func (r *AdminRepository) AgentMerchants(page int, size int) (PageResult[model.Merchant], error) {
	return pageFind[model.Merchant](r.db.Model(&model.Merchant{}), page, size, "id DESC")
}

func (r *AdminRepository) AgentCommissions(agentName string) ([]model.SettlementRecord, error) {
	items := make([]model.SettlementRecord, 0)
	err := r.db.Where("agent = ?", agentName).Find(&items).Error
	return items, err
}

func (r *AdminRepository) ServiceProviders(page int, size int, qualification string) (PageResult[model.ServiceProvider], error) {
	query := r.db.Model(&model.ServiceProvider{})
	if qualification != "" {
		query = query.Where("qualification = ?", qualification)
	}
	return pageFind[model.ServiceProvider](query, page, size, "id DESC")
}

func (r *AdminRepository) AgentDashboard() (map[string]interface{}, error) {
	items := make([]model.Agent, 0)
	if err := r.db.Where("status = ?", "active").Order("monthly_gmv DESC").Find(&items).Error; err != nil {
		return nil, err
	}
	var totalGMV float64
	for _, item := range items {
		totalGMV += item.MonthlyGMV
	}
	return map[string]interface{}{"agents": items, "total_agents": len(items), "total_gmv": totalGMV}, nil
}

func (r *AdminRepository) ListSales(page int, size int, status string, region string) (PageResult[model.Sale], error) {
	query := r.db.Model(&model.Sale{})
	if status != "" {
		query = query.Where("status = ?", status)
	}
	if region != "" {
		query = query.Where("region = ?", region)
	}
	return pageFind[model.Sale](query, page, size, "id DESC")
}

func (r *AdminRepository) SalesStats() (map[string]interface{}, error) {
	db, err := r.database()
	if err != nil {
		return nil, err
	}
	var stats struct {
		Total          int64 `gorm:"column:total"`
		Active         int64 `gorm:"column:active"`
		TotalCustomers int64 `gorm:"column:total_customers"`
	}
	if err := db.Model(&model.Sale{}).Select("COUNT(*) as total, SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active, COALESCE(SUM(customers), 0) as total_customers").Scan(&stats).Error; err != nil {
		return nil, err
	}
	return map[string]interface{}{"total": stats.Total, "active": stats.Active, "total_customers": stats.TotalCustomers}, nil
}

func (r *AdminRepository) GetSale(id uint) (*model.Sale, error) {
	var item model.Sale
	if err := r.db.First(&item, id).Error; err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *AdminRepository) CreateSale(item *model.Sale) error { return r.db.Create(item).Error }
func (r *AdminRepository) UpdateSale(id uint, updates map[string]interface{}) error {
	return r.db.Model(&model.Sale{}).Where("id = ?", id).Updates(updates).Error
}
func (r *AdminRepository) DeleteSale(id uint) error { return r.db.Delete(&model.Sale{}, id).Error }

func (r *AdminRepository) SalesPerformance(month string) (map[string]interface{}, error) {
	items := make([]model.Sale, 0)
	if err := r.db.Where("status = ?", "active").Order("this_month_sign DESC").Find(&items).Error; err != nil {
		return nil, err
	}
	totalSigns := 0
	for _, item := range items {
		totalSigns += item.ThisMonthSign
	}
	if month == "" {
		month = "2024-12"
	}
	return map[string]interface{}{"month": month, "sales": items, "total_signs": totalSigns}, nil
}

func (r *AdminRepository) CustomerAssigns(page int, size int) (PageResult[model.CustomerAssign], error) {
	return pageFind[model.CustomerAssign](r.db.Model(&model.CustomerAssign{}), page, size, "id DESC")
}

func (r *AdminRepository) CreateCustomerAssign(item *model.CustomerAssign) error {
	return r.db.Create(item).Error
}

func (r *AdminRepository) VisitRecords(page int, size int, salesman string) (PageResult[model.VisitRecord], error) {
	query := r.db.Model(&model.VisitRecord{})
	if salesman != "" {
		query = query.Where("salesman = ?", salesman)
	}
	return pageFind[model.VisitRecord](query, page, size, "id DESC")
}

func (r *AdminRepository) CreateVisitRecord(item *model.VisitRecord) error {
	return r.db.Create(item).Error
}

func (r *AdminRepository) RevenueByType() ([]map[string]interface{}, float64, error) {
	db, err := r.database()
	if err != nil {
		return nil, 0, err
	}
	var rows []struct {
		Type  string  `json:"type"`
		Total float64 `json:"total"`
		Count int64   `json:"count"`
	}
	if err := db.Model(&model.Transaction{}).Select("type, SUM(amount) as total, COUNT(*) as count").Where("status = ?", "success").Group("type").Scan(&rows).Error; err != nil {
		return nil, 0, err
	}
	items := make([]map[string]interface{}, 0, len(rows))
	for _, row := range rows {
		items = append(items, map[string]interface{}{"type": row.Type, "total": row.Total, "count": row.Count})
	}
	var totalRow struct {
		Total float64 `gorm:"column:total"`
	}
	if err := db.Model(&model.Transaction{}).Select("COALESCE(SUM(amount), 0) as total").Where("status = ?", "success").Scan(&totalRow).Error; err != nil {
		return nil, 0, err
	}
	return items, totalRow.Total, nil
}

func (r *AdminRepository) ListBilling(page int, size int, status string, merchant string) (PageResult[model.Transaction], error) {
	query := r.db.Model(&model.Transaction{})
	if status != "" {
		query = query.Where("status = ?", status)
	}
	if merchant != "" {
		query = query.Where("merchant LIKE ?", "%"+merchant+"%")
	}
	return pageFind[model.Transaction](query, page, size, "time DESC")
}

func (r *AdminRepository) GetBilling(id string) (*model.Transaction, error) {
	var item model.Transaction
	if err := r.db.First(&item, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *AdminRepository) ConfirmBilling(id string) error {
	return r.db.Model(&model.Transaction{}).Where("id = ?", id).Update("status", "success").Error
}

func (r *AdminRepository) ListRefunds(page int, size int, status string) (PageResult[model.Refund], error) {
	query := r.db.Model(&model.Refund{})
	if status != "" {
		query = query.Where("status = ?", status)
	}
	return pageFind[model.Refund](query, page, size, "id DESC")
}

func (r *AdminRepository) UpdateRefundStatus(id uint, status string) error {
	return r.db.Model(&model.Refund{}).Where("id = ?", id).Update("status", status).Error
}

func (r *AdminRepository) ListInvoices(page int, size int, status string) (PageResult[model.Invoice], error) {
	query := r.db.Model(&model.Invoice{})
	if status != "" {
		query = query.Where("status = ?", status)
	}
	return pageFind[model.Invoice](query, page, size, "id DESC")
}

func (r *AdminRepository) CreateInvoice(item *model.Invoice) error { return r.db.Create(item).Error }
func (r *AdminRepository) UpdateInvoiceStatus(id uint, status string) error {
	return r.db.Model(&model.Invoice{}).Where("id = ?", id).Update("status", status).Error
}

func pageFind[T any](query *gorm.DB, page int, size int, order string) (PageResult[T], error) {
	var total int64
	items := make([]T, 0)
	if err := query.Count(&total).Error; err != nil {
		return PageResult[T]{}, err
	}
	if err := query.Order(order).Limit(size).Offset((page - 1) * size).Find(&items).Error; err != nil {
		return PageResult[T]{}, err
	}
	return PageResult[T]{Items: items, Total: total, Page: page, Size: size}, nil
}
