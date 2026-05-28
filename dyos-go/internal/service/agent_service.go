package service

import (
	"dyos-go/internal/model"

	"gorm.io/gorm"
)

type AgentService struct{ db *gorm.DB }

func NewAgentService(db *gorm.DB) *AgentService { return &AgentService{db: db} }

func (s *AgentService) List(page, size int, level, status, region string) (map[string]interface{}, error) {
	if size <= 0 { size = 20 }
	if page <= 0 { page = 1 }
	if s.db == nil {
		return map[string]interface{}{"items": []model.Agent{}, "total": int64(0), "page": page, "size": size}, nil
	}
	q := s.db.Model(&model.Agent{})
	if level != "" { q = q.Where("level = ?", level) }
	if status != "" { q = q.Where("status = ?", status) }
	if region != "" { q = q.Where("region = ?", region) }
	var total int64
	q.Count(&total)
	var items []model.Agent
	q.Offset((page - 1) * size).Limit(size).Find(&items)
	return map[string]interface{}{"items": items, "total": total, "page": page, "size": size}, nil
}

func (s *AgentService) Stats() map[string]interface{} {
	if s.db == nil {
		return map[string]interface{}{"total_agents": 0, "active_agents": 0, "total_merchants": 0, "monthly_gmv": 0.0, "avg_commission": 0.0}
	}
	var totalAgents, activeAgents, totalMerchants int64
	s.db.Model(&model.Agent{}).Count(&totalAgents)
	s.db.Model(&model.Agent{}).Where("status = ?", "active").Count(&activeAgents)
	s.db.Model(&model.Store{}).Distinct("merchant_id").Count(&totalMerchants)
	var monthlyGMV float64
	s.db.Model(&model.Transaction{}).Where("status = ? AND time >= DATE_FORMAT(NOW(), '%Y-%m-01')", "success").Select("COALESCE(SUM(amount),0)").Row().Scan(&monthlyGMV)
	return map[string]interface{}{
		"total_agents": totalAgents, "active_agents": activeAgents, "total_merchants": totalMerchants,
		"monthly_gmv": monthlyGMV, "avg_commission": 8.5,
	}
}

func (s *AgentService) Get(id uint) (*model.Agent, error) {
	if s.db == nil {
		return &model.Agent{ID: id, Name: "-", Level: "-", Status: "inactive"}, nil
	}
	var a model.Agent
	if err := s.db.First(&a, id).Error; err != nil { return nil, err }
	return &a, nil
}

func (s *AgentService) Create(a *model.Agent) error {
	if s.db == nil { return gorm.ErrInvalidDB }
	return s.db.Create(a).Error
}

func (s *AgentService) Update(id uint, updates map[string]interface{}) error {
	if s.db == nil { return gorm.ErrInvalidDB }
	return s.db.Model(&model.Agent{}).Where("id = ?", id).Updates(updates).Error
}

func (s *AgentService) Delete(id uint) error {
	if s.db == nil { return gorm.ErrInvalidDB }
	return s.db.Delete(&model.Agent{}, id).Error
}

func (s *AgentService) Settlements(page, size int, month string) (map[string]interface{}, error) {
	if size <= 0 { size = 20 }
	if page <= 0 { page = 1 }
	if s.db == nil {
		return map[string]interface{}{"items": []model.SettlementRecord{}, "total": int64(0), "page": page, "size": size}, nil
	}
	q := s.db.Model(&model.SettlementRecord{})
	if month != "" { q = q.Where("month = ?", month) }
	var total int64
	q.Count(&total)
	var items []model.SettlementRecord
	q.Offset((page - 1) * size).Limit(size).Order("settle_time DESC").Find(&items)
	return map[string]interface{}{"items": items, "total": total, "page": page, "size": size}, nil
}

func (s *AgentService) Settle(agentID uint, month string) error {
	if s.db == nil { return gorm.ErrInvalidDB }
	var a model.Agent
	if err := s.db.First(&a, agentID).Error; err != nil { return err }
	// 从stores统计该代理商下商户当月GMV
	var monthlyGMV float64
	s.db.Model(&model.Transaction{}).
		Joins("JOIN stores ON stores.merchant_id = transactions.store_id").
		Where("stores.agent_id = ? AND transactions.status = ? AND transactions.time LIKE ?", agentID, "success", month+"%").
		Select("COALESCE(SUM(transactions.amount),0)").Row().Scan(&monthlyGMV)
	commission := monthlyGMV * 0.085 // 8.5% 默认佣金率
	return s.db.Create(&model.SettlementRecord{
		Agent: a.Name, Month: month,
		Payable: commission, Actual: commission,
		Status: "待结算", SettleTime: "",
	}).Error
}

func (s *AgentService) Providers(page, size int) (map[string]interface{}, error) {
	if size <= 0 { size = 20 }
	if page <= 0 { page = 1 }
	if s.db == nil {
		return map[string]interface{}{"items": []model.ServiceProvider{}, "total": int64(0), "page": page, "size": size}, nil
	}
	var total int64
	s.db.Model(&model.ServiceProvider{}).Count(&total)
	var items []model.ServiceProvider
	s.db.Offset((page - 1) * size).Limit(size).Find(&items)
	return map[string]interface{}{"items": items, "total": total, "page": page, "size": size}, nil
}

func (s *AgentService) CreateProvider(p *model.ServiceProvider) error {
	if s.db == nil { return gorm.ErrInvalidDB }
	return s.db.Create(p).Error
}

func (s *AgentService) Dashboard() map[string]interface{} {
	stats := s.Stats()
	if s.db == nil {
		stats["top_agents"] = []map[string]interface{}{}
		stats["trend"] = []map[string]interface{}{}
		return stats
	}
	// Top代理商：名下商户GMV最高的前5
	type topRow struct {
		AgentID uint; Name string; TotalGMV float64; MerchantCount int64
	}
	var tops []topRow
	s.db.Model(&model.Transaction{}).
		Select("stores.agent_id, agents.name, COALESCE(SUM(transactions.amount),0) as total_gmv, COUNT(DISTINCT stores.merchant_id) as merchant_count").
		Joins("JOIN stores ON stores.id = transactions.store_id").
		Joins("JOIN agents ON agents.id = stores.agent_id").
		Where("transactions.status = ?", "success").
		Group("stores.agent_id, agents.name").Order("total_gmv DESC").Limit(5).Find(&tops)
	topList := make([]map[string]interface{}, len(tops))
	for i, t := range tops {
		topList[i] = map[string]interface{}{"name": t.Name, "gmv": t.TotalGMV, "merchants": t.MerchantCount}
	}
	stats["top_agents"] = topList
	// GMV 趋势：最近5个月
	var trends []map[string]interface{}
	s.db.Model(&model.Transaction{}).
		Select("DATE_FORMAT(time, '%Y-%m') as month, COALESCE(SUM(amount),0) as gmv").
		Where("status = ? AND time >= DATE_SUB(NOW(), INTERVAL 5 MONTH)", "success").
		Group("month").Order("month ASC").Find(&trends)
	stats["trend"] = trends
	return stats
}

func (s *AgentService) AgentMerchants(agentID uint) (map[string]interface{}, error) {
	if s.db == nil {
		return map[string]interface{}{"items": []map[string]interface{}{}, "total": int64(0)}, nil
	}
	type merchantRow struct {
		ID uint; Name string; Industry string; Status string; JoinTime string; MonthlyGMV float64
	}
	var rows []merchantRow
	// 通过 stores 表关联该代理商下的商户
	s.db.Model(&model.Store{}).
		Select("stores.id, stores.name, stores.category as industry, CASE WHEN stores.status = 1 THEN 'active' ELSE 'inactive' END as status, stores.created_at as join_time, COALESCE(pm.total_amount, 0) as monthly_gmv").
		Joins("LEFT JOIN payment_merchants pm ON pm.merchant_id = stores.merchant_id").
		Where("stores.agent_id = ?", agentID).Find(&rows)
	items := make([]map[string]interface{}, len(rows))
	for i, r := range rows {
		items[i] = map[string]interface{}{
			"id": r.ID, "name": r.Name, "industry": r.Industry,
			"status": r.Status, "join_time": r.JoinTime, "monthly_gmv": r.MonthlyGMV,
		}
	}
	return map[string]interface{}{"items": items, "total": int64(len(rows))}, nil
}

func (s *AgentService) AgentCommission(agentID uint) map[string]interface{} {
	if s.db == nil {
		return map[string]interface{}{"agent_id": agentID, "total_commission": 0, "paid": 0, "pending": 0, "rate": 0, "history": []map[string]interface{}{}}
	}
	// 从 settlement_records 统计该代理商佣金
	var totalCommission, paid, pending float64
	s.db.Model(&model.SettlementRecord{}).
		Where("agent = (SELECT name FROM agents WHERE id = ?)", agentID).
		Select("COALESCE(SUM(payable),0)").Row().Scan(&totalCommission)
	s.db.Model(&model.SettlementRecord{}).
		Where("agent = (SELECT name FROM agents WHERE id = ?) AND status = ?", agentID, "已结算").
		Select("COALESCE(SUM(actual),0)").Row().Scan(&paid)
	s.db.Model(&model.SettlementRecord{}).
		Where("agent = (SELECT name FROM agents WHERE id = ?) AND status = ?", agentID, "待结算").
		Select("COALESCE(SUM(payable),0)").Row().Scan(&pending)
	// 历史佣金按月
	var history []map[string]interface{}
	s.db.Model(&model.SettlementRecord{}).
		Select("month, COALESCE(SUM(payable),0) as commission").
		Where("agent = (SELECT name FROM agents WHERE id = ?)", agentID).
		Group("month").Order("month DESC").Limit(6).Find(&history)
	return map[string]interface{}{
		"agent_id": agentID, "total_commission": totalCommission,
		"paid": paid, "pending": pending, "rate": 8.5, "history": history,
	}
}
