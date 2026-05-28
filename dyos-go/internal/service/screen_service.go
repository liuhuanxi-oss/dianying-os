package service

import (
	"math/rand"
	"time"

	"dyos-go/internal/model"

	"gorm.io/gorm"
)

type ScreenService struct {
	db *gorm.DB
}

func NewScreenService(db *gorm.DB) *ScreenService {
	return &ScreenService{db: db}
}

func (s *ScreenService) Snapshot() map[string]interface{} {
	return map[string]interface{}{
		"kpis":       s.KPIs(),
		"map":        s.StoreMap(),
		"orders":     s.RealTimeOrders(12),
		"agents":     s.AgentPipeline(),
		"industries": s.IndustryCompare(),
		"alerts":     s.Alerts(),
		"timestamp":  time.Now().UnixMilli(),
	}
}

func (s *ScreenService) KPIs() map[string]interface{} {
	stats := map[string]interface{}{
		"total_gmv":        0,
		"total_merchants":  0,
		"today_orders":     0,
		"today_amount":     0,
		"online_merchants": 0,
		"pay_success_rate": 99.2,
		"ai_calls":         0,
		"alerts":           len(s.Alerts()),
	}
	if s.db == nil {
		stats["total_gmv"] = 12856300
		stats["total_merchants"] = 268
		stats["today_orders"] = 3280
		stats["today_amount"] = 856000
		stats["online_merchants"] = 219
		stats["ai_calls"] = 28600
		return stats
	}
	var totalMerchants, onlineMerchants int64
	s.db.Model(&model.Merchant{}).Select("COUNT(*) as total_merchants, SUM(CASE WHEN status = 'active' OR status = 'APPROVED' THEN 1 ELSE 0 END) as online_merchants").Row().Scan(&totalMerchants, &onlineMerchants)
	stats["total_merchants"] = totalMerchants
	stats["online_merchants"] = onlineMerchants

	var totalGMV float64
	var totalOrders int64
	s.db.Model(&model.Transaction{}).Where("status = ?", "success").Select("COALESCE(SUM(amount), 0) as total_gmv, COUNT(*) as total_orders").Row().Scan(&totalGMV, &totalOrders)
	stats["total_gmv"] = totalGMV

	var todayOrders int64
	var todayAmount float64
	s.db.Model(&model.Transaction{}).Where("status = ? AND time LIKE ?", "success", time.Now().Format("2006-01-02")+"%").Select("COUNT(*) as today_orders, COALESCE(SUM(amount), 0) as today_amount").Row().Scan(&todayOrders, &todayAmount)
	stats["today_orders"] = todayOrders
	stats["today_amount"] = todayAmount
	return stats
}

func (s *ScreenService) StoreMap() []map[string]interface{} {
	provinces := []string{"广东", "浙江", "江苏", "山东", "四川", "河南", "湖北", "湖南", "福建", "上海", "北京", "重庆"}
	items := make([]map[string]interface{}, 0, len(provinces))
	for i, name := range provinces {
		items = append(items, map[string]interface{}{"name": name, "value": 120 - i*7, "gmv": 680000 - i*32000, "lat": 30 + rand.Float64()*8, "lng": 105 + rand.Float64()*15})
	}
	return items
}

func (s *ScreenService) RealTimeOrders(limit int) []map[string]interface{} {
	if limit <= 0 {
		limit = 10
	}
	items := make([]map[string]interface{}, 0, limit)
	if s.db != nil {
		transactions := make([]model.Transaction, 0, limit)
		if err := s.db.Order("time DESC").Limit(limit).Find(&transactions).Error; err == nil && len(transactions) > 0 {
			for _, item := range transactions {
				items = append(items, map[string]interface{}{"id": item.ID, "merchant": item.Merchant, "amount": item.Amount, "type": item.Type, "status": item.Status, "time": item.Time})
			}
			return items
		}
	}
	merchants := []string{"有味餐厅", "星辰便利", "悦享茶饮", "云端火锅", "城市烘焙"}
	for i := 0; i < limit; i++ {
		items = append(items, map[string]interface{}{"id": time.Now().UnixNano() + int64(i), "merchant": merchants[i%len(merchants)], "amount": 20 + rand.Intn(580), "type": "payment", "status": "success", "time": time.Now().Add(-time.Duration(i*18) * time.Second).Format("15:04:05")})
	}
	return items
}

func (s *ScreenService) AgentPipeline() []map[string]interface{} {
	return []map[string]interface{}{{"name": "经营分析Agent", "status": "running", "progress": 92, "tasks": 128}, {"name": "营销策略Agent", "status": "running", "progress": 76, "tasks": 86}, {"name": "评价管理Agent", "status": "idle", "progress": 100, "tasks": 64}, {"name": "供应链Agent", "status": "running", "progress": 58, "tasks": 42}, {"name": "内容创作Agent", "status": "running", "progress": 81, "tasks": 97}}
}

func (s *ScreenService) IndustryCompare() []map[string]interface{} {
	return []map[string]interface{}{{"industry": "餐饮", "merchants": 128, "gmv": 6800000, "orders": 38600}, {"industry": "零售", "merchants": 96, "gmv": 4200000, "orders": 29800}, {"industry": "休闲娱乐", "merchants": 44, "gmv": 1850000, "orders": 12600}}
}

func (s *ScreenService) Alerts() []map[string]interface{} {
	return []map[string]interface{}{{"id": 1, "level": "warning", "title": "支付成功率波动", "content": "华东区域成功率低于99%", "time": time.Now().Format("15:04:05")}, {"id": 2, "level": "info", "title": "Agent任务完成", "content": "营销策略Agent已生成新方案", "time": time.Now().Add(-3 * time.Minute).Format("15:04:05")}}
}

func (s *ScreenService) TickMessage() map[string]interface{} {
	return map[string]interface{}{"type": "screen_tick", "data": s.Snapshot()}
}
