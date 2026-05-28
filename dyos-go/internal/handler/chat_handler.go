package handler

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"dyos-go/internal/service"
	"dyos-go/pkg/response"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

type ChatHandler struct {
	svc      *service.ChatService
	hub      *service.ChatStreamHub
	upgrader websocket.Upgrader
}

func NewChatHandler(svc *service.ChatService) *ChatHandler {
	return &ChatHandler{svc: svc, hub: service.NewChatStreamHub(), upgrader: websocket.Upgrader{CheckOrigin: func(r *http.Request) bool { return true }}}
}

func (h *ChatHandler) RegisterAdminRoutes(group *gin.RouterGroup) {
	c := group.Group("/chat")
	{
		c.GET("/sessions", h.ListSessions)
		c.GET("/sessions/:id/messages", h.GetMessages)
		c.POST("/message", h.AdminSendMessage)
		c.GET("/sentiment", h.SentimentDashboard)
		c.GET("/alerts/rules", h.AlertRules)
		c.GET("/sop", h.SOP)
		c.GET("/stats", h.ReplyStats)
		c.PUT("/config", h.UpdateConfig)
		c.GET("/faq", h.ListFAQ)
		c.PUT("/faq", h.UpdateFAQ)
	}
}

func (h *ChatHandler) RegisterWSRoutes(group *gin.RouterGroup) {
	group.GET("/chat", h.ChatWS)
}

func (h *ChatHandler) ListSessions(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	data, err := h.svc.ListSessions(page, size, c.Query("status"))
	if err != nil {
		response.Error(c, 500, response.CodeServerError, err.Error())
		return
	}
	response.Success(c, data)
}

func (h *ChatHandler) GetMessages(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, 400, response.CodeBadRequest, "无效的会话ID")
		return
	}
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "50"))
	data, err := h.svc.GetMessages(uint(id), page, size)
	if err != nil {
		response.Error(c, 500, response.CodeServerError, err.Error())
		return
	}
	response.Success(c, data)
}

func (h *ChatHandler) AdminSendMessage(c *gin.Context) {
	var body struct {
		SessionID uint   `json:"session_id"`
		Content   string `json:"content"`
	}
	c.ShouldBindJSON(&body)
	reply := h.svc.StreamReply(body.SessionID, body.Content)
	response.Success(c, map[string]interface{}{"reply": reply, "session_id": body.SessionID})
}

func (h *ChatHandler) UpdateConfig(c *gin.Context) {
	var updates map[string]interface{}
	c.ShouldBindJSON(&updates)
	response.Success(c, map[string]interface{}{"updated": true, "config": updates})
}

func (h *ChatHandler) ListFAQ(c *gin.Context) {
	response.Success(c, gin.H{"items": []map[string]interface{}{
		{"id": 1, "category": "支付问题", "question": "退款多久到账？", "answer": "微信支付退款1-3个工作日到账，支付宝实时到账。"},
		{"id": 2, "category": "订单问题", "question": "如何修改订单？", "answer": "请在订单详情页点击修改按钮，支持修改菜品数量和备注信息。"},
		{"id": 3, "category": "会员问题", "question": "积分如何获取？", "answer": "每消费1元获得1积分，签到每日奖励5积分，评价奖励10积分。"},
		{"id": 4, "category": "投诉处理", "question": "投诉处理流程？", "answer": "投诉→AI分析分级→自动回复/退款→满意度回访→结案。"},
	}})
}

func (h *ChatHandler) UpdateFAQ(c *gin.Context) {
	var body map[string]interface{}
	c.ShouldBindJSON(&body)
	response.Success(c, map[string]interface{}{"updated": true})
}

func (h *ChatHandler) SentimentDashboard(c *gin.Context) {
	response.Success(c, h.svc.SentimentDashboard())
}

func (h *ChatHandler) AlertRules(c *gin.Context) {
	response.Success(c, gin.H{"items": h.svc.AlertRules()})
}

func (h *ChatHandler) SOP(c *gin.Context) {
	response.Success(c, gin.H{"items": h.svc.SOP(c.DefaultQuery("level", "warning"))})
}

func (h *ChatHandler) ReplyStats(c *gin.Context) {
	response.Success(c, h.svc.ReplyStats())
}

func (h *ChatHandler) RegisterMerchantRoutes(group *gin.RouterGroup) {
	c := group.Group("/chat")
	{
		c.GET("/sessions", h.MerchantSessions)
		c.GET("/sessions/:id", h.MerchantMessages)
		c.POST("/message", h.MerchantSend)
	}
}

func (h *ChatHandler) MerchantSessions(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	data, _ := h.svc.ListSessions(page, size, c.Query("status"))
	response.Success(c, data)
}

func (h *ChatHandler) MerchantMessages(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "50"))
	data, _ := h.svc.GetMessages(uint(id), page, size)
	response.Success(c, data)
}

func (h *ChatHandler) MerchantSend(c *gin.Context) {
	var body struct{ Content string `json:"content"`; SessionID uint `json:"session_id"` }
	c.ShouldBindJSON(&body)
	reply := h.svc.StreamReply(body.SessionID, body.Content)
	response.Success(c, map[string]interface{}{"reply": reply, "session_id": body.SessionID})
}

func (h *ChatHandler) ChatWS(c *gin.Context) {
	conn, err := h.upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		return
	}
	defer conn.Close()

	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			return
		}
		var req map[string]interface{}
		if err := json.Unmarshal(msg, &req); err != nil {
			continue
		}
		content, _ := req["content"].(string)
		reply := h.svc.StreamReply(0, content)
		for _, r := range reply {
			_ = conn.WriteJSON(map[string]interface{}{"type": "chat_chunk", "content": string(r)})
			time.Sleep(30 * time.Millisecond)
		}
		_ = conn.WriteJSON(map[string]interface{}{"type": "chat_done", "content": reply})
	}
}
