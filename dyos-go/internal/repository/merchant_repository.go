package repository

import (
	"dyos-go/internal/model"

	"gorm.io/gorm"
)

type MerchantListFilter struct {
	Status   string
	Industry string
	Keyword  string
	Page     int
	Size     int
}

type MerchantRepository struct {
	db *gorm.DB
}

func NewMerchantRepository(db *gorm.DB) *MerchantRepository {
	return &MerchantRepository{db: db}
}

// DB 返回数据库连接，供 Service 层直接操作
func (r *MerchantRepository) DB() *gorm.DB { return r.db }

func (r *MerchantRepository) List(filter MerchantListFilter) ([]model.Merchant, int64, error) {
	query := r.db.Model(&model.PaymentMerchant{})
	if filter.Status != "" {
		query = query.Where("status = ?", filter.Status)
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	var pms []model.PaymentMerchant
	offset := (filter.Page - 1) * filter.Size
	if err := query.Order("id DESC").Limit(filter.Size).Offset(offset).Find(&pms).Error; err != nil {
		return nil, 0, err
	}

	merchants := make([]model.Merchant, 0, len(pms))
	for _, pm := range pms {
		info := pm.ParseApplyData()
		m := model.Merchant{
			ID: pm.ID, Name: info.ShortName, Industry: info.Industry,
			Category: info.Category, Contact: info.Contact,
			Status: pm.Status, Mno: info.Mno, OrgName: info.OrgName,
			Salesman: info.Salesman, CreateTime: info.CreateTime,
			TotalTxns: pm.TotalTxns, TotalAmount: pm.TotalAmount,
			Channel: pm.Channel, WxSubMchID: info.WxSubMchID,
			AliSubMchID: info.AliSubMchID, SettleType: info.SettleType,
			SettleMethod: info.SettleMethod,
		}
		if m.Name == "" {
			m.Name = pm.ChannelMerchantCode
		}
		if filter.Keyword != "" {
			kw := "%" + filter.Keyword + "%"
			if !matchKeyword(m, kw) {
				continue
			}
		}
		if filter.Industry != "" && m.Industry != filter.Industry {
			continue
		}
		merchants = append(merchants, m)
	}
	return merchants, total, nil
}

func matchKeyword(m model.Merchant, kw string) bool {
	return true // 简单处理：SQL层面不做keyword过滤，由上层处理
}

func (r *MerchantRepository) Stats() (map[string]interface{}, error) {
	var total int64
	r.db.Model(&model.PaymentMerchant{}).Count(&total)

	var approved int64
	r.db.Model(&model.PaymentMerchant{}).Where("status = ?", "APPROVED").Count(&approved)

	var submitted int64
	r.db.Model(&model.PaymentMerchant{}).Where("status = ?", "SUBMITTED").Count(&submitted)

	// 统计行业分布
	rows, _ := r.db.Model(&model.PaymentMerchant{}).Select("apply_data").Rows()
	industryCount := map[string]int{}
	if rows != nil {
		defer rows.Close()
		for rows.Next() {
			var applyData string
			rows.Scan(&applyData)
			pm := model.PaymentMerchant{ApplyData: applyData}
			info := pm.ParseApplyData()
			if info.Industry != "" {
				industryCount[info.Industry]++
			}
		}
	}

	return map[string]interface{}{
		"total": total, "approved": approved, "submitted": submitted,
		"industries": industryCount,
	}, nil
}

func (r *MerchantRepository) GetByID(id uint) (*model.PaymentMerchant, error) {
	var pm model.PaymentMerchant
	if err := r.db.First(&pm, id).Error; err != nil {
		return nil, err
	}
	return &pm, nil
}
