package service

import (
	"time"

	"dyos-go/internal/model"
	"dyos-go/internal/repository"
)

type AgentCreateRequest struct {
	Name    string `json:"name" binding:"required"`
	Level   string `json:"level"`
	Region  string `json:"region"`
	Contact string `json:"contact"`
}

type AgentUpdateRequest struct {
	Name   *string `json:"name"`
	Level  *string `json:"level"`
	Status *string `json:"status"`
	Region *string `json:"region"`
}

type SaleCreateRequest struct {
	Name   string `json:"name" binding:"required"`
	Phone  string `json:"phone"`
	Region string `json:"region"`
}

type CustomerAssignRequest struct {
	CustomerID uint   `json:"customer_id" binding:"required"`
	NewOwner   string `json:"new_owner"`
	SalesID    uint   `json:"sales_id"`
}

type VisitCreateRequest struct {
	Merchant  string `json:"merchant"`
	Salesman  string `json:"salesman"`
	Type      string `json:"type"`
	Content   string `json:"content"`
	NextVisit string `json:"next_visit"`
}

type InvoiceCreateRequest struct {
	Merchant string  `json:"merchant"`
	Type     string  `json:"type"`
	Amount   float64 `json:"amount"`
}

type AdminService struct {
	repo *repository.AdminRepository
}

func NewAdminService(repo *repository.AdminRepository) *AdminService {
	return &AdminService{repo: repo}
}

func (s *AdminService) ListAgents(page int, size int, level string, status string, keyword string) (repository.PageResult[model.Agent], error) {
	return s.repo.ListAgents(page, size, level, status, keyword)
}
func (s *AdminService) AgentStats() (map[string]interface{}, error) { return s.repo.AgentStats() }
func (s *AdminService) GetAgent(id uint) (*model.Agent, error)      { return s.repo.GetAgent(id) }
func (s *AdminService) CreateAgent(req AgentCreateRequest) (uint, error) {
	item := &model.Agent{Name: req.Name, Level: defaultString(req.Level, "silver"), Region: req.Region, Contact: req.Contact, Status: "active", JoinTime: today()}
	if err := s.repo.CreateAgent(item); err != nil {
		return 0, err
	}
	return item.ID, nil
}
func (s *AdminService) UpdateAgent(id uint, req AgentUpdateRequest) error {
	updates := map[string]interface{}{}
	if req.Name != nil {
		updates["name"] = *req.Name
	}
	if req.Level != nil {
		updates["level"] = *req.Level
	}
	if req.Status != nil {
		updates["status"] = *req.Status
	}
	if req.Region != nil {
		updates["region"] = *req.Region
	}
	return s.repo.UpdateAgent(id, updates)
}
func (s *AdminService) DeleteAgent(id uint) error { return s.repo.DeleteAgent(id) }
func (s *AdminService) AgentMerchants(page int, size int) (repository.PageResult[model.Merchant], error) {
	return s.repo.AgentMerchants(page, size)
}
func (s *AdminService) AgentCommission(id uint) (map[string]interface{}, error) {
	agent, err := s.repo.GetAgent(id)
	if err != nil {
		return nil, err
	}
	items, err := s.repo.AgentCommissions(agent.Name)
	if err != nil {
		return nil, err
	}
	return map[string]interface{}{"agent_id": id, "agent_name": agent.Name, "commissions": items}, nil
}
func (s *AdminService) ServiceProviders(page int, size int, qualification string) (repository.PageResult[model.ServiceProvider], error) {
	return s.repo.ServiceProviders(page, size, qualification)
}
func (s *AdminService) AgentDashboard() (map[string]interface{}, error) {
	return s.repo.AgentDashboard()
}

func (s *AdminService) ListSales(page int, size int, status string, region string) (repository.PageResult[model.Sale], error) {
	return s.repo.ListSales(page, size, status, region)
}
func (s *AdminService) SalesStats() (map[string]interface{}, error) { return s.repo.SalesStats() }
func (s *AdminService) GetSale(id uint) (*model.Sale, error)        { return s.repo.GetSale(id) }
func (s *AdminService) CreateSale(req SaleCreateRequest) (uint, error) {
	item := &model.Sale{Name: req.Name, Phone: req.Phone, Region: req.Region, Status: "active"}
	if err := s.repo.CreateSale(item); err != nil {
		return 0, err
	}
	return item.ID, nil
}
func (s *AdminService) UpdateSale(id uint, req SaleCreateRequest) error {
	return s.repo.UpdateSale(id, map[string]interface{}{"name": req.Name, "phone": req.Phone, "region": req.Region})
}
func (s *AdminService) DeleteSale(id uint) error { return s.repo.DeleteSale(id) }
func (s *AdminService) SalesPerformance(month string) (map[string]interface{}, error) {
	return s.repo.SalesPerformance(month)
}
func (s *AdminService) CustomerAssigns(page int, size int) (repository.PageResult[model.CustomerAssign], error) {
	return s.repo.CustomerAssigns(page, size)
}
func (s *AdminService) CreateCustomerAssign(req CustomerAssignRequest) (uint, error) {
	item := &model.CustomerAssign{CustomerID: req.CustomerID, NewOwner: req.NewOwner, AssignTime: nowMinute()}
	if err := s.repo.CreateCustomerAssign(item); err != nil {
		return 0, err
	}
	return item.ID, nil
}
func (s *AdminService) VisitRecords(page int, size int, salesman string) (repository.PageResult[model.VisitRecord], error) {
	return s.repo.VisitRecords(page, size, salesman)
}
func (s *AdminService) CreateVisitRecord(req VisitCreateRequest) (uint, error) {
	item := &model.VisitRecord{Merchant: req.Merchant, Salesman: req.Salesman, Type: defaultString(req.Type, "电话回访"), Content: req.Content, Time: nowMinute(), NextVisit: req.NextVisit}
	if err := s.repo.CreateVisitRecord(item); err != nil {
		return 0, err
	}
	return item.ID, nil
}

func (s *AdminService) RevenueTrend(months int) map[string]interface{} {
	trend := []map[string]interface{}{{"month": "2024-01", "amount": 1250000}, {"month": "2024-02", "amount": 1380000}, {"month": "2024-03", "amount": 1420000}, {"month": "2024-04", "amount": 1560000}, {"month": "2024-05", "amount": 1680000}, {"month": "2024-06", "amount": 1750000}, {"month": "2024-07", "amount": 1820000}, {"month": "2024-08", "amount": 1950000}, {"month": "2024-09", "amount": 2080000}, {"month": "2024-10", "amount": 2250000}, {"month": "2024-11", "amount": 2380000}, {"month": "2024-12", "amount": 2560000}}
	if months <= 0 || months > len(trend) {
		months = len(trend)
	}
	selected := trend[:months]
	total := 0
	for _, item := range selected {
		total += item["amount"].(int)
	}
	return map[string]interface{}{"trend": selected, "total": total}
}
func (s *AdminService) RevenueStats() (map[string]interface{}, error) {
	byType, total, err := s.repo.RevenueByType()
	if err != nil {
		return nil, err
	}
	return map[string]interface{}{"total": total, "by_type": byType, "month": 2560000, "growth": 7.6}, nil
}
func (s *AdminService) ListBilling(page int, size int, status string, merchant string) (repository.PageResult[model.Transaction], error) {
	return s.repo.ListBilling(page, size, status, merchant)
}
func (s *AdminService) GetBilling(id string) (*model.Transaction, error) {
	return s.repo.GetBilling(id)
}
func (s *AdminService) ConfirmBilling(id string) error { return s.repo.ConfirmBilling(id) }
func (s *AdminService) ListRefunds(page int, size int, status string) (repository.PageResult[model.Refund], error) {
	return s.repo.ListRefunds(page, size, status)
}
func (s *AdminService) UpdateRefundStatus(id uint, status string) error {
	return s.repo.UpdateRefundStatus(id, status)
}
func (s *AdminService) ListInvoices(page int, size int, status string) (repository.PageResult[model.Invoice], error) {
	return s.repo.ListInvoices(page, size, status)
}
func (s *AdminService) CreateInvoice(req InvoiceCreateRequest) (uint, error) {
	item := &model.Invoice{Merchant: req.Merchant, Type: defaultString(req.Type, "普票"), Amount: req.Amount, Status: "pending", ApplyTime: today()}
	if err := s.repo.CreateInvoice(item); err != nil {
		return 0, err
	}
	return item.ID, nil
}
func (s *AdminService) UpdateInvoiceStatus(id uint, status string) error {
	return s.repo.UpdateInvoiceStatus(id, status)
}

func today() string     { return time.Now().Format("2006-01-02") }
func nowMinute() string { return time.Now().Format("2006-01-02 15:04") }
