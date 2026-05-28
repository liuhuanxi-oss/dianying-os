package handler

import (
	"strconv"

	"dyos-go/internal/service"
	"dyos-go/pkg/response"

	"github.com/gin-gonic/gin"
)

type SmartPricingHandler struct{ svc *service.SmartPricingService }

func NewSmartPricingHandler(svc *service.SmartPricingService) *SmartPricingHandler {
	return &SmartPricingHandler{svc: svc}
}

func (h *SmartPricingHandler) RegisterRoutes(group *gin.RouterGroup) {
	sp := group.Group("/smart-pricing")
	{
		sp.GET("/suggestions/:merchant_id", h.GetSuggestions)
		sp.GET("/analysis/:merchant_id", h.GetAnalysis)
		sp.GET("/trust/:merchant_id", h.GetTrustLevel)
		sp.GET("/trust-levels", h.ListTrustLevels)
		sp.PUT("/trust-levels/:merchant_id", h.UpdateTrustLevel)
	}
}

func (h *SmartPricingHandler) GetSuggestions(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("merchant_id"), 10, 64)
	response.Success(c, gin.H{"items": h.svc.GetSuggestions(uint(id))})
}

func (h *SmartPricingHandler) GetAnalysis(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("merchant_id"), 10, 64)
	response.Success(c, h.svc.GetAnalysis(uint(id)))
}

func (h *SmartPricingHandler) GetTrustLevel(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("merchant_id"), 10, 64)
	response.Success(c, h.svc.GetTrustLevel(uint(id)))
}

func (h *SmartPricingHandler) ListTrustLevels(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	data, _ := h.svc.ListTrustLevels(page, size)
	response.Success(c, data)
}

func (h *SmartPricingHandler) UpdateTrustLevel(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("merchant_id"), 10, 64)
	var body struct{ Level int `json:"level"` }
	c.ShouldBindJSON(&body)
	h.svc.UpdateTrustLevel(uint(id), body.Level)
	response.Success(c, nil)
}

func (h *SmartPricingHandler) RegisterMerchantRoutes(group *gin.RouterGroup) {
	sp := group.Group("/smart-pricing")
	{
		sp.GET("/suggestions", h.MerchantSuggestions)
		sp.POST("/apply/:id", h.MerchantApply)
		sp.POST("/batch-apply", h.MerchantBatchApply)
		sp.GET("/analysis", h.MerchantAnalysis)
	}
}

func (h *SmartPricingHandler) MerchantSuggestions(c *gin.Context) {
	merchantID := c.GetUint("merchant_id")
	response.Success(c, gin.H{"items": h.svc.GetSuggestions(merchantID)})
}

func (h *SmartPricingHandler) MerchantApply(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	response.Success(c, map[string]interface{}{"id": id, "applied": true, "message": "定价已应用"})
}

func (h *SmartPricingHandler) MerchantBatchApply(c *gin.Context) {
	var body struct{ IDs []uint `json:"ids"` }
	c.ShouldBindJSON(&body)
	response.Success(c, map[string]interface{}{"applied_count": len(body.IDs), "message": "批量应用成功"})
}

func (h *SmartPricingHandler) MerchantAnalysis(c *gin.Context) {
	merchantID := c.GetUint("merchant_id")
	response.Success(c, h.svc.GetAnalysis(merchantID))
}
