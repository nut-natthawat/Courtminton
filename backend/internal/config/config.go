package config

import (
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

// Config holds all configuration for the application
type Config struct {
	MongoURI    string
	Port        int
	JWTSecret   string
	Environment string
}

// LoadConfig loads configuration from .env file and environment variables
func LoadConfig() (*Config, error) {
	// โหลดไฟล์ .env (ไม่ error ถ้าไม่พบไฟล์)
	godotenv.Load()

	// ตั้งค่าเริ่มต้น
	cfg := &Config{
		MongoURI:    "mongodb://localhost:27017",
		Port:        8000,
		JWTSecret:   "your-secret-key",
		Environment: "development",
	}

	// Override from environment variables
	if mongoURI := os.Getenv("MONGO_URI"); mongoURI != "" {
		cfg.MongoURI = mongoURI
	}

	if portStr := os.Getenv("PORT"); portStr != "" {
		port, err := strconv.Atoi(portStr)
		if err == nil {
			cfg.Port = port
		}
	}

	if jwtSecret := os.Getenv("JWT_SECRET"); jwtSecret != "" {
		cfg.JWTSecret = jwtSecret
	}

	if env := os.Getenv("ENVIRONMENT"); env != "" {
		cfg.Environment = env
	}

	return cfg, nil
}
