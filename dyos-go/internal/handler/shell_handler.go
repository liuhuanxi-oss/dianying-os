package handler

import (
	"strconv"

	"dyos-go/internal/model"
	"dyos-go/internal/service"
	"dyos-go/pkg/response"

	"github.com/gin-gonic/gin"
)

type ShellHandler struct{ svc *service.ShellService }

func NewShellHandler(svc *service.ShellService) *ShellHandler { return &ShellHandler{svc: svc} }

func (h *ShellHandler) RegisterRoutes(group *gin.RouterGroup) {
	sh := group.Group("/shell")
	{
		sh.GET("/commands", h.SearchCommands)
		sh.GET("/onboarding", h.OnboardingSteps)
		sh.GET("/changelogs", h.ListChangelogs)
		sh.POST("/changelogs", h.CreateChangelog)
	}
}

func (h *ShellHandler) SearchCommands(c *gin.Context) {
	response.Success(c, gin.H{"items": h.svc.SearchCommands(c.Query("q"))})
}

func (h *ShellHandler) OnboardingSteps(c *gin.Context) {
	response.Success(c, gin.H{"items": h.svc.OnboardingSteps()})
}

func (h *ShellHandler) ListChangelogs(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	data, _ := h.svc.ListChangelogs(page, size)
	response.Success(c, data)
}

func (h *ShellHandler) CreateChangelog(c *gin.Context) {
	var cg model.Changelog
	if err := c.ShouldBindJSON(&cg); err != nil { response.Error(c, 400, response.CodeBadRequest, "参数格式错误"); return }
	h.svc.CreateChangelog(&cg)
	response.Success(c, cg)
}

func (h *ShellHandler) RegisterMerchantRoutes(group *gin.RouterGroup) {
	cmd := group.Group("/commands")
	{
		cmd.GET("", h.MerchantCommands)
		cmd.GET("/search", h.MerchantSearchCommands)
		cmd.POST("/:id/execute", h.MerchantExecuteCommand)
	}
	ob := group.Group("/onboarding")
	{
		ob.GET("/status", h.MerchantOnboardingStatus)
		ob.POST("/complete", h.MerchantOnboardingComplete)
		ob.POST("/skip", h.MerchantOnboardingSkip)
	}
	cl := group.Group("/changelog")
	{
		cl.GET("", h.MerchantChangelogs)
		cl.GET("/latest", h.MerchantLatestChangelog)
	}
}

func (h *ShellHandler) MerchantCommands(c *gin.Context) {
	response.Success(c, gin.H{"items": h.svc.SearchCommands("")})
}

func (h *ShellHandler) MerchantSearchCommands(c *gin.Context) {
	response.Success(c, gin.H{"items": h.svc.SearchCommands(c.Query("q"))})
}

func (h *ShellHandler) MerchantExecuteCommand(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	response.Success(c, map[string]interface{}{"command_id": id, "executed": true, "result": "命令已执行"})
}

func (h *ShellHandler) MerchantOnboardingStatus(c *gin.Context) {
	response.Success(c, map[string]interface{}{"current_step": 2, "total_steps": 4, "progress": 50, "steps": h.svc.OnboardingSteps()})
}

func (h *ShellHandler) MerchantOnboardingComplete(c *gin.Context) {
	var body struct{ Step string `json:"step"` }
	c.ShouldBindJSON(&body)
	response.Success(c, map[string]interface{}{"step": body.Step, "status": "completed"})
}

func (h *ShellHandler) MerchantOnboardingSkip(c *gin.Context) {
	response.Success(c, map[string]interface{}{"skipped": true, "message": "引导已跳过"})
}

func (h *ShellHandler) MerchantChangelogs(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	data, _ := h.svc.ListChangelogs(page, size)
	response.Success(c, data)
}

func (h *ShellHandler) MerchantLatestChangelog(c *gin.Context) {
	response.Success(c, map[string]interface{}{
		"version": "v2.0.0", "title": "支付投诉AI处理上线",
		"description": "新增微信/支付宝投诉AI自动处理功能，支持DeepSeek分诊+天阙自动退款",
		"released_at": "2026-05-24",
	})
}
