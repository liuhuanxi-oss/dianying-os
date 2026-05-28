package handler

import (
	"strconv"

	"dyos-go/internal/service"
	"dyos-go/pkg/response"

	"github.com/gin-gonic/gin"
)

type FunnelHandler struct {
	svc *service.FunnelService
}

func NewFunnelHandler(svc *service.FunnelService) *FunnelHandler { return &FunnelHandler{svc: svc} }

func (h *FunnelHandler) RegisterRoutes(group *gin.RouterGroup) {
	f := group.Group("/funnel")
	{
		f.GET("/analysis", h.FunnelData)
		f.GET("/channels", h.ChannelSources)
		f.GET("/dishes/top", h.TopDishes)
		f.GET("/repurchase", h.RepurchaseAnalysis)
		f.GET("/customers", h.CustomerProfiles)
	}
}

func (h *FunnelHandler) FunnelData(c *gin.Context) {
	response.Success(c, h.svc.FunnelData(c.DefaultQuery("period", "7d")))
}

func (h *FunnelHandler) ChannelSources(c *gin.Context) {
	response.Success(c, gin.H{"items": h.svc.ChannelSources()})
}

func (h *FunnelHandler) TopDishes(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	data, err := h.svc.TopDishes(limit)
	if err != nil {
		response.Error(c, 500, response.CodeServerError, err.Error())
		return
	}
	response.Success(c, gin.H{"items": data})
}

func (h *FunnelHandler) RepurchaseAnalysis(c *gin.Context) {
	response.Success(c, h.svc.RepurchaseAnalysis())
}

func (h *FunnelHandler) CustomerProfiles(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	data, err := h.svc.CustomerProfiles(page, size)
	if err != nil {
		response.Error(c, 500, response.CodeServerError, err.Error())
		return
	}
	response.Success(c, data)
}

func (h *FunnelHandler) RegisterMerchantRoutes(group *gin.RouterGroup) {
	f := group.Group("/traffic")
	{
		f.GET("/funnel", h.MerchantFunnel)
		f.GET("/sources", h.MerchantSources)
		f.GET("/profile", h.MerchantProfile)
	}
}

func (h *FunnelHandler) MerchantFunnel(c *gin.Context) {
	response.Success(c, h.svc.FunnelData(c.DefaultQuery("period", "7d")))
}

func (h *FunnelHandler) MerchantSources(c *gin.Context) {
	response.Success(c, gin.H{"items": h.svc.ChannelSources()})
}

func (h *FunnelHandler) MerchantProfile(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	data, _ := h.svc.CustomerProfiles(page, size)
	response.Success(c, data)
}
