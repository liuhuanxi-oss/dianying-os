package handler

import (
	"strconv"

	"dyos-go/internal/service"
	"dyos-go/pkg/response"

	"github.com/gin-gonic/gin"
)

type TrustHandler struct{ svc *service.TrustService }

func NewTrustHandler(svc *service.TrustService) *TrustHandler { return &TrustHandler{svc: svc} }

func (h *TrustHandler) RegisterRoutes(group *gin.RouterGroup) {
	t := group.Group("/trust")
	{
		t.GET("/:merchant_id", h.Get)
		t.PUT("/:merchant_id", h.Update)
		t.GET("/permissions/:level", h.Permissions)
	}
}

func (h *TrustHandler) Get(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("merchant_id"), 10, 64)
	response.Success(c, h.svc.Get(uint(id)))
}

func (h *TrustHandler) Update(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("merchant_id"), 10, 64)
	var body struct{ Level string `json:"level"` }
	c.ShouldBindJSON(&body)
	h.svc.Update(uint(id), body.Level)
	response.Success(c, nil)
}

func (h *TrustHandler) Permissions(c *gin.Context) {
	response.Success(c, h.svc.Permissions(c.Param("level")))
}
