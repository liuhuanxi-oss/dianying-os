package service

import (
	"encoding/json"
	"math/rand"
	"time"

	"dyos-go/internal/model"

	"gorm.io/gorm"
)

type DigitalTwinService struct{ db *gorm.DB }

func NewDigitalTwinService(db *gorm.DB) *DigitalTwinService { return &DigitalTwinService{db: db} }

func (s *DigitalTwinService) GetLayout(storeID uint) map[string]interface{} {
	layout := map[string]interface{}{
		"store_id": storeID, "width": 20, "height": 15,
		"zones": []map[string]interface{}{
			{"name": "前台", "x": 1, "y": 1, "w": 4, "h": 3, "type": "service"},
			{"name": "大厅A", "x": 6, "y": 1, "w": 8, "h": 8, "type": "dining", "tables": 12},
			{"name": "大厅B", "x": 6, "y": 10, "w": 8, "h": 5, "type": "dining", "tables": 8},
			{"name": "厨房", "x": 1, "y": 5, "w": 4, "h": 10, "type": "kitchen"},
		},
	}
	return layout
}

func (s *DigitalTwinService) SaveLayout(storeID uint, data map[string]interface{}) error {
	if s.db == nil { return nil }
	jsonData, _ := json.Marshal(data)
	return s.db.Model(&model.StoreLayout{}).Where("merchant_id = ?", storeID).Updates(map[string]interface{}{"layout_data": string(jsonData), "created_at": time.Now().Format("2006-01-02 15:04:05")}).Error
}

func (s *DigitalTwinService) Heatmap(storeID uint) map[string]interface{} {
	points := make([]map[string]interface{}, 20)
	for i := range points {
		points[i] = map[string]interface{}{"x": 2 + rand.Float64()*16, "y": 2 + rand.Float64()*11, "value": 10 + rand.Intn(90)}
	}
	return map[string]interface{}{
		"store_id": storeID, "heatmap_url": "/heatmaps/store_1.png",
		"peak_hours": []string{"11:30-13:00", "17:30-19:30"},
		"hot_zones":  []string{"大厅A 入口处", "大厅A 窗边区"},
		"points":      points,
	}
}

func (s *DigitalTwinService) Simulate(storeID uint, params map[string]interface{}) map[string]interface{} {
	return map[string]interface{}{
		"store_id": storeID,
		"scenario": "午市高峰",
		"result": map[string]interface{}{
			"avg_wait_min":    12.5, "table_turnover": 3.8,
			"bottleneck_zone": "厨房出餐口", "suggestion": "增加1个备菜岗可缩短平均出餐时间3分钟",
		},
	}
}

func (s *DigitalTwinService) VoiceCommand(command string) map[string]interface{} {
	actions := map[string]string{
		"今天业绩":     "今日GMV ¥28,600，订单128单，客单价¥223",
		"查看差评":     "最近一条差评：等了一个小时菜才上来，1星评价，已生成AI回复草稿",
		"库存":       "牛肉卷库存12份（建议补货45份），生菜库存8份（建议补货30份）",
		"打开大屏":     "数据大屏已启动，当前在线商户219家",
	}
	response := actions[command]
	if response == "" {
		response = "收到指令：「" + command + "」，正在处理中..."
	}
	return map[string]interface{}{"command": command, "response": response, "timestamp": time.Now().Format("15:04:05")}
}
