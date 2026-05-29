package service

import (
	"encoding/json"
	"fmt"
	"math"
	"math/rand"
	"time"

	"dyos-go/internal/model"

	"gorm.io/gorm"
)

type DigitalTwinService struct{ db *gorm.DB }

func NewDigitalTwinService(db *gorm.DB) *DigitalTwinService { return &DigitalTwinService{db: db} }

func (s *DigitalTwinService) GetLayout(storeID uint) map[string]interface{} {
	if s.db == nil {
		return s.defaultLayout(storeID)
	}
	var sl model.StoreLayout
	if err := s.db.Where("merchant_id = ?", storeID).First(&sl).Error; err != nil {
		return s.defaultLayout(storeID)
	}
	var layout map[string]interface{}
	if err := json.Unmarshal([]byte(sl.LayoutData), &layout); err != nil {
		return s.defaultLayout(storeID)
	}
	return layout
}

func (s *DigitalTwinService) SaveLayout(storeID uint, data map[string]interface{}) error {
	if s.db == nil {
		return nil
	}
	jsonData, _ := json.Marshal(data)
	now := time.Now().Format("2006-01-02 15:04:05")
	var sl model.StoreLayout
	if err := s.db.Where("merchant_id = ?", storeID).First(&sl).Error; err != nil {
		var storeName string
		if name, ok := data["name"].(string); ok {
			storeName = name
		} else {
			storeName = fmt.Sprintf("门店#%d", storeID)
		}
		return s.db.Create(&model.StoreLayout{
			Store:      storeName,
			MerchantID: storeID,
			LayoutData: string(jsonData),
			CreatedAt:  now,
		}).Error
	}
	return s.db.Model(&sl).Updates(map[string]interface{}{
		"layout_data": string(jsonData),
		"created_at":  now,
	}).Error
}

func (s *DigitalTwinService) Heatmap(storeID uint) map[string]interface{} {
	peakHours := []string{"11:30-13:00", "17:30-19:30"}
	hotZones := []string{}

	if s.db != nil {
		type HourCount struct {
			Hour int `gorm:"column:h"`
			Cnt  int `gorm:"column:c"`
		}
		var hourRows []HourCount
		s.db.Raw("SELECT CAST(strftime('%H', created_at) AS INTEGER) as h, COUNT(*) as c FROM orders WHERE store_id = ? AND created_at >= date('now','-30 days') GROUP BY h ORDER BY c DESC", storeID).Scan(&hourRows)
		if len(hourRows) >= 2 {
			h1, h2 := hourRows[0].Hour, hourRows[1].Hour
			peakHours = []string{fmt.Sprintf("%02d:00-%02d:00", h1, h1+2), fmt.Sprintf("%02d:00-%02d:00", h2, h2+2)}
		}
	}

	points := make([]map[string]interface{}, 20)
	for i := range points {
		points[i] = map[string]interface{}{"x": 2 + rand.Float64()*16, "y": 2 + rand.Float64()*11, "value": 10 + rand.Intn(90)}
	}

	return map[string]interface{}{
		"store_id":   storeID,
		"peak_hours": peakHours,
		"hot_zones":  hotZones,
		"points":     points,
	}
}

func (s *DigitalTwinService) Simulate(storeID uint, params map[string]interface{}) map[string]interface{} {
	customers := float64(50)
	staff := float64(5)
	chefCount := float64(3)

	if v, ok := params["customers"]; ok {
		customers = toFloat(v)
	}
	if v, ok := params["staff"]; ok {
		staff = toFloat(v)
	}
	if v, ok := params["chef_count"]; ok {
		chefCount = toFloat(v)
	}

	customerPerStaff := customers / staff
	customerPerChef := customers / chefCount
	avgWaitMin := math.Round((customerPerStaff*2.5 + customerPerChef*1.8) * 10) / 10
	turnover := math.Round((staff*0.8*8) * 10) / 10

	suggestion := ""
	bottleneck := ""
	if avgWaitMin > 20 {
		bottleneck = "厨房出餐口"
		suggestion = fmt.Sprintf("建议增加1个备菜岗，可将平均出餐时间缩短约%.0f分钟", avgWaitMin-12)
	} else if avgWaitMin > 12 {
		bottleneck = "大厅服务区"
		suggestion = fmt.Sprintf("建议午/晚高峰增加1名服务员，可减少%.0f分钟等位时间", avgWaitMin-8)
	} else {
		bottleneck = "无明显瓶颈"
		suggestion = "当前资源配置合理，翻台率表现良好"
	}

	return map[string]interface{}{
		"store_id": storeID,
		"scenario": params["scenario"],
		"result": map[string]interface{}{
			"avg_wait_min":    avgWaitMin,
			"table_turnover":  turnover,
			"bottleneck_zone": bottleneck,
			"suggestion":      suggestion,
		},
		"params": map[string]interface{}{
			"customers": customers, "staff": staff, "chef_count": chefCount,
			"ratio_staff":  math.Round(customerPerStaff*10) / 10,
			"ratio_kitchen": math.Round(customerPerChef*10) / 10,
		},
	}
}

func (s *DigitalTwinService) VoiceCommand(command string) map[string]interface{} {
	actions := map[string]string{
		"今天业绩": "今日GMV ¥28,600，订单128单，客单价¥223",
		"查看差评": "最近一条差评：等了一个小时菜才上来，1星评价，已生成AI回复草稿",
		"库存":   "牛肉卷库存12份（建议补货45份），生菜库存8份（建议补货30份）",
		"打开大屏": "数据大屏已启动，当前在线商户219家",
	}
	response := actions[command]
	if response == "" {
		response = "收到指令：「" + command + "」，正在处理中..."
	}
	return map[string]interface{}{"command": command, "response": response, "timestamp": time.Now().Format("15:04:05")}
}

func (s *DigitalTwinService) defaultLayout(storeID uint) map[string]interface{} {
	return map[string]interface{}{
		"store_id": storeID, "width": 20, "height": 15,
		"zones": []map[string]interface{}{
			{"name": "前台", "x": 1, "y": 1, "w": 4, "h": 3, "type": "service"},
			{"name": "大厅A", "x": 6, "y": 1, "w": 8, "h": 8, "type": "dining", "tables": 12},
			{"name": "大厅B", "x": 6, "y": 10, "w": 8, "h": 5, "type": "dining", "tables": 8},
			{"name": "厨房", "x": 1, "y": 5, "w": 4, "h": 10, "type": "kitchen"},
		},
	}
}

func toFloat(v interface{}) float64 {
	switch val := v.(type) {
	case float64:
		return val
	case int:
		return float64(val)
	case json.Number:
		f, _ := val.Float64()
		return f
	}
	return 0
}
