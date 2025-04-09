package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"courtopia-reserve/backend/internal/models"
)

// GetCourts ดึงข้อมูลคอร์ททั้งหมด
func (h *Handler) GetCourts(c *gin.Context) {
	// ดึงข้อมูลคอร์ททั้งหมดจาก repository
	courts, err := h.courtRepo.FindAll(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch courts"})
		return
	}

	// ส่งข้อมูลคอร์ททั้งหมดกลับไป
	c.JSON(http.StatusOK, courts)
}

// GetCourt ดึงข้อมูลคอร์ทด้วย ID
func (h *Handler) GetCourt(c *gin.Context) {
	// ดึง ID จาก URL parameters
	idStr := c.Param("id")
	id, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid court ID"})
		return
	}

	// ดึงข้อมูลคอร์ทจาก repository
	court, err := h.courtRepo.FindByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Court not found"})
		return
	}

	// ส่งข้อมูลคอร์ทกลับไป
	c.JSON(http.StatusOK, court)
}

// GetAvailableCourts ดึงข้อมูลคอร์ทที่ว่างในช่วงเวลาที่กำหนด
func (h *Handler) GetAvailableCourts(c *gin.Context) {
	// รับ parameters จาก query string
	dateStr := c.Query("date")
	startTimeStr := c.Query("startTime")
	endTimeStr := c.Query("endTime")

	// ตรวจสอบว่ามีข้อมูลครบหรือไม่
	if dateStr == "" || startTimeStr == "" || endTimeStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Date, start time and end time are required"})
		return
	}

	// แปลงวันที่และเวลาให้อยู่ในรูปแบบที่ถูกต้อง
	bookingDate, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format, use YYYY-MM-DD"})
		return
	}

	// สร้างเวลาเริ่มต้นและสิ้นสุดโดยรวมกับวันที่
	layout := "15:04"
	startTimeParsed, err := time.Parse(layout, startTimeStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid start time format, use HH:MM"})
		return
	}

	endTimeParsed, err := time.Parse(layout, endTimeStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid end time format, use HH:MM"})
		return
	}

	// สร้าง datetime objects สำหรับช่วงเวลาที่ต้องการจอง
	startTime := time.Date(
		bookingDate.Year(),
		bookingDate.Month(),
		bookingDate.Day(),
		startTimeParsed.Hour(),
		startTimeParsed.Minute(),
		0,
		0,
		bookingDate.Location(),
	)

	endTime := time.Date(
		bookingDate.Year(),
		bookingDate.Month(),
		bookingDate.Day(),
		endTimeParsed.Hour(),
		endTimeParsed.Minute(),
		0,
		0,
		bookingDate.Location(),
	)

	// ตรวจสอบคอร์ทที่ว่าง
	availabilities, err := h.bookingRepo.GetAvailableCourts(
		c.Request.Context(),
		bookingDate,
		startTime,
		endTime,
		h.courtRepo,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check court availability"})
		return
	}

	// สร้างข้อมูล response
	response := models.AvailabilityResponse{
		BookingDate: dateStr,
		StartTime:   startTimeStr,
		EndTime:     endTimeStr,
		Courts:      availabilities,
	}

	// ส่งข้อมูลกลับ
	c.JSON(http.StatusOK, response)
}

// UpdateCourtStatus อัปเดตสถานะคอร์ท (สำหรับ admin)
func (h *Handler) UpdateCourtStatus(c *gin.Context) {
	// ดึงค่า ID จาก URL
	idStr := c.Param("id")
	id, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid court ID"})
		return
	}

	// รับข้อมูลจาก request body
	var req struct {
		IsActive bool `json:"isActive"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// อัปเดตสถานะคอร์ท
	if err := h.courtRepo.UpdateStatus(c.Request.Context(), id, req.IsActive); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update court status"})
		return
	}

	// ส่ง response กลับไป
	c.JSON(http.StatusOK, gin.H{"message": "Court status updated successfully"})
}
