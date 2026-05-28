package wechat_pay

import (
	"crypto/rsa"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

// CallbackHandler 微信支付回调处理器
type CallbackHandler struct {
	Client        *Client
	WxPayPublicKey *rsa.PublicKey
	OnComplaint   func(eventType string, data map[string]interface{}) error
}

// NewCallbackHandler 创建回调处理器
func NewCallbackHandler(client *Client, publicKey *rsa.PublicKey) *CallbackHandler {
	return &CallbackHandler{Client: client, WxPayPublicKey: publicKey}
}

// HandleCallback 处理微信支付HTTPS回调
func (h *CallbackHandler) HandleCallback(r *http.Request) (*CallbackData, error) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		return nil, fmt.Errorf("读取请求体失败: %w", err)
	}
	defer r.Body.Close()

	signature := r.Header.Get("Wechatpay-Signature")
	timestamp := r.Header.Get("Wechatpay-Timestamp")
	nonce := r.Header.Get("Wechatpay-Nonce")

	if h.Client.IsMock() {
		var data CallbackData
		if err := json.Unmarshal(body, &data); err != nil {
			return nil, fmt.Errorf("解析回调数据失败: %w", err)
		}
		return &data, nil
	}

	// 验签
	if err := VerifySignature(signature, timestamp, nonce, string(body), h.WxPayPublicKey); err != nil {
		return nil, fmt.Errorf("回调验签失败: %w", err)
	}

	var data CallbackData
	if err := json.Unmarshal(body, &data); err != nil {
		return nil, fmt.Errorf("解析回调数据失败: %w", err)
	}

	// 解密resource（AES-256-GCM）
	if data.ResourceType == "encrypt-resource" {
		ciphertext, _ := data.Resource["ciphertext"].(string)
		associatedData, _ := data.Resource["associated_data"].(string)
		nonce, _ := data.Resource["nonce"].(string)
		plaintext, err := DecryptCallback(ciphertext, associatedData, nonce, h.Client.APIv3Key)
		if err != nil {
			return nil, fmt.Errorf("解密回调资源失败: %w", err)
		}
		var decryptedData map[string]interface{}
		if err := json.Unmarshal([]byte(plaintext), &decryptedData); err != nil {
			return nil, fmt.Errorf("解析解密后数据失败: %w", err)
		}
		data.Resource = decryptedData
	}

	// 触发投诉处理回调
	if h.OnComplaint != nil && isComplaintEvent(data.EventType) {
		if err := h.OnComplaint(data.EventType, data.Resource); err != nil {
			return &data, fmt.Errorf("投诉处理回调失败: %w", err)
		}
	}

	return &data, nil
}

// isComplaintEvent 判断是否为投诉相关事件
func isComplaintEvent(eventType string) bool {
	complaintEvents := []string{
		"COMPLAINT.CREATE",
		"COMPLAINT.STATE_CHANGE",
		"COMPLAINT.FEEDBACK",
		"COMPLAINT.NOTIFY",
	}
	for _, e := range complaintEvents {
		if eventType == e {
			return true
		}
	}
	return false
}
