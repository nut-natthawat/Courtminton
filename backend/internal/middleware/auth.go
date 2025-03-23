package middleware

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"

	"courtopia-reserve/backend/pkg/utils"
)

// AuthMiddleware เป็น middleware สำหรับตรวจสอบ authentication
func AuthMiddleware(jwtSecret string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// ดึง token จาก header
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				w.WriteHeader(http.StatusUnauthorized)
				json.NewEncoder(w).Encode(map[string]string{"error": "Authorization header is required"})
				return
			}

			// ตรวจสอบรูปแบบ Bearer token
			bearerToken := strings.Split(authHeader, " ")
			if len(bearerToken) != 2 || strings.ToLower(bearerToken[0]) != "bearer" {
				w.WriteHeader(http.StatusUnauthorized)
				json.NewEncoder(w).Encode(map[string]string{"error": "Invalid authorization format"})
				return
			}

			// ตรวจสอบความถูกต้องของ token
			claims, err := utils.ValidateToken(bearerToken[1], jwtSecret)
			if err != nil {
				w.WriteHeader(http.StatusUnauthorized)
				json.NewEncoder(w).Encode(map[string]string{"error": "Invalid or expired token"})
				return
			}

			// เพิ่มข้อมูล user เข้าไปใน context
			ctx := context.WithValue(r.Context(), "user", claims)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// AdminMiddleware เป็น middleware สำหรับตรวจสอบว่าเป็น admin หรือไม่
func AdminMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// ดึงข้อมูล user จาก context
		claims, ok := r.Context().Value("user").(*utils.Claims)
		if !ok {
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{"error": "Unauthorized"})
			return
		}

		// ตรวจสอบว่าเป็น admin หรือไม่
		if claims.Role != "admin" {
			w.WriteHeader(http.StatusForbidden)
			json.NewEncoder(w).Encode(map[string]string{"error": "Admin access required"})
			return
		}

		// ดำเนินการต่อหากเป็น admin
		next.ServeHTTP(w, r)
	})
}
