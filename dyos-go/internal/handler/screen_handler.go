package handler

import (
	"net/http"
	"strconv"

	"dyos-go/internal/screen"
	"dyos-go/internal/service"
	"dyos-go/pkg/response"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

type ScreenHandler struct {
	service  *service.ScreenService
	hub      *screen.Hub
	upgrader websocket.Upgrader
}

func NewScreenHandler(service *service.ScreenService, hub *screen.Hub) *ScreenHandler {
	return &ScreenHandler{
		service: service,
		hub:     hub,
		upgrader: websocket.Upgrader{CheckOrigin: allowedWebSocketOrigin},
	}
}

// --- 平台端大屏 ---

func (h *ScreenHandler) RegisterAdminRoutes(group *gin.RouterGroup) {
	sg := group.Group("/screen")
	{
		sg.GET("/snapshot", h.Snapshot)
		sg.GET("/kpis", h.KPIs)
		sg.GET("/map", h.StoreMap)
		sg.GET("/orders", h.Orders)
		sg.GET("/agents", h.AgentPipeline)
		sg.GET("/industries", h.IndustryCompare)
		sg.GET("/alerts", h.Alerts)
		sg.GET("/hourly", h.HourlyTrend)
		sg.GET("/platforms", h.PlatformStats)
	}
}

func (h *ScreenHandler) RegisterWSRoutes(group *gin.RouterGroup) {
	group.GET("/screen", h.WebSocket)
}

func (h *ScreenHandler) Snapshot(c *gin.Context) {
	response.Success(c, h.service.Snapshot())
}

func (h *ScreenHandler) KPIs(c *gin.Context) {
	response.Success(c, h.service.KPIs())
}

func (h *ScreenHandler) StoreMap(c *gin.Context) {
	response.Success(c, gin.H{"items": h.service.StoreMap()})
}

func (h *ScreenHandler) Orders(c *gin.Context) {
	response.Success(c, gin.H{"items": h.service.RealTimeOrders(queryInt(c, "limit", 20))})
}

func (h *ScreenHandler) AgentPipeline(c *gin.Context) {
	response.Success(c, gin.H{"items": h.service.AgentPipeline()})
}

func (h *ScreenHandler) IndustryCompare(c *gin.Context) {
	response.Success(c, gin.H{"items": h.service.IndustryCompare()})
}

func (h *ScreenHandler) Alerts(c *gin.Context) {
	response.Success(c, gin.H{"items": h.service.Alerts()})
}

func (h *ScreenHandler) HourlyTrend(c *gin.Context) {
	response.Success(c, gin.H{"items": h.service.HourlyTrend()})
}

func (h *ScreenHandler) PlatformStats(c *gin.Context) {
	response.Success(c, gin.H{"items": h.service.PlatformStats()})
}

// --- 商户端大屏 ---

func (h *ScreenHandler) RegisterMerchantRoutes(group *gin.RouterGroup) {
	sg := group.Group("/screen")
	{
		sg.GET("/snapshot", h.MerchantSnapshot)
		sg.GET("/kpis", h.MerchantKPIs)
		sg.GET("/orders", h.MerchantOrders)
		sg.GET("/trend", h.MerchantTrend)
		sg.GET("/hourly", h.MerchantHourly)
	}
}

func (h *ScreenHandler) MerchantSnapshot(c *gin.Context) {
	merchantID := h.getMerchantID(c)
	response.Success(c, h.service.MerchantSnap(merchantID))
}

func (h *ScreenHandler) MerchantKPIs(c *gin.Context) {
	merchantID := h.getMerchantID(c)
	response.Success(c, h.service.MerchantKPIs(merchantID))
}

func (h *ScreenHandler) MerchantOrders(c *gin.Context) {
	merchantID := h.getMerchantID(c)
	response.Success(c, gin.H{"items": h.service.MerchantOrders(merchantID, 20)})
}

func (h *ScreenHandler) MerchantTrend(c *gin.Context) {
	merchantID := h.getMerchantID(c)
	response.Success(c, gin.H{"items": h.service.MerchantTrend(merchantID)})
}

func (h *ScreenHandler) MerchantHourly(c *gin.Context) {
	merchantID := h.getMerchantID(c)
	response.Success(c, gin.H{"items": h.service.MerchantHourly(merchantID)})
}

// --- WebSocket ---

func (h *ScreenHandler) WebSocket(c *gin.Context) {
	conn, err := h.upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		return
	}
	h.hub.Add(conn)
	defer h.hub.Remove(conn)
	for {
		if _, _, err := conn.ReadMessage(); err != nil {
			return
		}
	}
}

// --- 辅助 ---

func (h *ScreenHandler) getMerchantID(c *gin.Context) uint {
	if mid, exists := c.Get("merchant_id"); exists {
		switch v := mid.(type) {
		case uint:
			return v
		case float64:
			return uint(v)
		case int:
			return uint(v)
		}
	}
	idStr := c.Query("merchant_id")
	if idStr == "" {
		idStr = c.GetHeader("X-Merchant-ID")
	}
	if idStr != "" {
		id, err := strconv.ParseUint(idStr, 10, 64)
		if err == nil {
			return uint(id)
		}
	}
	return 0
}
