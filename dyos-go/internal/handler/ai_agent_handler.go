package handler

import (
	"fmt"
	"strconv"

	"dyos-go/internal/service"
	"dyos-go/pkg/response"

	"github.com/gin-gonic/gin"
)

type AIAgentHandler struct {
	svc       *service.AIAgentService
	notifySvc *service.NotificationService
}

func NewAIAgentHandler(svc *service.AIAgentService) *AIAgentHandler {
	return &AIAgentHandler{svc: svc}
}
func (h *AIAgentHandler) SetNotificationService(ns *service.NotificationService) { h.notifySvc = ns }

func (h *AIAgentHandler) RegisterRoutes(group *gin.RouterGroup) {
	ai := group.Group("/ai-agents")
	{
		ai.GET("", h.ListAgents)
		ai.POST("/:type/trigger", h.Trigger)
		ai.GET("/tasks", h.ListTasks)
		ai.GET("/tasks/:id", h.GetTask)
		ai.POST("/tasks/:id/cancel", h.CancelTask)
		ai.GET("/config", h.GetConfig)
		ai.PUT("/config/:type", h.UpdateConfig)
	}
}

func (h *AIAgentHandler) ListAgents(c *gin.Context) {
	response.Success(c, gin.H{"items": h.svc.ListAgents()})
}

func (h *AIAgentHandler) Trigger(c *gin.Context) {
	agentType := c.Param("type")
	var params map[string]interface{}
	if err := c.ShouldBindJSON(&params); err != nil {
		params = map[string]interface{}{}
	}
	task, err := h.svc.Trigger(agentType, params)
	if err != nil {
		response.Error(c, 500, response.CodeServerError, "触发Agent失败: "+err.Error())
		return
	}
	if h.notifySvc != nil && task != nil {
		h.notifySvc.NotifyIfEnabled(0, "ai_task_done", "AI任务已启动", fmt.Sprintf("Agent [%s] 已开始执行任务：%s", agentType, task.Title))
	}
	response.Success(c, task)
}

func (h *AIAgentHandler) ListTasks(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	result, err := h.svc.ListTasks(c.Query("agent_type"), page, size)
	if err != nil {
		response.Error(c, 500, response.CodeServerError, err.Error())
		return
	}
	response.Success(c, result)
}

func (h *AIAgentHandler) GetTask(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, 400, response.CodeBadRequest, "无效的任务ID")
		return
	}
	task, err := h.svc.GetTask(uint(id))
	if err != nil {
		response.Error(c, 404, response.CodeServerError, "任务不存在")
		return
	}
	response.Success(c, task)
}

func (h *AIAgentHandler) CancelTask(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, 400, response.CodeBadRequest, "无效的任务ID")
		return
	}
	if err := h.svc.CancelTask(uint(id)); err != nil {
		response.Error(c, 500, response.CodeServerError, err.Error())
		return
	}
	response.Success(c, nil)
}

func (h *AIAgentHandler) GetConfig(c *gin.Context) {
	configs, err := h.svc.GetConfig(c.Query("agent_type"))
	if err != nil {
		response.Error(c, 500, response.CodeServerError, err.Error())
		return
	}
	response.Success(c, gin.H{"items": configs})
}

func (h *AIAgentHandler) UpdateConfig(c *gin.Context) {
	var updates map[string]interface{}
	if err := c.ShouldBindJSON(&updates); err != nil {
		response.Error(c, 400, response.CodeBadRequest, "参数格式错误")
		return
	}
	if err := h.svc.UpdateConfig(c.Param("type"), updates); err != nil {
		response.Error(c, 500, response.CodeServerError, err.Error())
		return
	}
	response.Success(c, nil)
}
