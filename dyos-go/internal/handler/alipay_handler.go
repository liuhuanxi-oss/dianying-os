package handler

import (
	"strconv"

	"dyos-go/internal/service"
	"dyos-go/pkg/response"

	"github.com/gin-gonic/gin"
)

type AlipayHandler struct{ svc *service.AlipayService }

func NewAlipayHandler(svc *service.AlipayService) *AlipayHandler { return &AlipayHandler{svc: svc} }

func (h *AlipayHandler) RegisterRoutes(group *gin.RouterGroup) {
	ap := group.Group("/alipay")
	{
		ap.POST("/order/create", h.CreateOrder)
		ap.GET("/order/query/:out_trade_no", h.QueryOrder)
		ap.POST("/order/refund", h.Refund)
		ap.POST("/knowledge/transfer", h.KnowledgeTransfer)
		ap.GET("/knowledge/score", h.TransferScore)
	}
}

func (h *AlipayHandler) CreateOrder(c *gin.Context) {
	var params map[string]interface{}
	c.ShouldBindJSON(&params)
	response.Success(c, h.svc.CreateOrder(params))
}

func (h *AlipayHandler) QueryOrder(c *gin.Context) {
	response.Success(c, h.svc.QueryOrder(c.Param("out_trade_no")))
}

func (h *AlipayHandler) Refund(c *gin.Context) {
	var body struct {
		OutTradeNo string  `json:"out_trade_no"`
		Amount     float64 `json:"amount"`
	}
	c.ShouldBindJSON(&body)
	response.Success(c, h.svc.Refund(body.OutTradeNo, body.Amount))
}

func (h *AlipayHandler) KnowledgeTransfer(c *gin.Context) {
	var body struct {
		FromMerchant uint `json:"from_merchant"`
		ToMerchant   uint `json:"to_merchant"`
	}
	c.ShouldBindJSON(&body)
	response.Success(c, h.svc.KnowledgeTransfer(body.FromMerchant, body.ToMerchant))
}

func (h *AlipayHandler) TransferScore(c *gin.Context) {
	from, _ := strconv.ParseUint(c.DefaultQuery("from", "1"), 10, 64)
	to, _ := strconv.ParseUint(c.DefaultQuery("to", "2"), 10, 64)
	response.Success(c, h.svc.TransferScore(uint(from), uint(to)))
}

func (h *AlipayHandler) RegisterMerchantRoutes(group *gin.RouterGroup) {
	ap := group.Group("/alipay")
	{
		ap.POST("/trade", h.MerchantTrade)
		ap.POST("/refund", h.MerchantRefund)
		ap.GET("/trade/:id", h.MerchantQueryTrade)
		ap.GET("/stats", h.MerchantStats)
	}
}

func (h *AlipayHandler) MerchantTrade(c *gin.Context) {
	var params map[string]interface{}
	c.ShouldBindJSON(&params)
	response.Success(c, h.svc.CreateOrder(params))
}

func (h *AlipayHandler) MerchantRefund(c *gin.Context) {
	var body struct{ OutTradeNo string `json:"out_trade_no"`; Amount float64 `json:"amount"` }
	c.ShouldBindJSON(&body)
	response.Success(c, h.svc.Refund(body.OutTradeNo, body.Amount))
}

func (h *AlipayHandler) MerchantQueryTrade(c *gin.Context) {
	response.Success(c, h.svc.QueryOrder(c.Param("id")))
}

func (h *AlipayHandler) MerchantStats(c *gin.Context) {
	response.Success(c, map[string]interface{}{
		"total_trades": 1286, "total_amount": 85600.00, "refund_rate": "2.3%", "today_trades": 42,
	})
}
