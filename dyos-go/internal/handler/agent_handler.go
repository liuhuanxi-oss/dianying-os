package handler

import (
	"strconv"

	"dyos-go/internal/model"
	"dyos-go/internal/service"
	"dyos-go/pkg/response"

	"github.com/gin-gonic/gin"
)

type AgentHandler struct{ svc *service.AgentService }

func NewAgentHandler(svc *service.AgentService) *AgentHandler { return &AgentHandler{svc: svc} }

func (h *AgentHandler) RegisterRoutes(group *gin.RouterGroup) {
	a := group.Group("/agents")
	{
		a.GET("", h.List)
		a.GET("/stats", h.Stats)
		a.GET("/dashboard", h.Dashboard)
		a.GET("/service-providers", h.Providers)
		a.POST("/service-providers", h.CreateProvider)
		a.GET("/:id", h.Get)
		a.GET("/:id/merchants", h.AgentMerchants)
		a.GET("/:id/commission", h.AgentCommission)
		a.POST("", h.Create)
		a.PUT("/:id", h.Update)
		a.DELETE("/:id", h.Delete)
		a.GET("/settlements", h.Settlements)
		a.POST("/settlements/:id/settle", h.Settle)
		a.GET("/providers", h.Providers)
		a.POST("/providers", h.CreateProvider)
	}
}

func (h *AgentHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	data, _ := h.svc.List(page, size, c.Query("level"), c.Query("status"), c.Query("region"))
	response.Success(c, data)
}

func (h *AgentHandler) Stats(c *gin.Context) {
	response.Success(c, h.svc.Stats())
}

func (h *AgentHandler) Get(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	data, err := h.svc.Get(uint(id))
	if err != nil { response.Error(c, 404, response.CodeServerError, "代理商不存在"); return }
	response.Success(c, data)
}

func (h *AgentHandler) Create(c *gin.Context) {
	var a model.Agent
	if err := c.ShouldBindJSON(&a); err != nil { response.Error(c, 400, response.CodeBadRequest, "参数格式错误"); return }
	h.svc.Create(&a)
	response.Success(c, a)
}

func (h *AgentHandler) Update(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	var updates map[string]interface{}
	c.ShouldBindJSON(&updates)
	h.svc.Update(uint(id), updates)
	response.Success(c, nil)
}

func (h *AgentHandler) Delete(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	h.svc.Delete(uint(id))
	response.Success(c, nil)
}

func (h *AgentHandler) Settlements(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	data, _ := h.svc.Settlements(page, size, c.DefaultQuery("month", "2026-05"))
	response.Success(c, data)
}

func (h *AgentHandler) Settle(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	h.svc.Settle(uint(id), c.Query("month"))
	response.Success(c, nil)
}

func (h *AgentHandler) Providers(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	data, _ := h.svc.Providers(page, size)
	response.Success(c, data)
}

func (h *AgentHandler) CreateProvider(c *gin.Context) {
	var p model.ServiceProvider
	if err := c.ShouldBindJSON(&p); err != nil { response.Error(c, 400, response.CodeBadRequest, "参数格式错误"); return }
	h.svc.CreateProvider(&p)
	response.Success(c, p)
}

func (h *AgentHandler) Dashboard(c *gin.Context) {
	response.Success(c, h.svc.Dashboard())
}

func (h *AgentHandler) AgentMerchants(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	data, _ := h.svc.AgentMerchants(uint(id))
	response.Success(c, data)
}

func (h *AgentHandler) AgentCommission(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	response.Success(c, h.svc.AgentCommission(uint(id)))
}
