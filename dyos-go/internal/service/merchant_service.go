package service

import (
	"dyos-go/internal/model"
	"dyos-go/internal/repository"

	"gorm.io/gorm"
)

type MerchantService struct {
	repo *repository.MerchantRepository
	db   *gorm.DB
}

func NewMerchantService(repo *repository.MerchantRepository) *MerchantService {
	return &MerchantService{repo: repo, db: repo.DB()}
}

func (s *MerchantService) List(page, size int, status, industry, keyword string) (map[string]interface{}, error) {
	if size <= 0 {
		size = 20
	}
	if page <= 0 {
		page = 1
	}
	items, total, err := s.repo.List(repository.MerchantListFilter{
		Status: status, Industry: industry, Keyword: keyword,
		Page: page, Size: size,
	})
	if err != nil {
		return nil, err
	}
	if items == nil {
		items = []model.Merchant{}
	}
	return map[string]interface{}{"items": items, "total": total, "page": page, "size": size}, nil
}

func (s *MerchantService) Stats() (map[string]interface{}, error) {
	return s.repo.Stats()
}

func (s *MerchantService) Get(id uint) (map[string]interface{}, error) {
	pm, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}
	info := pm.ParseApplyData()
	return map[string]interface{}{
		"id": pm.ID, "channel": pm.Channel, "channel_merchant_code": pm.ChannelMerchantCode,
		"status": pm.Status, "total_txns": pm.TotalTxns, "total_amount": pm.TotalAmount,
		"created_at": pm.CreatedAt,
		"merchant": map[string]interface{}{
			"mno": info.Mno, "short_name": info.ShortName,
			"contact": info.Contact, "industry": info.Industry,
			"category": info.Category, "address": info.Address,
			"reg_name": info.RegName, "legal_person": info.LegalPerson,
			"license_type": info.LicenseType, "biz_type": info.BizType,
			"org_name": info.OrgName, "salesman": info.Salesman,
			"wx_sub_mch_id": info.WxSubMchID, "ali_sub_mch_id": info.AliSubMchID,
			"union_sub_mch_id": info.UnionSubMchID,
			"settle_type": info.SettleType, "settle_method": info.SettleMethod,
			"bank_name": info.BankName, "wx_rate": info.WxRate, "ali_rate": info.AliRate,
		},
	}, nil
}

// Create 创建商户（真实写入数据库）
func (s *MerchantService) Create(data map[string]interface{}) (*model.PaymentMerchant, error) {
	pm := &model.PaymentMerchant{
		Status: "SUBMITTED",
	}
	if v, ok := data["channel"]; ok {
		pm.Channel, _ = v.(string)
	}
	if v, ok := data["channel_merchant_code"]; ok {
		pm.ChannelMerchantCode, _ = v.(string)
	}
	if v, ok := data["apply_data"]; ok {
		pm.ApplyData, _ = v.(string)
	}
	if s.db != nil {
		if err := s.db.Create(pm).Error; err != nil {
			return nil, err
		}
	}
	return pm, nil
}

// Update 更新商户信息
func (s *MerchantService) Update(id uint, updates map[string]interface{}) error {
	if s.db == nil {
		return nil
	}
	return s.db.Model(&model.PaymentMerchant{}).Where("id = ?", id).Updates(updates).Error
}

// Delete 删除商户
func (s *MerchantService) Delete(id uint) error {
	if s.db == nil {
		return nil
	}
	return s.db.Delete(&model.PaymentMerchant{}, id).Error
}

// Audit 审核商户
func (s *MerchantService) Audit(id uint, status string, remark string) error {
	if s.db == nil {
		return nil
	}
	updates := map[string]interface{}{"status": status}
	return s.db.Model(&model.PaymentMerchant{}).Where("id = ?", id).Updates(updates).Error
}

// Upgrade 升级商户套餐
func (s *MerchantService) Upgrade(id uint, plan string) error {
	if s.db == nil {
		return nil
	}
	return s.db.Model(&model.PaymentMerchant{}).Where("id = ?", id).Update("apply_data", plan).Error
}
