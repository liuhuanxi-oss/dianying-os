package handler

import (
	"strconv"

	"dyos-go/internal/model"
	"dyos-go/internal/service"
	"dyos-go/pkg/response"

	"github.com/gin-gonic/gin"
)

type PlatformHandler struct{ svc *service.PlatformService }

func NewPlatformHandler(svc *service.PlatformService) *PlatformHandler { return &PlatformHandler{svc: svc} }

func (h *PlatformHandler) RegisterRoutes(group *gin.RouterGroup) {
	p := group.Group("/platform")
	{
		p.GET("/adapters", h.ListAdapters)
		p.PUT("/adapters/:platform", h.UpdateAdapter)
		p.POST("/adapters/:platform/sync", h.SyncReviews)
		p.POST("/adapters/:platform/toggle-mock", h.ToggleMock)
		p.GET("/calendar", h.CalendarEvents)
		p.POST("/calendar", h.CreateCalendarEvent)
		p.GET("/inventory/alerts", h.InventoryAlerts)
	}
}

func (h *PlatformHandler) ListAdapters(c *gin.Context) {
	data, _ := h.svc.ListAdapters()
	response.Success(c, gin.H{"items": data})
}

func (h *PlatformHandler) UpdateAdapter(c *gin.Context) {
	var updates map[string]interface{}
	c.ShouldBindJSON(&updates)
	response.Success(c, h.svc.UpdateAdapter(c.Param("platform"), updates))
}

func (h *PlatformHandler) SyncReviews(c *gin.Context) {
	response.Success(c, h.svc.SyncReviews(c.Param("platform")))
}

func (h *PlatformHandler) ToggleMock(c *gin.Context) {
	var body struct{ UseMock bool `json:"use_mock"` }
	c.ShouldBindJSON(&body)
	response.Success(c, h.svc.ToggleMock(c.Param("platform"), body.UseMock))
}

func (h *PlatformHandler) CalendarEvents(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	data, _ := h.svc.CalendarEvents(page, size)
	response.Success(c, data)
}

func (h *PlatformHandler) CreateCalendarEvent(c *gin.Context) {
	var e model.CalendarEvent
	if err := c.ShouldBindJSON(&e); err != nil {
		response.Error(c, 400, response.CodeBadRequest, "参数格式错误")
		return
	}
	h.svc.CreateCalendarEvent(&e)
	response.Success(c, e)
}

func (h *PlatformHandler) InventoryAlerts(c *gin.Context) {
	response.Success(c, gin.H{"items": h.svc.InventoryAlerts()})
}

func (h *PlatformHandler) RegisterMerchantRoutes(group *gin.RouterGroup) {
	cal := group.Group("/calendar")
	{
		cal.GET("", h.MerchantCalendarList)
		cal.POST("", h.MerchantCalendarCreate)
		cal.PUT("/:id", h.MerchantCalendarUpdate)
		cal.DELETE("/:id", h.MerchantCalendarDelete)
	}
	inv := group.Group("/inventory")
	{
		inv.GET("/alerts", h.MerchantInvAlerts)
		inv.GET("/alerts/:id", h.MerchantInvAlertDetail)
		inv.POST("/alerts/:id/resolve", h.MerchantInvResolve)
		inv.GET("/suggestion", h.MerchantInvSuggestion)
	}
}

func (h *PlatformHandler) MerchantCalendarList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	data, _ := h.svc.CalendarEvents(page, size)
	response.Success(c, data)
}

func (h *PlatformHandler) MerchantCalendarCreate(c *gin.Context) {
	var e model.CalendarEvent
	c.ShouldBindJSON(&e)
	h.svc.CreateCalendarEvent(&e)
	response.Success(c, e)
}

func (h *PlatformHandler) MerchantCalendarUpdate(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	var updates map[string]interface{}
	c.ShouldBindJSON(&updates)
	response.Success(c, map[string]interface{}{"id": id, "updated": true})
}

func (h *PlatformHandler) MerchantCalendarDelete(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	response.Success(c, map[string]interface{}{"id": id, "deleted": true})
}

func (h *PlatformHandler) MerchantInvAlerts(c *gin.Context) {
	response.Success(c, gin.H{"items": h.svc.InventoryAlerts()})
}

func (h *PlatformHandler) MerchantInvAlertDetail(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	response.Success(c, map[string]interface{}{"id": id, "product": "牛肉卷", "stock": 12, "threshold": 50, "level": "warning"})
}

func (h *PlatformHandler) MerchantInvResolve(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	response.Success(c, map[string]interface{}{"id": id, "resolved": true})
}

func (h *PlatformHandler) MerchantInvSuggestion(c *gin.Context) {
	response.Success(c, map[string]interface{}{
		"suggestions": []map[string]interface{}{
			{"product": "牛肉卷", "suggested_order": 45, "reason": "库存仅剩12份，建议紧急补货"},
			{"product": "金针菇", "suggested_order": 30, "reason": "预计周末用量增加50%"},
		},
	})
}
