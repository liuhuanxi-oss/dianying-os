package handler

import (
	"strconv"

	"dyos-go/internal/model"
	"dyos-go/internal/service"
	"dyos-go/pkg/response"

	"github.com/gin-gonic/gin"
)

type MemberHandler struct{ svc *service.MemberService }

func NewMemberHandler(svc *service.MemberService) *MemberHandler { return &MemberHandler{svc: svc} }

func (h *MemberHandler) RegisterRoutes(group *gin.RouterGroup) {
	m := group.Group("/members")
	{
		m.GET("", h.List)
		m.GET("/:id", h.Get)
		m.POST("", h.Create)
		m.PUT("/:id", h.Update)
		m.GET("/levels", h.LevelRules)
		m.GET("/:id/points", h.PointsHistory)
		m.GET("/:id/profile", h.Profile)
	}
}

func (h *MemberHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	data, _ := h.svc.List(page, size, c.Query("level"))
	response.Success(c, data)
}

func (h *MemberHandler) Get(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	m, err := h.svc.Get(uint(id))
	if err != nil {
		response.Error(c, 404, response.CodeServerError, "会员不存在")
		return
	}
	response.Success(c, m)
}

func (h *MemberHandler) Create(c *gin.Context) {
	var m model.Member
	if err := c.ShouldBindJSON(&m); err != nil { response.Error(c, 400, response.CodeBadRequest, "参数格式错误"); return }
	h.svc.Create(&m)
	response.Success(c, m)
}

func (h *MemberHandler) Update(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	var updates map[string]interface{}
	c.ShouldBindJSON(&updates)
	h.svc.Update(uint(id), updates)
	response.Success(c, nil)
}

func (h *MemberHandler) LevelRules(c *gin.Context) {
	response.Success(c, gin.H{"items": h.svc.LevelRules()})
}

func (h *MemberHandler) PointsHistory(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	data, _ := h.svc.PointsHistory(uint(id), page, size)
	response.Success(c, data)
}

func (h *MemberHandler) Profile(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	response.Success(c, h.svc.Profile(uint(id)))
}

func (h *MemberHandler) RegisterMerchantRoutes(group *gin.RouterGroup) {
	m := group.Group("/members")
	{
		m.GET("", h.MerchantList)
		m.GET("/:id", h.MerchantGet)
		m.POST("", h.MerchantCreate)
		m.PUT("/:id", h.MerchantUpdate)
		m.GET("/levels", h.MerchantLevels)
		m.POST("/:id/points", h.MerchantAdjustPoints)
	}
}

func (h *MemberHandler) MerchantList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	data, _ := h.svc.List(page, size, c.Query("level"))
	response.Success(c, data)
}

func (h *MemberHandler) MerchantGet(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	m, err := h.svc.Get(uint(id))
	if err != nil {
		response.Error(c, 404, response.CodeServerError, "会员不存在")
		return
	}
	response.Success(c, m)
}

func (h *MemberHandler) MerchantCreate(c *gin.Context) {
	var m model.Member
	if err := c.ShouldBindJSON(&m); err != nil {
		response.Error(c, 400, response.CodeBadRequest, "参数格式错误")
		return
	}
	h.svc.Create(&m)
	response.Success(c, m)
}

func (h *MemberHandler) MerchantUpdate(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	var updates map[string]interface{}
	c.ShouldBindJSON(&updates)
	h.svc.Update(uint(id), updates)
	response.Success(c, nil)
}

func (h *MemberHandler) MerchantLevels(c *gin.Context) {
	response.Success(c, gin.H{"items": h.svc.LevelRules()})
}

func (h *MemberHandler) MerchantAdjustPoints(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	var body struct{ Points int `json:"points"`; Reason string `json:"reason"` }
	c.ShouldBindJSON(&body)
	response.Success(c, map[string]interface{}{"member_id": id, "points_added": body.Points, "reason": body.Reason})
}
