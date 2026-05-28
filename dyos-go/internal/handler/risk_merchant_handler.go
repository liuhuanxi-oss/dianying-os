package handler

import (
	"strconv"

	"dyos-go/internal/service"
	"dyos-go/pkg/response"

	"github.com/gin-gonic/gin"
)

type RiskMerchantHandler struct {
	svc *service.RiskMerchantService
}

func NewRiskMerchantHandler(svc *service.RiskMerchantService) *RiskMerchantHandler {
	return &RiskMerchantHandler{svc: svc}
}

func (h *RiskMerchantHandler) RegisterRoutes(group *gin.RouterGroup) {
	g := group.Group("/risk-merchants")
	{
		g.GET("", h.List)
		g.GET("/stats", h.Stats)
		g.POST("/sync", h.Sync)
		g.POST("/:id/handle", h.Handle)
	}
}

func (h *RiskMerchantHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	data, _ := h.svc.List(c.Query("platform"), c.Query("risk_level"), c.Query("handle_status"), page, size)
	response.Success(c, data)
}

func (h *RiskMerchantHandler) Stats(c *gin.Context) {
	response.Success(c, h.svc.GetStats())
}

func (h *RiskMerchantHandler) Sync(c *gin.Context) {
	providerIDStr := c.DefaultQuery("provider_id", "0")
	providerID, _ := strconv.ParseUint(providerIDStr, 10, 64)
	platform := c.DefaultQuery("platform", "wechat_pay")
	count, _ := h.svc.SyncRiskMerchants(uint(providerID), platform)
	response.Success(c, map[string]interface{}{
		"synced": count,
		"message": "风险商户检测完成",
	})
}

func (h *RiskMerchantHandler) Handle(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	var body struct {
		Action string `json:"action" binding:"required"`
		Remark string `json:"remark"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.Error(c, 400, response.CodeBadRequest, "请指定处置动作")
		return
	}
	if err := h.svc.Handle(uint(id), body.Action, body.Remark); err != nil {
		response.Error(c, 500, response.CodeServerError, "处置失败")
		return
	}
	response.Success(c, map[string]interface{}{"id": id, "action": body.Action})
}
