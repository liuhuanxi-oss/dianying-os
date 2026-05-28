package handler

import (
	"strconv"
	"time"

	"dyos-go/internal/service"
	"dyos-go/pkg/response"

	"github.com/gin-gonic/gin"
)

type InsightHandler struct{ svc *service.InsightService }

func NewInsightHandler(svc *service.InsightService) *InsightHandler { return &InsightHandler{svc: svc} }

func (h *InsightHandler) RegisterRoutes(group *gin.RouterGroup) {
	ins := group.Group("/insights")
	{
		ins.GET("/decision-logs", h.DecisionLogs)
		ins.GET("/daily-report", h.AIDailyReport)
		ins.GET("/daily-reports", h.ListDailyReports)
	}
}

func (h *InsightHandler) DecisionLogs(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	data, _ := h.svc.DecisionLogs(page, size)
	response.Success(c, data)
}

func (h *InsightHandler) AIDailyReport(c *gin.Context) {
	date := c.DefaultQuery("date", time.Now().Format("2006-01-02"))
	response.Success(c, h.svc.AIDailyReport(date))
}

func (h *InsightHandler) ListDailyReports(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "10"))
	data, _ := h.svc.ListDailyReports(page, size)
	response.Success(c, data)
}

func (h *InsightHandler) RegisterMerchantRoutes(group *gin.RouterGroup) {
	a := group.Group("/analytics")
	{
		a.GET("/overview", h.MerchantOverview)
		a.GET("/gmv-trend", h.MerchantGMVTrend)
		a.GET("/ai-usage", h.MerchantAIUsage)
	}
}

func (h *InsightHandler) MerchantOverview(c *gin.Context) {
	response.Success(c, map[string]interface{}{
		"gmv_today": 28600, "orders_today": 128, "avg_amount": 223.4,
		"ai_reply_rate": "92%", "review_count": 486, "avg_rating": 4.3,
	})
}

func (h *InsightHandler) MerchantGMVTrend(c *gin.Context) {
	response.Success(c, map[string]interface{}{
		"trend": []map[string]interface{}{
			{"date": "05-18", "gmv": 25300}, {"date": "05-19", "gmv": 26800},
			{"date": "05-20", "gmv": 24500}, {"date": "05-21", "gmv": 29200},
			{"date": "05-22", "gmv": 27800}, {"date": "05-23", "gmv": 30500}, {"date": "05-24", "gmv": 28600},
		},
	})
}

func (h *InsightHandler) MerchantAIUsage(c *gin.Context) {
	response.Success(c, map[string]interface{}{
		"ai_reply_count": 156, "ai_reply_rate": 0.92, "avg_reply_time": 28,
		"sentiment_positive": 392, "sentiment_neutral": 68, "sentiment_negative": 26,
	})
}
