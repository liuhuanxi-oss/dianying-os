package handler

import (
	"strconv"

	"dyos-go/internal/model"
	"dyos-go/internal/service"
	"dyos-go/pkg/response"

	"github.com/gin-gonic/gin"
)

type PaymentProviderHandler struct {
	svc *service.PaymentProviderService
}

func NewPaymentProviderHandler(svc *service.PaymentProviderService) *PaymentProviderHandler {
	return &PaymentProviderHandler{svc: svc}
}

func (h *PaymentProviderHandler) RegisterRoutes(group *gin.RouterGroup) {
	g := group.Group("/payment-providers")
	{
		g.GET("", h.List)
		g.GET("/:id", h.GetByID)
		g.POST("", h.Create)
		g.PUT("/:id", h.Update)
		g.DELETE("/:id", h.Delete)
	}
}

func (h *PaymentProviderHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	data, _ := h.svc.List(c.Query("platform"), page, size)
	response.Success(c, data)
}

func (h *PaymentProviderHandler) GetByID(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	data, err := h.svc.GetByID(uint(id))
	if err != nil {
		response.Error(c, 404, response.CodeBadRequest, "服务商不存在")
		return
	}
	response.Success(c, data)
}

func (h *PaymentProviderHandler) Create(c *gin.Context) {
	var p model.PaymentProvider
	if err := c.ShouldBindJSON(&p); err != nil {
		response.Error(c, 400, response.CodeBadRequest, "参数错误")
		return
	}
	if p.Platform == "" || p.MchID == "" {
		response.Error(c, 400, response.CodeBadRequest, "平台和商户号不能为空")
		return
	}
	if err := h.svc.Create(&p); err != nil {
		response.Error(c, 500, response.CodeServerError, "保存失败")
		return
	}
	response.Success(c, p)
}

func (h *PaymentProviderHandler) Update(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	var updates map[string]interface{}
	if err := c.ShouldBindJSON(&updates); err != nil {
		response.Error(c, 400, response.CodeBadRequest, "参数错误")
		return
	}
	if err := h.svc.Update(uint(id), updates); err != nil {
		response.Error(c, 500, response.CodeServerError, "更新失败")
		return
	}
	response.Success(c, map[string]interface{}{"id": id, "updated": true})
}

func (h *PaymentProviderHandler) Delete(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	if err := h.svc.Delete(uint(id)); err != nil {
		response.Error(c, 500, response.CodeServerError, "删除失败")
		return
	}
	response.Success(c, map[string]interface{}{"id": id, "deleted": true})
}
