package handler

import (
	"strconv"

	"dyos-go/internal/model"
	"dyos-go/internal/service"
	"dyos-go/pkg/response"

	"github.com/gin-gonic/gin"
)

type ReportHandler struct {
	svc *service.ReportService
}

func NewReportHandler(svc *service.ReportService) *ReportHandler {
	return &ReportHandler{svc: svc}
}

func (h *ReportHandler) RegisterRoutes(group *gin.RouterGroup) {
	rp := group.Group("/reports")
	{
		rp.GET("", h.List)
		rp.POST("", h.Create)
		rp.GET("/:id", h.Get)
		rp.PUT("/:id", h.Update)
		rp.DELETE("/:id", h.Delete)
		rp.POST("/:id/generate", h.Generate)
		rp.GET("/:id/export", h.Export)
		rp.GET("/templates", h.ListTemplates)
		rp.POST("/templates", h.CreateTemplate)
		rp.DELETE("/templates/:tid", h.DeleteTemplate)
		rp.GET("/schedules", h.ListSchedules)
		rp.POST("/schedules", h.CreateSchedule)
		rp.PUT("/schedules/:sid", h.UpdateSchedule)
		rp.DELETE("/schedules/:sid", h.DeleteSchedule)
	}
}

func (h *ReportHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	result, err := h.svc.ListReports(page, size, c.Query("type"))
	if err != nil {
		response.Error(c, 500, response.CodeServerError, err.Error())
		return
	}
	response.Success(c, result)
}

func (h *ReportHandler) Create(c *gin.Context) {
	var r model.Report
	if err := c.ShouldBindJSON(&r); err != nil {
		response.Error(c, 400, response.CodeBadRequest, "参数格式错误")
		return
	}
	if err := h.svc.CreateReport(&r); err != nil {
		response.Error(c, 500, response.CodeServerError, err.Error())
		return
	}
	response.Success(c, r)
}

func (h *ReportHandler) Get(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, 400, response.CodeBadRequest, "无效的报表ID")
		return
	}
	r, err := h.svc.GetReport(uint(id))
	if err != nil {
		response.Error(c, 404, response.CodeServerError, "报表不存在")
		return
	}
	response.Success(c, r)
}

func (h *ReportHandler) Update(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, 400, response.CodeBadRequest, "无效的报表ID")
		return
	}
	var updates map[string]interface{}
	if err := c.ShouldBindJSON(&updates); err != nil {
		response.Error(c, 400, response.CodeBadRequest, "参数格式错误")
		return
	}
	if err := h.svc.UpdateReport(uint(id), updates); err != nil {
		response.Error(c, 500, response.CodeServerError, err.Error())
		return
	}
	response.Success(c, nil)
}

func (h *ReportHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, 400, response.CodeBadRequest, "无效的报表ID")
		return
	}
	if err := h.svc.DeleteReport(uint(id)); err != nil {
		response.Error(c, 500, response.CodeServerError, err.Error())
		return
	}
	response.Success(c, nil)
}

func (h *ReportHandler) Generate(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, 400, response.CodeBadRequest, "无效的报表ID")
		return
	}
	data, err := h.svc.GenerateReport(uint(id))
	if err != nil {
		response.Error(c, 500, response.CodeServerError, err.Error())
		return
	}
	response.Success(c, data)
}

func (h *ReportHandler) Export(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, 400, response.CodeBadRequest, "无效的报表ID")
		return
	}
	format := c.DefaultQuery("format", "pdf")
	result, err := h.svc.ExportReport(uint(id), format)
	if err != nil {
		response.Error(c, 500, response.CodeServerError, err.Error())
		return
	}
	response.Success(c, result)
}

func (h *ReportHandler) ListTemplates(c *gin.Context) {
	templates, err := h.svc.ListTemplates(c.Query("category"))
	if err != nil {
		response.Error(c, 500, response.CodeServerError, err.Error())
		return
	}
	response.Success(c, gin.H{"items": templates, "total": len(templates)})
}

func (h *ReportHandler) CreateTemplate(c *gin.Context) {
	var t model.ReportTemplate
	if err := c.ShouldBindJSON(&t); err != nil {
		response.Error(c, 400, response.CodeBadRequest, "参数格式错误")
		return
	}
	if err := h.svc.CreateTemplate(&t); err != nil {
		response.Error(c, 500, response.CodeServerError, err.Error())
		return
	}
	response.Success(c, t)
}

func (h *ReportHandler) DeleteTemplate(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("tid"), 10, 64)
	if err != nil {
		response.Error(c, 400, response.CodeBadRequest, "无效的模板ID")
		return
	}
	if err := h.svc.DeleteTemplate(uint(id)); err != nil {
		response.Error(c, 500, response.CodeServerError, err.Error())
		return
	}
	response.Success(c, nil)
}

func (h *ReportHandler) ListSchedules(c *gin.Context) {
	schedules, err := h.svc.ListSchedules()
	if err != nil {
		response.Error(c, 500, response.CodeServerError, err.Error())
		return
	}
	response.Success(c, gin.H{"items": schedules, "total": len(schedules)})
}

func (h *ReportHandler) CreateSchedule(c *gin.Context) {
	var sc model.ReportSchedule
	if err := c.ShouldBindJSON(&sc); err != nil {
		response.Error(c, 400, response.CodeBadRequest, "参数格式错误")
		return
	}
	if err := h.svc.CreateSchedule(&sc); err != nil {
		response.Error(c, 500, response.CodeServerError, err.Error())
		return
	}
	response.Success(c, sc)
}

func (h *ReportHandler) UpdateSchedule(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("sid"), 10, 64)
	if err != nil {
		response.Error(c, 400, response.CodeBadRequest, "无效的推送ID")
		return
	}
	var updates map[string]interface{}
	if err := c.ShouldBindJSON(&updates); err != nil {
		response.Error(c, 400, response.CodeBadRequest, "参数格式错误")
		return
	}
	if err := h.svc.UpdateSchedule(uint(id), updates); err != nil {
		response.Error(c, 500, response.CodeServerError, err.Error())
		return
	}
	response.Success(c, nil)
}

func (h *ReportHandler) DeleteSchedule(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("sid"), 10, 64)
	if err != nil {
		response.Error(c, 400, response.CodeBadRequest, "无效的推送ID")
		return
	}
	if err := h.svc.DeleteSchedule(uint(id)); err != nil {
		response.Error(c, 500, response.CodeServerError, err.Error())
		return
	}
	response.Success(c, nil)
}

func (h *ReportHandler) RegisterMerchantRoutes(group *gin.RouterGroup) {
	rp := group.Group("/reports")
	{
		rp.GET("", h.MerchantList)
		rp.GET("/:id", h.MerchantGet)
		rp.GET("/:id/export", h.MerchantExport)
		rp.GET("/quick", h.MerchantQuick)
	}
}

func (h *ReportHandler) MerchantList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	result, _ := h.svc.ListReports(page, size, c.Query("type"))
	response.Success(c, result)
}

func (h *ReportHandler) MerchantGet(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	r, err := h.svc.GetReport(uint(id))
	if err != nil {
		response.Error(c, 404, response.CodeServerError, "报表不存在")
		return
	}
	response.Success(c, r)
}

func (h *ReportHandler) MerchantExport(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	format := c.DefaultQuery("format", "pdf")
	result, _ := h.svc.ExportReport(uint(id), format)
	response.Success(c, result)
}

func (h *ReportHandler) MerchantQuick(c *gin.Context) {
	period := c.DefaultQuery("period", "today")
	response.Success(c, map[string]interface{}{
		"period": period, "gmv": 28600, "orders": 128, "avg_amount": 223.4,
		"compare_last": "+12%", "top_dish": "招牌锅底", "ai_score": 92,
	})
}
