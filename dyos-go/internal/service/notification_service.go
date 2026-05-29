package service

import (
	"bytes"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"dyos-go/internal/model"

	"gorm.io/gorm"
)

// 事件类型定义
var EventDefs = []map[string]string{
	{"type": "negative_review", "name": "差评预警", "desc": "新增1-2星低分评价时通知"},
	{"type": "complaint_alert", "name": "投诉预警", "desc": "新增支付投诉时通知"},
	{"type": "daily_report", "name": "经营日报", "desc": "每日经营数据汇总推送"},
	{"type": "inventory_alert", "name": "库存预警", "desc": "库存低于安全线时通知"},
	{"type": "inspection_remind", "name": "巡检提醒", "desc": "巡检即将到期或结果通知"},
	{"type": "order_anomaly", "name": "订单异常", "desc": "异常订单/退款风险告警"},
	{"type": "ai_task_done", "name": "AI任务完成", "desc": "AI Agent任务执行完成通知"},
	{"type": "risk_alert", "name": "支付风险", "desc": "风险交易/异常支付告警"},
	{"type": "system_announce", "name": "系统公告", "desc": "平台公告/功能更新推送"},
	{"type": "merchant_audit", "name": "商户审核", "desc": "入驻/变更审核结果通知"},
	{"type": "finance_reconcile", "name": "财务对账", "desc": "对账异常/结算到账通知"},
	{"type": "member_activity", "name": "会员活动", "desc": "会员营销活动推送通知"},
}

type NotificationService struct{ db *gorm.DB }

func NewNotificationService(db *gorm.DB) *NotificationService { return &NotificationService{db: db} }

// 获取商户的通知渠道列表
func (s *NotificationService) ListChannels(merchantID uint) []model.NotificationChannel {
	var channels []model.NotificationChannel
	if s.db != nil {
		s.db.Where("merchant_id = ?", merchantID).Find(&channels)
	}
	if len(channels) == 0 {
		now := time.Now().Format("2006-01-02 15:04:05")
		return []model.NotificationChannel{
			{ID: 0, MerchantID: merchantID, Channel: "wecom_bot", Name: "企业微信机器人", WebhookURL: "", Enabled: false, CreatedAt: now},
			{ID: 0, MerchantID: merchantID, Channel: "feishu_bot", Name: "飞书机器人", WebhookURL: "", Enabled: false, CreatedAt: now},
			{ID: 0, MerchantID: merchantID, Channel: "dingtalk_bot", Name: "钉钉机器人", WebhookURL: "", Enabled: false, CreatedAt: now},
			{ID: 0, MerchantID: merchantID, Channel: "wechat_oa", Name: "公众号模板消息", WebhookURL: "", Enabled: true, CreatedAt: now},
			{ID: 0, MerchantID: merchantID, Channel: "sms", Name: "短信通知", WebhookURL: "", Enabled: false, CreatedAt: now},
			{ID: 0, MerchantID: merchantID, Channel: "email", Name: "邮件通知", WebhookURL: "", Enabled: false, CreatedAt: now},
		}
	}
	return channels
}

// 保存渠道配置
func (s *NotificationService) SaveChannel(ch *model.NotificationChannel) error {
	now := time.Now().Format("2006-01-02 15:04:05")
	if s.db == nil {
		ch.ID = 1
		ch.CreatedAt = now
		ch.UpdatedAt = now
		return nil
	}
	if ch.ID > 0 {
		ch.UpdatedAt = now
		return s.db.Model(ch).Updates(map[string]interface{}{
			"name": ch.Name, "webhook_url": ch.WebhookURL,
			"enabled": ch.Enabled, "updated_at": now,
		}).Error
	}
	ch.CreatedAt = now
	ch.UpdatedAt = now
	return s.db.Create(ch).Error
}

// 删除渠道
func (s *NotificationService) DeleteChannel(id uint) error {
	if s.db == nil {
		return nil
	}
	return s.db.Delete(&model.NotificationChannel{}, id).Error
}

// 获取通知规则
func (s *NotificationService) ListRules(merchantID uint) []map[string]interface{} {
	if s.db != nil {
		var rules []model.NotificationRule
		s.db.Where("merchant_id = ?", merchantID).Find(&rules)
		if len(rules) > 0 {
			result := make([]map[string]interface{}, len(rules))
			for i, r := range rules {
				result[i] = map[string]interface{}{
					"id": r.ID, "merchant_id": r.MerchantID, "event_type": r.EventType,
					"event_name": r.EventName, "channels": strings.Split(r.Channels, ","),
					"enabled": r.Enabled, "created_at": r.CreatedAt, "updated_at": r.UpdatedAt,
				}
			}
			return result
		}
	}
	// 默认规则
	result := make([]map[string]interface{}, len(EventDefs))
	for i, ev := range EventDefs {
		result[i] = map[string]interface{}{
			"id": 0, "merchant_id": merchantID,
			"event_type": ev["type"], "event_name": ev["name"],
			"channels": []string{"wechat_oa"}, "enabled": true,
		}
	}
	return result
}

// 批量保存规则
func (s *NotificationService) SaveRules(merchantID uint, rules []map[string]interface{}) error {
	if s.db == nil {
		return nil
	}
	now := time.Now().Format("2006-01-02 15:04:05")
	return s.db.Transaction(func(tx *gorm.DB) error {
		tx.Where("merchant_id = ?", merchantID).Delete(&model.NotificationRule{})
		for _, r := range rules {
			eventType, _ := r["event_type"].(string)
			eventName, _ := r["event_name"].(string)
			chs := []string{}
			if chArr, ok := r["channels"].([]interface{}); ok {
				for _, ch := range chArr {
					if s, ok := ch.(string); ok {
						chs = append(chs, s)
					}
				}
			}
			enabled := true
			if e, ok := r["enabled"].(bool); ok {
				enabled = e
			}
			tx.Create(&model.NotificationRule{
				MerchantID: merchantID, EventType: eventType, EventName: eventName,
				Channels: strings.Join(chs, ","), Enabled: enabled,
				CreatedAt: now, UpdatedAt: now,
			})
		}
		return nil
	})
}

// 发送通知日志
func (s *NotificationService) ListLogs(merchantID uint, page, size int) map[string]interface{} {
	if size <= 0 {
		size = 20
	}
	if page <= 0 {
		page = 1
	}
	if s.db != nil {
		var total int64
		q := s.db.Model(&model.NotificationLog{})
		if merchantID > 0 {
			q = q.Where("merchant_id = ?", merchantID)
		}
		q.Count(&total)
		var items []model.NotificationLog
		q.Order("id DESC").Limit(size).Offset((page - 1) * size).Find(&items)
		return map[string]interface{}{"items": items, "total": total, "page": page, "size": size}
	}
	return map[string]interface{}{"items": []interface{}{}, "total": int64(0), "page": page, "size": size}
}

// 发送通知（核心方法）
func (s *NotificationService) Send(merchantID uint, eventType, title, content string) []map[string]interface{} {
	results := []map[string]interface{}{}
	now := time.Now().Format("2006-01-02 15:04:05")

	// 查规则
	var channels []string
	if s.db != nil {
		var rule model.NotificationRule
		if err := s.db.Where("merchant_id = ? AND event_type = ? AND enabled = ?", merchantID, eventType, true).First(&rule).Error; err == nil {
			channels = strings.Split(rule.Channels, ",")
		} else {
			channels = []string{"wechat_oa"} // 默认公众号
		}
	} else {
		channels = []string{"wechat_oa"}
	}

	for _, ch := range channels {
		ch = strings.TrimSpace(ch)
		result := map[string]interface{}{"channel": ch, "status": "success", "error": ""}

		var err error
		switch ch {
		case "wecom_bot":
			err = s.sendWecomBot(merchantID, title, content)
		case "feishu_bot":
			err = s.sendFeishuBot(merchantID, title, content)
		case "dingtalk_bot":
			err = s.sendDingTalkBot(merchantID, title, content)
		case "wechat_oa":
			err = s.sendWechatOA(merchantID, title, content)
		default:
			err = nil // sms/email 暂不实现
		}

		if err != nil {
			result["status"] = "failed"
			result["error"] = err.Error()
		}

		// 记录日志
		if s.db != nil {
			s.db.Create(&model.NotificationLog{
				MerchantID: merchantID, EventType: eventType, Channel: ch,
				Title: title, Content: content,
				Status: map[bool]string{true: "success", false: "failed"}[err == nil],
				ErrorMsg: func() string {
					if err != nil {
						return err.Error()
					}
					return ""
				}(),
				CreatedAt: now,
			})
		}

		results = append(results, result)
	}
	return results
}

// 发送测试消息
func (s *NotificationService) TestChannel(channelID uint) error {
	if s.db == nil {
		return fmt.Errorf("数据库未连接")
	}
	var ch model.NotificationChannel
	if err := s.db.First(&ch, channelID).Error; err != nil {
		return err
	}
	title := "🔔 店赢OS通知测试"
	content := "这是一条测试消息，如果您收到此消息，说明通知渠道配置成功！\n\n发送时间：" + time.Now().Format("2006-01-02 15:04:05")
	switch ch.Channel {
	case "wecom_bot":
		return s.sendWecomBot(ch.MerchantID, title, content)
	case "feishu_bot":
		return s.sendFeishuBot(ch.MerchantID, title, content)
	case "dingtalk_bot":
		return s.sendDingTalkBot(ch.MerchantID, title, content)
	case "wechat_oa":
		return fmt.Errorf("公众号模板消息需要在公众号后台配置后测试")
	default:
		return fmt.Errorf("该渠道暂不支持测试发送")
	}
}

// 企业微信机器人发送
func (s *NotificationService) sendWecomBot(merchantID uint, title, content string) error {
	webhookURL := ""
	if s.db != nil {
		var ch model.NotificationChannel
		if err := s.db.Where("merchant_id = ? AND channel = ? AND enabled = ?", merchantID, "wecom_bot", true).First(&ch).Error; err != nil {
			return fmt.Errorf("企业微信机器人未配置")
		}
		webhookURL = ch.WebhookURL
	}
	if webhookURL == "" {
		return fmt.Errorf("企业微信机器人webhook地址为空")
	}

	msg := map[string]interface{}{
		"msgtype": "markdown",
		"markdown": map[string]string{
			"content": fmt.Sprintf("## %s\n\n%s\n\n> 店赢OS · %s", title, content, time.Now().Format("2006-01-02 15:04:05")),
		},
	}
	body, _ := json.Marshal(msg)
	resp, err := http.Post(webhookURL, "application/json", bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("企业微信发送失败: %w", err)
	}
	defer resp.Body.Close()
	respBody, _ := io.ReadAll(resp.Body)
	var result map[string]interface{}
	json.Unmarshal(respBody, &result)
	if errcode, ok := result["errcode"].(float64); ok && errcode != 0 {
		return fmt.Errorf("企业微信返回错误: %v", result["errmsg"])
	}
	return nil
}

// 飞书机器人发送
func (s *NotificationService) sendFeishuBot(merchantID uint, title, content string) error {
	webhookURL := ""
	secret := ""
	if s.db != nil {
		var ch model.NotificationChannel
		if err := s.db.Where("merchant_id = ? AND channel = ? AND enabled = ?", merchantID, "feishu_bot", true).First(&ch).Error; err != nil {
			return fmt.Errorf("飞书机器人未配置")
		}
		webhookURL = ch.WebhookURL
		secret = ch.Secret
	}
	if webhookURL == "" {
		return fmt.Errorf("飞书机器人webhook地址为空")
	}

	// 飞书签名（如果配置了secret）
	timestamp := time.Now().Unix()
	sign := ""
	if secret != "" {
		str := fmt.Sprintf("%d\n%s", timestamp, secret)
		hash := sha256.Sum256([]byte(str))
		sign = base64.StdEncoding.EncodeToString(hash[:])
	}

	msg := map[string]interface{}{
		"timestamp": fmt.Sprintf("%d", timestamp),
		"sign":      sign,
		"msg_type":  "interactive",
		"card": map[string]interface{}{
			"header": map[string]interface{}{
				"title":    map[string]string{"content": title, "tag": "plain_text"},
				"template": "blue",
			},
			"elements": []map[string]interface{}{
				{"tag": "div", "text": map[string]string{"content": content, "tag": "lark_md"}},
				{"tag": "hr"},
				{"tag": "note", "elements": []map[string]interface{}{
					{"tag": "plain_text", "content": "店赢OS · " + time.Now().Format("2006-01-02 15:04:05")},
				}},
			},
		},
	}
	body, _ := json.Marshal(msg)
	resp, err := http.Post(webhookURL, "application/json", bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("飞书发送失败: %w", err)
	}
	defer resp.Body.Close()
	respBody, _ := io.ReadAll(resp.Body)
	var result map[string]interface{}
	json.Unmarshal(respBody, &result)
	if code, ok := result["code"].(float64); ok && code != 0 {
		return fmt.Errorf("飞书返回错误: %v", result["msg"])
	}
	return nil
}

// 钉钉机器人发送
func (s *NotificationService) sendDingTalkBot(merchantID uint, title, content string) error {
	webhookURL := ""
	secret := ""
	if s.db != nil {
		var ch model.NotificationChannel
		if err := s.db.Where("merchant_id = ? AND channel = ? AND enabled = ?", merchantID, "dingtalk_bot", true).First(&ch).Error; err != nil {
			return fmt.Errorf("钉钉机器人未配置")
		}
		webhookURL = ch.WebhookURL
		secret = ch.Secret
	}
	if webhookURL == "" {
		return fmt.Errorf("钉钉机器人webhook地址为空")
	}

	// 钉钉签名
	timestamp := time.Now().UnixMilli()
	sign := ""
	if secret != "" {
		str := fmt.Sprintf("%d\n%s", timestamp, secret)
		hash := sha256.Sum256([]byte(str))
		sign = base64.StdEncoding.EncodeToString(hash[:])
		webhookURL = fmt.Sprintf("%s&timestamp=%d&sign=%s", webhookURL, timestamp, sign)
	}

	msg := map[string]interface{}{
		"msgtype": "markdown",
		"markdown": map[string]string{
			"title": title,
			"text":  fmt.Sprintf("## %s\n\n%s\n\n> 店赢OS · %s", title, content, time.Now().Format("2006-01-02 15:04:05")),
		},
	}
	body, _ := json.Marshal(msg)
	resp, err := http.Post(webhookURL, "application/json", bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("钉钉发送失败: %w", err)
	}
	defer resp.Body.Close()
	respBody, _ := io.ReadAll(resp.Body)
	var result map[string]interface{}
	json.Unmarshal(respBody, &result)
	if errcode, ok := result["errcode"].(float64); ok && errcode != 0 {
		return fmt.Errorf("钉钉返回错误: %v", result["errmsg"])
	}
	return nil
}

// 公众号模板消息（平台统一公众号）
func (s *NotificationService) sendWechatOA(merchantID uint, title, content string) error {
	// 公众号模板消息需要：access_token + openid + template_id
	// 此处为接口预留，实际对接需在 config 中配置公众号 appid/secret
	// 商户需先微信授权获取 openid
	return nil
}

// 供其他 service 调用的便捷发送方法
func (s *NotificationService) NotifyIfEnabled(merchantID uint, eventType, title, content string) {
	go s.Send(merchantID, eventType, title, content)
}
