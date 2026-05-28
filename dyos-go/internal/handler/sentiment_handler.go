package handler

import (
	"strconv"

	"dyos-go/internal/service"
	"dyos-go/pkg/response"

	"github.com/gin-gonic/gin"
)

type SentimentHandler struct{ svc *service.SentimentService }

func NewSentimentHandler(svc *service.SentimentService) *SentimentHandler { return &SentimentHandler{svc: svc} }

func (h *SentimentHandler) RegisterRoutes(group *gin.RouterGroup) {
	s := group.Group("/sentiment")
	{
		s.GET("/overview", h.Overview)
		s.GET("/detail", h.Detail)
		s.GET("/alerts", h.Alerts)
		s.PUT("/alerts/:id", h.UpdateAlert)
		s.GET("/incidents", h.Incidents)
		s.GET("/sop", h.SOP)
		s.POST("/appeal", h.Appeal)
	}
}

func (h *SentimentHandler) Overview(c *gin.Context) {
	response.Success(c, h.svc.Overview(0))
}

func (h *SentimentHandler) Detail(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	data, _ := h.svc.Detail(page, size, c.Query("sentiment"), c.Query("source"))
	response.Success(c, data)
}

func (h *SentimentHandler) Alerts(c *gin.Context) {
	response.Success(c, map[string]interface{}{"items": h.svc.Alerts()})
}

func (h *SentimentHandler) UpdateAlert(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	var updates map[string]interface{}
	c.ShouldBindJSON(&updates)
	h.svc.UpdateAlert(uint(id), updates)
	response.Success(c, nil)
}

func (h *SentimentHandler) Incidents(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	data, _ := h.svc.Incidents(page, size, c.Query("level"), c.Query("status"))
	response.Success(c, data)
}

func (h *SentimentHandler) SOP(c *gin.Context) {
	response.Success(c, map[string]interface{}{"items": h.svc.SOP()})
}

func (h *SentimentHandler) Appeal(c *gin.Context) {
	var body struct{ IncidentID uint `json:"incident_id"` }
	c.ShouldBindJSON(&body)
	response.Success(c, h.svc.Appeal(body.IncidentID))
}

func (h *SentimentHandler) RegisterMerchantRoutes(group *gin.RouterGroup) {
	s := group.Group("/sentiment")
	{
		s.GET("/overview", h.MerchantOverview)
		s.GET("/detail", h.MerchantDetail)
		s.GET("/incidents", h.MerchantIncidents)
	}
}

func (h *SentimentHandler) MerchantOverview(c *gin.Context) {
	response.Success(c, h.svc.Overview(0))
}

func (h *SentimentHandler) MerchantDetail(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	data, _ := h.svc.Detail(page, size, c.Query("sentiment"), c.Query("source"))
	response.Success(c, data)
}

func (h *SentimentHandler) MerchantIncidents(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	data, _ := h.svc.Incidents(page, size, c.Query("level"), c.Query("status"))
	response.Success(c, data)
}
