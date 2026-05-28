package handler

import (
	"strconv"

	"dyos-go/internal/service"
	"dyos-go/pkg/response"

	"github.com/gin-gonic/gin"
)

type MiniAppHandler struct {
	svc *service.MiniAppService
}

func NewMiniAppHandler(svc *service.MiniAppService) *MiniAppHandler { return &MiniAppHandler{svc: svc} }

func (h *MiniAppHandler) RegisterRoutes(group *gin.RouterGroup) {
	mp := group.Group("/miniapp")
	{
		mp.GET("/kpi/:merchant_id", h.KPI)
		mp.GET("/reviews/:merchant_id", h.ReviewSummary)
		mp.GET("/alerts", h.RealTimeAlerts)
		mp.GET("/report/:merchant_id", h.StoreReport)
		mp.POST("/qr-code", h.GenerateQR)
		mp.GET("/reports", h.ListReports)
	}
}

func (h *MiniAppHandler) KPI(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("merchant_id"), 10, 64)
	if err != nil {
		response.Error(c, 400, response.CodeBadRequest, "无效的商户ID")
		return
	}
	response.Success(c, h.svc.KPI(uint(id)))
}

func (h *MiniAppHandler) ReviewSummary(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("merchant_id"), 10, 64)
	response.Success(c, h.svc.ReviewSummary(uint(id)))
}

func (h *MiniAppHandler) RealTimeAlerts(c *gin.Context) {
	response.Success(c, gin.H{"items": h.svc.RealTimeAlerts()})
}

func (h *MiniAppHandler) StoreReport(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("merchant_id"), 10, 64)
	response.Success(c, h.svc.StoreReport(uint(id)))
}

func (h *MiniAppHandler) GenerateQR(c *gin.Context) {
	var body struct {
		MerchantID uint   `json:"merchant_id"`
		Data       string `json:"data"`
	}
	c.ShouldBindJSON(&body)
	response.Success(c, h.svc.GenerateQRCode(body.MerchantID, body.Data))
}

func (h *MiniAppHandler) ListReports(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "10"))
	merchantID, _ := strconv.ParseUint(c.DefaultQuery("merchant_id", "0"), 10, 64)
	data, err := h.svc.ListReports(uint(merchantID), page, size)
	if err != nil {
		response.Error(c, 500, response.CodeServerError, err.Error())
		return
	}
	response.Success(c, data)
}

func (h *MiniAppHandler) RegisterMerchantRoutes(group *gin.RouterGroup) {
	mp := group.Group("/miniprogram")
	{
		mp.GET("/kpi", h.MerchantKPI)
		mp.GET("/reviews", h.MerchantReviews)
		mp.GET("/alerts", h.MerchantAlerts)
	}
}

func (h *MiniAppHandler) MerchantKPI(c *gin.Context) {
	merchantID := c.GetUint("merchant_id")
	response.Success(c, h.svc.KPI(merchantID))
}

func (h *MiniAppHandler) MerchantReviews(c *gin.Context) {
	merchantID := c.GetUint("merchant_id")
	response.Success(c, h.svc.ReviewSummary(merchantID))
}

func (h *MiniAppHandler) MerchantAlerts(c *gin.Context) {
	response.Success(c, gin.H{"items": h.svc.RealTimeAlerts()})
}
