package service

import (
	"encoding/json"
	"fmt"
	"time"

	"dyos-go/internal/model"
	"dyos-go/internal/repository"
)

type AdminV1Service struct {
	repo *repository.AdminV1Repository
}

func NewAdminV1Service(repo *repository.AdminV1Repository) *AdminV1Service {
	return &AdminV1Service{repo: repo}
}

type AnnouncementRequest struct {
	Title   string `json:"title" binding:"required"`
	Content string `json:"content"`
	Scope   string `json:"scope"`
	Status  string `json:"status"`
}

type ActivityRequest struct {
	Title     string `json:"title" binding:"required"`
	Type      string `json:"type"`
	StartTime string `json:"start_time"`
	EndTime   string `json:"end_time"`
	Status    string `json:"status"`
}

type PartnerRequest struct {
	Name            string `json:"name" binding:"required"`
	PartnerType     string `json:"partner_type"`
	CooperationTime string `json:"cooperation_time"`
}

type TicketRequest struct {
	Merchant string `json:"merchant" binding:"required"`
	Type     string `json:"type"`
	Title    string `json:"title" binding:"required"`
	Priority string `json:"priority"`
}

type TicketUpdateRequest struct {
	Status   string `json:"status"`
	Assignee string `json:"assignee"`
}

type FAQRequest struct {
	Category string `json:"category"`
	Question string `json:"question" binding:"required"`
	Answer   string `json:"answer"`
}

type ABTestRequest struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
}

type RoleRequest struct {
	Name        string   `json:"name" binding:"required"`
	Level       string   `json:"level"`
	Permissions []string `json:"permissions"`
}

func (s *AdminV1Service) ListKnowledge(page int, size int, category string, status string) (repository.PageResult[model.Knowledge], error) {
	return s.repo.ListKnowledge(page, size, category, status)
}
func (s *AdminV1Service) GetKnowledge(id uint) (*model.Knowledge, error) {
	return s.repo.GetKnowledge(id)
}
func (s *AdminV1Service) CreateKnowledge(title string, category string, content string) (uint, error) {
	item := &model.Knowledge{Title: title, Category: defaultString(category, "catering"), Status: "published", UpdateTime: today()}
	if err := s.repo.CreateKnowledge(item); err != nil {
		return 0, err
	}
	return item.ID, nil
}
func (s *AdminV1Service) UpdateKnowledgeStatus(id uint, status string) error {
	return s.repo.UpdateKnowledgeStatus(id, status)
}
func (s *AdminV1Service) ListAITemplates(page int, size int, category string) (repository.PageResult[model.AITemplate], error) {
	return s.repo.ListAITemplates(page, size, category)
}

func (s *AdminV1Service) ListAnnouncements(page int, size int, status string) (repository.PageResult[model.Announcement], error) {
	return s.repo.ListAnnouncements(page, size, status)
}
func (s *AdminV1Service) CreateAnnouncement(req AnnouncementRequest) (uint, error) {
	item := &model.Announcement{Title: req.Title, Content: req.Content, Scope: defaultString(req.Scope, "all"), Status: defaultString(req.Status, "published"), CreateTime: today()}
	if err := s.repo.CreateAnnouncement(item); err != nil {
		return 0, err
	}
	return item.ID, nil
}
func (s *AdminV1Service) UpdateAnnouncement(id uint, req AnnouncementRequest) error {
	updates := map[string]interface{}{}
	if req.Title != "" {
		updates["title"] = req.Title
	}
	if req.Content != "" {
		updates["content"] = req.Content
	}
	if req.Scope != "" {
		updates["scope"] = req.Scope
	}
	if req.Status != "" {
		updates["status"] = req.Status
	}
	return s.repo.UpdateAnnouncement(id, updates)
}
func (s *AdminV1Service) DeleteAnnouncement(id uint) error { return s.repo.DeleteAnnouncement(id) }

func (s *AdminV1Service) ListActivities(page int, size int, status string) (repository.PageResult[model.Activity], error) {
	return s.repo.ListActivities(page, size, status)
}
func (s *AdminV1Service) CreateActivity(req ActivityRequest) (uint, error) {
	item := &model.Activity{Title: req.Title, Type: req.Type, StartTime: req.StartTime, EndTime: req.EndTime, Status: defaultString(req.Status, "draft")}
	if err := s.repo.CreateActivity(item); err != nil {
		return 0, err
	}
	return item.ID, nil
}
func (s *AdminV1Service) UpdateActivity(id uint, req ActivityRequest) error {
	updates := map[string]interface{}{}
	if req.Title != "" {
		updates["title"] = req.Title
	}
	if req.Type != "" {
		updates["type"] = req.Type
	}
	if req.StartTime != "" {
		updates["start_time"] = req.StartTime
	}
	if req.EndTime != "" {
		updates["end_time"] = req.EndTime
	}
	if req.Status != "" {
		updates["status"] = req.Status
	}
	return s.repo.UpdateActivity(id, updates)
}

func (s *AdminV1Service) AnalyticsOverview() (map[string]interface{}, error) {
	stats, err := s.repo.MerchantStats()
	if err != nil {
		return nil, err
	}
	todayStats, _ := s.repo.TodayStats()
	stats["month_growth"] = 12.8
	stats["today_gmv"] = 0.0
	stats["today_orders"] = 0
	stats["ai_calls"] = 0
	stats["online_merchants"] = stats["active_merchants"]
	if todayStats != nil {
		if v, ok := todayStats["today_gmv"]; ok {
			stats["today_gmv"] = v
		}
		if v, ok := todayStats["today_orders"]; ok {
			stats["today_orders"] = v
		}
		if v, ok := todayStats["ai_calls"]; ok {
			stats["ai_calls"] = v
		}
		if v, ok := todayStats["online_merchants"]; ok {
			stats["online_merchants"] = v
		}
	}
	return stats, nil
}
func (s *AdminV1Service) GMVTrend(months int) map[string]interface{} {
	if months <= 0 || months > 12 {
		months = 12
	}
	trend := make([]map[string]interface{}, 0, months)
	base := 1200000
	for i := 1; i <= months; i++ {
		trend = append(trend, map[string]interface{}{"month": fmt.Sprintf("2024-%02d", i), "gmv": base + i*120000, "orders": 1200 + i*110})
	}
	return map[string]interface{}{"trend": trend}
}
func (s *AdminV1Service) IndustryReport() map[string]interface{} {
	return map[string]interface{}{"reports": []map[string]interface{}{{"industry": "餐饮", "merchants": 128, "avg_gmv": 68000, "avg_rating": 4.7, "ai_usage_rate": 82}, {"industry": "零售", "merchants": 96, "avg_gmv": 52000, "avg_rating": 4.6, "ai_usage_rate": 76}, {"industry": "休闲娱乐", "merchants": 48, "avg_gmv": 73000, "avg_rating": 4.8, "ai_usage_rate": 88}}}
}
func (s *AdminV1Service) AIStats() map[string]interface{} {
	return map[string]interface{}{"total_calls": 286000, "total_tokens": 9630000, "agents": 5, "monthly_trend": []map[string]interface{}{{"month": "2024-10", "calls": 68000}, {"month": "2024-11", "calls": 92000}, {"month": "2024-12", "calls": 126000}}}
}
func (s *AdminV1Service) ListChurnWarnings(page int, size int, threshold int) (repository.PageResult[model.ChurnWarning], error) {
	return s.repo.ListChurnWarnings(page, size, threshold)
}
func (s *AdminV1Service) GetChurnWarning(id uint) (*model.ChurnWarning, error) {
	return s.repo.GetChurnWarning(id)
}

func (s *AdminV1Service) ListPaymentTransactions(page int, size int, status string, merchant string) (repository.PageResult[model.Transaction], error) {
	return s.repo.ListPaymentTransactions(page, size, status, merchant)
}
func (s *AdminV1Service) GetPaymentTransaction(id string) (*model.Transaction, error) {
	return s.repo.GetPaymentTransaction(id)
}
func (s *AdminV1Service) ListPaymentChannels() ([]model.PaymentChannel, error) {
	return s.repo.ListPaymentChannels()
}
func (s *AdminV1Service) UpdatePaymentChannel(name string, status string, fee float64) error {
	updates := map[string]interface{}{}
	if status != "" {
		updates["status"] = status
	}
	if fee > 0 {
		updates["success_rate"] = fee
	}
	return s.repo.UpdatePaymentChannel(name, updates)
}
func (s *AdminV1Service) SplitPayment(page int, size int) map[string]interface{} {
	items := []map[string]interface{}{{"transaction_id": "T20241201001", "merchant": "示例门店", "amount": 2999, "platform_fee": 299.9, "agent_commission": 149.95, "actual_amount": 2549.15}}
	return map[string]interface{}{"items": items, "total": len(items), "page": page, "size": size}
}
func (s *AdminV1Service) Reconciliation(month string) map[string]interface{} {
	if month == "" {
		month = time.Now().Format("2006-01")
	}
	return map[string]interface{}{"month": month, "settlements": []map[string]interface{}{}, "total_payable": 0, "total_settled": 0, "pending": 0}
}

func (s *AdminV1Service) Onboarding(page int, size int) map[string]interface{} {
	return map[string]interface{}{"items": []map[string]interface{}{}, "total": 0, "page": page, "size": size}
}
func (s *AdminV1Service) OnboardingDetail(id uint) map[string]interface{} {
	steps := []map[string]interface{}{{"step": 1, "title": "账号开通", "status": "completed", "completed_time": today()}, {"step": 2, "title": "资料完善", "status": "pending", "completed_time": ""}}
	return map[string]interface{}{"merchant_id": id, "merchant_name": "", "progress": 50, "steps": steps}
}
func (s *AdminV1Service) HealthScore(page int, size int, threshold int) map[string]interface{} {
	return map[string]interface{}{"items": []map[string]interface{}{}, "total": 0, "page": page, "size": size, "threshold": threshold}
}
func (s *AdminV1Service) Renewal(page int, size int, days int) map[string]interface{} {
	return map[string]interface{}{"items": []map[string]interface{}{}, "total": 0, "page": page, "size": size, "days_threshold": days}
}
func (s *AdminV1Service) UpgradeFunnel() map[string]interface{} {
	return map[string]interface{}{"funnel": []map[string]interface{}{{"version": "基础版", "count": 120, "upgrades": 18}, {"version": "专业版", "count": 68, "upgrades": 12}, {"version": "旗舰版", "count": 24, "upgrades": 0}}}
}
func (s *AdminV1Service) WakeUp(page int, size int) map[string]interface{} {
	return map[string]interface{}{"items": []map[string]interface{}{}, "total": 0, "page": page, "size": size}
}

func (s *AdminV1Service) ChannelAnalysis() (map[string]interface{}, error) {
	channels, err := s.repo.ListChannelAnalysis()
	if err != nil {
		return nil, err
	}
	summary := map[string]interface{}{"total_leads": 0, "total_converted": 0, "overall_rate": 0, "total_cost": 0, "avg_cost_per_lead": 0}
	leads := 0
	converted := 0
	cost := 0.0
	for _, item := range channels {
		leads += item.Leads
		converted += item.Converted
		cost += item.Cost
	}
	if leads > 0 {
		summary["overall_rate"] = float64(converted) * 100 / float64(leads)
		summary["avg_cost_per_lead"] = cost / float64(leads)
	}
	summary["total_leads"] = leads
	summary["total_converted"] = converted
	summary["total_cost"] = cost
	return map[string]interface{}{"channels": channels, "summary": summary}, nil
}
func (s *AdminV1Service) InviteFission() map[string]interface{} {
	return map[string]interface{}{"total_invites": 1680, "successful_invites": 326, "reward_given": 65200, "conversion_rate": 19.4, "top_inviters": []map[string]interface{}{}}
}
func (s *AdminV1Service) Trial() map[string]interface{} {
	return map[string]interface{}{"total": 280, "active": 96, "converted": 84, "expired": 100, "conversion_rate": 30, "avg_trial_days": 10}
}
func (s *AdminV1Service) ListPartners(page int, size int, status string) (repository.PageResult[model.Partner], error) {
	return s.repo.ListPartners(page, size, status)
}
func (s *AdminV1Service) CreatePartner(req PartnerRequest) (uint, error) {
	item := &model.Partner{Name: req.Name, Type: req.PartnerType, Status: "active", CooperationTime: req.CooperationTime}
	if err := s.repo.CreatePartner(item); err != nil {
		return 0, err
	}
	return item.ID, nil
}

func (s *AdminV1Service) ListTickets(page int, size int, status string, priority string) (repository.PageResult[model.Ticket], error) {
	return s.repo.ListTickets(page, size, status, priority)
}
func (s *AdminV1Service) CreateTicket(req TicketRequest) (string, error) {
	id := fmt.Sprintf("TK%d", time.Now().UnixNano())
	item := &model.Ticket{ID: id, Merchant: req.Merchant, Type: req.Type, Title: req.Title, Status: "open", Priority: defaultString(req.Priority, "medium"), CreateTime: nowMinute()}
	if err := s.repo.CreateTicket(item); err != nil {
		return "", err
	}
	return id, nil
}
func (s *AdminV1Service) UpdateTicket(id string, req TicketUpdateRequest) error {
	updates := map[string]interface{}{}
	if req.Status != "" {
		updates["status"] = req.Status
	}
	if req.Assignee != "" {
		updates["assignee"] = req.Assignee
	}
	return s.repo.UpdateTicket(id, updates)
}
func (s *AdminV1Service) ListFAQ(page int, size int, category string) (repository.PageResult[model.FAQ], error) {
	return s.repo.ListFAQ(page, size, category)
}
func (s *AdminV1Service) CreateFAQ(req FAQRequest) (uint, error) {
	item := &model.FAQ{Category: req.Category, Question: req.Question, Answer: req.Answer, Status: "published"}
	if err := s.repo.CreateFAQ(item); err != nil {
		return 0, err
	}
	return item.ID, nil
}
func (s *AdminV1Service) Satisfaction() map[string]interface{} {
	return map[string]interface{}{"nps_score": 62, "promoters": 126, "passives": 48, "detractors": 18, "avg_score": 4.6, "total_responses": 192}
}

func (s *AdminV1Service) ListFeatureFlags(page int, size int, status string) (repository.PageResult[model.FeatureFlag], error) {
	return s.repo.ListFeatureFlags(page, size, status)
}
func (s *AdminV1Service) UpdateFeatureFlag(id uint, status string) error {
	return s.repo.UpdateFeatureFlag(id, status)
}
func (s *AdminV1Service) ABTests(page int, size int) map[string]interface{} {
	return map[string]interface{}{"items": []map[string]interface{}{}, "total": 0, "page": page, "size": size}
}
func (s *AdminV1Service) CreateABTest(req ABTestRequest) map[string]interface{} {
	return map[string]interface{}{"id": time.Now().Unix(), "name": req.Name, "description": req.Description}
}
func (s *AdminV1Service) ListRequirements(page int, size int, status string) (repository.PageResult[model.Requirement], error) {
	return s.repo.ListRequirements(page, size, status)
}
func (s *AdminV1Service) VoteRequirement(id uint) error { return s.repo.VoteRequirement(id) }
func (s *AdminV1Service) ListVersions(page int, size int) (repository.PageResult[model.Version], error) {
	return s.repo.ListVersions(page, size)
}

func (s *AdminV1Service) ListLoginLogs(page int, size int, status string) (repository.PageResult[model.LoginLog], error) {
	return s.repo.ListLoginLogs(page, size, status)
}
func (s *AdminV1Service) DataMaskingRules() []model.DataMaskingRule {
	return []model.DataMaskingRule{{ID: 1, Field: "phone", Type: "手机号", Pattern: "中间四位脱敏", Enabled: true}, {ID: 2, Field: "id_card", Type: "身份证", Pattern: "保留前后四位", Enabled: true}}
}
func (s *AdminV1Service) Compliance(page int, size int) map[string]interface{} {
	return map[string]interface{}{"items": []map[string]interface{}{}, "total": 0, "page": page, "size": size}
}

func (s *AdminV1Service) ListRoles(page int, size int) (repository.PageResult[model.Role], error) {
	return s.repo.ListRoles(page, size)
}
func (s *AdminV1Service) CreateRole(req RoleRequest) (uint, error) {
	permissions, _ := json.Marshal(req.Permissions)
	item := &model.Role{Name: req.Name, Level: req.Level, Permissions: string(permissions)}
	if err := s.repo.CreateRole(item); err != nil {
		return 0, err
	}
	return item.ID, nil
}
func (s *AdminV1Service) UpdateRole(id uint, req RoleRequest) error {
	updates := map[string]interface{}{}
	if req.Name != "" {
		updates["name"] = req.Name
	}
	if req.Level != "" {
		updates["level"] = req.Level
	}
	if req.Permissions != nil {
		permissions, _ := json.Marshal(req.Permissions)
		updates["permissions"] = string(permissions)
	}
	return s.repo.UpdateRole(id, updates)
}
func (s *AdminV1Service) ListOperationLogs(page int, size int, operator string, logType string) (repository.PageResult[model.OperationLog], error) {
	return s.repo.ListOperationLogs(page, size, operator, logType)
}
func (s *AdminV1Service) ListPricing() ([]model.Pricing, error) { return s.repo.ListPricing() }
func (s *AdminV1Service) UpdatePricing(version string, price float64, features string) error {
	updates := map[string]interface{}{}
	if price > 0 {
		updates["price"] = price
	}
	if features != "" {
		updates["features"] = features
	}
	return s.repo.UpdatePricing(version, updates)
}
func (s *AdminV1Service) Notifications(page int, size int, status string) map[string]interface{} {
	items := []model.Notification{{ID: 1, Title: "系统通知", Content: "欢迎使用店赢OS", Type: "system", Status: defaultString(status, "unread"), CreateTime: nowMinute()}}
	return map[string]interface{}{"items": items, "total": len(items), "page": page, "size": size}
}
