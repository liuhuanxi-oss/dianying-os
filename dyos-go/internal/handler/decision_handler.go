package handler

import (
	"strconv"

	"dyos-go/internal/service"
	"dyos-go/pkg/response"

	"github.com/gin-gonic/gin"
)

type DecisionHandler struct {
	svc *service.DecisionService
}

func NewDecisionHandler(svc *service.DecisionService) *DecisionHandler { return &DecisionHandler{svc: svc} }

func (h *DecisionHandler) RegisterRoutes(group *gin.RouterGroup) {
	d := group.Group("/decisions")
	{
		d.POST("/roi", h.CalcROI)
		d.GET("/competitor", h.CompetitorBenchmark)
		d.GET("/trend", h.TrendPredict)
	}
}

func (h *DecisionHandler) CalcROI(c *gin.Context) {
	var params map[string]interface{}
	c.ShouldBindJSON(&params)
	response.Success(c, h.svc.CalcROI(params))
}

func (h *DecisionHandler) CompetitorBenchmark(c *gin.Context) {
	response.Success(c, gin.H{"items": h.svc.CompetitorBenchmark(c.DefaultQuery("industry", "餐饮"))})
}

func (h *DecisionHandler) TrendPredict(c *gin.Context) {
	months := 6
	if m, ok := c.GetQuery("months"); ok {
		if v, err := strconv.Atoi(m); err == nil && v > 0 { months = v }
	}
	response.Success(c, h.svc.TrendPredict(c.DefaultQuery("metric", "gmv"), months))
}
