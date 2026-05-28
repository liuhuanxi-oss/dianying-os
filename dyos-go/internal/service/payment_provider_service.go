package service

import (
	"dyos-go/internal/model"

	"gorm.io/gorm"
)

type PaymentProviderService struct {
	db *gorm.DB
}

func NewPaymentProviderService(db *gorm.DB) *PaymentProviderService {
	return &PaymentProviderService{db: db}
}

func (s *PaymentProviderService) List(platform string, page, size int) (map[string]interface{}, error) {
	if size <= 0 {
		size = 20
	}
	if page <= 0 {
		page = 1
	}
	if s.db == nil {
		return map[string]interface{}{"items": []model.PaymentProvider{}, "total": int64(0), "page": page, "size": size}, nil
	}
	var items []model.PaymentProvider
	var total int64
	q := s.db.Model(&model.PaymentProvider{})
	if platform != "" {
		q = q.Where("platform = ?", platform)
	}
	q.Count(&total)
	q.Order("id DESC").Offset((page - 1) * size).Limit(size).Find(&items)
	// 不返回私钥原文
	for i := range items {
		if items[i].PrivateKey != "" {
			items[i].PrivateKey = "***已加密***"
		}
		if items[i].APIKey != "" {
			items[i].APIKey = "***已加密***"
		}
	}
	return map[string]interface{}{"items": items, "total": total, "page": page, "size": size}, nil
}

func (s *PaymentProviderService) GetByID(id uint) (*model.PaymentProvider, error) {
	if s.db == nil {
		return nil, gorm.ErrRecordNotFound
	}
	var item model.PaymentProvider
	if err := s.db.First(&item, id).Error; err != nil {
		return nil, err
	}
	if item.PrivateKey != "" {
		item.PrivateKey = "***已加密***"
	}
	if item.APIKey != "" {
		item.APIKey = "***已加密***"
	}
	return &item, nil
}

func (s *PaymentProviderService) Create(p *model.PaymentProvider) error {
	if s.db == nil {
		return nil
	}
	return s.db.Create(p).Error
}

func (s *PaymentProviderService) Update(id uint, updates map[string]interface{}) error {
	if s.db == nil {
		return nil
	}
	return s.db.Model(&model.PaymentProvider{}).Where("id = ?", id).Updates(updates).Error
}

func (s *PaymentProviderService) Delete(id uint) error {
	if s.db == nil {
		return nil
	}
	return s.db.Delete(&model.PaymentProvider{}, id).Error
}

// GetActiveProviders 获取指定平台的所有活跃服务商
func (s *PaymentProviderService) GetActiveProviders(platform string) []model.PaymentProvider {
	if s.db == nil {
		return nil
	}
	var items []model.PaymentProvider
	s.db.Where("platform = ? AND status = ?", platform, "active").Find(&items)
	return items
}
