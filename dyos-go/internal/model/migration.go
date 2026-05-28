package model

// AllModels 返回所有需要自动迁移的GORM模型
func AllModels() []interface{} {
	return []interface{}{
		// 核心业务表
		&User{},
		&Store{},
		&Order{},
		&StatsDaily{},
		&Review{},
		&ReviewReplyRule{},
		&Complaint{},
		&ComplaintAnalysis{},

		// 商户体系
		&Merchant{},
		&PaymentMerchant{},
		&ApplyInfo{},

		// 代理商体系
		&Agent{},
		&SettlementRecord{},
		&ServiceProvider{},

		// 业务人员
		&Sale{},
		&CustomerAssign{},
		&VisitRecord{},

		// 财务
		&Transaction{},
		&Refund{},
		&Invoice{},

		// AI Agent
		&AIAgentTask{},
		&AIAgentConfig{},

		// 内容与知识
		&ChatSession{},
		&ChatMessage{},
		&SentimentRecord{},
		&GeneratedContent{},
		&IndustryKnowledge{},
		&Knowledge{},
		&AITemplate{},

		// 平台运营
		&PlatformAdapter{},
		&CalendarEvent{},
		&InventoryAlert{},
		&Member{},
		&MemberLevelRule{},
		&PointsRecord{},
		&Employee{},
		&StoreInspection{},
		&InspectionTemplate{},
		&StoreLayout{},

		// 智能定价与决策
		&PricingSuggestion{},
		&TrustLevel{},
		&Command{},
		&OnboardingStep{},
		&Changelog{},
		&DecisionLog{},
		&AIDailyReport{},

		// 报表
		&Report{},
		&ReportTemplate{},
		&ReportSchedule{},

		// 菜品
		&Dish{},
		&CustomerProfile{},

		// 系统设置
		&Role{},
		&OperationLog{},
		&Pricing{},
		&Notification{},

		// 小程序
		&MiniAppReport{},

		// 公告/活动
		&Announcement{},
		&Activity{},
		&ChurnWarning{},
		&PaymentChannel{},
		&ChannelAnalysis{},
		&Partner{},
		&Ticket{},
		&FAQ{},
		&FeatureFlag{},
		&Requirement{},
		&Version{},
		&LoginLog{},
		&DataMaskingRule{},

		// 支付服务商与风险商户
		&PaymentProvider{},
		&RiskMerchant{},
	}
}
