package handler

import (
	"strconv"

	"dyos-go/internal/service"
	"dyos-go/pkg/response"

	"github.com/gin-gonic/gin"
)

type DigitalTwinHandler struct{ svc *service.DigitalTwinService }

func NewDigitalTwinHandler(svc *service.DigitalTwinService) *DigitalTwinHandler {
	return &DigitalTwinHandler{svc: svc}
}

func (h *DigitalTwinHandler) RegisterRoutes(group *gin.RouterGroup) {
	dt := group.Group("/digital-twin")
	{
		dt.GET("/layout/:store_id", h.GetLayout)
		dt.POST("/layout/:store_id", h.SaveLayout)
		dt.GET("/heatmap/:store_id", h.Heatmap)
		dt.POST("/simulate/:store_id", h.Simulate)
		dt.POST("/voice", h.VoiceCommand)
	}
}

func (h *DigitalTwinHandler) GetLayout(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("store_id"), 10, 64)
	response.Success(c, h.svc.GetLayout(uint(id)))
}

func (h *DigitalTwinHandler) SaveLayout(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("store_id"), 10, 64)
	var data map[string]interface{}
	c.ShouldBindJSON(&data)
	h.svc.SaveLayout(uint(id), data)
	response.Success(c, nil)
}

func (h *DigitalTwinHandler) Heatmap(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("store_id"), 10, 64)
	response.Success(c, h.svc.Heatmap(uint(id)))
}

func (h *DigitalTwinHandler) Simulate(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("store_id"), 10, 64)
	var params map[string]interface{}
	c.ShouldBindJSON(&params)
	response.Success(c, h.svc.Simulate(uint(id), params))
}

func (h *DigitalTwinHandler) VoiceCommand(c *gin.Context) {
	var body struct{ Command string `json:"command"` }
	c.ShouldBindJSON(&body)
	response.Success(c, h.svc.VoiceCommand(body.Command))
}

func (h *DigitalTwinHandler) RegisterMerchantRoutes(group *gin.RouterGroup) {
	v := group.Group("/voice")
	{
		v.POST("/recognize", h.MerchantRecognize)
		v.POST("/command", h.MerchantVoiceCommand)
		v.GET("/history", h.MerchantVoiceHistory)
	}
}

func (h *DigitalTwinHandler) MerchantRecognize(c *gin.Context) {
	var body struct{ AudioURL string `json:"audio_url"` }
	c.ShouldBindJSON(&body)
	response.Success(c, map[string]interface{}{"transcript": "查询今日营业额", "confidence": 0.95})
}

func (h *DigitalTwinHandler) MerchantVoiceCommand(c *gin.Context) {
	var body struct{ Command string `json:"command"` }
	c.ShouldBindJSON(&body)
	response.Success(c, h.svc.VoiceCommand(body.Command))
}

func (h *DigitalTwinHandler) MerchantVoiceHistory(c *gin.Context) {
	response.Success(c, map[string]interface{}{
		"items": []map[string]interface{}{
			{"id": 1, "command": "查询今日营业额", "result": "今日营业额¥28,600", "time": "10:30"},
			{"id": 2, "command": "查看差评", "result": "今日新增1条差评，已AI自动回复", "time": "11:45"},
		},
	})
}
