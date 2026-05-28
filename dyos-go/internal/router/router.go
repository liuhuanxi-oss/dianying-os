package router

import (
	"io/fs"
	"log"
	"net/http"
	"strconv"

	"dyos-go/internal/config"
	"dyos-go/internal/handler"
	"dyos-go/internal/middleware"
	"dyos-go/internal/model"
	"dyos-go/internal/repository"
	"dyos-go/internal/screen"
	"dyos-go/internal/service"
	"dyos-go/internal/tianque"
	"dyos-go/pkg/response"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func New(db *gorm.DB, cfg *config.Config, spaFS fs.FS) *gin.Engine {
	r := gin.New()
	r.Use(gin.Logger(), gin.Recovery(), middleware.RateLimit(), middleware.CORS())

	health := handler.NewHealthHandler(db)
	r.GET("/api/", health.Check)
	r.GET("/api/health", health.Check)

	// 服务初始化
	screenService := service.NewScreenService(db)
	screenHub := screen.NewHub(screenService)
	screenHandler := handler.NewScreenHandler(screenService, screenHub)
	go screenHub.Run()

	reviewService := service.NewReviewService(db)
	reviewHandler := handler.NewReviewHandler(reviewService)

	chatService := service.NewChatService(db)
	chatHandler := handler.NewChatHandler(chatService)

	complaintService := service.NewComplaintService(db)
	aiComplaintService := service.NewAIComplaintService(db)
	complaintHandler := handler.NewComplaintHandler(complaintService, aiComplaintService)

	reportService := service.NewReportService(db)
	reportHandler := handler.NewReportHandler(reportService)

	decisionService := service.NewDecisionService(db)
	decisionHandler := handler.NewDecisionHandler(decisionService)

	funnelService := service.NewFunnelService(db)
	funnelHandler := handler.NewFunnelHandler(funnelService)

	contentGenService := service.NewContentGenService(db)
	contentGenHandler := handler.NewContentGenHandler(contentGenService)

	miniappService := service.NewMiniAppService(db)
	miniappHandler := handler.NewMiniAppHandler(miniappService)

	platformService := service.NewPlatformService(db)
	platformHandler := handler.NewPlatformHandler(platformService)

	memberService := service.NewMemberService(db)
	memberHandler := handler.NewMemberHandler(memberService)

	hrService := service.NewHRService(db)
	hrHandler := handler.NewHRHandler(hrService)

	digitalTwinService := service.NewDigitalTwinService(db)
	digitalTwinHandler := handler.NewDigitalTwinHandler(digitalTwinService)

	smartPricingService := service.NewSmartPricingService(db)
	smartPricingHandler := handler.NewSmartPricingHandler(smartPricingService)

	shellService := service.NewShellService(db)
	shellHandler := handler.NewShellHandler(shellService)

	alipayService := service.NewAlipayService(db)
	alipayHandler := handler.NewAlipayHandler(alipayService)

	insightService := service.NewInsightService(db)
	insightHandler := handler.NewInsightHandler(insightService)

	aiAgentService := service.NewAIAgentService(db)
	aiAgentHandler := handler.NewAIAgentHandler(aiAgentService)

	// M3: 代理商体系
	agentService := service.NewAgentService(db)
	agentHandler := handler.NewAgentHandler(agentService)

	// M3: 财务中心
	financeService := service.NewFinanceService(db)
	financeHandler := handler.NewFinanceHandler(financeService)

	// M3: 业务人员管理
	saleService := service.NewSaleService(db)
	saleHandler := handler.NewSaleHandler(saleService)

	// 舆情管控
	sentimentService := service.NewSentimentService(db)
	sentimentHandler := handler.NewSentimentHandler(sentimentService)

	// 菜品/商品排行
	productRankService := service.NewProductRankService(db)
	productRankHandler := handler.NewProductRankHandler(productRankService)

	// 商户系统设置
	settingsService := service.NewSettingsService(db)
	settingsHandler := handler.NewSettingsHandler(settingsService)

	// 五级信任体系
	trustService := service.NewTrustService(db)
	trustHandler := handler.NewTrustHandler(trustService)

	// 跨店知识迁移
	crossStoreService := service.NewCrossStoreService(db)
	crossStoreHandler := handler.NewCrossStoreHandler(crossStoreService)

	// 行业大模型
	knowledgeService := service.NewKnowledgeService(db)
	knowledgeHandler := handler.NewKnowledgeHandler(knowledgeService)

	// 支付服务商管理
	paymentProviderService := service.NewPaymentProviderService(db)
	paymentProviderHandler := handler.NewPaymentProviderHandler(paymentProviderService)

	// 风险商户管理
	riskMerchantService := service.NewRiskMerchantService(db)
	riskMerchantHandler := handler.NewRiskMerchantHandler(riskMerchantService)

	authHandler := handler.NewAuthHandler(db)
	r.POST("/api/login", authHandler.Login)
	r.POST("/api/auth/login", authHandler.Login)
	r.POST("/api/auth/refresh", authHandler.Login)

	ws := r.Group("/ws")
	{
		screenHandler.RegisterWSRoutes(ws)
		reviewHandler.RegisterWSRoutes(ws)
		chatHandler.RegisterWSRoutes(ws)
		ws.GET("/miniprogram", notImplemented)
	}

	admin := r.Group("/api/admin")
	admin.Use(middleware.AdminAuth(), middleware.TenantIsolation(), middleware.Pagination(), middleware.PricingGate())
	{
		admin.GET("/ping", ping("admin"))
		if db != nil {
			merchantRepo := repository.NewMerchantRepository(db)
			merchantService := service.NewMerchantService(merchantRepo)
			merchantHandler := handler.NewMerchantHandler(merchantService)
			merchantHandler.RegisterRoutes(admin)

			adminRepo := repository.NewAdminRepository(db)
			adminService := service.NewAdminService(adminRepo)
			adminHandler := handler.NewAdminHandler(adminService)
			adminHandler.RegisterRoutes(admin)
		}

		adminV1Repo := repository.NewAdminV1Repository(db)
		adminV1Service := service.NewAdminV1Service(adminV1Repo)
		adminV1Handler := handler.NewAdminV1Handler(adminV1Service)
		adminV1Handler.RegisterRoutes(admin)

		// M3: 代理商 + 财务 + 业务员
		agentHandler.RegisterRoutes(admin)
		financeHandler.RegisterRoutes(admin)
		saleHandler.RegisterRoutes(admin)

		// v2.0 模块
		screenHandler.RegisterAdminRoutes(admin)
		aiAgentHandler.RegisterRoutes(admin)
		reviewHandler.RegisterAdminRoutes(admin)
		reportHandler.RegisterRoutes(admin)
		decisionHandler.RegisterRoutes(admin)
		funnelHandler.RegisterRoutes(admin)
		chatHandler.RegisterAdminRoutes(admin)
		contentGenHandler.RegisterRoutes(admin)
		miniappHandler.RegisterRoutes(admin)
		platformHandler.RegisterRoutes(admin)
		memberHandler.RegisterRoutes(admin)
		hrHandler.RegisterRoutes(admin)
		digitalTwinHandler.RegisterRoutes(admin)
		smartPricingHandler.RegisterRoutes(admin)
		shellHandler.RegisterRoutes(admin)
		alipayHandler.RegisterRoutes(admin)
		insightHandler.RegisterRoutes(admin)
		complaintHandler.RegisterRoutes(admin)

		// 舆情管控 + 菜品排行 + 五级信任 + 跨店知识迁移
		sentimentHandler.RegisterRoutes(admin)
		productRankHandler.RegisterRoutes(admin)
		trustHandler.RegisterRoutes(admin)
		crossStoreHandler.RegisterRoutes(admin)
		knowledgeHandler.RegisterRoutes(admin)

		if cfg != nil {
			tianqueClient, err := tianque.NewClient(cfg.Tianque)
			if err != nil {
				log.Printf("初始化天阙SDK失败: %v", err)
			} else {
				tianqueHandler := handler.NewTianqueHandler(tianqueClient)
				tianqueHandler.RegisterRoutes(admin)
					complaintHandler.SetTianqueClient(tianqueClient)
			}
		}

		// 支付服务商 + 风险商户（总平台管理）
		paymentProviderHandler.RegisterRoutes(admin)
		riskMerchantHandler.RegisterRoutes(admin)
	}

	merchant := r.Group("/api/merchant")
	merchant.Use(middleware.MerchantAuth(), middleware.TenantIsolation(), middleware.Pagination(), middleware.PricingGate())
	{
		merchant.GET("/ping", ping("merchant"))
		merchant.GET("/overview", func(c *gin.Context) {
		mid := c.GetUint("merchant_id")
		var totalReviews, pendingReviews int64
		var avgRating float64
		if db != nil {
			db.Model(&model.Review{}).Where("merchant_id = ?", mid).Count(&totalReviews)
			db.Model(&model.Review{}).Where("merchant_id = ?", mid).Where("status = ?", "pending").Count(&pendingReviews)
			row := db.Model(&model.Review{}).Where("merchant_id = ?", mid).Select("AVG(rating)").Row()
			if row != nil {
				var r *float64
				row.Scan(&r)
				if r != nil {
					avgRating = *r
				}
			}
		}
		var totalOrders, todayOrders int64
		var todayGMV, avgAmount float64
		if db != nil {
			db.Model(&model.Order{}).Where("merchant_id = ?", mid).Count(&totalOrders)
			db.Model(&model.Order{}).Where("merchant_id = ?", mid).Where("DATE(created_at) = CURDATE()").Count(&todayOrders)
			row := db.Model(&model.Order{}).Where("merchant_id = ?", mid).Where("DATE(created_at) = CURDATE()").Select("SUM(final_amount)").Row()
			if row != nil {
				row.Scan(&todayGMV)
			}
			if todayOrders > 0 {
				avgAmount = todayGMV / float64(todayOrders)
			}
		}
		response.Success(c, map[string]interface{}{
			"gmv_today": todayGMV, "orders_today": todayOrders, "avg_amount": avgAmount,
			"ai_calls": 0, "rating": avgRating, "pending_reviews": pendingReviews, "total_reviews": totalReviews,
		})
	})
		merchant.GET("/overview/trend", func(c *gin.Context) {
		mid := c.GetUint("merchant_id")
		trend := []map[string]interface{}{}
		if db != nil {
			var rows *gorm.DB
			rows = db.Model(&model.Order{}).Where("merchant_id = ?", mid).Where("created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)").Select("DATE(created_at) as date, SUM(final_amount) as gmv").Group("DATE(created_at)").Order("date ASC").Find(&trend)
			_ = rows
		}
		response.Success(c, map[string]interface{}{"trend": trend})
	})
		merchant.GET("/overview/alerts", func(c *gin.Context) {
		mid := c.GetUint("merchant_id")
		alerts := []map[string]interface{}{}
		if db != nil {
			var lowRatingCount int64
			db.Model(&model.Review{}).Where("merchant_id = ?", mid).Where("rating <= ?", 2).Where("DATE(created_at) = CURDATE()").Count(&lowRatingCount)
			if lowRatingCount > 0 {
				alerts = append(alerts, map[string]interface{}{"id": 1, "type": "差评预警", "level": "warning", "content": "今日新增" + strconv.FormatInt(lowRatingCount, 10) + "条低分评价"})
			}
			var pendingComplaint int64
			db.Model(&model.Complaint{}).Where("merchant_id = ?", mid).Where("status = ?", "pending").Count(&pendingComplaint)
			if pendingComplaint > 0 {
				alerts = append(alerts, map[string]interface{}{"id": 2, "type": "投诉预警", "level": "warning", "content": strconv.FormatInt(pendingComplaint, 10) + "条支付投诉待处理"})
			}
		}
		response.Success(c, map[string]interface{}{"items": alerts})
	})
		reviewHandler.RegisterMerchantRoutes(merchant)
		reportHandler.RegisterMerchantRoutes(merchant)
		chatHandler.RegisterMerchantRoutes(merchant)
		contentGenHandler.RegisterMerchantRoutes(merchant)
		miniappHandler.RegisterMerchantRoutes(merchant)
		screenHandler.RegisterMerchantRoutes(merchant)
		funnelHandler.RegisterMerchantRoutes(merchant)
		platformHandler.RegisterMerchantRoutes(merchant)
		memberHandler.RegisterMerchantRoutes(merchant)
		hrHandler.RegisterMerchantRoutes(merchant)
		smartPricingHandler.RegisterMerchantRoutes(merchant)
		digitalTwinHandler.RegisterMerchantRoutes(merchant)
		alipayHandler.RegisterMerchantRoutes(merchant)
		shellHandler.RegisterMerchantRoutes(merchant)
		insightHandler.RegisterMerchantRoutes(merchant)
		complaintHandler.RegisterMerchantRoutes(merchant)

		// 商户端：支付交易 + 舆情 + 菜品排行 + 系统设置 + 财务 + 知识库策略
		financeHandler.RegisterMerchantRoutes(merchant)
		sentimentHandler.RegisterMerchantRoutes(merchant)
		productRankHandler.RegisterMerchantRoutes(merchant)
		settingsHandler.RegisterMerchantRoutes(merchant)
		knowledgeHandler.RegisterMerchantRoutes(merchant)
	}

	// 内嵌前端SPA (璇玑NAS模式)
	if spaFS != nil {
		r.Use(gin.WrapH(http.FileServer(http.FS(spaFS))))
	}

	return r
}

func ping(scope string) gin.HandlerFunc {
	return func(c *gin.Context) {
		response.Success(c, gin.H{"scope": scope})
	}
}

func notImplemented(c *gin.Context) {
	response.Error(c, 501, response.CodeServerError, "功能开发中")
}

func merchantOverview(c *gin.Context) {
	response.Success(c, map[string]interface{}{
		"gmv_today": 28600, "orders_today": 128, "avg_amount": 223.4,
		"ai_calls": 42, "rating": 4.3, "pending_reviews": 8, "inventory_alerts": 2,
	})
}

func merchantTrend(c *gin.Context) {
	response.Success(c, map[string]interface{}{
		"trend": []map[string]interface{}{
			{"date": "05-18", "gmv": 25300}, {"date": "05-19", "gmv": 26800},
			{"date": "05-20", "gmv": 24500}, {"date": "05-21", "gmv": 29200},
			{"date": "05-22", "gmv": 27800}, {"date": "05-23", "gmv": 30500}, {"date": "05-24", "gmv": 28600},
		},
	})
}

func merchantAlerts(c *gin.Context) {
	response.Success(c, map[string]interface{}{
		"items": []map[string]interface{}{
			{"id": 1, "type": "差评预警", "level": "warning", "content": "新增1条1星差评"},
			{"id": 2, "type": "库存预警", "level": "warning", "content": "牛肉卷库存仅剩12份"},
			{"id": 3, "type": "巡检到期", "level": "info", "content": "门店巡检3天后到期"},
		},
	})
}
