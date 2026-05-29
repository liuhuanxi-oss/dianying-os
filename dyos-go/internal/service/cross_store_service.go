package service

import (
	"fmt"
	"math/rand"
	"time"

	"dyos-go/internal/model"

	"gorm.io/gorm"
)

type CrossStoreService struct{ db *gorm.DB }

func NewCrossStoreService(db *gorm.DB) *CrossStoreService { return &CrossStoreService{db: db} }

func (s *CrossStoreService) Transfer(fromMerchant, toMerchant uint, knowledgeType string) (uint, error) {
	score := float64(60 + rand.Intn(40))
	now := time.Now().Format("2006-01-02 15:04:05")

	fromName := fmt.Sprintf("门店#%d", fromMerchant)
	toName := fmt.Sprintf("门店#%d", toMerchant)

	if s.db != nil {
		type StoreInfo struct {
			Name string `gorm:"column:name"`
		}
		var si StoreInfo
		if err := s.db.Table("stores").Select("name").Where("id = ?", fromMerchant).Scan(&si).Error; err == nil && si.Name != "" {
			fromName = si.Name
		}
		var si2 StoreInfo
		if err := s.db.Table("stores").Select("name").Where("id = ?", toMerchant).Scan(&si2).Error; err == nil && si2.Name != "" {
			toName = si2.Name
		}
	}

	transfer := model.KnowledgeTransfer{
		SourceMerchant: fromMerchant,
		SourceName:     fromName,
		TargetMerchant: toMerchant,
		TargetName:     toName,
		KnowledgeType:  knowledgeType,
		TransferScore:  score,
		Applied:        false,
		CreatedAt:      now,
	}

	if s.db != nil {
		if err := s.db.Create(&transfer).Error; err != nil {
			return 0, err
		}
	} else {
		transfer.ID = uint(rand.Intn(9000) + 1000)
	}

	return transfer.ID, nil
}

func (s *CrossStoreService) History(page, size int, knowledgeType string) (map[string]interface{}, error) {
	if size <= 0 {
		size = 20
	}
	if page <= 0 {
		page = 1
	}

	if s.db != nil {
		var total int64
		q := s.db.Model(&model.KnowledgeTransfer{})
		if knowledgeType != "" {
			q = q.Where("knowledge_type = ?", knowledgeType)
		}
		q.Count(&total)

		var items []model.KnowledgeTransfer
		offset := (page - 1) * size
		q.Order("id DESC").Limit(size).Offset(offset).Find(&items)

		// 转换为前端期望的 map
		result := make([]map[string]interface{}, len(items))
		for i, item := range items {
			result[i] = map[string]interface{}{
				"id":              item.ID,
				"source_merchant": item.SourceMerchant,
				"source_name":     item.SourceName,
				"target_merchant": item.TargetMerchant,
				"target_name":     item.TargetName,
				"knowledge_type":  item.KnowledgeType,
				"transfer_score":  item.TransferScore,
				"applied":         item.Applied,
				"created_at":      item.CreatedAt,
			}
		}
		return map[string]interface{}{"items": result, "total": total, "page": page, "size": size}, nil
	}

	// 无数据库时的模拟数据
	items := make([]map[string]interface{}, size)
	for i := range items {
		items[i] = map[string]interface{}{
			"id":              uint((page-1)*size + i + 1),
			"source_merchant": uint(1 + i%5),
			"source_name":     "门店" + string(rune('A'+i%5)),
			"target_merchant": uint(6 + i%5),
			"target_name":     "门店" + string(rune('F'+i%5)),
			"knowledge_type":  []string{"reply_strategy", "layout", "pricing"}[i%3],
			"transfer_score":  float64(60 + rand.Intn(40)),
			"applied":         i%2 == 0,
			"created_at":      time.Now().Add(-time.Duration(rand.Intn(30)*24) * time.Hour).Format("2006-01-02 15:04:05"),
		}
	}
	return map[string]interface{}{"items": items, "total": int64(86), "page": page, "size": size}, nil
}

func (s *CrossStoreService) Apply(id uint) error {
	if s.db != nil {
		return s.db.Model(&model.KnowledgeTransfer{}).Where("id = ?", id).Update("applied", true).Error
	}
	return nil
}
