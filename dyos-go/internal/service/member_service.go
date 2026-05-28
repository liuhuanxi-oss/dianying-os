package service

import (
	"math/rand"
	"time"

	"dyos-go/internal/model"

	"gorm.io/gorm"
)

type MemberService struct{ db *gorm.DB }

func NewMemberService(db *gorm.DB) *MemberService { return &MemberService{db: db} }

func (s *MemberService) List(page, size int, level string) (map[string]interface{}, error) {
	if size <= 0 { size = 20 }
	if page <= 0 { page = 1 }
	if s.db != nil {
		var items []model.Member
		var total int64
		q := s.db.Model(&model.Member{})
		if level != "" { q = q.Where("level = ?", level) }
		q.Count(&total)
		q.Offset((page - 1) * size).Limit(size).Order("id DESC").Find(&items)
		// 本月新增
		var newThisMonth int64
		thisMonth := time.Now().Format("2006-01")
		s.db.Model(&model.Member{}).Where("join_date LIKE ?", thisMonth+"%").Count(&newThisMonth)
		// 续费率（上个月有访问的会员中本月还在活跃的比例）
		var renewRate float64
		lastMonth := time.Now().AddDate(0, -1, 0).Format("2006-01")
		var lastMonthActive int64
		s.db.Model(&model.Member{}).Where("last_visit LIKE ?", lastMonth+"%").Count(&lastMonthActive)
		if lastMonthActive > 0 {
			var thisMonthActive int64
			thisMonthLike := time.Now().Format("2006-01") + "%"
			s.db.Model(&model.Member{}).Where("last_visit LIKE ?", thisMonthLike).Count(&thisMonthActive)
			renewRate = float64(thisMonthActive) / float64(lastMonthActive) * 100
		}
		return map[string]interface{}{"items": items, "total": total, "new_this_month": newThisMonth, "renew_rate": renewRate, "page": page, "size": size}, nil
	}
	items := make([]model.Member, size)
	for i := range items {
		items[i] = model.Member{
			ID: uint((page-1)*size + i + 1), Name: "会员" + string(rune('A'+i%26)),
			Phone: "138****" + string(rune('0'+i%10)), Level: []string{"普通", "银卡", "金卡", "钻石"}[i%4],
			Points: 100 + rand.Intn(5000), TotalSpent: 500 + rand.Float64()*5000,
			Tags: "[\"高价值\",\"活跃\"]", MerchantID: 1,
			JoinDate: time.Now().AddDate(-1, 0, 0).Format("2006-01-02"),
			LastVisit: time.Now().Add(-time.Duration(rand.Intn(30)*24)*time.Hour).Format("2006-01-02"),
		}
	}
	return map[string]interface{}{"items": items, "total": int64(2568), "new_this_month": int64(12), "renew_rate": 68.5, "page": page, "size": size}, nil
}

func (s *MemberService) Get(id uint) (*model.Member, error) {
	if s.db == nil {
		return &model.Member{ID: id, Name: "会员示例", Level: "金卡", Points: 3200, TotalSpent: 12800, Tags: "[\"高频\",\"高价值\"]", JoinDate: "2024-01-15", LastVisit: time.Now().Add(-3*24*time.Hour).Format("2006-01-02")}, nil
	}
	var m model.Member
	if err := s.db.First(&m, id).Error; err != nil { return nil, err }
	return &m, nil
}

func (s *MemberService) Create(m *model.Member) error {
	if s.db == nil { return nil }
	m.JoinDate = time.Now().Format("2006-01-02")
	return s.db.Create(m).Error
}

func (s *MemberService) Update(id uint, updates map[string]interface{}) error {
	if s.db == nil { return nil }
	return s.db.Model(&model.Member{}).Where("id = ?", id).Updates(updates).Error
}

func (s *MemberService) LevelRules() []model.MemberLevelRule {
	return []model.MemberLevelRule{
		{ID: 1, Name: "普通会员", MinSpent: 0, MinPoints: 0, Discount: 1.0, Icon: "user"},
		{ID: 2, Name: "银卡会员", MinSpent: 3000, MinPoints: 500, Discount: 0.95, Icon: "shield"},
		{ID: 3, Name: "金卡会员", MinSpent: 10000, MinPoints: 2000, Discount: 0.88, Icon: "star"},
		{ID: 4, Name: "钻石会员", MinSpent: 30000, MinPoints: 5000, Discount: 0.80, Icon: "award"},
	}
}

func (s *MemberService) PointsHistory(memberID uint, page, size int) (map[string]interface{}, error) {
	if size <= 0 { size = 20 }
	items := make([]model.PointsRecord, size)
	for i := range items {
		items[i] = model.PointsRecord{
			ID: uint((page-1)*size + i + 1), MemberID: memberID,
			Amount: []int{200, 500, -100, 300, 1000}[i%5],
			Reason: []string{"消费获得", "签到奖励", "兑换商品", "评价奖励", "邀请好友"}[i%5],
			CreatedAt: time.Now().Add(-time.Duration(rand.Intn(30)*24)*time.Hour).Format("2006-01-02"),
		}
	}
	return map[string]interface{}{"items": items, "total": int64(128), "page": page, "size": size}, nil
}

func (s *MemberService) Profile(id uint) map[string]interface{} {
	return map[string]interface{}{
		"member_id": id, "name": "会员示例", "level": "金卡",
		"tags":     []string{"高频客", "火锅爱好者", "社交达人"},
		"visit_freq": "每周2次", "avg_order": 186.5, "fav_dishes": []string{"麻辣锅底", "肥牛卷", "虾滑"},
		"insights":    "该会员对火锅偏好明显，建议推送新锅底和高端肉类活动。近30天未到访，可发送召回优惠券。",
	}
}
