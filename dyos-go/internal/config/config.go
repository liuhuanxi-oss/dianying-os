package config

import (
	"fmt"
	"strings"

	"github.com/joho/godotenv"
	"github.com/spf13/viper"
)

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	Tianque  TianqueConfig
	Log      LogConfig
}

type ServerConfig struct {
	Host string
	Port int
}

type DatabaseConfig struct {
	Host      string
	Port      string
	User      string
	Password  string
	Name      string
	Charset   string
	ParseTime bool
	Loc       string
}

type TianqueConfig struct {
	OrgID               string
	PrivateKey          string
	PublicKey           string
	SuixingpayPublicKey string
	SignAlgorithm       string
	BaseURL             string
	TestMerchantNo      string
	TimeoutSeconds      int
	RetryTimes          int
	UseMock             bool
}

type LogConfig struct {
	Level string
}

func Load() (*Config, error) {
	_ = godotenv.Load("../.env", "../../.env", "../../../.env", ".env")

	v := viper.New()
	v.SetConfigName("config")
	v.SetConfigType("yaml")
	v.AddConfigPath(".")
	v.AddConfigPath("./dyos-go")

	v.SetDefault("server.host", "0.0.0.0")
	v.SetDefault("server.port", 8081)
	v.SetDefault("database.charset", "utf8mb4")
	v.SetDefault("database.parse_time", true)
	v.SetDefault("database.loc", "Local")
	v.SetDefault("tianque.sign_algorithm", "SHA1withRSA")
	v.SetDefault("tianque.base_url", "https://openapi-test.suixingpay.com")
	v.SetDefault("tianque.timeout_seconds", 30)
	v.SetDefault("tianque.retry_times", 3)
	v.SetDefault("tianque.use_mock", false)
	v.SetDefault("log.level", "info")

	v.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	v.AutomaticEnv()

	if err := v.ReadInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); !ok {
			return nil, err
		}
	}

	cfg := &Config{
		Server: ServerConfig{
			Host: v.GetString("server.host"),
			Port: v.GetInt("server.port"),
		},
		Database: DatabaseConfig{
			Host:      v.GetString("MYSQL_HOST"),
			Port:      v.GetString("MYSQL_PORT"),
			User:      v.GetString("MYSQL_USER"),
			Password:  v.GetString("MYSQL_PASSWORD"),
			Name:      v.GetString("MYSQL_DATABASE"),
			Charset:   v.GetString("database.charset"),
			ParseTime: v.GetBool("database.parse_time"),
			Loc:       v.GetString("database.loc"),
		},
		Tianque: TianqueConfig{
			OrgID:               v.GetString("TIANQUE_ORG_ID"),
			PrivateKey:          v.GetString("TIANQUE_PRIVATE_KEY"),
			PublicKey:           v.GetString("TIANQUE_PUBLIC_KEY"),
			SuixingpayPublicKey: v.GetString("TIANQUE_SP_PUBLIC_KEY"),
			SignAlgorithm:       v.GetString("TIANQUE_SIGN_ALGORITHM"),
			BaseURL:             v.GetString("TIANQUE_BASE_URL"),
			TestMerchantNo:      firstNonEmpty(v.GetString("TIANQUE_MERCHANT_NO"), v.GetString("TIANQUE_TEST_MNO")),
			TimeoutSeconds:      v.GetInt("tianque.timeout_seconds"),
			RetryTimes:          v.GetInt("tianque.retry_times"),
			UseMock:             v.GetBool("tianque.use_mock"),
		},
		Log: LogConfig{Level: v.GetString("log.level")},
	}

	return cfg, nil
}

func firstNonEmpty(values ...string) string {
	for _, value := range values {
		if value != "" {
			return value
		}
	}
	return ""
}

func (c DatabaseConfig) DSN() string {
	parseTime := "False"
	if c.ParseTime {
		parseTime = "True"
	}
	return fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=%s&parseTime=%s&loc=%s&timeout=3s", c.User, c.Password, c.Host, c.Port, c.Name, c.Charset, parseTime, c.Loc)
}

func (c ServerConfig) Addr() string {
	return fmt.Sprintf("%s:%d", c.Host, c.Port)
}
