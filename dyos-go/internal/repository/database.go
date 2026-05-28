package repository

import (
	"log"
	"time"

	"dyos-go/internal/config"
	"dyos-go/internal/model"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func ConnectDatabase(cfg config.DatabaseConfig) (*gorm.DB, error) {
	db, err := gorm.Open(mysql.Open(cfg.DSN()), &gorm.Config{})
	if err != nil {
		return nil, err
	}
	sqlDB, err := db.DB()
	if err != nil {
		return nil, err
	}
	sqlDB.SetMaxOpenConns(50)
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetConnMaxLifetime(5 * time.Minute)
	sqlDB.SetConnMaxIdleTime(2 * time.Minute)
	AutoMigrate(db)
	return db, nil
}

// AutoMigrate 自动建表和字段迁移，兼容现有数据库结构
func AutoMigrate(db *gorm.DB) {
	if db == nil {
		return
	}
	models := model.AllModels()
	log.Printf("[AutoMigrate] 开始自动迁移 %d 个数据表...", len(models))
	for _, m := range models {
		if err := db.AutoMigrate(m); err != nil {
			log.Printf("[AutoMigrate] 迁移表失败: %v", err)
		}
	}
	log.Println("[AutoMigrate] 自动迁移完成")
}
