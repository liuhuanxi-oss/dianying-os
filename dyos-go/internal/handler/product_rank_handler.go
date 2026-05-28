package handler

import (
	"strconv"

	"dyos-go/internal/service"
	"dyos-go/pkg/response"

	"github.com/gin-gonic/gin"
)

type ProductRankHandler struct{ svc *service.ProductRankService }

func NewProductRankHandler(svc *service.ProductRankService) *ProductRankHandler {
	return &ProductRankHandler{svc: svc}
}

func (h *ProductRankHandler) RegisterRoutes(group *gin.RouterGroup) {
	pr := group.Group("/product-rank")
	{
		pr.GET("/rank", h.Rank)
		pr.GET("/repurchase", h.Repurchase)
		pr.GET("/correlation", h.Correlation)
		pr.GET("/feedback", h.Feedback)
	}
}

func (h *ProductRankHandler) Rank(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	data, _ := h.svc.Rank(page, size, c.DefaultQuery("period", "month"), c.Query("category"))
	response.Success(c, data)
}

func (h *ProductRankHandler) Repurchase(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	data, _ := h.svc.Repurchase(page, size, c.DefaultQuery("period", "month"))
	response.Success(c, data)
}

func (h *ProductRankHandler) Correlation(c *gin.Context) {
	id, _ := strconv.ParseUint(c.DefaultQuery("product_id", "1"), 10, 64)
	response.Success(c, h.svc.Correlation(uint(id)))
}

func (h *ProductRankHandler) Feedback(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	data, _ := h.svc.Feedback(page, size, c.Query("product_name"))
	response.Success(c, data)
}

func (h *ProductRankHandler) RegisterMerchantRoutes(group *gin.RouterGroup) {
	pr := group.Group("/product-rank")
	{
		pr.GET("/rank", h.MerchantRank)
		pr.GET("/repurchase", h.MerchantRepurchase)
		pr.GET("/feedback", h.MerchantFeedback)
	}
}

func (h *ProductRankHandler) MerchantRank(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	data, _ := h.svc.Rank(page, size, c.DefaultQuery("period", "month"), c.Query("category"))
	response.Success(c, data)
}

func (h *ProductRankHandler) MerchantRepurchase(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	data, _ := h.svc.Repurchase(page, size, c.DefaultQuery("period", "month"))
	response.Success(c, data)
}

func (h *ProductRankHandler) MerchantFeedback(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	data, _ := h.svc.Feedback(page, size, c.Query("product_name"))
	response.Success(c, data)
}
