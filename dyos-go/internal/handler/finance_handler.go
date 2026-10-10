package handler

import (
	"strconv"

	"dyos-go/internal/service"
	"dyos-go/pkg/response"

	"github.com/gin-gonic/gin"
)

type FinanceHandler struct{ svc *service.FinanceService }

func NewFinanceHandler(svc *service.FinanceService) *FinanceHandler { return &FinanceHandler{svc: svc} }

func (h *FinanceHandler) RegisterRoutes(group *gin.RouterGroup) {
	f := group.Group("/finance")
	{
		f.GET("/overview", h.Overview)
		f.GET("/transactions", h.Transactions)
		f.GET("/transactions/:id", h.GetTransaction)
		f.GET("/refunds", h.Refunds)
		f.POST("/refunds", h.CreateRefund)
		f.POST("/refund/:id/approve", h.ApproveRefund)
		f.POST("/refund/:id/reject", h.RejectRefund)
		f.GET("/invoices", h.Invoices)
		f.POST("/invoices", h.CreateInvoice)
		f.POST("/invoices/:id/issue", h.IssueInvoice)
		f.PUT("/invoices/:id", h.UpdateInvoice)
		f.GET("/reconciliation", h.Reconciliation)
		f.POST("/reconciliation/settle", h.SettleReconciliation)
		f.GET("/commission", h.Commission)
		f.POST("/commission/:id/pay", h.PayCommission)
		f.GET("/revenue", h.Revenue)
		f.GET("/revenue/stats", h.RevenueStats)
		f.GET("/billing", h.BillingList)
		f.GET("/billing/:id", h.GetBilling)
		f.POST("/billing/:id/confirm", h.ConfirmBilling)
	}
}

func (h *FinanceHandler) Overview(c *gin.Context) {
	response.Success(c, h.svc.Overview())
}

func (h *FinanceHandler) Transactions(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	data, _ := h.svc.Transactions(page, size, c.Query("status"), c.Query("merchant"), c.Query("type"))
	response.Success(c, data)
}

func (h *FinanceHandler) GetTransaction(c *gin.Context) {
	data, err := h.svc.GetTransaction(c.Param("id"))
	if err != nil { response.Error(c, 404, response.CodeServerError, "交易不存在"); return }
	response.Success(c, data)
}

func (h *FinanceHandler) Refunds(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	data, _ := h.svc.Refunds(page, size, c.Query("status"))
	response.Success(c, data)
}

func (h *FinanceHandler) CreateRefund(c *gin.Context) {
	var body struct {
		Merchant string  `json:"merchant"`
		Amount   float64 `json:"amount"`
		Reason   string  `json:"reason"`
	}
	c.ShouldBindJSON(&body)
	id, _ := h.svc.CreateRefund(body.Merchant, body.Amount, body.Reason)
	response.Success(c, map[string]interface{}{"id": id})
}

func (h *FinanceHandler) Invoices(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	data, _ := h.svc.Invoices(page, size, c.Query("status"))
	response.Success(c, data)
}

func (h *FinanceHandler) IssueInvoice(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	h.svc.IssueInvoice(uint(id))
	response.Success(c, nil)
}

func (h *FinanceHandler) Reconciliation(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	data, _ := h.svc.Reconciliation(page, size, c.DefaultQuery("month", "2026-05"))
	response.Success(c, data)
}

func (h *FinanceHandler) SettleReconciliation(c *gin.Context) {
	var body struct {
		Agent string `json:"agent"`
		Month string `json:"month"`
	}
	c.ShouldBindJSON(&body)
	h.svc.SettleReconciliation(body.Agent, body.Month)
	response.Success(c, nil)
}

func (h *FinanceHandler) Commission(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	data, _ := h.svc.Commission(page, size, c.DefaultQuery("month", "2026-05"))
	response.Success(c, data)
}

func (h *FinanceHandler) PayCommission(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	h.svc.PayCommission(uint(id))
	response.Success(c, nil)
}

func (h *FinanceHandler) ApproveRefund(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	h.svc.ApproveRefund(uint(id))
	response.Success(c, nil)
}

func (h *FinanceHandler) RejectRefund(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	h.svc.RejectRefund(uint(id))
	response.Success(c, nil)
}

func (h *FinanceHandler) CreateInvoice(c *gin.Context) {
	var body struct {
		Merchant string  `json:"merchant"`
		Type     string  `json:"type"`
		Amount   float64 `json:"amount"`
	}
	c.ShouldBindJSON(&body)
	id, _ := h.svc.CreateInvoice(body.Merchant, body.Type, body.Amount)
	response.Success(c, map[string]interface{}{"id": id})
}

func (h *FinanceHandler) UpdateInvoice(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	h.svc.UpdateInvoice(uint(id), c.Query("status"))
	response.Success(c, nil)
}

func (h *FinanceHandler) Revenue(c *gin.Context) {
	response.Success(c, h.svc.Revenue())
}

func (h *FinanceHandler) RevenueStats(c *gin.Context) {
	response.Success(c, h.svc.RevenueStats())
}

func (h *FinanceHandler) BillingList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	data, _ := h.svc.BillingList(page, size, c.Query("status"), c.Query("merchant"))
	response.Success(c, data)
}

func (h *FinanceHandler) GetBilling(c *gin.Context) {
	data, err := h.svc.GetBilling(c.Param("id"))
	if err != nil { response.Error(c, 404, response.CodeServerError, "账单不存在"); return }
	response.Success(c, data)
}

func (h *FinanceHandler) ConfirmBilling(c *gin.Context) {
	h.svc.ConfirmBilling(c.Param("id"))
	response.Success(c, nil)
}

func (h *FinanceHandler) RegisterMerchantRoutes(group *gin.RouterGroup) {
	f := group.Group("/payments")
	{
		f.GET("", h.MerchantTransactions)
		f.GET("/:id", h.MerchantGetTransaction)
		f.POST("/refund", h.MerchantRefund)
		f.GET("/stats", h.MerchantPaymentStats)
	}
	fi := group.Group("/finance")
	{
		fi.GET("/overview", h.MerchantFinanceOverview)
		fi.GET("/transactions", h.MerchantFinanceTransactions)
		fi.GET("/transactions/:id", h.MerchantFinanceTransactionDetail)
		fi.GET("/refunds", h.MerchantFinanceRefunds)
		fi.GET("/invoices", h.MerchantFinanceInvoices)
	}
}

func (h *FinanceHandler) MerchantTransactions(c *gin.Context) {
	// Fail closed until merchant_id is bound to the finance tables via a verified mapping.
	response.Error(c, 503, response.CodeServerError, "商户财务接口正在进行租户隔离升级")
	return
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	data, _ := h.svc.MerchantTransactions(page, size)
	response.Success(c, data)
}

func (h *FinanceHandler) MerchantGetTransaction(c *gin.Context) {
	// Fail closed until merchant_id is bound to the finance tables via a verified mapping.
	response.Error(c, 503, response.CodeServerError, "商户财务接口正在进行租户隔离升级")
	return
	data, err := h.svc.GetTransaction(c.Param("id"))
	if err != nil { response.Error(c, 404, response.CodeServerError, "交易不存在"); return }
	response.Success(c, data)
}

func (h *FinanceHandler) MerchantRefund(c *gin.Context) {
	// Fail closed until merchant_id is bound to the finance tables via a verified mapping.
	response.Error(c, 503, response.CodeServerError, "商户财务接口正在进行租户隔离升级")
	return
	var body struct {
		Amount float64 `json:"amount"`
		Reason string  `json:"reason"`
	}
	c.ShouldBindJSON(&body)
	id, _ := h.svc.CreateRefund("", body.Amount, body.Reason)
	response.Success(c, map[string]interface{}{"id": id})
}

func (h *FinanceHandler) MerchantPaymentStats(c *gin.Context) {
	response.Success(c, map[string]interface{}{
		"today_gmv": 28600, "today_orders": 128, "refund_rate": "2.3%",
		"total_transactions": 15860, "avg_amount": 223.40,
	})
}

func (h *FinanceHandler) MerchantFinanceOverview(c *gin.Context) {
	response.Success(c, map[string]interface{}{
		"today_gmv": 28600, "today_orders": 128, "today_refunds": 3,
		"month_gmv": 852000, "month_commission": 42600, "pending_settlement": 156000,
	})
}

func (h *FinanceHandler) MerchantFinanceTransactions(c *gin.Context) {
	// Fail closed until merchant_id is bound to the finance tables via a verified mapping.
	response.Error(c, 503, response.CodeServerError, "商户财务接口正在进行租户隔离升级")
	return
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	data, _ := h.svc.Transactions(page, size, c.Query("status"), "", c.Query("type"))
	response.Success(c, data)
}

func (h *FinanceHandler) MerchantFinanceTransactionDetail(c *gin.Context) {
	// Fail closed until merchant_id is bound to the finance tables via a verified mapping.
	response.Error(c, 503, response.CodeServerError, "商户财务接口正在进行租户隔离升级")
	return
	data, err := h.svc.GetTransaction(c.Param("id"))
	if err != nil { response.Error(c, 404, response.CodeServerError, "交易不存在"); return }
	response.Success(c, data)
}

func (h *FinanceHandler) MerchantFinanceRefunds(c *gin.Context) {
	// Fail closed until merchant_id is bound to the finance tables via a verified mapping.
	response.Error(c, 503, response.CodeServerError, "商户财务接口正在进行租户隔离升级")
	return
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	data, _ := h.svc.Refunds(page, size, c.Query("status"))
	response.Success(c, data)
}

func (h *FinanceHandler) MerchantFinanceInvoices(c *gin.Context) {
	// Fail closed until merchant_id is bound to the finance tables via a verified mapping.
	response.Error(c, 503, response.CodeServerError, "商户财务接口正在进行租户隔离升级")
	return
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	data, _ := h.svc.Invoices(page, size, c.Query("status"))
	response.Success(c, data)
}
