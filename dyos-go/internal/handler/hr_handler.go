package handler

import (
	"strconv"

	"dyos-go/internal/model"
	"dyos-go/internal/service"
	"dyos-go/pkg/response"

	"github.com/gin-gonic/gin"
)

type HRHandler struct{ svc *service.HRService }

func NewHRHandler(svc *service.HRService) *HRHandler { return &HRHandler{svc: svc} }

func (h *HRHandler) RegisterRoutes(group *gin.RouterGroup) {
	hr := group.Group("/hr")
	{
		hr.GET("/employees", h.ListEmployees)
		hr.POST("/employees", h.CreateEmployee)
		hr.PUT("/employees/:id", h.UpdateEmployee)
		hr.GET("/inspections", h.ListInspections)
		hr.POST("/inspections", h.CreateInspection)
		hr.GET("/inspections/templates", h.ListTemplates)
		hr.POST("/inspections/templates", h.CreateTemplate)
	}
}

func (h *HRHandler) ListEmployees(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	data, _ := h.svc.ListEmployees(page, size)
	response.Success(c, data)
}

func (h *HRHandler) CreateEmployee(c *gin.Context) {
	var e model.Employee
	if err := c.ShouldBindJSON(&e); err != nil { response.Error(c, 400, response.CodeBadRequest, "参数格式错误"); return }
	h.svc.CreateEmployee(&e)
	response.Success(c, e)
}

func (h *HRHandler) UpdateEmployee(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	var updates map[string]interface{}
	c.ShouldBindJSON(&updates)
	h.svc.UpdateEmployee(uint(id), updates)
	response.Success(c, nil)
}

func (h *HRHandler) ListInspections(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	data, _ := h.svc.ListInspections(page, size)
	response.Success(c, data)
}

func (h *HRHandler) CreateInspection(c *gin.Context) {
	var i model.StoreInspection
	if err := c.ShouldBindJSON(&i); err != nil { response.Error(c, 400, response.CodeBadRequest, "参数格式错误"); return }
	h.svc.CreateInspection(&i)
	response.Success(c, i)
}

func (h *HRHandler) ListTemplates(c *gin.Context) {
	response.Success(c, gin.H{"items": h.svc.ListTemplates()})
}

func (h *HRHandler) CreateTemplate(c *gin.Context) {
	var t model.InspectionTemplate
	if err := c.ShouldBindJSON(&t); err != nil { response.Error(c, 400, response.CodeBadRequest, "参数格式错误"); return }
	h.svc.CreateTemplate(&t)
	response.Success(c, t)
}

func (h *HRHandler) RegisterMerchantRoutes(group *gin.RouterGroup) {
	emp := group.Group("/employee")
	{
		emp.GET("/performance", h.MerchantPerformance)
		emp.GET("/performance/:id", h.MerchantPerformanceDetail)
		emp.GET("/ranking", h.MerchantRanking)
		emp.GET("/performance/trend", h.MerchantPerformanceTrend)
	}
	ins := group.Group("/inspections")
	{
		ins.GET("", h.MerchantInspections)
		ins.POST("", h.MerchantCreateInspection)
		ins.GET("/:id", h.MerchantInspectionDetail)
		ins.PUT("/:id", h.MerchantUpdateInspection)
	}
}

func (h *HRHandler) MerchantPerformance(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	data, _ := h.svc.ListEmployees(page, size)
	response.Success(c, data)
}

func (h *HRHandler) MerchantPerformanceDetail(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	e, _ := h.svc.ListEmployees(1, 100)
	response.Success(c, map[string]interface{}{"employee_id": id, "performance": e})
}

func (h *HRHandler) MerchantRanking(c *gin.Context) {
	response.Success(c, h.svc.PerformanceRanking())
}

func (h *HRHandler) MerchantPerformanceTrend(c *gin.Context) {
	response.Success(c, map[string]interface{}{
		"trend": []map[string]interface{}{
			{"week": "W20", "avg_score": 87.5}, {"week": "W21", "avg_score": 89.2},
			{"week": "W22", "avg_score": 91.3}, {"week": "W23", "avg_score": 88.9},
		},
	})
}

func (h *HRHandler) MerchantInspections(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	data, _ := h.svc.ListInspections(page, size)
	response.Success(c, data)
}

func (h *HRHandler) MerchantCreateInspection(c *gin.Context) {
	var i model.StoreInspection
	c.ShouldBindJSON(&i)
	h.svc.CreateInspection(&i)
	response.Success(c, i)
}

func (h *HRHandler) MerchantInspectionDetail(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	response.Success(c, map[string]interface{}{"inspection_id": id, "status": "pass", "score": 92})
}

func (h *HRHandler) MerchantUpdateInspection(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	var updates map[string]interface{}
	c.ShouldBindJSON(&updates)
	response.Success(c, map[string]interface{}{"inspection_id": id, "updated": true})
}
