-- ============================================================
-- 店赢OS 数据库升级脚本 (MySQL 5.5+ 兼容)
-- 用途: 补充多租户字段(merchant_id/agent_id) + JWT认证支持
-- 执行前请先备份数据库!
-- 执行方式: mysql -u root -p dyos < database_migration.sql
-- ============================================================

-- 第1步: 查看当前MySQL版本和表结构
SELECT VERSION() AS mysql_version;
SELECT DATABASE() AS current_database;

-- ============================================================
-- 第2步: users 表增加多租户字段
-- ============================================================
-- 检查字段是否已存在 (忽略错误)
-- ALTER TABLE users ADD COLUMN merchant_id INT UNSIGNED NOT NULL DEFAULT 0 AFTER role;
-- ALTER TABLE users ADD COLUMN agent_id INT UNSIGNED NOT NULL DEFAULT 0 AFTER merchant_id;

-- 安全版: 使用存储过程检查字段是否存在 (MySQL 5.5 不支持 IF NOT EXISTS for columns)
DROP PROCEDURE IF EXISTS add_column_if_not_exists;

DELIMITER //
CREATE PROCEDURE add_column_if_not_exists(
    IN tbl_name VARCHAR(64),
    IN col_name VARCHAR(64),
    IN col_def VARCHAR(256)
)
BEGIN
    DECLARE col_count INT DEFAULT 0;
    SELECT COUNT(*) INTO col_count
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = tbl_name
      AND COLUMN_NAME = col_name;

    IF col_count = 0 THEN
        SET @sql = CONCAT('ALTER TABLE `', tbl_name, '` ADD COLUMN `', col_name, '` ', col_def);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        SELECT CONCAT('[OK] 已添加字段 ', tbl_name, '.', col_name) AS result;
    ELSE
        SELECT CONCAT('[SKIP] 字段已存在 ', tbl_name, '.', col_name) AS result;
    END IF;
END //
DELIMITER ;

-- 为各表添加 merchant_id 和 agent_id 字段
CALL add_column_if_not_exists('users', 'merchant_id', 'INT UNSIGNED NOT NULL DEFAULT 0 COMMENT "商户ID"');
CALL add_column_if_not_exists('users', 'agent_id', 'INT UNSIGNED NOT NULL DEFAULT 0 COMMENT "代理商ID"');

CALL add_column_if_not_exists('stores', 'merchant_id', 'INT UNSIGNED NOT NULL DEFAULT 0 COMMENT "商户ID"');
CALL add_column_if_not_exists('stores', 'agent_id', 'INT UNSIGNED NOT NULL DEFAULT 0 COMMENT "代理商ID"');

CALL add_column_if_not_exists('orders', 'merchant_id', 'INT UNSIGNED NOT NULL DEFAULT 0 COMMENT "商户ID"');
CALL add_column_if_not_exists('orders', 'agent_id', 'INT UNSIGNED NOT NULL DEFAULT 0 COMMENT "代理商ID"');

CALL add_column_if_not_exists('stats_daily', 'merchant_id', 'INT UNSIGNED NOT NULL DEFAULT 0 COMMENT "商户ID"');
CALL add_column_if_not_exists('stats_daily', 'agent_id', 'INT UNSIGNED NOT NULL DEFAULT 0 COMMENT "代理商ID"');

CALL add_column_if_not_exists('reviews', 'merchant_id', 'INT UNSIGNED NOT NULL DEFAULT 0 COMMENT "商户ID"');
CALL add_column_if_not_exists('reviews', 'agent_id', 'INT UNSIGNED NOT NULL DEFAULT 0 COMMENT "代理商ID"');

-- ============================================================
-- 第3步: 添加索引 (提升多租户查询性能)
-- ============================================================
DROP PROCEDURE IF EXISTS add_index_if_not_exists;

DELIMITER //
CREATE PROCEDURE add_index_if_not_exists(
    IN tbl_name VARCHAR(64),
    IN idx_name VARCHAR(64),
    IN idx_cols VARCHAR(256)
)
BEGIN
    DECLARE idx_count INT DEFAULT 0;
    SELECT COUNT(*) INTO idx_count
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = tbl_name
      AND INDEX_NAME = idx_name;

    IF idx_count = 0 THEN
        SET @sql = CONCAT('CREATE INDEX `', idx_name, '` ON `', tbl_name, '` (', idx_cols, ')');
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        SELECT CONCAT('[OK] 已添加索引 ', tbl_name, '.', idx_name) AS result;
    ELSE
        SELECT CONCAT('[SKIP] 索引已存在 ', tbl_name, '.', idx_name) AS result;
    END IF;
END //
DELIMITER ;

CALL add_index_if_not_exists('users', 'idx_users_merchant_id', 'merchant_id');
CALL add_index_if_not_exists('users', 'idx_users_agent_id', 'agent_id');
CALL add_index_if_not_exists('stores', 'idx_stores_merchant_id', 'merchant_id');
CALL add_index_if_not_exists('orders', 'idx_orders_merchant_id', 'merchant_id');
CALL add_index_if_not_exists('stats_daily', 'idx_stats_daily_merchant_id', 'merchant_id');
CALL add_index_if_not_exists('reviews', 'idx_reviews_merchant_id', 'merchant_id');

-- ============================================================
-- 第4步: 数据迁移 — 将现有 admin 角色用户的 merchant_id 设为 0 (平台级别)
-- ============================================================
-- 如果有 admin 用户，保持 merchant_id=0 (表示平台级账号，可查看所有数据)
-- 如果是商户用户，需要关联到实际的 merchant_id
-- 此部分需要根据实际业务数据手动调整
SELECT '=== 现有用户角色分布 ===' AS info;
SELECT role, COUNT(*) AS cnt FROM users GROUP BY role;

-- ============================================================
-- 第5步: 清理存储过程
-- ============================================================
DROP PROCEDURE IF EXISTS add_column_if_not_exists;
DROP PROCEDURE IF EXISTS add_index_if_not_exists;

-- ============================================================
-- 第6步: 验证
-- ============================================================
SELECT '=== 迁移完成，验证各表字段 ===' AS info;

SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE, COLUMN_DEFAULT, COLUMN_COMMENT
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND COLUMN_NAME IN ('merchant_id', 'agent_id')
ORDER BY TABLE_NAME, COLUMN_NAME;

SELECT '=== 迁移完成 ===' AS result;

-- ============================================================
-- MySQL 5.5 → 8.0 升级建议 (需DBA操作):
-- 1. 使用 mysqldump 导出: mysqldump -u root -p --all-databases > backup.sql
-- 2. 安装 MySQL 8.0.39 (AlmaLinux: dnf install mysql-server-8.0)
-- 3. 导入数据: mysql -u root -p < backup.sql
-- 4. 运行 mysql_upgrade 升级系统表
-- 5. 更新 .env 中数据库连接配置
-- ============================================================
