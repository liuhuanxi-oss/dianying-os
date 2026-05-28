package repository

import (
	"dyos-go/internal/model"
	"time"

	"gorm.io/gorm"
)

type AdminV1Repository struct {
	db *gorm.DB
}

func NewAdminV1Repository(db *gorm.DB) *AdminV1Repository {
	return &AdminV1Repository{db: db}
}

func (r *AdminV1Repository) database() (*gorm.DB, error) {
	if r == nil || r.db == nil {
		return nil, errDatabaseUnavailable
	}
	return r.db, nil
}

func (r *AdminV1Repository) ListKnowledge(page int, size int, category string, status string) (PageResult[model.Knowledge], error) {
	db, err := r.database()
	if err != nil {
		return PageResult[model.Knowledge]{}, err
	}
	query := db.Model(&model.Knowledge{})
	if category != "" {
		query = query.Where("category = ?", category)
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}
	return pageFind[model.Knowledge](query, page, size, "id DESC")
}

func (r *AdminV1Repository) GetKnowledge(id uint) (*model.Knowledge, error) {
	db, err := r.database()
	if err != nil {
		return nil, err
	}
	var item model.Knowledge
	if err := db.First(&item, id).Error; err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *AdminV1Repository) CreateKnowledge(item *model.Knowledge) error {
	db, err := r.database()
	if err != nil {
		return err
	}
	return db.Create(item).Error
}

func (r *AdminV1Repository) UpdateKnowledgeStatus(id uint, status string) error {
	db, err := r.database()
	if err != nil {
		return err
	}
	return db.Model(&model.Knowledge{}).Where("id = ?", id).Update("status", status).Error
}

func (r *AdminV1Repository) ListAITemplates(page int, size int, category string) (PageResult[model.AITemplate], error) {
	db, err := r.database()
	if err != nil {
		return PageResult[model.AITemplate]{}, err
	}
	query := db.Model(&model.AITemplate{})
	if category != "" {
		query = query.Where("category = ?", category)
	}
	return pageFind[model.AITemplate](query, page, size, "id DESC")
}

func (r *AdminV1Repository) ListAnnouncements(page int, size int, status string) (PageResult[model.Announcement], error) {
	db, err := r.database()
	if err != nil {
		return PageResult[model.Announcement]{}, err
	}
	query := db.Model(&model.Announcement{})
	if status != "" {
		query = query.Where("status = ?", status)
	}
	return pageFind[model.Announcement](query, page, size, "id DESC")
}

func (r *AdminV1Repository) CreateAnnouncement(item *model.Announcement) error {
	db, err := r.database()
	if err != nil {
		return err
	}
	return db.Create(item).Error
}

func (r *AdminV1Repository) UpdateAnnouncement(id uint, updates map[string]interface{}) error {
	db, err := r.database()
	if err != nil {
		return err
	}
	return db.Model(&model.Announcement{}).Where("id = ?", id).Updates(updates).Error
}

func (r *AdminV1Repository) DeleteAnnouncement(id uint) error {
	db, err := r.database()
	if err != nil {
		return err
	}
	return db.Delete(&model.Announcement{}, id).Error
}

func (r *AdminV1Repository) ListActivities(page int, size int, status string) (PageResult[model.Activity], error) {
	db, err := r.database()
	if err != nil {
		return PageResult[model.Activity]{}, err
	}
	query := db.Model(&model.Activity{})
	if status != "" {
		query = query.Where("status = ?", status)
	}
	return pageFind[model.Activity](query, page, size, "id DESC")
}

func (r *AdminV1Repository) CreateActivity(item *model.Activity) error {
	db, err := r.database()
	if err != nil {
		return err
	}
	return db.Create(item).Error
}

func (r *AdminV1Repository) UpdateActivity(id uint, updates map[string]interface{}) error {
	db, err := r.database()
	if err != nil {
		return err
	}
	return db.Model(&model.Activity{}).Where("id = ?", id).Updates(updates).Error
}

func (r *AdminV1Repository) MerchantStats() (map[string]interface{}, error) {
	db, err := r.database()
	if err != nil {
		return nil, err
	}
	var totalMerchants, activeMerchants, totalOrders int64
	var totalGMV, avgRating float64
	db.Model(&model.Merchant{}).Select("COUNT(*) as total_merchants, SUM(CASE WHEN status = 'active' OR status = 'APPROVED' THEN 1 ELSE 0 END) as active_merchants").Row().Scan(&totalMerchants, &activeMerchants)
	db.Model(&model.Transaction{}).Where("status = 'success'").Select("COALESCE(SUM(amount), 0) as total_gmv, COUNT(*) as total_orders").Row().Scan(&totalGMV, &totalOrders)
	db.Model(&model.Review{}).Select("COALESCE(AVG(rating), 0) as avg_rating").Row().Scan(&avgRating)
	return map[string]interface{}{"total_merchants": totalMerchants, "active_merchants": activeMerchants, "total_gmv": totalGMV, "total_orders": totalOrders, "avg_rating": avgRating}, nil
}

func (r *AdminV1Repository) TodayStats() (map[string]interface{}, error) {
	db, err := r.database()
	if err != nil {
		return nil, err
	}
	todayPrefix := time.Now().Format("2006-01-02") + "%"
	var result struct {
		GMV    float64 `gorm:"column:gmv"`
		Orders int64   `gorm:"column:orders"`
	}
	db.Model(&model.Transaction{}).Where("status = 'success' AND time LIKE ?", todayPrefix).Select("COALESCE(SUM(amount), 0) as gmv, COUNT(*) as orders").Scan(&result)
	var aiCalls int64
	db.Model(&model.ChatSession{}).Count(&aiCalls)
	return map[string]interface{}{"today_gmv": result.GMV, "today_orders": result.Orders, "ai_calls": aiCalls, "online_merchants": nil}, nil
}

func (r *AdminV1Repository) ListChurnWarnings(page int, size int, threshold int) (PageResult[model.ChurnWarning], error) {
	db, err := r.database()
	if err != nil {
		return PageResult[model.ChurnWarning]{}, err
	}
	query := db.Model(&model.ChurnWarning{})
	if threshold > 0 {
		query = query.Where("probability >= ?", threshold)
	}
	return pageFind[model.ChurnWarning](query, page, size, "probability DESC")
}

func (r *AdminV1Repository) GetChurnWarning(id uint) (*model.ChurnWarning, error) {
	db, err := r.database()
	if err != nil {
		return nil, err
	}
	var item model.ChurnWarning
	if err := db.First(&item, id).Error; err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *AdminV1Repository) ListPaymentTransactions(page int, size int, status string, merchant string) (PageResult[model.Transaction], error) {
	db, err := r.database()
	if err != nil {
		return PageResult[model.Transaction]{}, err
	}
	query := db.Model(&model.Transaction{})
	if status != "" {
		query = query.Where("status = ?", status)
	}
	if merchant != "" {
		query = query.Where("merchant LIKE ?", "%"+merchant+"%")
	}
	return pageFind[model.Transaction](query, page, size, "time DESC")
}

func (r *AdminV1Repository) GetPaymentTransaction(id string) (*model.Transaction, error) {
	db, err := r.database()
	if err != nil {
		return nil, err
	}
	var item model.Transaction
	if err := db.First(&item, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *AdminV1Repository) ListPaymentChannels() ([]model.PaymentChannel, error) {
	db, err := r.database()
	if err != nil {
		return nil, err
	}
	items := make([]model.PaymentChannel, 0)
	err = db.Order("name ASC").Find(&items).Error
	return items, err
}

func (r *AdminV1Repository) UpdatePaymentChannel(name string, updates map[string]interface{}) error {
	db, err := r.database()
	if err != nil {
		return err
	}
	return db.Model(&model.PaymentChannel{}).Where("name = ?", name).Updates(updates).Error
}

func (r *AdminV1Repository) ListChannelAnalysis() ([]model.ChannelAnalysis, error) {
	db, err := r.database()
	if err != nil {
		return nil, err
	}
	items := make([]model.ChannelAnalysis, 0)
	err = db.Order("leads DESC").Find(&items).Error
	return items, err
}

func (r *AdminV1Repository) ListPartners(page int, size int, status string) (PageResult[model.Partner], error) {
	db, err := r.database()
	if err != nil {
		return PageResult[model.Partner]{}, err
	}
	query := db.Model(&model.Partner{})
	if status != "" {
		query = query.Where("status = ?", status)
	}
	return pageFind[model.Partner](query, page, size, "id DESC")
}

func (r *AdminV1Repository) CreatePartner(item *model.Partner) error {
	db, err := r.database()
	if err != nil {
		return err
	}
	return db.Create(item).Error
}

func (r *AdminV1Repository) ListTickets(page int, size int, status string, priority string) (PageResult[model.Ticket], error) {
	db, err := r.database()
	if err != nil {
		return PageResult[model.Ticket]{}, err
	}
	query := db.Model(&model.Ticket{})
	if status != "" {
		query = query.Where("status = ?", status)
	}
	if priority != "" {
		query = query.Where("priority = ?", priority)
	}
	return pageFind[model.Ticket](query, page, size, "create_time DESC")
}

func (r *AdminV1Repository) CreateTicket(item *model.Ticket) error {
	db, err := r.database()
	if err != nil {
		return err
	}
	return db.Create(item).Error
}

func (r *AdminV1Repository) UpdateTicket(id string, updates map[string]interface{}) error {
	db, err := r.database()
	if err != nil {
		return err
	}
	return db.Model(&model.Ticket{}).Where("id = ?", id).Updates(updates).Error
}

func (r *AdminV1Repository) ListFAQ(page int, size int, category string) (PageResult[model.FAQ], error) {
	db, err := r.database()
	if err != nil {
		return PageResult[model.FAQ]{}, err
	}
	query := db.Model(&model.FAQ{})
	if category != "" {
		query = query.Where("category = ?", category)
	}
	return pageFind[model.FAQ](query, page, size, "id DESC")
}

func (r *AdminV1Repository) CreateFAQ(item *model.FAQ) error {
	db, err := r.database()
	if err != nil {
		return err
	}
	return db.Create(item).Error
}

func (r *AdminV1Repository) ListFeatureFlags(page int, size int, status string) (PageResult[model.FeatureFlag], error) {
	db, err := r.database()
	if err != nil {
		return PageResult[model.FeatureFlag]{}, err
	}
	query := db.Model(&model.FeatureFlag{})
	if status != "" {
		query = query.Where("status = ?", status)
	}
	return pageFind[model.FeatureFlag](query, page, size, "id DESC")
}

func (r *AdminV1Repository) UpdateFeatureFlag(id uint, status string) error {
	db, err := r.database()
	if err != nil {
		return err
	}
	return db.Model(&model.FeatureFlag{}).Where("id = ?", id).Update("status", status).Error
}

func (r *AdminV1Repository) ListRequirements(page int, size int, status string) (PageResult[model.Requirement], error) {
	db, err := r.database()
	if err != nil {
		return PageResult[model.Requirement]{}, err
	}
	query := db.Model(&model.Requirement{})
	if status != "" {
		query = query.Where("status = ?", status)
	}
	return pageFind[model.Requirement](query, page, size, "votes DESC")
}

func (r *AdminV1Repository) VoteRequirement(id uint) error {
	db, err := r.database()
	if err != nil {
		return err
	}
	return db.Model(&model.Requirement{}).Where("id = ?", id).UpdateColumn("votes", gorm.Expr("votes + 1")).Error
}

func (r *AdminV1Repository) ListVersions(page int, size int) (PageResult[model.Version], error) {
	db, err := r.database()
	if err != nil {
		return PageResult[model.Version]{}, err
	}
	return pageFind[model.Version](db.Model(&model.Version{}), page, size, "release_time DESC")
}

func (r *AdminV1Repository) ListLoginLogs(page int, size int, status string) (PageResult[model.LoginLog], error) {
	db, err := r.database()
	if err != nil {
		return PageResult[model.LoginLog]{}, err
	}
	query := db.Model(&model.LoginLog{})
	if status != "" {
		query = query.Where("status = ?", status)
	}
	return pageFind[model.LoginLog](query, page, size, "id DESC")
}

func (r *AdminV1Repository) ListRoles(page int, size int) (PageResult[model.Role], error) {
	db, err := r.database()
	if err != nil {
		return PageResult[model.Role]{}, err
	}
	return pageFind[model.Role](db.Model(&model.Role{}), page, size, "id DESC")
}

func (r *AdminV1Repository) CreateRole(item *model.Role) error {
	db, err := r.database()
	if err != nil {
		return err
	}
	return db.Create(item).Error
}

func (r *AdminV1Repository) UpdateRole(id uint, updates map[string]interface{}) error {
	db, err := r.database()
	if err != nil {
		return err
	}
	return db.Model(&model.Role{}).Where("id = ?", id).Updates(updates).Error
}

func (r *AdminV1Repository) ListOperationLogs(page int, size int, operator string, logType string) (PageResult[model.OperationLog], error) {
	db, err := r.database()
	if err != nil {
		return PageResult[model.OperationLog]{}, err
	}
	query := db.Model(&model.OperationLog{})
	if operator != "" {
		query = query.Where("operator = ?", operator)
	}
	if logType != "" {
		query = query.Where("type = ?", logType)
	}
	return pageFind[model.OperationLog](query, page, size, "id DESC")
}

func (r *AdminV1Repository) ListPricing() ([]model.Pricing, error) {
	db, err := r.database()
	if err != nil {
		return nil, err
	}
	items := make([]model.Pricing, 0)
	err = db.Order("price ASC").Find(&items).Error
	return items, err
}

func (r *AdminV1Repository) UpdatePricing(version string, updates map[string]interface{}) error {
	db, err := r.database()
	if err != nil {
		return err
	}
	return db.Model(&model.Pricing{}).Where("version = ?", version).Updates(updates).Error
}
