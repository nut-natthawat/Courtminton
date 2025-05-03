package config

import (
	"fmt"
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
	// โหลดไฟล์ .env (แสดงข้อความถ้าโหลดสำเร็จ)
	err := godotenv.Load()
	if err != nil {
		fmt.Println("Warning: .env file not found, using environment variables")
	} else {
		fmt.Println(".env file loaded successfully")
	}

	// ตั้งค่าเริ่มต้น
	cfg := &Config{
		MongoURI:    "mongodb://localhost:27017",
		Port:        8000,
		JWTSecret:   "your-secret-key",
		Environment: "development",
	}

	// เพิ่มการแสดงผลว่ามีการอ่านค่า environment variable หรือไม่
	if mongoURI := os.Getenv("MONGO_URI"); mongoURI != "" {
		cfg.MongoURI = mongoURI
		fmt.Println("MongoDB URI loaded from environment variable")
	} else {
		fmt.Println("Using default MongoDB URI")
	}

	// ส่วนที่เหลือยังคงเหมือนเดิม
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
	fmt.Printf("db: %s\n", cfg.MongoURI)
	return cfg, nil
}
