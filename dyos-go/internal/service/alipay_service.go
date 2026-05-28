package service

import (
	"fmt"
	"math/rand"
	"time"

	"gorm.io/gorm"
)

type AlipayService struct{ db *gorm.DB }

func NewAlipayService(db *gorm.DB) *AlipayService { return &AlipayService{db: db} }

func (s *AlipayService) CreateOrder(params map[string]interface{}) map[string]interface{} {
	body := params
	_ = body
	outTradeNo := fmt.Sprintf("ALIPAY%d%d", time.Now().UnixMilli(), rand.Intn(9999))
	qrCode := fmt.Sprintf("alipay://qr/%s", outTradeNo)
	return map[string]interface{}{
		"out_trade_no": outTradeNo, "qr_code": qrCode,
		"amount":       params["amount"], "subject": params["subject"],
		"status":       "created", "created_at": time.Now().Format("2006-01-02 15:04:05"),
	}
}

func (s *AlipayService) QueryOrder(outTradeNo string) map[string]interface{} {
	statuses := []string{"success", "success", "success", "pending", "closed"}
	return map[string]interface{}{
		"out_trade_no": outTradeNo, "status": statuses[rand.Intn(len(statuses))],
		"total_amount": 28.00, "buyer": "支付宝用户***", "pay_time": time.Now().Add(-time.Duration(rand.Intn(60))*time.Minute).Format("2006-01-02 15:04:05"),
	}
}

func (s *AlipayService) Refund(outTradeNo string, amount float64) map[string]interface{} {
	return map[string]interface{}{
		"out_trade_no":  outTradeNo, "refund_amount": amount,
		"refund_status": "processing", "refund_no": fmt.Sprintf("REFUND%d", time.Now().UnixMilli()),
	}
}

func (s *AlipayService) KnowledgeTransfer(fromMerchant, toMerchant uint) map[string]interface{} {
	return map[string]interface{}{
		"from": fromMerchant, "to": toMerchant,
		"compatibility": 78.5,
		"transferable":  []string{"菜品定价策略", "营销活动模板", "差评回复话术", "最佳营业时间"},
		"not_transferable": []string{"会员数据", "交易记录", "本地化偏好"},
		"estimated_benefit": "预计新店可缩短3个月适应期",
	}
}

func (s *AlipayService) TransferScore(fromMerchant, toMerchant uint) map[string]interface{} {
	return map[string]interface{}{
		"from": fromMerchant, "to": toMerchant,
		"overall": 78.5,
		"dimensions": map[string]float64{"品类相似度": 92, "客群重叠度": 85, "区域互补性": 65, "供应链重叠": 72},
	}
}
