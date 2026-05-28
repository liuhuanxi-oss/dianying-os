package service

import (
	"math"
	"math/rand"
	"time"

	"gorm.io/gorm"
)

type DecisionService struct {
	db *gorm.DB
}

func NewDecisionService(db *gorm.DB) *DecisionService {
	return &DecisionService{db: db}
}

func (s *DecisionService) CalcROI(params map[string]interface{}) map[string]interface{} {
	investment := float64(10000)
	if v, ok := params["investment"].(float64); ok && v > 0 { investment = v }
	if v, ok := params["investment"].(int); ok && v > 0 { investment = float64(v) }
	monthlyRevenue := investment * (0.8 + rand.Float64()*1.2)
	monthlyCost := investment * (0.3 + rand.Float64()*0.3)
	monthlyProfit := monthlyRevenue - monthlyCost
	roi := math.Round(monthlyProfit/investment*10000) / 100
	paybackMonths := math.Round(investment/monthlyProfit*10) / 10
	return map[string]interface{}{
		"investment": investment, "monthly_revenue": math.Round(monthlyRevenue*100)/100,
		"monthly_cost": math.Round(monthlyCost*100)/100, "monthly_profit": math.Round(monthlyProfit*100)/100,
		"roi_pct": roi, "payback_months": paybackMonths,
		"annual_return": math.Round(monthlyProfit*12*100)/100,
		"breakdown": map[string]float64{"营销获客": math.Round(investment*0.3*100)/100, "运营成本": math.Round(investment*0.25*100)/100, "人力成本": math.Round(investment*0.2*100)/100, "其他": math.Round(investment*0.25*100)/100},
	}
}

func (s *DecisionService) CompetitorBenchmark(industry string) []map[string]interface{} {
	return []map[string]interface{}{
		{"metric": "客单价(元)", "your_value": 68.5, "industry_avg": 62.3, "top_quartile": 85.0, "position": "above_avg"},
		{"metric": "翻台率(次/天)", "your_value": 3.8, "industry_avg": 3.2, "top_quartile": 5.5, "position": "above_avg"},
		{"metric": "评分", "your_value": 4.3, "industry_avg": 4.1, "top_quartile": 4.8, "position": "above_avg"},
		{"metric": "复购率(%)", "your_value": 28.5, "industry_avg": 32.0, "top_quartile": 45.0, "position": "below_avg"},
		{"metric": "人工成本占比(%)", "your_value": 22.0, "industry_avg": 19.5, "top_quartile": 14.0, "position": "below_avg"},
		{"metric": "外卖占比(%)", "your_value": 18.0, "industry_avg": 25.0, "top_quartile": 42.0, "position": "below_avg"},
	}
}

func (s *DecisionService) TrendPredict(metric string, months int) map[string]interface{} {
	if months <= 0 { months = 6 }
	history := make([]map[string]interface{}, months)
	forecast := make([]map[string]interface{}, 3)
	base := 100.0 + rand.Float64()*50
	for i := 0; i < months; i++ {
		val := base + float64(i)*rand.Float64()*12 + rand.Float64()*8
		history[i] = map[string]interface{}{"month": time.Now().AddDate(0, -months+1+i, 0).Format("2006-01"), "value": math.Round(val*100)/100}
	}
	for i := 0; i < 3; i++ {
		lastVal := history[len(history)-1]["value"].(float64)
		trend := lastVal * (1.02 + float64(i)*0.03)
		forecast[i] = map[string]interface{}{"month": time.Now().AddDate(0, i+1, 0).Format("2006-01"), "value": math.Round(trend*100)/100, "confidence": math.Round((0.85-float64(i)*0.08)*100)/100}
	}
	return map[string]interface{}{"metric": metric, "history": history, "forecast": forecast, "trend": "upward", "growth_rate": math.Round(rand.Float64()*15*100)/100}
}
