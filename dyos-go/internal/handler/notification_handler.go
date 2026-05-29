package handler

import (
	"strconv"

	"dyos-go/internal/model"
	"dyos-go/internal/service"
	"dyos-go/pkg/response"

	"github.com/gin-gonic/gin"
)

type NotificationHandler struct{ svc *service.NotificationService }

func NewNotificationHandler(svc *service.NotificationService) *NotificationHandler {
	return &NotificationHandler{svc: svc}
}

func (h *NotificationHandler) RegisterRoutes(group *gin.RouterGroup) {
	n := group.Group("/notifications")
	{
		n.GET("/channels", h.ListChannels)
		n.POST("/channels", h.SaveChannel)
		n.DELETE("/channels/:id", h.DeleteChannel)
		n.POST("/channels/:id/test", h.TestChannel)
		n.GET("/rules", h.ListRules)
		n.PUT("/rules", h.SaveRules)
		n.GET("/logs", h.ListLogs)
		n.GET("/events", h.ListEvents)
		n.POST("/send", h.SendTest)
	}
}

func (h *NotificationHandler) ListChannels(c *gin.Context) {
	mid := c.GetUint("merchant_id")
	response.Success(c, map[string]interface{}{"items": h.svc.ListChannels(mid)})
}

func (h *NotificationHandler) SaveChannel(c *gin.Context) {
	var body struct {
		ID         uint   `json:"id"`
		Channel    string `json:"channel"`
		Name       string `json:"name"`
		WebhookURL string `json:"webhook_url"`
		Secret     string `json:"secret"`
		Enabled    bool   `json:"enabled"`
	}
	c.ShouldBindJSON(&body)
	mid := c.GetUint("merchant_id")
	err := h.svc.SaveChannel(&model.NotificationChannel{
		ID: body.ID, MerchantID: mid, Channel: body.Channel,
		Name: body.Name, WebhookURL: body.WebhookURL,
		Secret: body.Secret, Enabled: body.Enabled,
	})
	if err != nil {
		response.Error(c, 500, response.CodeServerError, err.Error())
		return
	}
	response.Success(c, nil)
}

func (h *NotificationHandler) DeleteChannel(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	if err := h.svc.DeleteChannel(uint(id)); err != nil {
		response.Error(c, 500, response.CodeServerError, err.Error())
		return
	}
	response.Success(c, nil)
}

func (h *NotificationHandler) TestChannel(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	if err := h.svc.TestChannel(uint(id)); err != nil {
		response.Error(c, 500, response.CodeServerError, err.Error())
		return
	}
	response.Success(c, map[string]string{"msg": "测试消息已发送"})
}

func (h *NotificationHandler) ListRules(c *gin.Context) {
	mid := c.GetUint("merchant_id")
	response.Success(c, map[string]interface{}{"items": h.svc.ListRules(mid)})
}

func (h *NotificationHandler) SaveRules(c *gin.Context) {
	mid := c.GetUint("merchant_id")
	var body struct {
		Rules []map[string]interface{} `json:"rules"`
	}
	c.ShouldBindJSON(&body)
	if err := h.svc.SaveRules(mid, body.Rules); err != nil {
		response.Error(c, 500, response.CodeServerError, err.Error())
		return
	}
	response.Success(c, nil)
}

func (h *NotificationHandler) ListLogs(c *gin.Context) {
	mid := c.GetUint("merchant_id")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	response.Success(c, h.svc.ListLogs(mid, page, size))
}

func (h *NotificationHandler) ListEvents(c *gin.Context) {
	response.Success(c, map[string]interface{}{"items": service.EventDefs})
}

func (h *NotificationHandler) SendTest(c *gin.Context) {
	mid := c.GetUint("merchant_id")
	var body struct {
		EventType string `json:"event_type"`
		Title     string `json:"title"`
		Content   string `json:"content"`
	}
	c.ShouldBindJSON(&body)
	if body.Title == "" {
		body.Title = "测试通知"
	}
	if body.Content == "" {
		body.Content = "这是一条手动发送的测试通知"
	}
	results := h.svc.Send(mid, body.EventType, body.Title, body.Content)
	response.Success(c, map[string]interface{}{"results": results})
}
