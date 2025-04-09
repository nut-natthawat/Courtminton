package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"courtopia-reserve/backend/pkg/utils"
)

// AuthMiddleware เป็น middleware สำหรับตรวจสอบ authentication
func AuthMiddleware(jwtSecret string) gin.HandlerFunc {
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
		claims, err := utils.ValidateToken(bearerToken[1], jwtSecret)
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

// AdminMiddleware เป็น middleware สำหรับตรวจสอบว่าเป็น admin หรือไม่
func AdminMiddleware() gin.HandlerFunc {
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
