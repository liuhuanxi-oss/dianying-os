package service

import (
	"fmt"
	"time"

	"dyos-go/internal/model"

	"gorm.io/gorm"
)

type ContentGenService struct {
	db *gorm.DB
}

func NewContentGenService(db *gorm.DB) *ContentGenService { return &ContentGenService{db: db} }

func (s *ContentGenService) GeneratePost(platform string, merchantID uint, params map[string]interface{}) map[string]interface{} {
	titles := map[string]string{
		"xiaohongshu": "藏在巷子里的宝藏店铺🔥连吃一周都不腻",
		"dianping":    "人均80，这家店值得N刷！附最新菜单价格",
		"douyin":      "",
	}
	posts := map[string]interface{}{
		"platform": platform, "title": titles[platform],
		"content":  fmt.Sprintf("【必打卡】最近发现了一家超棒的店！\n\n📍地址：市中心商圈\n⭐评分：4.3分\n💰人均：￥68\n🔥推荐：招牌锅底+肥牛卷\n\n#探店 #美食 #%s", platform),
		"hashtags": []string{"#探店", "#美食推荐", "#必打卡", "#本地生活"},
		"images":   []string{"/mock/image_1.jpg", "/mock/image_2.jpg"},
	}
	if platform == "douyin" {
		posts["script"] = "【开场0-3s】凌晨5点去菜市场挑菜的秘密...【中段3-30s】揭秘后厨秘制底料...【结尾30-45s】限时福利放送...【CTA】点击左下角团购！"
		posts["duration"] = 45
	}
	return posts
}

func (s *ContentGenService) GenerateQRCode(merchantID uint, data string) map[string]interface{} {
	return map[string]interface{}{
		"merchant_id": merchantID, "qr_url": fmt.Sprintf("/qrcodes/merchant_%d_%d.png", merchantID, time.Now().Unix()),
		"payload": data, "type": "merchant_miniapp", "created_at": time.Now().Format("2006-01-02 15:04:05"),
	}
}

func (s *ContentGenService) ListKnowledge(page, size int, industry string) (map[string]interface{}, error) {
	if size <= 0 { size = 20 }
	if page <= 0 { page = 1 }
	if s.db == nil { return s.mockKnowledge(page, size, industry), nil }
	var items []model.IndustryKnowledge
	var total int64
	q := s.db.Model(&model.IndustryKnowledge{})
	if industry != "" { q = q.Where("industry = ?", industry) }
	q.Count(&total)
	q.Order("id DESC").Offset((page-1)*size).Limit(size).Find(&items)
	return map[string]interface{}{"items": items, "total": total, "page": page, "size": size}, nil
}

func (s *ContentGenService) CreateKnowledge(k *model.IndustryKnowledge) error {
	if s.db == nil { return fmt.Errorf("数据库不可用") }
	return s.db.Create(k).Error
}

func (s *ContentGenService) UpdateKnowledge(id uint, updates map[string]interface{}) error {
	if s.db == nil { return fmt.Errorf("数据库不可用") }
	return s.db.Model(&model.IndustryKnowledge{}).Where("id = ?", id).Updates(updates).Error
}

func (s *ContentGenService) DeleteKnowledge(id uint) error {
	if s.db == nil { return fmt.Errorf("数据库不可用") }
	return s.db.Delete(&model.IndustryKnowledge{}, id).Error
}

func (s *ContentGenService) BrandReplyStrategy(industry string) map[string]interface{} {
	return map[string]interface{}{
		"industry": industry, "tone": "温暖+专业",
		"principles": []string{"24小时内回复", "先共情再解决", "个性化不模板化"},
		"templates": []map[string]interface{}{
			{"scene": "好评感谢", "example": "感谢您的认可！我们会继续保持品质，期待再次为您服务~"},
			{"scene": "差评安抚", "example": "非常抱歉给您不好的体验，我们已安排店长跟进，24小时内联系您。"},
			{"scene": "中评引导", "example": "谢谢您的反馈，我们会根据您的建议优化服务，期待下次给您更好的体验！"},
		},
	}
}

func (s *ContentGenService) mockKnowledge(page, size int, industry string) map[string]interface{} {
	items := []map[string]interface{}{
		{"id": 1, "industry": "餐饮", "title": "2024餐饮行业消费趋势报告", "category": "行业报告", "source": "中国餐饮协会"},
		{"id": 2, "industry": "零售", "title": "社区零售数字化白皮书", "category": "白皮书", "source": "艾瑞咨询"},
		{"id": 3, "industry": "餐饮", "title": "火锅品类年度发展报告", "category": "行业报告", "source": "美团研究院"},
		{"id": 4, "industry": "休闲娱乐", "title": "沉浸式体验消费洞察", "category": "研究报告", "source": "腾讯研究院"},
	}
	total := int64(len(items))
	return map[string]interface{}{"items": items, "total": total, "page": page, "size": size}
}
