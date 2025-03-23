package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"courtopia-reserve/backend/internal/config"
	"courtopia-reserve/backend/internal/database"
	"courtopia-reserve/backend/internal/handlers"
	"courtopia-reserve/backend/internal/repository"

	"github.com/gorilla/mux"
)

func main() {
	// โหลดค่า config
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Error loading config: %v", err)
	}

	// เชื่อมต่อกับฐานข้อมูล
	client, err := database.ConnectDB(cfg.MongoURI)
	if err != nil {
		log.Fatalf("Error connecting to database: %v", err)
	}
	defer func() {
		if err := client.Disconnect(context.Background()); err != nil {
			log.Fatalf("Error disconnecting from database: %v", err)
		}
	}()

	// สร้างฐานข้อมูลและ repositories
	db := client.Database("courtopia")
	userRepo := repository.NewUserRepository(db)
	courtRepo := repository.NewCourtRepository(db)
	bookingRepo := repository.NewBookingRepository(db)

	// สร้าง handler และให้ repositories เป็น dependencies
	h := handlers.NewHandler(db, userRepo, courtRepo, bookingRepo, cfg.JWTSecret)

	// สร้าง router
	r := mux.NewRouter()

	// Health check endpoint
	r.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	}).Methods("GET")

	// ลงทะเบียน API routes
	api := r.PathPrefix("/api").Subrouter()
	h.RegisterRoutes(api)

	// ตั้งค่า CORS middleware
	corsMiddleware := func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "http://localhost:8080")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			w.Header().Set("Access-Control-Allow-Credentials", "true")

			// ตอบกลับทันทีสำหรับ OPTIONS request (preflight)
			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusOK)
				return
			}

			next.ServeHTTP(w, r)
		})
	}

	// เพิ่ม middleware
	r.Use(corsMiddleware)

	// เริ่มต้น server
	srv := &http.Server{
		Addr:         fmt.Sprintf(":%d", cfg.Port),
		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
		IdleTimeout:  60 * time.Second,
		Handler:      r,
	}

	// รันใน goroutine ที่แยกกันเพื่อไม่ให้บล็อก
	go func() {
		log.Printf("Server starting on port %d", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Error starting server: %v", err)
		}
	}()

	// รอสัญญาณปิดแอพ
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)

	// บล็อกจนกว่าจะได้รับสัญญาณ
	<-c

	// สร้าง timeout context สำหรับการปิด
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	// ปิด server
	log.Println("Shutting down server...")
	srv.Shutdown(ctx)
	log.Println("Server stopped")
}
