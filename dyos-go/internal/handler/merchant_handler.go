package handler

import (
	"net/http"
	"strconv"

	"dyos-go/internal/service"
	"dyos-go/pkg/response"

	"github.com/gin-gonic/gin"
)

type MerchantHandler struct {
	service *service.MerchantService
}

func NewMerchantHandler(service *service.MerchantService) *MerchantHandler {
	return &MerchantHandler{service: service}
}

func (h *MerchantHandler) RegisterRoutes(group *gin.RouterGroup) {
	merchants := group.Group("/merchants")
	{
		merchants.GET("/", h.List)
		merchants.GET("/stats", h.Stats)
		merchants.GET("/:merchant_id", h.Get)
		merchants.POST("/", h.Create)
		merchants.PUT("/:merchant_id", h.Update)
		merchants.DELETE("/:merchant_id", h.Delete)
		merchants.POST("/audit", h.Audit)
		merchants.POST("/upgrade", h.Upgrade)
		merchants.POST("/:merchant_id/upgrade", h.UpgradeByPath)
		merchants.GET("/:merchant_id/permission", h.GetPermission)
		merchants.PUT("/:merchant_id/permission", h.UpdatePermission)
	}
}

func (h *MerchantHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))

	data, err := h.service.List(page, size, c.Query("status"), c.Query("industry"), c.Query("keyword"))
	if err != nil {
		response.Error(c, http.StatusInternalServerError, response.CodeServerError, "获取商户列表失败")
		return
	}
	response.Success(c, data)
}

func (h *MerchantHandler) Stats(c *gin.Context) {
	stats, err := h.service.Stats()
	if err != nil {
		response.Error(c, http.StatusInternalServerError, response.CodeServerError, "获取商户统计失败")
		return
	}
	response.Success(c, stats)
}

func (h *MerchantHandler) Get(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("merchant_id"), 10, 64)
	if err != nil || id == 0 {
		response.Error(c, http.StatusBadRequest, response.CodeBadRequest, "商户ID无效")
		return
	}
	data, err := h.service.Get(uint(id))
	if err != nil {
		response.Error(c, http.StatusNotFound, response.CodeServerError, "商户不存在")
		return
	}
	response.Success(c, data)
}

func (h *MerchantHandler) Create(c *gin.Context) {
	var data map[string]interface{}
	if err := c.ShouldBindJSON(&data); err != nil {
		response.Error(c, 400, response.CodeBadRequest, "参数格式错误")
		return
	}
	pm, err := h.service.Create(data)
	if err != nil {
		response.Error(c, 500, response.CodeServerError, "创建商户失败: "+err.Error())
		return
	}
	response.Success(c, map[string]interface{}{"id": pm.ID, "status": pm.Status, "channel": pm.Channel})
}

func (h *MerchantHandler) Update(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("merchant_id"), 10, 64)
	if err != nil || id == 0 {
		response.Error(c, http.StatusBadRequest, response.CodeBadRequest, "商户ID无效")
		return
	}
	var updates map[string]interface{}
	if err := c.ShouldBindJSON(&updates); err != nil {
		response.Error(c, 400, response.CodeBadRequest, "参数格式错误")
		return
	}
	if err := h.service.Update(uint(id), updates); err != nil {
		response.Error(c, 500, response.CodeServerError, "更新商户失败: "+err.Error())
		return
	}
	response.Success(c, map[string]interface{}{"id": id, "updated": true})
}

func (h *MerchantHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("merchant_id"), 10, 64)
	if err != nil || id == 0 {
		response.Error(c, http.StatusBadRequest, response.CodeBadRequest, "商户ID无效")
		return
	}
	if err := h.service.Delete(uint(id)); err != nil {
		response.Error(c, 500, response.CodeServerError, "删除商户失败: "+err.Error())
		return
	}
	response.Success(c, map[string]interface{}{"id": id, "deleted": true})
}

func (h *MerchantHandler) Audit(c *gin.Context) {
	var body struct {
		MerchantID uint   `json:"merchant_id" binding:"required"`
		Status     string `json:"status" binding:"required"`
		Remark     string `json:"remark"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.Error(c, 400, response.CodeBadRequest, "参数格式错误: "+err.Error())
		return
	}
	if err := h.service.Audit(body.MerchantID, body.Status, body.Remark); err != nil {
		response.Error(c, 500, response.CodeServerError, "审核失败: "+err.Error())
		return
	}
	response.Success(c, map[string]interface{}{"merchant_id": body.MerchantID, "status": body.Status, "audited": true})
}

func (h *MerchantHandler) Upgrade(c *gin.Context) {
	var body struct {
		MerchantID uint   `json:"merchant_id" binding:"required"`
		Plan       string `json:"plan" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.Error(c, 400, response.CodeBadRequest, "参数格式错误: "+err.Error())
		return
	}
	if err := h.service.Upgrade(body.MerchantID, body.Plan); err != nil {
		response.Error(c, 500, response.CodeServerError, "升级失败: "+err.Error())
		return
	}
	response.Success(c, map[string]interface{}{"merchant_id": body.MerchantID, "plan": body.Plan, "upgraded": true})
}

func (h *MerchantHandler) UpgradeByPath(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("merchant_id"), 10, 64)
	if err != nil || id == 0 {
		response.Error(c, http.StatusBadRequest, response.CodeBadRequest, "商户ID无效")
		return
	}
	var body struct{ Plan string `json:"plan" binding:"required"` }
	if err := c.ShouldBindJSON(&body); err != nil {
		response.Error(c, 400, response.CodeBadRequest, "参数格式错误: "+err.Error())
		return
	}
	if err := h.service.Upgrade(uint(id), body.Plan); err != nil {
		response.Error(c, 500, response.CodeServerError, "升级失败: "+err.Error())
		return
	}
	response.Success(c, map[string]interface{}{"merchant_id": id, "plan": body.Plan, "upgraded": true})
}

func (h *MerchantHandler) GetPermission(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("merchant_id"), 10, 64)
	response.Success(c, map[string]interface{}{
		"merchant_id": id,
		"permissions": []string{"basic_ai", "basic_stats"},
	})
}

func (h *MerchantHandler) UpdatePermission(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("merchant_id"), 10, 64)
	if err != nil || id == 0 {
		response.Error(c, http.StatusBadRequest, response.CodeBadRequest, "商户ID无效")
		return
	}
	var body struct {
		Permissions []string `json:"permissions" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.Error(c, 400, response.CodeBadRequest, "参数格式错误")
		return
	}
	response.Success(c, map[string]interface{}{"merchant_id": id, "permissions": body.Permissions, "updated": true})
}
