package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"courtopia-reserve/backend/internal/models"
	"courtopia-reserve/backend/pkg/utils"
)

// Register จัดการการลงทะเบียนผู้ใช้ใหม่
func (h *Handler) Register(c *gin.Context) {
	// อ่านข้อมูลจาก request body
	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// ตรวจสอบว่ามีผู้ใช้นี้ในระบบแล้วหรือไม่
	_, err := h.userRepo.FindByStudentID(c.Request.Context(), req.StudentID)
	if err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "รหัสนักศึกษานี้ถูกใช้งานแล้ว"})
		return
	} else if err != mongo.ErrNoDocuments {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// เข้ารหัสผ่านก่อนเก็บลงฐานข้อมูล
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Server error"})
		return
	}

	// สร้าง user ใหม่
	user := &models.User{
		ID:        primitive.NewObjectID(),
		StudentID: req.StudentID,
		Password:  hashedPassword,
		Name:      req.Name,
		Email:     req.Email,
		Role:      "user", // กำหนดเป็น user ปกติ
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	// บันทึกลงฐานข้อมูล
	if err := h.userRepo.Create(c.Request.Context(), user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	// ส่ง response กลับไป
	c.JSON(http.StatusCreated, gin.H{"message": "User registered successfully"})
}

// Login จัดการการเข้าสู่ระบบและสร้าง JWT token
func (h *Handler) Login(c *gin.Context) {
	// อ่านข้อมูลจาก request body
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// ค้นหาผู้ใช้จากรหัสนักศึกษา
	user, err := h.userRepo.FindByStudentID(c.Request.Context(), req.StudentID)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "รหัสนักศึกษาหรือรหัสผ่านไม่ถูกต้อง"})
		return
	}

	// ตรวจสอบรหัสผ่าน
	if !utils.CheckPasswordHash(req.Password, user.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "รหัสนักศึกษาหรือรหัสผ่านไม่ถูกต้อง"})
		return
	}

	// สร้าง JWT token
	token, err := utils.GenerateToken(user, h.jwtSecret, 24)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	// ส่ง response พร้อม token กลับไป
	c.JSON(http.StatusOK, models.LoginResponse{
		Token:     token,
		StudentID: user.StudentID,
		Name:      user.Name,
		Role:      user.Role,
	})
}
