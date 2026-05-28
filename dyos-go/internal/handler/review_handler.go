package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"dyos-go/internal/model"
	"dyos-go/internal/service"
	"dyos-go/pkg/response"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

type ReviewHandler struct {
	svc      *service.ReviewService
	upgrader websocket.Upgrader
}

func NewReviewHandler(svc *service.ReviewService) *ReviewHandler {
	return &ReviewHandler{svc: svc, upgrader: websocket.Upgrader{CheckOrigin: func(r *http.Request) bool { return true }}}
}

func (h *ReviewHandler) RegisterAdminRoutes(group *gin.RouterGroup) {
	rv := group.Group("/reviews")
	{
		rv.GET("", h.List)
		rv.GET("/stats", h.Stats)
		rv.GET("/:id", h.Get)
		rv.POST("/:id/generate-reply", h.GenerateReply)
		rv.POST("/:id/sync", h.SyncReply)
		rv.GET("/rules", h.ListRules)
		rv.POST("/rules", h.CreateRule)
		rv.PUT("/rules/:id", h.UpdateRule)
		rv.DELETE("/rules/:id", h.DeleteRule)
	}
}

func (h *ReviewHandler) RegisterWSRoutes(group *gin.RouterGroup) {
	group.GET("/reviews/alert", h.AlertWS)
}

// adminMerchantID 平台端默认查看全部，可传参筛选特定商户
func adminMerchantID(c *gin.Context) uint {
	if mid := c.Query("merchant_id"); mid != "" {
		id, _ := strconv.ParseUint(mid, 10, 64)
		return uint(id)
	}
	return 0
}

func (h *ReviewHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	rating, _ := strconv.Atoi(c.DefaultQuery("rating", "0"))
	mid := adminMerchantID(c)
	result, err := h.svc.List(mid, c.Query("platform"), rating, c.Query("sentiment"), page, size)
	if err != nil {
		response.Error(c, 500, response.CodeServerError, err.Error())
		return
	}
	response.Success(c, result)
}

func (h *ReviewHandler) Stats(c *gin.Context) {
	response.Success(c, h.svc.Stats(adminMerchantID(c)))
}

func (h *ReviewHandler) Get(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, 400, response.CodeBadRequest, "无效的评价ID")
		return
	}
	if ok, _ := h.svc.CheckOwnership(uint(id), c.GetUint("tenant_merchant_id")); !ok { response.Error(c, 403, response.CodeForbidden, "无权访问此评价"); return }
	review, err := h.svc.Get(uint(id))
	if err != nil {
		response.Error(c, 404, response.CodeServerError, "评价不存在")
		return
	}
	response.Success(c, review)
}

func (h *ReviewHandler) GenerateReply(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, 400, response.CodeBadRequest, "无效的评价ID")
		return
	}
	if ok, _ := h.svc.CheckOwnership(uint(id), c.GetUint("tenant_merchant_id")); !ok { response.Error(c, 403, response.CodeForbidden, "无权操作此评价"); return }
	var body struct{ Style string `json:"style"` }
	c.ShouldBindJSON(&body)
	result, err := h.svc.GenerateReply(uint(id), body.Style)
	if err != nil {
		response.Error(c, 500, response.CodeServerError, err.Error())
		return
	}
	response.Success(c, result)
}

func (h *ReviewHandler) SyncReply(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, 400, response.CodeBadRequest, "无效的评价ID")
		return
	}
	if ok, _ := h.svc.CheckOwnership(uint(id), c.GetUint("tenant_merchant_id")); !ok { response.Error(c, 403, response.CodeForbidden, "无权操作此评价"); return }
	if err := h.svc.SyncReply(uint(id)); err != nil {
		response.Error(c, 500, response.CodeServerError, err.Error())
		return
	}
	response.Success(c, nil)
}

func (h *ReviewHandler) ListRules(c *gin.Context) {
	rules, err := h.svc.ListRules()
	if err != nil {
		response.Error(c, 500, response.CodeServerError, err.Error())
		return
	}
	response.Success(c, gin.H{"items": rules, "total": len(rules)})
}

func (h *ReviewHandler) CreateRule(c *gin.Context) {
	var rule model.ReviewReplyRule
	if err := c.ShouldBindJSON(&rule); err != nil {
		response.Error(c, 400, response.CodeBadRequest, "参数格式错误")
		return
	}
	if err := h.svc.CreateRule(&rule); err != nil {
		response.Error(c, 500, response.CodeServerError, err.Error())
		return
	}
	response.Success(c, rule)
}

func (h *ReviewHandler) UpdateRule(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, 400, response.CodeBadRequest, "无效的规则ID")
		return
	}
	var updates map[string]interface{}
	if err := c.ShouldBindJSON(&updates); err != nil {
		response.Error(c, 400, response.CodeBadRequest, "参数格式错误")
		return
	}
	if err := h.svc.UpdateRule(uint(id), updates); err != nil {
		response.Error(c, 500, response.CodeServerError, err.Error())
		return
	}
	response.Success(c, nil)
}

func (h *ReviewHandler) DeleteRule(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, 400, response.CodeBadRequest, "无效的规则ID")
		return
	}
	if err := h.svc.DeleteRule(uint(id)); err != nil {
		response.Error(c, 500, response.CodeServerError, err.Error())
		return
	}
	response.Success(c, nil)
}

func (h *ReviewHandler) RegisterMerchantRoutes(group *gin.RouterGroup) {
	rv := group.Group("/reviews")
	{
		rv.GET("", h.MerchantList)
		rv.GET("/stats", h.MerchantStats)
		rv.GET("/:id", h.MerchantGet)
		rv.POST("/:id/reply", h.MerchantReply)
		rv.POST("/ai-reply", h.MerchantAIReply)
		rv.POST("/:id/sync", h.MerchantSync)
	}
}

func (h *ReviewHandler) MerchantList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	rating, _ := strconv.Atoi(c.DefaultQuery("rating", "0"))
	mid := c.GetUint("merchant_id")
	result, _ := h.svc.List(mid, c.Query("platform"), rating, c.Query("sentiment"), page, size)
	response.Success(c, result)
}

func (h *ReviewHandler) MerchantStats(c *gin.Context) {
	response.Success(c, h.svc.Stats(c.GetUint("merchant_id")))
}

func (h *ReviewHandler) MerchantGet(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	if ok, _ := h.svc.CheckOwnership(uint(id), c.GetUint("merchant_id")); !ok { response.Error(c, 403, response.CodeForbidden, "无权访问此评价"); return }
	review, err := h.svc.Get(uint(id))
	if err != nil {
		response.Error(c, 404, response.CodeServerError, "评价不存在")
		return
	}
	response.Success(c, review)
}

func (h *ReviewHandler) MerchantReply(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	if ok, _ := h.svc.CheckOwnership(uint(id), c.GetUint("merchant_id")); !ok { response.Error(c, 403, response.CodeForbidden, "无权操作此评价"); return }
	var body struct{ Content string `json:"content"` }
	c.ShouldBindJSON(&body)
	if err := h.svc.SaveReply(uint(id), body.Content); err != nil {
		response.Error(c, 500, response.CodeServerError, "保存回复失败")
		return
	}
	response.Success(c, map[string]interface{}{"id": id, "reply": body.Content, "status": "replied"})
}

func (h *ReviewHandler) MerchantAIReply(c *gin.Context) {
	var body struct {
		ReviewID uint   `json:"review_id"`
		Style    string `json:"style"`
	}
	if err := c.ShouldBindJSON(&body); err != nil { response.Error(c, 400, response.CodeBadRequest, "参数无效"); return }
	if ok, _ := h.svc.CheckOwnership(body.ReviewID, c.GetUint("merchant_id")); !ok { response.Error(c, 403, response.CodeForbidden, "无权操作此评价"); return }
	result, _ := h.svc.GenerateReply(body.ReviewID, body.Style)
	response.Success(c, result)
}

func (h *ReviewHandler) MerchantSync(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	if ok, _ := h.svc.CheckOwnership(uint(id), c.GetUint("merchant_id")); !ok { response.Error(c, 403, response.CodeForbidden, "无权操作此评价"); return }
	h.svc.SyncReply(uint(id))
	response.Success(c, nil)
}

func (h *ReviewHandler) AlertWS(c *gin.Context) {
	conn, err := h.upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		return
	}
	defer conn.Close()
	ch := h.svc.AlertHub.Subscribe()
	defer h.svc.AlertHub.Unsubscribe(ch)
	for msg := range ch {
		data, _ := json.Marshal(msg)
		if err := conn.WriteMessage(websocket.TextMessage, data); err != nil {
			return
		}
	}
}
