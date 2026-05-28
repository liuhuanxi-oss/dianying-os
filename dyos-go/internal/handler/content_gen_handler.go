package handler

import (
	"strconv"

	"dyos-go/internal/model"
	"dyos-go/internal/service"
	"dyos-go/pkg/response"

	"github.com/gin-gonic/gin"
)

type ContentGenHandler struct {
	svc *service.ContentGenService
}

func NewContentGenHandler(svc *service.ContentGenService) *ContentGenHandler {
	return &ContentGenHandler{svc: svc}
}

func (h *ContentGenHandler) RegisterRoutes(group *gin.RouterGroup) {
	cg := group.Group("/content-gen")
	{
		cg.POST("/post", h.GeneratePost)
		cg.POST("/qr-code", h.GenerateQRCode)
		cg.GET("/knowledge", h.ListKnowledge)
		cg.POST("/knowledge", h.CreateKnowledge)
		cg.PUT("/knowledge/:id", h.UpdateKnowledge)
		cg.DELETE("/knowledge/:id", h.DeleteKnowledge)
		cg.GET("/brand-strategy", h.BrandReplyStrategy)
	}
}

func (h *ContentGenHandler) GeneratePost(c *gin.Context) {
	var body struct {
		Platform string                 `json:"platform"`
		Params   map[string]interface{} `json:"params"`
	}
	c.ShouldBindJSON(&body)
	mid := c.GetUint("merchant_id")
	if mid == 0 { mid = c.GetUint("tenant_merchant_id") }
	response.Success(c, h.svc.GeneratePost(body.Platform, mid, body.Params))
}

func (h *ContentGenHandler) GenerateQRCode(c *gin.Context) {
	var body struct {
		Data string `json:"data"`
	}
	c.ShouldBindJSON(&body)
	mid := c.GetUint("merchant_id")
	if mid == 0 { mid = c.GetUint("tenant_merchant_id") }
	response.Success(c, h.svc.GenerateQRCode(mid, body.Data))
}

func (h *ContentGenHandler) ListKnowledge(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	data, err := h.svc.ListKnowledge(page, size, c.Query("industry"))
	if err != nil {
		response.Error(c, 500, response.CodeServerError, err.Error())
		return
	}
	response.Success(c, data)
}

func (h *ContentGenHandler) CreateKnowledge(c *gin.Context) {
	var k model.IndustryKnowledge
	if err := c.ShouldBindJSON(&k); err != nil {
		response.Error(c, 400, response.CodeBadRequest, "参数格式错误")
		return
	}
	if err := h.svc.CreateKnowledge(&k); err != nil {
		response.Error(c, 500, response.CodeServerError, err.Error())
		return
	}
	response.Success(c, k)
}

func (h *ContentGenHandler) UpdateKnowledge(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	var updates map[string]interface{}
	if err := c.ShouldBindJSON(&updates); err != nil {
		response.Error(c, 400, response.CodeBadRequest, "参数格式错误")
		return
	}
	if err := h.svc.UpdateKnowledge(uint(id), updates); err != nil {
		response.Error(c, 500, response.CodeServerError, err.Error())
		return
	}
	response.Success(c, nil)
}

func (h *ContentGenHandler) DeleteKnowledge(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	if err := h.svc.DeleteKnowledge(uint(id)); err != nil {
		response.Error(c, 500, response.CodeServerError, err.Error())
		return
	}
	response.Success(c, nil)
}

func (h *ContentGenHandler) BrandReplyStrategy(c *gin.Context) {
	response.Success(c, h.svc.BrandReplyStrategy(c.DefaultQuery("industry", "餐饮")))
}

func (h *ContentGenHandler) RegisterMerchantRoutes(group *gin.RouterGroup) {
	cg := group.Group("/content-gen")
	{
		cg.POST("/note", h.MerchantNote)
		cg.POST("/script", h.MerchantScript)
		cg.GET("/history", h.MerchantHistory)
	}
}

func (h *ContentGenHandler) MerchantNote(c *gin.Context) {
	var body struct{ Platform string `json:"platform"`; Params map[string]interface{} `json:"params"` }
	c.ShouldBindJSON(&body)
	merchantID := c.GetUint("merchant_id")
	response.Success(c, h.svc.GeneratePost(body.Platform, merchantID, body.Params))
}

func (h *ContentGenHandler) MerchantScript(c *gin.Context) {
	var body struct{ Params map[string]interface{} `json:"params"` }
	c.ShouldBindJSON(&body)
	merchantID := c.GetUint("merchant_id")
	response.Success(c, h.svc.GeneratePost("douyin", merchantID, body.Params))
}

func (h *ContentGenHandler) MerchantHistory(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	data, _ := h.svc.ListKnowledge(page, size, "")
	response.Success(c, data)
}
