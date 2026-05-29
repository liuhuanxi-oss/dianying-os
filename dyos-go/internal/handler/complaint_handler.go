package handler

import (
	"fmt"
	"strconv"
	"time"

	"dyos-go/internal/model"
	"dyos-go/internal/service"
	"dyos-go/internal/tianque"
	"dyos-go/pkg/response"

	"github.com/gin-gonic/gin"
)

type ComplaintHandler struct {
	svc      *service.ComplaintService
	aiSvc    *service.AIComplaintService
	tianque  *tianque.Client
	notifySvc *service.NotificationService
}

func NewComplaintHandler(svc *service.ComplaintService, aiSvc *service.AIComplaintService) *ComplaintHandler {
	return &ComplaintHandler{svc: svc, aiSvc: aiSvc}
}

func (h *ComplaintHandler) SetTianqueClient(client *tianque.Client) { h.tianque = client }
func (h *ComplaintHandler) SetNotificationService(ns *service.NotificationService) { h.notifySvc = ns }

// RegisterRoutes 平台端路由
func (h *ComplaintHandler) RegisterRoutes(group *gin.RouterGroup) {
	cg := group.Group("/complaints")
	{
		cg.GET("", h.List)
		cg.GET("/stats", h.Stats)
		cg.GET("/risk-alerts", h.RiskAlerts)
		cg.GET("/:id", h.GetByID)
		cg.POST("/:id/analyze", h.Analyze)
		cg.POST("/:id/auto-handle", h.AutoHandle)
		cg.POST("/:id/reply", h.Reply)
		cg.POST("/:id/refund", h.Refund)
		cg.POST("/:id/complete", h.Complete)
		cg.POST("/:id/escalate", h.Escalate)
		cg.POST("/callback/wechat", h.WechatCallback)
		cg.POST("/callback/alipay", h.AlipayCallback)
	}
}

// RegisterMerchantRoutes 商户端路由
func (h *ComplaintHandler) RegisterMerchantRoutes(group *gin.RouterGroup) {
	cg := group.Group("/complaints")
	{
		cg.GET("", h.MerchantList)
		cg.GET("/:id", h.MerchantGetByID)
		cg.POST("/:id/analyze", h.MerchantAnalyze)
		cg.POST("/:id/auto-handle", h.MerchantAutoHandle)
		cg.POST("/:id/reply", h.MerchantReply)
		cg.POST("/:id/escalate", h.MerchantEscalate)
	}
}

func (h *ComplaintHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	platform := c.Query("platform")
	urgency := c.Query("urgency")
	status := c.Query("status")
	merchantID := c.GetUint("tenant_merchant_id")
	data, _ := h.svc.List(merchantID, platform, urgency, status, page, size)
	response.Success(c, data)
}

func (h *ComplaintHandler) GetByID(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	ok, _ := h.svc.CheckOwnership(uint(id), c.GetUint("tenant_merchant_id"))
	if !ok { response.Error(c, 403, response.CodeForbidden, "无权访问此投诉"); return }
	data, err := h.svc.GetByID(uint(id))
	if err != nil {
		response.Error(c, 404, response.CodeBadRequest, "投诉不存在")
		return
	}
	response.Success(c, data)
}

func (h *ComplaintHandler) Stats(c *gin.Context) {
	merchantID := c.GetUint("tenant_merchant_id")
	response.Success(c, h.svc.GetStats(merchantID))
}

func (h *ComplaintHandler) RiskAlerts(c *gin.Context) {
	merchantID := c.GetUint("tenant_merchant_id")
	response.Success(c, h.svc.RiskAlerts(merchantID))
}

func (h *ComplaintHandler) Analyze(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	if ok, _ := h.svc.CheckOwnership(uint(id), c.GetUint("tenant_merchant_id")); !ok { response.Error(c, 403, response.CodeForbidden, "无权操作此投诉"); return }
	response.Success(c, h.aiSvc.Analyze(uint(id)))
}

func (h *ComplaintHandler) AutoHandle(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	if ok, _ := h.svc.CheckOwnership(uint(id), c.GetUint("tenant_merchant_id")); !ok { response.Error(c, 403, response.CodeForbidden, "无权操作此投诉"); return }
	response.Success(c, h.aiSvc.AutoHandle(uint(id)))
}

func (h *ComplaintHandler) Reply(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	if ok, _ := h.svc.CheckOwnership(uint(id), c.GetUint("tenant_merchant_id")); !ok { response.Error(c, 403, response.CodeForbidden, "无权操作此投诉"); return }
	var body struct {
		Reply string `json:"reply" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.Error(c, 400, response.CodeBadRequest, "回复内容不能为空")
		return
	}
	if err := h.svc.SaveReply(uint(id), body.Reply); err != nil {
		response.Error(c, 500, response.CodeServerError, "保存回复失败")
		return
	}
	response.Success(c, map[string]interface{}{"id": id, "reply": body.Reply, "status": "replied"})
}

// Refund 发起天阙退款（真实调用SDK）
func (h *ComplaintHandler) Refund(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	if ok, _ := h.svc.CheckOwnership(uint(id), c.GetUint("tenant_merchant_id")); !ok { response.Error(c, 403, response.CodeForbidden, "无权操作此投诉"); return }
	var body struct {
		Amount       float64 `json:"amount"`
		RefundReason string  `json:"refund_reason"`
	}
	c.ShouldBindJSON(&body)

	refundResult := map[string]interface{}{
		"complaint_id": id,
		"channel":      "天阙代子商户退款",
		"status":       "processing",
	}

	if h.tianque != nil {
		// 获取投诉详情以提取商户号和交易流水号
		complaintData, err := h.svc.GetByID(uint(id))
		if err != nil {
			refundResult["status"] = "failed"
			refundResult["error"] = "投诉不存在"
			response.Error(c, 404, response.CodeBadRequest, "投诉不存在")
			return
		}
		complaint, _ := complaintData["complaint"].(model.Complaint)

		mno := complaint.MerchantNo
		origOrderNo := complaint.TransactionID
		paymentAPI := tianque.NewPaymentAPI(h.tianque)
		ordNo := fmt.Sprintf("RF%d%06d", time.Now().UnixMilli(), id)
		refundData := map[string]interface{}{
			"mno":          mno,
			"ordNo":        ordNo,
			"origOrderNo":  origOrderNo,
			"amt":          fmt.Sprintf("%.2f", body.Amount),
			"refundReason": body.RefundReason,
		}
		result, err := paymentAPI.Refund(refundData)
		if err != nil {
			refundResult["tianque_error"] = err.Error()
			refundResult["status"] = "failed"
		} else {
			refundResult["tianque_response"] = result
			respData, _ := result["respData"].(map[string]interface{})
			if respData != nil {
				if refundStatus, ok := respData["refundStatus"]; ok {
					refundResult["tianque_status"] = refundStatus
					refundResult["refund_no"] = respData["refundUuid"]
				}
				if bizCode, ok := respData["bizCode"]; ok {
					refundResult["biz_code"] = bizCode
				}
				if bizMsg, ok := respData["bizMsg"]; ok {
					refundResult["biz_msg"] = bizMsg
				}
			}
			if code, _ := result["code"].(string); code == "0000" {
				refundResult["status"] = "refunded"
				h.svc.UpdateStatus(uint(id), "resolved", "ai_auto")
			}
		}
	} else {
		refundResult["refund_no"] = "TK_MOCK_" + c.Param("id")
		refundResult["status"] = "processing"
		refundResult["note"] = "天阙SDK未配置，使用模拟退款"
		h.svc.UpdateStatus(uint(id), "processing", "manual")
	}

	refundResult["refund_amount"] = body.Amount
	refundResult["refund_reason"] = body.RefundReason
	response.Success(c, refundResult)
}

func (h *ComplaintHandler) Complete(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	if ok, _ := h.svc.CheckOwnership(uint(id), c.GetUint("tenant_merchant_id")); !ok { response.Error(c, 403, response.CodeForbidden, "无权操作此投诉"); return }
	h.svc.UpdateStatus(uint(id), "resolved", "manual")
	response.Success(c, map[string]interface{}{"id": id, "status": "resolved"})
}

func (h *ComplaintHandler) Escalate(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	mid := c.GetUint("tenant_merchant_id")
	if ok, _ := h.svc.CheckOwnership(uint(id), mid); !ok { response.Error(c, 403, response.CodeForbidden, "无权操作此投诉"); return }
	var body struct {
		Reason string `json:"reason"`
	}
	c.ShouldBindJSON(&body)
	h.svc.UpdateStatus(uint(id), "escalated", "manual")
	if h.notifySvc != nil {
		h.notifySvc.NotifyIfEnabled(mid, "complaint_alert", "投诉升级提醒", fmt.Sprintf("投诉#%d已升级处理\n原因：%s\n预计30分钟内响应", id, body.Reason))
	}
	response.Success(c, map[string]interface{}{
		"id": id, "status": "escalated", "reason": body.Reason,
		"message": "已升级至运营主管，预计30分钟内响应",
	})
}

func (h *ComplaintHandler) WechatCallback(c *gin.Context) {
	var data map[string]interface{}
	c.ShouldBindJSON(&data)
	if h.notifySvc != nil {
		if mid, ok := data["merchant_id"].(float64); ok {
			h.notifySvc.NotifyIfEnabled(uint(mid), "complaint_alert", "微信支付投诉通知", fmt.Sprintf("收到一条微信支付投诉\n投诉内容：%v\n请及时处理", data["body"]))
		}
	}
	response.Success(c, map[string]interface{}{"code": "SUCCESS", "message": "回调接收成功", "platform": "wechat_pay"})
}

func (h *ComplaintHandler) AlipayCallback(c *gin.Context) {
	var data map[string]interface{}
	c.ShouldBindJSON(&data)
	if h.notifySvc != nil {
		if mid, ok := data["merchant_id"].(float64); ok {
			h.notifySvc.NotifyIfEnabled(uint(mid), "complaint_alert", "支付宝投诉通知", fmt.Sprintf("收到一条支付宝投诉\n投诉内容：%v\n请及时处理", data["body"]))
		}
	}
	response.Success(c, map[string]interface{}{"code": "SUCCESS", "message": "回调接收成功", "platform": "alipay"})
}

// MerchantList 商户端列表
func (h *ComplaintHandler) MerchantList(c *gin.Context) {
	merchantID := c.GetUint("merchant_id")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	data, _ := h.svc.List(merchantID, c.Query("platform"), c.Query("urgency"), c.Query("status"), page, size)
	response.Success(c, data)
}

func (h *ComplaintHandler) MerchantGetByID(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	if ok, _ := h.svc.CheckOwnership(uint(id), c.GetUint("merchant_id")); !ok { response.Error(c, 403, response.CodeForbidden, "无权访问此投诉"); return }
	data, err := h.svc.GetByID(uint(id))
	if err != nil {
		response.Error(c, 404, response.CodeBadRequest, "投诉不存在")
		return
	}
	response.Success(c, data)
}

func (h *ComplaintHandler) MerchantAnalyze(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	if ok, _ := h.svc.CheckOwnership(uint(id), c.GetUint("merchant_id")); !ok { response.Error(c, 403, response.CodeForbidden, "无权操作此投诉"); return }
	response.Success(c, h.aiSvc.Analyze(uint(id)))
}

func (h *ComplaintHandler) MerchantAutoHandle(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	if ok, _ := h.svc.CheckOwnership(uint(id), c.GetUint("merchant_id")); !ok { response.Error(c, 403, response.CodeForbidden, "无权操作此投诉"); return }
	result := h.aiSvc.AutoHandle(uint(id))
	result["note"] = "商户端直接退款，无需平台审批"
	response.Success(c, result)
}

func (h *ComplaintHandler) MerchantReply(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	if ok, _ := h.svc.CheckOwnership(uint(id), c.GetUint("merchant_id")); !ok { response.Error(c, 403, response.CodeForbidden, "无权操作此投诉"); return }
	var body struct {
		Reply string `json:"reply" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.Error(c, 400, response.CodeBadRequest, "回复内容不能为空")
		return
	}
	if err := h.svc.SaveReply(uint(id), body.Reply); err != nil {
		response.Error(c, 500, response.CodeServerError, "保存回复失败")
		return
	}
	response.Success(c, map[string]interface{}{"id": id, "reply": body.Reply, "status": "replied"})
}

func (h *ComplaintHandler) MerchantEscalate(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	var body struct {
		Reason string `json:"reason"`
	}
	c.ShouldBindJSON(&body)
	h.svc.UpdateStatus(uint(id), "escalated", "manual")
	response.Success(c, map[string]interface{}{
		"id": id, "status": "escalated", "reason": body.Reason,
	})
}
