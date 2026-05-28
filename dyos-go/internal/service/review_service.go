package service

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"strings"
	"sync"
	"time"

	"dyos-go/internal/model"

	"gorm.io/gorm"
)

type ReviewService struct {
	db       *gorm.DB
	AlertHub *ReviewAlertHub
}

func NewReviewService(db *gorm.DB) *ReviewService {
	return &ReviewService{db: db, AlertHub: NewReviewAlertHub()}
}

var reviewSentiments = []string{"positive", "neutral", "negative"}

func (s *ReviewService) List(merchantID uint, platform string, rating int, sentiment string, page, size int) (map[string]interface{}, error) {
	if size <= 0 {
		size = 20
	}
	if page <= 0 {
		page = 1
	}
	if s.db == nil {
		return s.mockList(merchantID, platform, rating, sentiment, page, size)
	}
	var reviews []model.Review
	var total int64
	q := s.db.Model(&model.Review{})
	if merchantID > 0 {
		q = q.Where("merchant_id = ?", merchantID)
	}
	if platform != "" {
		q = q.Where("platform = ?", platform)
	}
	if rating > 0 {
		q = q.Where("rating = ?", rating)
	}
	if sentiment != "" {
		q = q.Where("sentiment = ?", sentiment)
	}
	q.Count(&total)
	if err := q.Order("id DESC").Offset((page - 1) * size).Limit(size).Find(&reviews).Error; err != nil {
		return nil, err
	}
	return map[string]interface{}{"items": reviews, "total": total, "page": page, "size": size}, nil
}

// CheckOwnership 验证评价是否属于指定商户，merchantID=0表示admin跳过检查
func (s *ReviewService) CheckOwnership(id uint, merchantID uint) (bool, error) {
	if merchantID == 0 { return true, nil }
	if s.db == nil { return true, nil }
	var count int64
	err := s.db.Model(&model.Review{}).Where("id = ? AND merchant_id = ?", id, merchantID).Count(&count).Error
	return count > 0, err
}

func (s *ReviewService) Get(id uint) (*model.Review, error) {
	if s.db == nil {
		return s.mockDetail(id), nil
	}
	var r model.Review
	if err := s.db.First(&r, id).Error; err != nil {
		return nil, err
	}
	return &r, nil
}

func (s *ReviewService) GenerateReply(id uint, style string) (map[string]interface{}, error) {
	r, err := s.Get(id)
	if err != nil {
		return nil, err
	}
	replies := s.aiReplies(r, style)
	result := map[string]interface{}{"review_id": id, "replies": replies}
	if s.db != nil {
		s.db.Model(&model.Review{}).Where("id = ?", id).Update("reply", replies[0])
	}
	return result, nil
}

func (s *ReviewService) SaveReply(id uint, reply string) error {
	if s.db != nil {
		return s.db.Model(&model.Review{}).Where("id = ?", id).Updates(map[string]interface{}{
			"merchant_reply": reply,
			"reply_time":     time.Now().Format("2006-01-02 15:04:05"),
			"status":         "REPLIED",
		}).Error
	}
	return fmt.Errorf("数据库不可用")
}

func (s *ReviewService) SyncReply(id uint) error {
	if s.db != nil {
		s.db.Model(&model.Review{}).Where("id = ?", id).Updates(map[string]interface{}{"reply_status": "synced", "synced_at": time.Now().Format("2006-01-02 15:04:05")})
	}
	return nil
}

func (s *ReviewService) Stats(merchantID uint) map[string]interface{} {
	if s.db == nil {
		return s.mockStats(merchantID)
	}
	var total, synced int64
	q := s.db.Model(&model.Review{})
	if merchantID > 0 {
		q = q.Where("merchant_id = ?", merchantID)
	}
	q.Count(&total)
	q2 := s.db.Model(&model.Review{})
	if merchantID > 0 {
		q2 = q2.Where("merchant_id = ?", merchantID)
	}
	q2.Where("reply_status = ?", "synced").Count(&synced)
	stats := map[string]interface{}{"total": total, "synced": synced, "pending_reply": total - synced, "merchant_id": merchantID}
	for _, p := range []string{"大众点评", "美团", "饿了么", "小红书"} {
		var cnt int64
		qp := s.db.Model(&model.Review{}).Where("platform = ?", p)
		if merchantID > 0 {
			qp = qp.Where("merchant_id = ?", merchantID)
		}
		qp.Count(&cnt)
		stats[fmt.Sprintf("platform_%s", p)] = cnt
	}
	for _, sent := range reviewSentiments {
		var cnt int64
		qs := s.db.Model(&model.Review{}).Where("sentiment = ?", sent)
		if merchantID > 0 {
			qs = qs.Where("merchant_id = ?", merchantID)
		}
		qs.Count(&cnt)
		stats[fmt.Sprintf("sentiment_%s", sent)] = cnt
	}
	return stats
}

func (s *ReviewService) ListRules() ([]model.ReviewReplyRule, error) {
	if s.db == nil {
		return s.mockRules(), nil
	}
	var rules []model.ReviewReplyRule
	if err := s.db.Order("priority DESC").Find(&rules).Error; err != nil {
		return nil, err
	}
	if len(rules) == 0 {
		rules = s.mockRules()
	}
	return rules, nil
}

func (s *ReviewService) CreateRule(rule *model.ReviewReplyRule) error {
	if s.db == nil {
		return fmt.Errorf("数据库不可用")
	}
	return s.db.Create(rule).Error
}

func (s *ReviewService) UpdateRule(id uint, updates map[string]interface{}) error {
	if s.db == nil {
		return fmt.Errorf("数据库不可用")
	}
	return s.db.Model(&model.ReviewReplyRule{}).Where("id = ?", id).Updates(updates).Error
}

func (s *ReviewService) DeleteRule(id uint) error {
	if s.db == nil {
		return fmt.Errorf("数据库不可用")
	}
	return s.db.Delete(&model.ReviewReplyRule{}, id).Error
}

func (s *ReviewService) SimulateAlert() {
	r := mockReview(1, 1)
	r.AlertLevel = "critical"
	s.AlertHub.Broadcast(map[string]interface{}{"type": "review_alert", "data": r})
}

func (s *ReviewService) aiReplies(r *model.Review, style string) []string {
	if style == "" {
		style = "friendly"
	}
	var tmpls []string
	switch {
	case r.Rating <= 2:
		tmpls = []string{
			"非常抱歉给您带来了不愉快的体验，我们已经安排店长跟进此事，并将在24小时内与您联系。您的反馈对我们非常重要！",
			"感谢您的反馈，我们深刻反思了服务中的不足。已对相关员工进行培训，欢迎您再次光临体验改进后的服务。",
			"您好，对于您遇到的问题我们深感歉意。我们已优化流程，承诺给您下次到店更好的体验。期待您的再次光临！",
		}
	case r.Rating <= 4:
		tmpls = []string{
			"感谢您的评价和建议！我们会继续努力，期待您下次光临能有五星体验🌟",
			"谢谢您的反馈，您提到的细节我们已经记录，会在后续优化中改进。期待再次为您服务！",
			"感谢选择我们，您的建议是我们进步的动力。下次来试试我们的新品吧！",
		}
	default:
		tmpls = []string{
			"感谢您的五星好评！您的满意是我们最大的动力，期待再次为您服务❤️",
			"太开心了！感谢您的认可，我们会继续保持品质，欢迎常来！",
			"谢谢您的好评！分享给朋友一起来体验吧，更多惊喜等着您~",
		}
	}
	return tmpls
}

func (s *ReviewService) mockList(merchantID uint, platform string, rating int, sentiment string, page, size int) (map[string]interface{}, error) {
	platforms := []string{"大众点评", "美团", "饿了么", "小红书"}
	items := make([]model.Review, 0, size)
	for i := 0; i < size; i++ {
		idx := (page-1)*size + i
		r := mockReview(idx, idx%len(platforms))
		r.Platform = platforms[idx%len(platforms)]
		r.MerchantID = merchantID
		if platform != "" && r.Platform != platform {
			continue
		}
		if rating > 0 && r.Rating != rating {
			continue
		}
		if sentiment != "" && r.Sentiment != sentiment {
			continue
		}
		items = append(items, r)
	}
	return map[string]interface{}{"items": items, "total": int64(68), "page": page, "size": size}, nil
}

func (s *ReviewService) mockDetail(id uint) *model.Review {
	r := mockReview(int(id), 0)
	r.ID = id
	sentimentData := s.sentimentAnalysis(r.Content)
	r.Sentiment = sentimentData["sentiment"].(string)
	kw, _ := json.Marshal(sentimentData["keywords"])
	r.Keywords = string(kw)
	return &r
}

func (s *ReviewService) mockStats(merchantID uint) map[string]interface{} {
	return map[string]interface{}{
		"merchant_id":     merchantID,
		"total":           int64(1286),
		"synced":          int64(1102),
		"pending_reply":   int64(184),
		"platform_大众点评":  int64(486),
		"platform_美团":    int64(398),
		"platform_饿了么":   int64(265),
		"platform_小红书":   int64(137),
		"sentiment_positive": int64(892),
		"sentiment_neutral":  int64(268),
		"sentiment_negative": int64(126),
	}
}

func (s *ReviewService) mockRules() []model.ReviewReplyRule {
	return []model.ReviewReplyRule{
		{ID: 1, Name: "差评即时响应", Platform: "all", Condition: "rating", MinRating: 1, MaxRating: 2, ReplyTmpl: "非常抱歉...已安排专人跟进，请联系客服热线。", AutoApprove: false, Enabled: true, Priority: 100},
		{ID: 2, Name: "好评感谢模板", Platform: "all", Condition: "rating", MinRating: 5, MaxRating: 5, ReplyTmpl: "感谢您的五星好评！期待再次为您服务。", AutoApprove: true, Enabled: true, Priority: 50},
	}
}

func (s *ReviewService) sentimentAnalysis(content string) map[string]interface{} {
	positiveWords := []string{"好", "棒", "赞", "满意", "推荐", "好吃", "美味", "性价比高", "环境好", "服务好", "喜欢", "爱", "不错", "优秀", "完美"}
	negativeWords := []string{"差", "慢", "贵", "难吃", "失望", "态度差", "脏", "乱", "等", "排队", "不值", "差评", "投诉", "退款", "垃圾"}
	posCount, negCount := 0, 0
	keywords := []string{}
	for _, w := range positiveWords {
		if strings.Contains(content, w) {
			posCount++
			keywords = append(keywords, w)
		}
	}
	for _, w := range negativeWords {
		if strings.Contains(content, w) {
			negCount++
			keywords = append(keywords, w)
		}
	}
	sentiment := "neutral"
	if posCount > negCount {
		sentiment = "positive"
	} else if negCount > posCount {
		sentiment = "negative"
	}
	return map[string]interface{}{"sentiment": sentiment, "keywords": keywords, "confidence": 0.7 + rand.Float64()*0.25}
}

type ReviewAlertHub struct {
	clients map[chan map[string]interface{}]struct{}
	mu      sync.RWMutex
}

func NewReviewAlertHub() *ReviewAlertHub {
	return &ReviewAlertHub{clients: make(map[chan map[string]interface{}]struct{})}
}

func (h *ReviewAlertHub) Subscribe() chan map[string]interface{} {
	ch := make(chan map[string]interface{}, 16)
	h.mu.Lock()
	h.clients[ch] = struct{}{}
	h.mu.Unlock()
	return ch
}

func (h *ReviewAlertHub) Unsubscribe(ch chan map[string]interface{}) {
	h.mu.Lock()
	delete(h.clients, ch)
	close(ch)
	h.mu.Unlock()
}

func (h *ReviewAlertHub) Broadcast(msg map[string]interface{}) {
	h.mu.RLock()
	defer h.mu.RUnlock()
	for ch := range h.clients {
		select {
		case ch <- msg:
		default:
		}
	}
}

func mockReview(idx, platformIdx int) model.Review {
	platforms := []string{"大众点评", "美团", "饿了么", "小红书"}
	merchants := []string{"有味餐厅", "星辰便利", "悦享茶饮", "云端火锅", "城市烘焙"}
	users := []string{"吃货小王", "美食探寻者", "点评达人", "周末食客", "本地生活家"}
	contents := []string{
		"菜品味道很好，分量也足，服务态度特别好，下次还会再来！",
		"环境很干净，但是上菜速度太慢了，等了将近一个小时。",
		"性价比很高的一家店，推荐他们家的招牌菜，真的很好吃。",
		"总体还不错，有几个菜需要改进一下口味，偏咸了。",
		"服务态度特别差，叫了半天没人理，不会再来了。",
		"非常满意的一次用餐体验，从进门到离开服务都很到位。",
		"人太多了排了好久，不过菜品味道值得等待，会回购。",
		"美团上买的券很划算，到店体验也很好，给个好评！",
	}
	ratings := []int{5, 2, 4, 3, 1, 5, 4, 4}
	return model.Review{
		Platform:    platforms[platformIdx%len(platforms)],
		PlatformID:  fmt.Sprintf("rv_%s_%d", platforms[platformIdx%len(platforms)], idx),
		Merchant:    merchants[idx%len(merchants)],
		MerchantID:  uint(idx%len(merchants) + 1),
		User:        users[idx%len(users)],
		Rating:      ratings[idx%len(ratings)],
		Content:     contents[idx%len(contents)],
		Sentiment:   reviewSentiments[idx%3],
		Keywords:    "[]",
		CreatedAt:   time.Now().Add(-time.Duration(idx*37) * time.Minute).Format("2006-01-02 15:04:05"),
		ReplyStatus: "pending",
	}
}
