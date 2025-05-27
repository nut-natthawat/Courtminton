package handlers

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"

	"courtopia-reserve/backend/internal/repository"
	"courtopia-reserve/backend/pkg/utils"
)

// Handler holds the database client and other dependencies
type Handler struct {
	db          *mongo.Database
	userRepo    *repository.UserRepository
	courtRepo   *repository.CourtRepository
	bookingRepo *repository.BookingRepository
	jwtSecret   string
}

// NewHandler creates a new handler instance
func NewHandler(
	db *mongo.Database,
	userRepo *repository.UserRepository,
	courtRepo *repository.CourtRepository,
	bookingRepo *repository.BookingRepository,
	jwtSecret string,
) *Handler {
	return &Handler{
		db:          db,
		userRepo:    userRepo,
		courtRepo:   courtRepo,
		bookingRepo: bookingRepo,
		jwtSecret:   jwtSecret,
	}
}

// AuthMiddleware returns a middleware to verify JWT tokens
func (h *Handler) AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// ดึง token จาก header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header is required"})
			c.Abort()
			return
		}

		// ตรวจสอบรูปแบบ Bearer token
		bearerToken := strings.Split(authHeader, " ")
		if len(bearerToken) != 2 || strings.ToLower(bearerToken[0]) != "bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization format"})
			c.Abort()
			return
		}

		// ตรวจสอบความถูกต้องของ token
		claims, err := utils.ValidateToken(bearerToken[1], h.jwtSecret)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}

		// เพิ่มข้อมูล user เข้าไปใน context
		c.Set("user", claims)
		c.Next()
	}
}

// AdminMiddleware returns middleware to check admin privileges
func (h *Handler) AdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// ดึงข้อมูล user จาก context
		claims, exists := c.Get("user")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			c.Abort()
			return
		}

		// ตรวจสอบว่าเป็น admin หรือไม่
		if claims.(*utils.Claims).Role != "admin" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Admin access required"})
			c.Abort()
			return
		}

		c.Next()
	}
}

// RegisterRoutes registers all API routes
func (h *Handler) RegisterRoutes(r *gin.Engine) {
	api := r.Group("/api")

	// Public routes
	auth := api.Group("/auth")
	{
		auth.POST("/register", h.Register)
		auth.POST("/login", h.Login)
	}

	// Public court routes
	courts := api.Group("/courts")
	{
		courts.GET("", h.GetCourts)
		courts.GET("/available", h.GetAvailableCourts)
		courts.GET("/:id", h.GetCourt)
	}

	// Protected routes requiring authentication
	bookings := api.Group("/bookings")
	bookings.Use(h.AuthMiddleware())
	{
		bookings.POST("", h.CreateBooking)
		bookings.GET("", h.GetUserBookings)
		bookings.POST("/check", h.CheckAvailability)
		bookings.DELETE("/:id", h.CancelBooking)
	}

	profile := api.Group("/profile")
	profile.Use(h.AuthMiddleware())
	{
		profile.GET("", h.GetProfile)                   // ดึงข้อมูลโปรไฟล์
		profile.PUT("", h.UpdateProfile)                // อัปเดตข้อมูลโปรไฟล์
		profile.POST("/upload", h.UploadProfilePicture) // อัปโหลดรูปโปรไฟล์
	}

	// Admin routes
	admin := api.Group("/admin")
	admin.Use(h.AuthMiddleware(), h.AdminMiddleware())
	{
		admin.PATCH("/courts/:id/status", h.UpdateCourtStatus)
		admin.GET("/bookings", h.GetAllBookings)
	}
}
