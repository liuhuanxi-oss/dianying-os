package handler

import (
	"net/http"

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
	return &ScreenHandler{service: service, hub: hub, upgrader: websocket.Upgrader{CheckOrigin: func(r *http.Request) bool { return true }}}
}

func (h *ScreenHandler) RegisterAdminRoutes(group *gin.RouterGroup) {
	screenGroup := group.Group("/screen")
	{
		screenGroup.GET("/snapshot", h.Snapshot)
		screenGroup.GET("/kpis", h.KPIs)
		screenGroup.GET("/map", h.StoreMap)
		screenGroup.GET("/orders", h.Orders)
		screenGroup.GET("/agents", h.AgentPipeline)
		screenGroup.GET("/industries", h.IndustryCompare)
		screenGroup.GET("/alerts", h.Alerts)
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

func (h *ScreenHandler) RegisterMerchantRoutes(group *gin.RouterGroup) {
	sg := group.Group("/screen")
	{
		sg.GET("/kpis", h.MerchantKPIs)
		sg.GET("/orders", h.MerchantOrders)
		sg.GET("/trend", h.MerchantTrend)
	}
}

func (h *ScreenHandler) MerchantKPIs(c *gin.Context) {
	response.Success(c, h.service.KPIs())
}

func (h *ScreenHandler) MerchantOrders(c *gin.Context) {
	response.Success(c, gin.H{"items": h.service.RealTimeOrders(20)})
}

func (h *ScreenHandler) MerchantTrend(c *gin.Context) {
	response.Success(c, map[string]interface{}{
		"trend": []map[string]interface{}{
			{"date": "05-18", "gmv": 25300}, {"date": "05-19", "gmv": 26800},
			{"date": "05-20", "gmv": 24500}, {"date": "05-21", "gmv": 29200},
			{"date": "05-22", "gmv": 27800}, {"date": "05-23", "gmv": 30500}, {"date": "05-24", "gmv": 28600},
		},
	})
}

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
