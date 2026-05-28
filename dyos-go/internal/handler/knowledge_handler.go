package handler

import (
	"strconv"

	"dyos-go/internal/service"
	"dyos-go/pkg/response"

	"github.com/gin-gonic/gin"
)

type KnowledgeHandler struct{ svc *service.KnowledgeService }

func NewKnowledgeHandler(svc *service.KnowledgeService) *KnowledgeHandler {
	return &KnowledgeHandler{svc: svc}
}

func (h *KnowledgeHandler) RegisterRoutes(group *gin.RouterGroup) {
	k := group.Group("/knowledge")
	{
		k.GET("/base", h.ListBase)
		k.POST("/base", h.CreateBase)
		k.PUT("/strategy", h.UpdateStrategy)
		k.GET("/metrics", h.Metrics)
		k.POST("/tune", h.Tune)
	}
}

func (h *KnowledgeHandler) ListBase(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	data, _ := h.svc.ListBase(page, size, c.Query("industry"), c.Query("category"))
	response.Success(c, data)
}

func (h *KnowledgeHandler) CreateBase(c *gin.Context) {
	var body struct {
		Industry string `json:"industry"`
		Category string `json:"category"`
		Title    string `json:"title"`
		Content  string `json:"content"`
	}
	c.ShouldBindJSON(&body)
	id, _ := h.svc.CreateBase(body.Industry, body.Category, body.Title, body.Content)
	response.Success(c, map[string]interface{}{"id": id})
}

func (h *KnowledgeHandler) UpdateStrategy(c *gin.Context) {
	merchantID, _ := strconv.ParseUint(c.DefaultQuery("merchant_id", "0"), 10, 64)
	var config map[string]interface{}
	c.ShouldBindJSON(&config)
	if merchantID == 0 {
		h.svc.UpdateStrategy(0, config)
	} else {
		h.svc.UpdateStrategy(uint(merchantID), config)
	}
	response.Success(c, nil)
}

func (h *KnowledgeHandler) Metrics(c *gin.Context) {
	response.Success(c, h.svc.Metrics())
}

func (h *KnowledgeHandler) Tune(c *gin.Context) {
	response.Success(c, h.svc.Tune())
}

func (h *KnowledgeHandler) RegisterMerchantRoutes(group *gin.RouterGroup) {
	k := group.Group("/knowledge")
	{
		k.GET("/strategy", h.MerchantStrategy)
		k.PUT("/strategy", h.MerchantUpdateStrategy)
	}
}

func (h *KnowledgeHandler) MerchantStrategy(c *gin.Context) {
	response.Success(c, h.svc.Strategy(0))
}

func (h *KnowledgeHandler) MerchantUpdateStrategy(c *gin.Context) {
	var config map[string]interface{}
	c.ShouldBindJSON(&config)
	h.svc.UpdateStrategy(0, config)
	response.Success(c, nil)
}
