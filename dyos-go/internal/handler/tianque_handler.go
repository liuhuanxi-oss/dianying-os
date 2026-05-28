package handler

import (
	"net/http"

	"dyos-go/internal/tianque"
	"dyos-go/pkg/response"

	"github.com/gin-gonic/gin"
)

type TianqueHandler struct {
	merchant  *tianque.MerchantAPI
	payment   *tianque.PaymentAPI
	split     *tianque.SplitAPI
	settle    *tianque.SettleAPI
	reconcile *tianque.ReconcileAPI
}

func NewTianqueHandler(client *tianque.Client) *TianqueHandler {
	return &TianqueHandler{
		merchant:  tianque.NewMerchantAPI(client),
		payment:   tianque.NewPaymentAPI(client),
		split:     tianque.NewSplitAPI(client),
		settle:    tianque.NewSettleAPI(client),
		reconcile: tianque.NewReconcileAPI(client),
	}
}

func (h *TianqueHandler) RegisterRoutes(group *gin.RouterGroup) {
	api := group.Group("/tianque")
	{
		api.GET("/ping", h.Ping)
		api.POST("/merchant/income", h.MerchantApply)
		api.POST("/merchant/income-query", h.MerchantQuery)
		api.POST("/merchant/update", h.MerchantModify)
		api.POST("/merchant/info", h.MerchantInfo)
		api.POST("/merchant/audit-status", h.MerchantAuditStatus)
		api.POST("/payment/scan", h.PaymentScan)
		api.POST("/payment/reverse-scan", h.PaymentReverseScan)
		api.POST("/payment/query", h.PaymentQuery)
		api.POST("/payment/refund", h.PaymentRefund)
		api.POST("/payment/refund-query", h.PaymentRefundQuery)
		api.POST("/payment/close", h.PaymentClose)
		api.POST("/payment/fee-query", h.PaymentFeeQuery)
		api.POST("/split/apply", h.SplitApply)
		api.POST("/split/query", h.SplitQuery)
		api.POST("/split/sign-agreement", h.SplitSignAgreement)
		api.POST("/split/query-agreement", h.SplitQueryAgreement)
		api.POST("/settle/query", h.SettleQuery)
		api.POST("/settle/detail", h.SettleDetail)
		api.POST("/reconcile/download", h.ReconcileDownload)
	}
}

func (h *TianqueHandler) Ping(c *gin.Context) {
	response.Success(c, gin.H{"service": "tianque", "status": "ready"})
}

func (h *TianqueHandler) MerchantApply(c *gin.Context)       { h.call(c, h.merchant.Apply) }
func (h *TianqueHandler) MerchantQuery(c *gin.Context)       { h.call(c, h.merchant.Query) }
func (h *TianqueHandler) MerchantModify(c *gin.Context)      { h.call(c, h.merchant.Modify) }
func (h *TianqueHandler) MerchantInfo(c *gin.Context)        { h.call(c, h.merchant.QueryInfo) }
func (h *TianqueHandler) MerchantAuditStatus(c *gin.Context) { h.call(c, h.merchant.QueryAuditStatus) }
func (h *TianqueHandler) PaymentScan(c *gin.Context)         { h.call(c, h.payment.CreateScanPay) }
func (h *TianqueHandler) PaymentReverseScan(c *gin.Context)  { h.call(c, h.payment.ReverseScan) }
func (h *TianqueHandler) PaymentQuery(c *gin.Context)        { h.call(c, h.payment.Query) }
func (h *TianqueHandler) PaymentRefund(c *gin.Context)       { h.call(c, h.payment.Refund) }
func (h *TianqueHandler) PaymentRefundQuery(c *gin.Context)  { h.call(c, h.payment.RefundQuery) }
func (h *TianqueHandler) PaymentClose(c *gin.Context)        { h.call(c, h.payment.Close) }
func (h *TianqueHandler) PaymentFeeQuery(c *gin.Context)     { h.call(c, h.payment.FeeQuery) }
func (h *TianqueHandler) SplitApply(c *gin.Context)          { h.call(c, h.split.Apply) }
func (h *TianqueHandler) SplitQuery(c *gin.Context)          { h.call(c, h.split.Query) }
func (h *TianqueHandler) SplitSignAgreement(c *gin.Context)  { h.call(c, h.split.SignAgreement) }
func (h *TianqueHandler) SplitQueryAgreement(c *gin.Context) { h.call(c, h.split.QueryAgreement) }
func (h *TianqueHandler) SettleQuery(c *gin.Context)         { h.call(c, h.settle.Query) }
func (h *TianqueHandler) SettleDetail(c *gin.Context)        { h.call(c, h.settle.QueryDetail) }
func (h *TianqueHandler) ReconcileDownload(c *gin.Context)   { h.call(c, h.reconcile.Download) }

func (h *TianqueHandler) call(c *gin.Context, fn func(map[string]interface{}) (map[string]interface{}, error)) {
	data := map[string]interface{}{}
	if c.Request.Body != nil {
		if err := c.ShouldBindJSON(&data); err != nil {
			response.Error(c, http.StatusBadRequest, response.CodeBadRequest, "请求参数错误")
			return
		}
	}
	result, err := fn(data)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, response.CodeServerError, err.Error())
		return
	}
	response.Success(c, result)
}
