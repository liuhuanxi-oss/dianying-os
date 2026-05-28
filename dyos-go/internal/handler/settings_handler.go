package handler

import (
	"dyos-go/internal/service"
	"dyos-go/pkg/response"

	"github.com/gin-gonic/gin"
)

type SettingsHandler struct{ svc *service.SettingsService }

func NewSettingsHandler(svc *service.SettingsService) *SettingsHandler { return &SettingsHandler{svc: svc} }

func (h *SettingsHandler) RegisterMerchantRoutes(group *gin.RouterGroup) {
	s := group.Group("/settings")
	{
		s.GET("", h.Get)
		s.PUT("", h.Update)
		s.PUT("/password", h.UpdatePassword)
	}
}

func (h *SettingsHandler) Get(c *gin.Context) {
	response.Success(c, h.svc.Get())
}

func (h *SettingsHandler) Update(c *gin.Context) {
	var updates map[string]interface{}
	c.ShouldBindJSON(&updates)
	h.svc.Update(updates)
	response.Success(c, nil)
}

func (h *SettingsHandler) UpdatePassword(c *gin.Context) {
	var body struct {
		OldPassword string `json:"old_password"`
		NewPassword string `json:"new_password"`
	}
	c.ShouldBindJSON(&body)
	h.svc.UpdatePassword(body.OldPassword, body.NewPassword)
	response.Success(c, nil)
}
