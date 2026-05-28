package handler

import (
	"strconv"

	"dyos-go/internal/model"
	"dyos-go/internal/service"
	"dyos-go/pkg/response"

	"github.com/gin-gonic/gin"
)

type SaleHandler struct{ svc *service.SaleService }

func NewSaleHandler(svc *service.SaleService) *SaleHandler { return &SaleHandler{svc: svc} }

func (h *SaleHandler) RegisterRoutes(group *gin.RouterGroup) {
	s := group.Group("/sales")
	{
		s.GET("", h.List)
		s.GET("/stats", h.Stats)
		s.GET("/:id", h.Get)
		s.POST("", h.Create)
		s.PUT("/:id", h.Update)
		s.DELETE("/:id", h.Delete)
		s.GET("/assignments", h.Assignments)
		s.POST("/assign", h.Assign)
		s.GET("/visits", h.Visits)
		s.POST("/visits", h.CreateVisit)
		s.GET("/performance", h.Performance)
	}
}

func (h *SaleHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	data, _ := h.svc.List(page, size, c.Query("status"), c.Query("region"))
	response.Success(c, data)
}

func (h *SaleHandler) Stats(c *gin.Context) { response.Success(c, h.svc.Stats()) }

func (h *SaleHandler) Get(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	data, err := h.svc.Get(uint(id))
	if err != nil { response.Error(c, 404, response.CodeServerError, "业务员不存在"); return }
	response.Success(c, data)
}

func (h *SaleHandler) Create(c *gin.Context) {
	var s model.Sale
	if err := c.ShouldBindJSON(&s); err != nil { response.Error(c, 400, response.CodeBadRequest, "参数格式错误"); return }
	h.svc.Create(&s)
	response.Success(c, s)
}

func (h *SaleHandler) Update(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	var updates map[string]interface{}
	c.ShouldBindJSON(&updates)
	h.svc.Update(uint(id), updates)
	response.Success(c, nil)
}

func (h *SaleHandler) Delete(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	h.svc.Delete(uint(id))
	response.Success(c, nil)
}

func (h *SaleHandler) Assignments(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	data, _ := h.svc.Assignments(page, size)
	response.Success(c, data)
}

func (h *SaleHandler) Assign(c *gin.Context) {
	var body struct {
		CustomerID uint   `json:"customer_id"`
		NewOwner   string `json:"new_owner"`
	}
	c.ShouldBindJSON(&body)
	id, _ := h.svc.Assign(body.CustomerID, body.NewOwner)
	response.Success(c, map[string]interface{}{"id": id})
}

func (h *SaleHandler) Visits(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	data, _ := h.svc.Visits(page, size, c.Query("salesman"))
	response.Success(c, data)
}

func (h *SaleHandler) CreateVisit(c *gin.Context) {
	var v model.VisitRecord
	if err := c.ShouldBindJSON(&v); err != nil { response.Error(c, 400, response.CodeBadRequest, "参数格式错误"); return }
	h.svc.CreateVisit(&v)
	response.Success(c, v)
}

func (h *SaleHandler) Performance(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	data, _ := h.svc.Performance(page, size)
	response.Success(c, data)
}
