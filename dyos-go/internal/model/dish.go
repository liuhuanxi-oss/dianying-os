package model

type Dish struct {
	ID            uint    `gorm:"primaryKey;column:id" json:"id"`
	Name          string  `gorm:"column:name" json:"name"`
	Category      string  `gorm:"column:category" json:"category"`
	MerchantID    uint    `gorm:"column:merchant_id;index" json:"merchant_id"`
	Merchant      string  `gorm:"column:merchant" json:"merchant"`
	Price         float64 `gorm:"column:price" json:"price"`
	SalesCount    int     `gorm:"column:sales_count" json:"sales_count"`
	Revenue       float64 `gorm:"column:revenue" json:"revenue"`
	RepurchaseRate float64 `gorm:"column:repurchase_rate" json:"repurchase_rate"`
	RelatedDishes string  `gorm:"column:related_dishes" json:"related_dishes"`
	Rating        float64 `gorm:"column:rating" json:"rating"`
}

func (Dish) TableName() string { return "dishes" }

type CustomerProfile struct {
	ID             uint   `gorm:"primaryKey;column:id" json:"id"`
	Name           string `gorm:"column:name" json:"name"`
	Gender         string `gorm:"column:gender" json:"gender"`
	AgeGroup       string `gorm:"column:age_group" json:"age_group"`
	Tags           string `gorm:"column:tags" json:"tags"`
	VisitCount     int    `gorm:"column:visit_count" json:"visit_count"`
	AvgOrderAmount float64 `gorm:"column:avg_order_amount" json:"avg_order_amount"`
	FavCategory    string `gorm:"column:fav_category" json:"fav_category"`
	LastVisit      string `gorm:"column:last_visit" json:"last_visit"`
}

func (CustomerProfile) TableName() string { return "customer_profiles" }
