package service

import (
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"dyos-go/internal/model"
	"dyos-go/pkg/ai"

	"gorm.io/gorm"
)

type ContentGenService struct {
	db *gorm.DB
	ai *ai.Client
}

func NewContentGenService(db *gorm.DB) *ContentGenService {
	return &ContentGenService{db: db, ai: ai.NewClient()}
}

func (s *ContentGenService) GeneratePost(platform string, merchantID uint, params map[string]interface{}) map[string]interface{} {
	topic := ""
	if t, ok := params["topic"].(string); ok && t != "" {
		topic = t
	} else {
		topic = "门店推荐"
	}

	// 尝试 AI 生成
	if s.ai.Available() {
		prompts := map[string]string{
			"xiaohongshu": "小红书风格：标题吸引眼球带emoji，正文亲切分享体验感，结尾带3-5个话题标签。",
			"dianping":    "大众点评风格：客观真实，有具体价格和菜品描述，排版清晰。",
			"douyin":      "抖音短视频脚本：前3秒钩子抓住注意力，中段展示核心内容，结尾引导转化。",
		}
		style := prompts[platform]
		if style == "" {
			style = "社交媒体营销风格。"
		}
		sysPrompt := fmt.Sprintf("你是专业的社交媒体内容创作者。请为门店创作%s平台的内容。%s输出JSON格式：{\"title\":\"标题\",\"content\":\"正文\",\"hashtags\":[\"标签1\",\"标签2\"],\"tips\":\"发布建议\"}。如果是抖音额外包含{\"script\":\"脚本\",\"duration\":时长秒数}。", platform, style)
		userMsg := fmt.Sprintf("创作主题: %s\n商户ID: %d\n补充参数: %v", topic, merchantID, params)
		if result, err := s.ai.Chat(sysPrompt, userMsg); err == nil {
			result = cleanJSON(result)
			var aiResult map[string]interface{}
			if json.Unmarshal([]byte(result), &aiResult) == nil {
				aiResult["platform"] = platform
				aiResult["ai_generated"] = true
				return aiResult
			}
		}
	}

	// 降级：返回模板内容
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

func cleanJSON(s string) string {
	s = strings.TrimSpace(s)
	s = strings.TrimPrefix(s, "```json")
	s = strings.TrimPrefix(s, "```")
	s = strings.TrimSuffix(s, "```")
	return strings.TrimSpace(s)
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
