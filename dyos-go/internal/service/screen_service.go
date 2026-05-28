package service

import (
	"encoding/json"
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

func (s *ScreenService) isSQLite() bool {
	return s.db != nil && s.db.Dialector.Name() == "sqlite"
}

func (s *ScreenService) jsonUnquote(col, path string) string {
	if s.isSQLite() {
		return "REPLACE(json_extract(" + col + ", '$." + path + "'), '\"', '')"
	}
	return "JSON_UNQUOTE(JSON_EXTRACT(" + col + ", '$." + path + "'))"
}

func (s *ScreenService) Snapshot() map[string]interface{} {
	return map[string]interface{}{
		"kpis":        s.KPIs(),
		"map":         s.StoreMap(),
		"orders":      s.RealTimeOrders(12),
		"agents":      s.AgentPipeline(),
		"industries":  s.IndustryCompare(),
		"alerts":      s.Alerts(),
		"hourly":      s.HourlyTrend(),
		"platforms":   s.PlatformStats(),
		"timestamp":   time.Now().UnixMilli(),
	}
}

func (s *ScreenService) KPIs() map[string]interface{} {
	stats := map[string]interface{}{
		"total_gmv":        0.0,
		"total_merchants":  0,
		"today_orders":     0,
		"today_amount":     0.0,
		"online_merchants": 0,
		"pay_success_rate": 0.0,
		"ai_calls":         0,
		"alerts":           0,
		"avg_rating":       0.0,
		"total_reviews":    0,
	}
	if s.db == nil {
		return stats
	}

	var totalMerchants, onlineMerchants int64
	s.db.Model(&model.Merchant{}).Select("COUNT(*) as total_merchants, SUM(CASE WHEN status IN ('active','APPROVED') THEN 1 ELSE 0 END) as online_merchants").Row().Scan(&totalMerchants, &onlineMerchants)
	stats["total_merchants"] = totalMerchants
	stats["online_merchants"] = onlineMerchants

	var totalGMV float64
	var totalOrders int64
	s.db.Model(&model.Transaction{}).Where("status = ?", "success").Select("COALESCE(SUM(amount),0) as total_gmv, COUNT(*) as total_orders").Row().Scan(&totalGMV, &totalOrders)
	stats["total_gmv"] = totalGMV

	todayPrefix := time.Now().Format("2006-01-02") + "%"
	var todayOrders int64
	var todayAmount float64
	s.db.Model(&model.Transaction{}).Where("status = ? AND time LIKE ?", "success", todayPrefix).Select("COUNT(*) as today_orders, COALESCE(SUM(amount),0) as today_amount").Row().Scan(&todayOrders, &todayAmount)
	stats["today_orders"] = todayOrders
	stats["today_amount"] = todayAmount

	var totalTxns, successTxns int64
	s.db.Model(&model.Transaction{}).Select("COUNT(*) as total, SUM(CASE WHEN status='success' THEN 1 ELSE 0 END) as success").Row().Scan(&totalTxns, &successTxns)
	if totalTxns > 0 {
		stats["pay_success_rate"] = float64(successTxns) / float64(totalTxns) * 100
	}

	var aiCalls int64
	s.db.Model(&model.ChatSession{}).Count(&aiCalls)
	stats["ai_calls"] = aiCalls

	var alertCount int64
	s.db.Model(&model.Complaint{}).Where("status IN ('pending','processing')").Count(&alertCount)
	stats["alerts"] = alertCount

	var avgRating float64
	var totalReviews int64
	s.db.Model(&model.Review{}).Select("COUNT(*) as total, COALESCE(AVG(rating),0) as avg").Row().Scan(&totalReviews, &avgRating)
	stats["avg_rating"] = avgRating
	stats["total_reviews"] = totalReviews

	return stats
}

func (s *ScreenService) StoreMap() []map[string]interface{} {
	items := make([]map[string]interface{}, 0)
	if s.db != nil {
		rows := make([]struct {
			City  string  `gorm:"column:city"`
			Count int64   `gorm:"column:cnt"`
			GMV   float64 `gorm:"column:gmv"`
		}, 0)
		cityExpr := s.jsonUnquote("apply_data", "经营地址")
		s.db.Raw("SELECT "+cityExpr+" as city, COUNT(*) as cnt, COALESCE(SUM(total_amount),0) as gmv FROM payment_merchants WHERE apply_data != '' AND json_extract(apply_data, '$.经营地址') IS NOT NULL GROUP BY city ORDER BY cnt DESC LIMIT 30").Scan(&rows)
		if len(rows) > 0 {
			for _, r := range rows {
				items = append(items, map[string]interface{}{"name": r.City, "value": r.Count, "gmv": r.GMV})
			}
			return items
		}
	}
	// 无数据时返回空，前端显示中国地图轮廓
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
				items = append(items, map[string]interface{}{
					"id": item.ID, "merchant": item.Merchant, "amount": item.Amount,
					"type": item.Type, "status": item.Status, "time": item.Time,
				})
			}
			return items
		}
	}
	return items
}

func (s *ScreenService) AgentPipeline() []map[string]interface{} {
	agents := []map[string]interface{}{
		{"name": "经营分析Agent", "status": "running", "icon": "Monitor", "tasks": 0, "progress": 0},
		{"name": "评价管理Agent", "status": "running", "icon": "Star", "tasks": 0, "progress": 0},
		{"name": "内容创作Agent", "status": "idle", "icon": "Edit", "tasks": 0, "progress": 0},
		{"name": "投诉处理Agent", "status": "running", "icon": "Warning", "tasks": 0, "progress": 0},
		{"name": "决策支持Agent", "status": "idle", "icon": "TrendCharts", "tasks": 0, "progress": 0},
	}
	if s.db == nil {
		return agents
	}
	// 从真实数据推算各Agent活跃度
	var reviewCount int64
	s.db.Model(&model.Review{}).Count(&reviewCount)
	agents[1]["tasks"] = reviewCount
	agents[1]["progress"] = minInt(100, int(reviewCount))

	var complaintCount int64
	s.db.Model(&model.Complaint{}).Where("status IN ('pending','processing')").Count(&complaintCount)
	agents[3]["tasks"] = complaintCount
	if complaintCount > 0 {
		agents[3]["progress"] = minInt(100, int(complaintCount)*5)
	}

	var chatCount int64
	s.db.Model(&model.ChatSession{}).Count(&chatCount)
	agents[0]["tasks"] = chatCount
	agents[0]["progress"] = minInt(100, int(chatCount)*2)

	var contentCount int64
	s.db.Model(&model.GeneratedContent{}).Count(&contentCount)
	agents[2]["tasks"] = contentCount
	agents[2]["progress"] = minInt(100, int(contentCount)*10)

	agents[4]["tasks"] = reviewCount + complaintCount
	agents[4]["progress"] = minInt(100, int(reviewCount+complaintCount))

	return agents
}

func (s *ScreenService) IndustryCompare() []map[string]interface{} {
	items := make([]map[string]interface{}, 0)
	if s.db != nil {
		rows := make([]struct {
			Name  string  `gorm:"column:name"`
			Count int64   `gorm:"column:cnt"`
			GMV   float64 `gorm:"column:gmv"`
		}, 0)
		nameExpr := s.jsonUnquote("apply_data", "行业大类")
		s.db.Raw("SELECT "+nameExpr+" as name, COUNT(*) as cnt, COALESCE(SUM(total_amount),0) as gmv FROM payment_merchants WHERE apply_data != '' AND json_extract(apply_data, '$.行业大类') IS NOT NULL GROUP BY name ORDER BY cnt DESC LIMIT 5").Scan(&rows)
		if len(rows) > 0 {
			for _, r := range rows {
				items = append(items, map[string]interface{}{"industry": r.Name, "merchants": r.Count, "gmv": r.GMV})
			}
			return items
		}
	}
	return items
}

func (s *ScreenService) Alerts() []map[string]interface{} {
	alerts := make([]map[string]interface{}, 0)
	if s.db != nil {
		// 待处理投诉
		complaints := make([]model.Complaint, 0, 5)
		s.db.Where("status IN ('pending','processing')").Order("complaint_time DESC").Limit(5).Find(&complaints)
		for _, c := range complaints {
			level := "warning"
			if c.Urgency == "urgent" {
				level = "danger"
			}
			alerts = append(alerts, map[string]interface{}{
				"id": c.ID, "level": level, "title": "投诉待处理",
				"content": truncateStr(c.Content, 40), "time": c.ComplaintTime.Format("15:04:05"),
				"type": "complaint",
			})
		}
		// 差评预警
		reviews := make([]model.Review, 0, 3)
		s.db.Where("rating <= 2 AND ai_reply = ''").Order("created_at DESC").Limit(3).Find(&reviews)
		for _, r := range reviews {
			alerts = append(alerts, map[string]interface{}{
				"id": r.ID, "level": "warning", "title": "差评未回复",
				"content": truncateStr(r.Content, 40), "time": r.CreatedAt,
				"rating": r.Rating, "type": "review",
			})
		}
	}
	return alerts
}

func (s *ScreenService) HourlyTrend() []map[string]interface{} {
	trend := make([]map[string]interface{}, 0)
	if s.db != nil {
		todayPrefix := time.Now().Format("2006-01-02")
		type HourRow struct {
			Hour   int     `gorm:"column:h"`
			Amount float64 `gorm:"column:amt"`
			Count  int64   `gorm:"column:cnt"`
		}
		rows := make([]HourRow, 0)
		s.db.Raw("SELECT CAST(SUBSTRING(time,12,2) AS UNSIGNED) as h, COALESCE(SUM(amount),0) as amt, COUNT(*) as cnt FROM transactions WHERE status='success' AND time LIKE ? GROUP BY h ORDER BY h", todayPrefix+"%").Scan(&rows)
		if len(rows) > 0 {
			full := make([]map[string]interface{}, 24)
			for i := 0; i < 24; i++ {
				full[i] = map[string]interface{}{"hour": i, "amount": 0.0, "orders": 0}
			}
			for _, r := range rows {
				if r.Hour >= 0 && r.Hour < 24 {
					full[r.Hour] = map[string]interface{}{"hour": r.Hour, "amount": r.Amount, "orders": r.Count}
				}
			}
			return full
		}
	}
	// 返回空24小时骨架
	for i := 0; i < 24; i++ {
		trend = append(trend, map[string]interface{}{"hour": i, "amount": 0, "orders": 0})
	}
	return trend
}

func (s *ScreenService) PlatformStats() []map[string]interface{} {
	items := make([]map[string]interface{}, 0)
	if s.db != nil {
		if s.db.Dialector.Name() == "sqlite" {
			return items
		}
		type PlatRow struct {
			Name  string `gorm:"column:platform"`
			Count int64  `gorm:"column:cnt"`
			Avg   float64 `gorm:"column:avg_rating"`
		}
		rows := make([]PlatRow, 0)
		s.db.Raw("SELECT platform, COUNT(*) as cnt, COALESCE(AVG(rating),0) as avg_rating FROM reviews WHERE platform != '' GROUP BY platform ORDER BY cnt DESC").Scan(&rows)
		for _, r := range rows {
			items = append(items, map[string]interface{}{"platform": r.Name, "count": r.Count, "avg_rating": r.Avg})
		}
	}
	return items
}

func (s *ScreenService) TickMessage() map[string]interface{} {
	return map[string]interface{}{"type": "screen_tick", "data": s.Snapshot()}
}

// --- 商户端数据 ---

func (s *ScreenService) MerchantSnap(merchantID uint) map[string]interface{} {
	return map[string]interface{}{
		"kpis":      s.MerchantKPIs(merchantID),
		"orders":    s.MerchantOrders(merchantID, 10),
		"trend":     s.MerchantTrend(merchantID),
		"hourly":    s.MerchantHourly(merchantID),
		"timestamp": time.Now().UnixMilli(),
	}
}

func (s *ScreenService) merchantName(merchantID uint) string {
	if s.db == nil || merchantID == 0 {
		return ""
	}
	var name string
	s.db.Model(&model.PaymentMerchant{}).Where("merchant_id = ?", merchantID).Select("channel_merchant_code").Limit(1).Row().Scan(&name)
	if name == "" {
		s.db.Model(&model.PaymentMerchant{}).Where("id = ?", merchantID).Select("channel_merchant_code").Limit(1).Row().Scan(&name)
	}
	return name
}

func (s *ScreenService) MerchantKPIs(merchantID uint) map[string]interface{} {
	stats := map[string]interface{}{
		"today_gmv": 0.0, "today_orders": 0, "total_reviews": 0,
		"avg_rating": 0.0, "pending_complaints": 0, "month_gmv": 0.0,
	}
	if s.db == nil || merchantID == 0 {
		return stats
	}
	name := s.merchantName(merchantID)
	todayPrefix := time.Now().Format("2006-01-02") + "%"
	monthPrefix := time.Now().Format("2006-01") + "%"

	var todayGMV float64
	var todayOrders int64
	s.db.Model(&model.Transaction{}).Where("merchant = ? AND status = 'success' AND time LIKE ?", name, todayPrefix).Select("COALESCE(SUM(amount),0) as gmv, COUNT(*) as orders").Row().Scan(&todayGMV, &todayOrders)
	stats["today_gmv"] = todayGMV
	stats["today_orders"] = todayOrders

	var monthGMV float64
	s.db.Model(&model.Transaction{}).Where("merchant = ? AND status = 'success' AND time LIKE ?", name, monthPrefix).Select("COALESCE(SUM(amount),0)").Row().Scan(&monthGMV)
	stats["month_gmv"] = monthGMV

	var totalReviews int64
	var avgRating float64
	s.db.Model(&model.Review{}).Where("merchant_id = ?", merchantID).Select("COUNT(*) as total, COALESCE(AVG(rating),0) as avg").Row().Scan(&totalReviews, &avgRating)
	stats["total_reviews"] = totalReviews
	stats["avg_rating"] = avgRating

	var pendingComplaints int64
	s.db.Model(&model.Complaint{}).Where("merchant_id = ? AND status IN ('pending','processing')", merchantID).Count(&pendingComplaints)
	stats["pending_complaints"] = pendingComplaints

	return stats
}

func (s *ScreenService) MerchantOrders(merchantID uint, limit int) []map[string]interface{} {
	items := make([]map[string]interface{}, 0)
	if s.db == nil || merchantID == 0 {
		return items
	}
	name := s.merchantName(merchantID)
	transactions := make([]model.Transaction, 0, limit)
	s.db.Where("merchant = ?", name).Order("time DESC").Limit(limit).Find(&transactions)
	for _, item := range transactions {
		items = append(items, map[string]interface{}{
			"id": item.ID, "amount": item.Amount, "type": item.Type,
			"status": item.Status, "time": item.Time,
		})
	}
	return items
}

func (s *ScreenService) MerchantTrend(merchantID uint) []map[string]interface{} {
	trend := make([]map[string]interface{}, 0)
	if s.db != nil && merchantID != 0 {
		name := s.merchantName(merchantID)
		rows := make([]struct {
			Date   string  `gorm:"column:d"`
			Amount float64 `gorm:"column:amt"`
			Count  int64   `gorm:"column:cnt"`
		}, 0)
		s.db.Raw("SELECT SUBSTRING(time,1,10) as d, COALESCE(SUM(amount),0) as amt, COUNT(*) as cnt FROM transactions WHERE merchant = ? AND status='success' AND time >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) GROUP BY d ORDER BY d", name).Scan(&rows)
		for _, r := range rows {
			trend = append(trend, map[string]interface{}{"date": r.Date[5:], "gmv": r.Amount, "orders": r.Count})
		}
	}
	return trend
}

func (s *ScreenService) MerchantHourly(merchantID uint) []map[string]interface{} {
	trend := make([]map[string]interface{}, 24)
	for i := 0; i < 24; i++ {
		trend[i] = map[string]interface{}{"hour": i, "amount": 0.0, "orders": 0}
	}
	if s.db != nil && merchantID != 0 {
		name := s.merchantName(merchantID)
		todayPrefix := time.Now().Format("2006-01-02")
		rows := make([]struct {
			Hour   int     `gorm:"column:h"`
			Amount float64 `gorm:"column:amt"`
			Count  int64   `gorm:"column:cnt"`
		}, 0)
		s.db.Raw("SELECT CAST(SUBSTRING(time,12,2) AS UNSIGNED) as h, COALESCE(SUM(amount),0) as amt, COUNT(*) as cnt FROM transactions WHERE merchant = ? AND status='success' AND time LIKE ? GROUP BY h ORDER BY h", name, todayPrefix+"%").Scan(&rows)
		for _, r := range rows {
			if r.Hour >= 0 && r.Hour < 24 {
				trend[r.Hour] = map[string]interface{}{"hour": r.Hour, "amount": r.Amount, "orders": r.Count}
			}
		}
	}
	return trend
}

// --- 辅助函数 ---

func minInt(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func truncateStr(s string, maxLen int) string {
	runes := []rune(s)
	if len(runes) <= maxLen {
		return s
	}
	return string(runes[:maxLen]) + "..."
}

// 初始化函数：确保 payment_merchants 表有 industry_name 和 city 字段数据
func (s *ScreenService) EnsureMerchantMeta() {
	if s.db == nil {
		return
	}
	if s.isSQLite() {
		return
	}
	s.db.Exec(`
		UPDATE payment_merchants pm
		SET city = COALESCE(
			JSON_UNQUOTE(JSON_EXTRACT(pm.apply_data, '$.经营地址')),
			''
		),
		industry_name = COALESCE(
			JSON_UNQUOTE(JSON_EXTRACT(pm.apply_data, '$.行业大类')),
			''
		)
		WHERE pm.apply_data IS NOT NULL AND pm.apply_data != ''
		AND (pm.city = '' OR pm.city IS NULL)
	`)
}

// ParseCity 从地址字符串中提取城市名
func ParseCity(address string) string {
	if address == "" {
		return ""
	}
	// 简单匹配：取"省/市/区"中的"市"级
	for _, suffix := range []string{"市", "区", "县"} {
		for i := len(address) - 1; i >= 0; i-- {
			if string([]rune(address)[i]) == suffix {
				// 向前找到省/市边界
				runes := []rune(address)
				for j := i - 1; j >= 0; j-- {
					if string(runes[j]) == "省" || string(runes[j]) == " " {
						return string(runes[j+1:i]) + suffix
					}
				}
				return string(runes[:i]) + suffix
			}
		}
	}
	return address
}

func init() {
	// 注册 JSON 解析 helper
	_ = json.Valid([]byte(`{}`))
}
