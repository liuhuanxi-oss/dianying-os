package handler

import (
	"strconv"

	"dyos-go/internal/service"
	"dyos-go/pkg/response"

	"github.com/gin-gonic/gin"
)

type CrossStoreHandler struct{ svc *service.CrossStoreService }

func NewCrossStoreHandler(svc *service.CrossStoreService) *CrossStoreHandler {
	return &CrossStoreHandler{svc: svc}
}

func (h *CrossStoreHandler) RegisterRoutes(group *gin.RouterGroup) {
	ks := group.Group("/knowledge")
	{
		ks.POST("/transfer", h.Transfer)
		ks.GET("/transfer/history", h.History)
		ks.POST("/transfer/:id/apply", h.Apply)
	}
}

func (h *CrossStoreHandler) Transfer(c *gin.Context) {
	var body struct {
		FromMerchant uint   `json:"from_merchant"`
		ToMerchant   uint   `json:"to_merchant"`
		Type         string `json:"type"`
	}
	c.ShouldBindJSON(&body)
	id, _ := h.svc.Transfer(body.FromMerchant, body.ToMerchant, body.Type)
	response.Success(c, map[string]interface{}{"id": id})
}

func (h *CrossStoreHandler) History(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	data, _ := h.svc.History(page, size, c.Query("type"))
	response.Success(c, data)
}

func (h *CrossStoreHandler) Apply(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	h.svc.Apply(uint(id))
	response.Success(c, nil)
}
