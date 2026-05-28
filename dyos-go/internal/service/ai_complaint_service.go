package service

import (
	"fmt"
	"strings"
	"time"

	"dyos-go/internal/model"
	"dyos-go/pkg/deepseek"

	"gorm.io/gorm"
)

type AIComplaintService struct {
	db     *gorm.DB
	deepSeek *deepseek.Client
}

func NewAIComplaintService(db *gorm.DB) *AIComplaintService {
	return &AIComplaintService{db: db, deepSeek: deepseek.NewClient()}
}

// Analyze 使用DeepSeek+规则引擎分析投诉
func (s *AIComplaintService) Analyze(complaintID uint) map[string]interface{} {
	analysis := s.deepSeekTriage(complaintID)
	s.saveAnalysis(complaintID, analysis)

	// 更新投诉的紧急度和退款决策
	if s.db != nil {
		urgency, _ := analysis["urgency"].(string)
		refundDecision, _ := analysis["refund_decision"].(string)
		s.db.Model(&model.Complaint{}).Where("id = ?", complaintID).Updates(map[string]interface{}{
			"urgency":         urgency,
			"refund_decision": refundDecision,
		})
	}

	return analysis
}

// AutoHandle AI自动处理投诉
func (s *AIComplaintService) AutoHandle(complaintID uint) map[string]interface{} {
	// 加载投诉信息
	var complaint model.Complaint
	complaintAmount := 0.0
	if s.db != nil {
		s.db.First(&complaint, complaintID)
		complaintAmount = complaint.ComplaintAmount
	}

	// AI分诊
	analysis := s.deepSeekTriage(complaintID)
	s.saveAnalysis(complaintID, analysis)

	// 生成回复
	reply := s.generateReply(analysis)

	// 判断退款
	refundResult := map[string]interface{}{"action": "skip", "reason": "无需退款"}
	if decision, _ := analysis["refund_decision"].(string); decision == "auto_refund" || decision == "auto_refund_partial" {
		refundAmount := complaintAmount
		if amt, ok := analysis["refund_amount"].(float64); ok && amt > 0 {
			refundAmount = amt
		}
		if decision == "auto_refund_partial" && refundAmount == complaintAmount {
			refundAmount = complaintAmount * 0.5
		}
		refundResult = map[string]interface{}{
			"action":          "refund_approved",
			"amount":          refundAmount,
			"refund_no":       fmt.Sprintf("TK%d", time.Now().UnixMilli()),
			"tianque_status":  "processing",
			"channel":         "天阙代子商户退款",
		}
	}

	// 更新投诉状态
	status := "resolved"
	if refundResult["action"] == "skip" {
		status = "processing"
	}
	if s.db != nil {
		now := time.Now()
		updates := map[string]interface{}{
			"status":          status,
			"ai_reply":        reply,
			"handler_type":    "ai_auto",
		}
		urgency, _ := analysis["urgency"].(string)
		refundDecision, _ := analysis["refund_decision"].(string)
		if urgency != "" {
			updates["urgency"] = urgency
		}
		if refundDecision != "" {
			updates["refund_decision"] = refundDecision
		}
		if status == "resolved" {
			updates["handled_at"] = &now
		}
		s.db.Model(&model.Complaint{}).Where("id = ?", complaintID).Updates(updates)
	}

	steps := []map[string]interface{}{
		{"step": 1, "action": "AI分诊完成", "result": analysis, "status": "done"},
		{"step": 2, "action": "AI回复生成", "result": reply, "status": "done"},
		{"step": 3, "action": "天阙退款决策", "result": refundResult, "status": "done"},
		{"step": 4, "action": "投诉状态更新", "result": map[string]string{"status": status}, "status": "done"},
	}

	return map[string]interface{}{
		"complaint_id": complaintID,
		"status":       status,
		"analysis":     analysis,
		"reply":        reply,
		"refund":       refundResult,
		"steps":        steps,
		"handler_type": "ai_auto",
		"completed_at": time.Now().Format("2006-01-02 15:04:05"),
	}
}

// deepSeekTriage 先尝试 DeepSeek API，失败则降级到规则引擎
func (s *AIComplaintService) deepSeekTriage(complaintID uint) map[string]interface{} {
	content := ""
	complaintType := ""
	amount := 0.0

	if s.db != nil {
		var c model.Complaint
		if err := s.db.First(&c, complaintID).Error; err == nil {
			content = c.Content
			complaintType = c.ComplaintType
			amount = c.ComplaintAmount
		}
	}

	// 尝试 DeepSeek API
	if s.deepSeek != nil && s.deepSeek.Available() && content != "" {
		analysis, err := s.deepSeek.AnalyzeComplaint(content, complaintType, amount)
		if err == nil && analysis != nil {
			return analysis
		}
		// API失败时记录日志，继续使用规则引擎
		fmt.Printf("DeepSeek API 调用失败，降级到规则引擎: %v\n", err)
	}

	// 降级：规则引擎
	return s.ruleEngineTriage(complaintID)
}

// ruleEngineTriage 规则引擎分诊
func (s *AIComplaintService) ruleEngineTriage(complaintID uint) map[string]interface{} {
	categories := map[string]string{
		"food_safety":      "食品安全",
		"duplicate_charge": "重复扣款",
		"no_service":       "未收到服务/商品",
		"service_attitude": "服务态度",
		"price_dispute":    "价格争议",
		"refund_delay":     "退款延迟",
		"other":            "其他",
	}

	category := s.ruleBasedCategory(complaintID)
	urgency := s.ruleBasedUrgency(complaintID)
	refundDecision, refundAmount := s.ruleBasedRefund(complaintID)

	return map[string]interface{}{
		"model_used":      "rule-engine",
		"category":        category,
		"category_name":   categories[category],
		"urgency":         urgency,
		"confidence":      0.85,
		"refund_decision": refundDecision,
		"refund_amount":   refundAmount,
		"reasoning":       s.generateReasoning(category, urgency, refundDecision),
		"fallback_used":   true,
	}
}

// ruleBasedCategory 规则引擎分类
func (s *AIComplaintService) ruleBasedCategory(complaintID uint) string {
	if s.db != nil {
		var c model.Complaint
		if err := s.db.First(&c, complaintID).Error; err == nil {
			content := strings.ToLower(c.Content + c.ComplaintDetail)
			switch {
			case strings.Contains(content, "食品") || strings.Contains(content, "中毒") || strings.Contains(content, "过敏") || strings.Contains(content, "过期") || strings.Contains(content, "异物"):
				return "food_safety"
			case strings.Contains(content, "重复扣") || strings.Contains(content, "多扣") || strings.Contains(content, "二次收费"):
				return "duplicate_charge"
			case strings.Contains(content, "未收到") || strings.Contains(content, "没收到") || strings.Contains(content, "未送达"):
				return "no_service"
			case strings.Contains(content, "态度") || strings.Contains(content, "骂") || strings.Contains(content, "不理"):
				return "service_attitude"
			case strings.Contains(content, "退款") || strings.Contains(content, "到账") || strings.Contains(content, "退钱"):
				return "refund_delay"
			case strings.Contains(content, "价格") || strings.Contains(content, "贵") || strings.Contains(content, "收费"):
				return "price_dispute"
			}
		}
	}
	return "other"
}

// ruleBasedUrgency 规则引擎紧急度判断
func (s *AIComplaintService) ruleBasedUrgency(complaintID uint) string {
	category := s.ruleBasedCategory(complaintID)
	switch category {
	case "food_safety", "duplicate_charge":
		return "critical"
	case "no_service", "refund_delay":
		return "high"
	default:
		return "normal"
	}
}

// ruleBasedRefund 规则引擎退款决策
func (s *AIComplaintService) ruleBasedRefund(complaintID uint) (string, float64) {
	category := s.ruleBasedCategory(complaintID)
	urgency := s.ruleBasedUrgency(complaintID)

	if s.db != nil {
		var c model.Complaint
		if err := s.db.First(&c, complaintID).Error; err == nil {
			switch {
			case urgency == "critical" || category == "food_safety":
				return "auto_refund", c.ComplaintAmount
			case category == "duplicate_charge" || category == "no_service":
				return "auto_refund", c.ComplaintAmount
			case category == "refund_delay":
				return "auto_refund_partial", c.ComplaintAmount * 0.3
			default:
				return "manual_review", 0
			}
		}
	}
	return "manual_review", 0
}

// generateReply 生成AI回复
func (s *AIComplaintService) generateReply(analysis map[string]interface{}) string {
	// 优先使用 DeepSeek 返回的建议回复
	if reply, ok := analysis["suggested_reply"].(string); ok && reply != "" {
		return reply
	}

	urgency, _ := analysis["urgency"].(string)
	category, _ := analysis["category"].(string)

	templates := map[string]string{
		"food_safety":       "尊敬的用户，食品安全是我们的生命线。收到您的反馈后已立即启动核查程序，将在2小时内致电了解详情并办理全额退款。给您带来的不好体验深表歉意。",
		"duplicate_charge":  "尊敬的顾客，经核实您的订单存在重复扣款，已为您发起退款，款项1-3个工作日内原路返回。我们将优化系统避免此类问题。",
		"no_service":        "非常抱歉给您带来不好的体验！已核实订单未按时送达，已办理全额退款预计24小时内到账。我们将对相关人员进行追责。",
		"service_attitude":  "感谢您的反馈，对服务人员态度问题深表歉意。已安排店长谈话教育并给予补偿。请继续监督。",
		"price_dispute":     "感谢反馈，已对价格进行核实。如有价差24小时内退还差价。我们坚持明码标价。",
		"refund_delay":      "非常抱歉退款延迟。已催促财务加急处理预计今日到账。同时为您申请优惠券作为补偿。",
		"other":             "感谢您的反馈，已将问题反馈相关部门处理，专员24小时内联系您。",
	}

	template := templates[category]
	if urgency == "critical" {
		template = "【紧急】" + template + " 如不满意可通过官方渠道申诉，我们将积极配合。"
	}

	return template
}

// generateReasoning 生成推理说明
func (s *AIComplaintService) generateReasoning(category, urgency, refundDecision string) string {
	templates := map[string]string{
		"auto_refund":         "基于投诉分类[%s]+紧急度[%s]判定：属于平台规则要求优先退款类型，建议自动退款以减少商户号风险，同时生成致歉回复。",
		"auto_refund_partial": "投诉紧急度为[%s]，建议部分退款作为补偿，既表达诚意又控制商户损失。",
		"manual_review":       "投诉分类[%s]情况复杂，建议人工审核后决定。已生成回复草稿供参考。",
		"escalate":            "投诉紧急度[%s]涉及金额较大/食品安全，可能触发商户号风险预警。建议升级至运营主管处理。",
		"reject":              "投诉内容[%s]分析存在恶意投诉特征。建议保留交易凭证和沟通记录，拒绝退款并准备申诉材料。",
	}
	tmpl := templates[refundDecision]
	if tmpl == "" {
		tmpl = "投诉分析完成，分类[%s]紧急度[%s]，建议人工审核处理。"
	}
	return fmt.Sprintf(tmpl, category, urgency)
}

// saveAnalysis 保存AI分析记录
func (s *AIComplaintService) saveAnalysis(complaintID uint, analysis map[string]interface{}) {
	if s.db == nil {
		return
	}
	cat, _ := analysis["category"].(string)
	urg, _ := analysis["urgency"].(string)
	dec, _ := analysis["refund_decision"].(string)
	conf, _ := analysis["confidence"].(float64)
	reas, _ := analysis["reasoning"].(string)
	mdl, _ := analysis["model_used"].(string)
	fallback, _ := analysis["fallback_used"].(bool)

	record := model.ComplaintAnalysis{
		ComplaintID:    complaintID,
		ModelUsed:      mdl,
		Category:       cat,
		Urgency:        urg,
		RefundDecision: dec,
		Confidence:     conf,
		Reasoning:      reas,
		SuggestedReply: s.generateReply(analysis),
		FallbackUsed:   fallback,
	}
	s.db.Create(&record)
}
