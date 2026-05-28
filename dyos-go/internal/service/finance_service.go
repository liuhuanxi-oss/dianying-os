package service

import (
	"dyos-go/internal/model"

	"gorm.io/gorm"
)

type FinanceService struct{ db *gorm.DB }

func NewFinanceService(db *gorm.DB) *FinanceService { return &FinanceService{db: db} }

func (s *FinanceService) Overview() map[string]interface{} {
	if s.db == nil {
		return map[string]interface{}{"today_gmv": 0, "today_orders": 0, "today_refunds": 0, "month_gmv": 0, "month_commission": 0, "pending_settlement": 0, "refund_rate": "0%", "avg_order": 0}
	}
	var todayGMV, monthGMV, monthCommission, pendingSettle, avgOrder float64
	var todayOrders, todayRefunds int64
	s.db.Model(&model.Transaction{}).Where("status = ? AND DATE(time) = CURDATE()", "success").Select("COALESCE(SUM(amount),0)").Row().Scan(&todayGMV)
	s.db.Model(&model.Transaction{}).Where("DATE(time) = CURDATE()").Count(&todayOrders)
	s.db.Model(&model.Refund{}).Where("status = ? AND DATE(time) = CURDATE()", "completed").Count(&todayRefunds)
	s.db.Model(&model.Transaction{}).Where("status = ? AND time >= DATE_FORMAT(NOW(),'%Y-%m-01')", "success").Select("COALESCE(SUM(amount),0)").Row().Scan(&monthGMV)
	s.db.Model(&model.SettlementRecord{}).Where("status = ?", "待结算").Select("COALESCE(SUM(payable),0)").Row().Scan(&pendingSettle)
	monthCommission = monthGMV * 0.05
	var refundRate float64
	todayOrdersF := float64(todayOrders)
	if todayOrdersF > 0 { refundRate = float64(todayRefunds) / todayOrdersF * 100 }
	if todayOrdersF > 0 { avgOrder = todayGMV / todayOrdersF }
	return map[string]interface{}{
		"today_gmv": todayGMV, "today_orders": int64(todayOrders), "today_refunds": todayRefunds,
		"month_gmv": monthGMV, "month_commission": monthCommission, "pending_settlement": pendingSettle,
		"refund_rate": fmtRate(refundRate), "avg_order": avgOrder,
	}
}

func fmtRate(r float64) string {
	if r < 0.01 { return "0%" }
	buf := make([]byte, 0, 8)
	intPart := int(r * 10)
	buf = append(buf, byte('0'+intPart/10))
	buf = append(buf, '.')
	buf = append(buf, byte('0'+intPart%10))
	buf = append(buf, '%')
	return string(buf)
}

func (s *FinanceService) Transactions(page, size int, status, merchant, txnType string) (map[string]interface{}, error) {
	if size <= 0 { size = 20 }
	if page <= 0 { page = 1 }
	if s.db == nil {
		return map[string]interface{}{"items": []model.Transaction{}, "total": int64(0), "page": page, "size": size}, nil
	}
	q := s.db.Model(&model.Transaction{})
	if status != "" { q = q.Where("status = ?", status) }
	if merchant != "" { q = q.Where("merchant = ?", merchant) }
	if txnType != "" { q = q.Where("type = ?", txnType) }
	var total int64
	q.Count(&total)
	var items []model.Transaction
	q.Offset((page - 1) * size).Limit(size).Order("time DESC").Find(&items)
	return map[string]interface{}{"items": items, "total": total, "page": page, "size": size}, nil
}

func (s *FinanceService) GetTransaction(id string) (*model.Transaction, error) {
	if s.db == nil { return nil, gorm.ErrRecordNotFound }
	var t model.Transaction
	if err := s.db.First(&t, "id = ?", id).Error; err != nil { return nil, err }
	return &t, nil
}

func (s *FinanceService) Refunds(page, size int, status string) (map[string]interface{}, error) {
	if size <= 0 { size = 20 }
	if page <= 0 { page = 1 }
	if s.db == nil {
		return map[string]interface{}{"items": []model.Refund{}, "total": int64(0), "page": page, "size": size}, nil
	}
	q := s.db.Model(&model.Refund{})
	if status != "" { q = q.Where("status = ?", status) }
	var total int64
	q.Count(&total)
	var items []model.Refund
	q.Offset((page - 1) * size).Limit(size).Order("time DESC").Find(&items)
	return map[string]interface{}{"items": items, "total": total, "page": page, "size": size}, nil
}

func (s *FinanceService) CreateRefund(merchant string, amount float64, reason string) (uint, error) {
	if s.db == nil { return 0, gorm.ErrInvalidDB }
	r := model.Refund{Merchant: merchant, Amount: amount, Reason: reason, Status: "pending"}
	if err := s.db.Create(&r).Error; err != nil { return 0, err }
	return r.ID, nil
}

func (s *FinanceService) Invoices(page, size int, status string) (map[string]interface{}, error) {
	if size <= 0 { size = 20 }
	if page <= 0 { page = 1 }
	if s.db == nil {
		return map[string]interface{}{"items": []model.Invoice{}, "total": int64(0), "page": page, "size": size}, nil
	}
	q := s.db.Model(&model.Invoice{})
	if status != "" { q = q.Where("status = ?", status) }
	var total int64
	q.Count(&total)
	var items []model.Invoice
	q.Offset((page - 1) * size).Limit(size).Order("apply_time DESC").Find(&items)
	return map[string]interface{}{"items": items, "total": total, "page": page, "size": size}, nil
}

func (s *FinanceService) IssueInvoice(id uint) error {
	if s.db == nil { return gorm.ErrInvalidDB }
	return s.db.Model(&model.Invoice{}).Where("id = ?", id).Update("status", "已开具").Error
}

func (s *FinanceService) Reconciliation(page, size int, month string) (map[string]interface{}, error) {
	if size <= 0 { size = 20 }
	if page <= 0 { page = 1 }
	if s.db == nil {
		return map[string]interface{}{"items": []map[string]interface{}{}, "total": int64(0), "page": page, "size": size}, nil
	}
	// 对账数据：按商户汇总交易金额
	type recRow struct {
		Merchant string; TotalAmount float64
	}
	var rows []recRow
	q := s.db.Model(&model.Transaction{}).Select("merchant, COALESCE(SUM(amount),0) as total_amount").Where("status = ?", "success")
	if month != "" { q = q.Where("time LIKE ?", month+"%") }
	q.Group("merchant")
	var total int64
	s.db.Model(&model.Transaction{}).Select("COUNT(DISTINCT merchant)").Where("status = ?", "success").Row().Scan(&total)
	q.Offset((page - 1) * size).Limit(size).Find(&rows)
	items := make([]map[string]interface{}, len(rows))
	feeRate := 0.006 // 0.6% 手续费
	for i, r := range rows {
		fee := r.TotalAmount * feeRate
		items[i] = map[string]interface{}{
			"merchant": r.Merchant, "period": month, "total_amount": r.TotalAmount,
			"fee": fee, "net_amount": r.TotalAmount - fee, "status": "已对账", "diff_amount": 0,
		}
	}
	return map[string]interface{}{"items": items, "total": total, "page": page, "size": size}, nil
}

func (s *FinanceService) SettleReconciliation(agent string, month string) error {
	if s.db == nil { return gorm.ErrInvalidDB }
	return s.db.Model(&model.SettlementRecord{}).Where("agent = ? AND month = ?", agent, month).Update("status", "已结算").Error
}

func (s *FinanceService) Commission(page, size int, month string) (map[string]interface{}, error) {
	if size <= 0 { size = 20 }
	if page <= 0 { page = 1 }
	if s.db == nil {
		return map[string]interface{}{"items": []map[string]interface{}{}, "total": int64(0), "page": page, "size": size}, nil
	}
	q := s.db.Model(&model.SettlementRecord{})
	if month != "" { q = q.Where("month = ?", month) }
	var total int64
	q.Count(&total)
	var records []model.SettlementRecord
	q.Offset((page - 1) * size).Limit(size).Order("month DESC").Find(&records)
	items := make([]map[string]interface{}, len(records))
	for i, r := range records {
		items[i] = map[string]interface{}{
			"id": uint(i + 1), "agent": r.Agent, "month": r.Month,
			"gmv": r.Payable / 0.085, "rate": 8.5, "commission": r.Payable,
			"status": func() string { if r.Status == "已结算" { return "已支付" }; return "待支付" }(),
		}
	}
	return map[string]interface{}{"items": items, "total": total, "page": page, "size": size}, nil
}

func (s *FinanceService) PayCommission(id uint) error {
	if s.db == nil { return gorm.ErrInvalidDB }
	return s.db.Model(&model.SettlementRecord{}).Where("id = ?", id).Updates(map[string]interface{}{"status": "已结算", "settle_time": gorm.Expr("NOW()")}).Error
}

func (s *FinanceService) ApproveRefund(id uint) error {
	if s.db == nil { return gorm.ErrInvalidDB }
	return s.db.Model(&model.Refund{}).Where("id = ?", id).Update("status", "completed").Error
}

func (s *FinanceService) RejectRefund(id uint) error {
	if s.db == nil { return gorm.ErrInvalidDB }
	return s.db.Model(&model.Refund{}).Where("id = ?", id).Update("status", "rejected").Error
}

func (s *FinanceService) CreateInvoice(merchant, invoiceType string, amount float64) (uint, error) {
	if s.db == nil { return 0, gorm.ErrInvalidDB }
	inv := model.Invoice{Merchant: merchant, Type: invoiceType, Amount: amount, Status: "申请中"}
	if err := s.db.Create(&inv).Error; err != nil { return 0, err }
	return inv.ID, nil
}

func (s *FinanceService) UpdateInvoice(id uint, status string) error {
	if s.db == nil { return gorm.ErrInvalidDB }
	return s.db.Model(&model.Invoice{}).Where("id = ?", id).Update("status", status).Error
}

func (s *FinanceService) Revenue() map[string]interface{} {
	if s.db == nil {
		return map[string]interface{}{"today": 0, "this_month": 0, "this_year": 0, "avg_daily": 0, "growth": "0%", "trend": []map[string]interface{}{}}
	}
	var today, thisMonth, thisYear, avgDaily float64
	s.db.Model(&model.Transaction{}).Where("status = ? AND DATE(time) = CURDATE()", "success").Select("COALESCE(SUM(amount),0)").Row().Scan(&today)
	s.db.Model(&model.Transaction{}).Where("status = ? AND time >= DATE_FORMAT(NOW(),'%Y-%m-01')", "success").Select("COALESCE(SUM(amount),0)").Row().Scan(&thisMonth)
	s.db.Model(&model.Transaction{}).Where("status = ? AND time >= DATE_FORMAT(NOW(),'%Y-01-01')", "success").Select("COALESCE(SUM(amount),0)").Row().Scan(&thisYear)
	var dayCount float64
	s.db.Model(&model.Transaction{}).Select("COUNT(DISTINCT DATE(time))").Where("status = ? AND time >= DATE_FORMAT(NOW(),'%Y-%m-01')", "success").Row().Scan(&dayCount)
	if dayCount > 0 { avgDaily = thisMonth / dayCount }
	var trend []map[string]interface{}
	s.db.Model(&model.Transaction{}).Select("DATE_FORMAT(time,'%Y-%m') as month, COALESCE(SUM(amount),0) as revenue").Where("status = ? AND time >= DATE_SUB(NOW(), INTERVAL 6 MONTH)", "success").Group("month").Order("month ASC").Find(&trend)
	return map[string]interface{}{"today": today, "this_month": thisMonth, "this_year": thisYear, "avg_daily": avgDaily, "growth": "0%", "trend": trend}
}

func (s *FinanceService) RevenueStats() map[string]interface{} {
	if s.db == nil {
		return map[string]interface{}{"total_revenue": 0, "total_orders": 0, "avg_order": 0, "refund_rate": "0%", "commission_rate": "5.0%"}
	}
	var totalRevenue, avgOrder float64
	var totalOrders, refundCount int64
	s.db.Model(&model.Transaction{}).Where("status = ?", "success").Select("COALESCE(SUM(amount),0)").Row().Scan(&totalRevenue)
	s.db.Model(&model.Transaction{}).Where("status = ?", "success").Count(&totalOrders)
	s.db.Model(&model.Refund{}).Where("status = ?", "completed").Count(&refundCount)
	if totalOrders > 0 { avgOrder = totalRevenue / float64(totalOrders) }
	refundRate := "0%"
	if totalOrders > 0 { refundRate = fmtRate(float64(refundCount) / float64(totalOrders) * 100) }
	return map[string]interface{}{"total_revenue": totalRevenue, "total_orders": totalOrders, "avg_order": avgOrder, "refund_rate": refundRate, "commission_rate": "5.0%"}
}

func (s *FinanceService) BillingList(page, size int, status, merchant string) (map[string]interface{}, error) {
	if size <= 0 { size = 20 }
	if page <= 0 { page = 1 }
	if s.db == nil {
		return map[string]interface{}{"items": []map[string]interface{}{}, "total": int64(0), "page": page, "size": size}, nil
	}
	q := s.db.Model(&model.Invoice{})
	if status != "" { q = q.Where("status = ?", status) }
	if merchant != "" { q = q.Where("merchant = ?", merchant) }
	var total int64
	q.Count(&total)
	var invoices []model.Invoice
	q.Offset((page - 1) * size).Limit(size).Order("apply_time DESC").Find(&invoices)
	items := make([]map[string]interface{}, len(invoices))
	for i, inv := range invoices {
		items[i] = map[string]interface{}{
			"id": inv.ID, "merchant": inv.Merchant, "period": inv.ApplyTime[:7],
			"amount": inv.Amount, "status": inv.Status, "created_at": inv.ApplyTime,
		}
	}
	return map[string]interface{}{"items": items, "total": total, "page": page, "size": size}, nil
}

func (s *FinanceService) GetBilling(id string) (map[string]interface{}, error) {
	if s.db == nil { return nil, gorm.ErrRecordNotFound }
	var inv model.Invoice
	if err := s.db.First(&inv, "id = ?", id).Error; err != nil { return nil, err }
	return map[string]interface{}{
		"id": inv.ID, "merchant": inv.Merchant, "period": inv.ApplyTime[:7],
		"amount": inv.Amount, "status": inv.Status,
		"details": []map[string]interface{}{{"item": "账单金额", "amount": inv.Amount}},
		"created_at": inv.ApplyTime,
	}, nil
}

func (s *FinanceService) ConfirmBilling(id string) error {
	if s.db == nil { return gorm.ErrInvalidDB }
	return s.db.Model(&model.Invoice{}).Where("id = ?", id).Update("status", "已确认").Error
}

func (s *FinanceService) MerchantTransactions(page, size int) (map[string]interface{}, error) {
	if size <= 0 { size = 20 }
	if page <= 0 { page = 1 }
	if s.db == nil {
		return map[string]interface{}{"items": []model.Transaction{}, "total": int64(0), "page": page, "size": size}, nil
	}
	var total int64
	s.db.Model(&model.Transaction{}).Count(&total)
	var items []model.Transaction
	s.db.Offset((page - 1) * size).Limit(size).Order("time DESC").Find(&items)
	return map[string]interface{}{"items": items, "total": total, "page": page, "size": size}, nil
}
