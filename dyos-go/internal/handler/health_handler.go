package handler

import (
	"dyos-go/pkg/response"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type HealthHandler struct {
	db *gorm.DB
}

func NewHealthHandler(db *gorm.DB) *HealthHandler {
	return &HealthHandler{db: db}
}

func (h *HealthHandler) Check(c *gin.Context) {
	data := gin.H{"status": "healthy", "service": "dyos-go", "version": "2.0.0"}
	if h.db != nil {
		data["database"] = "connected"
	}
	response.Success(c, data)
}
