package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"courtopia-reserve/backend/internal/models"
	"courtopia-reserve/backend/pkg/utils"
)

// CreateBooking handles creating a new booking
func (h *Handler) CreateBooking(w http.ResponseWriter, r *http.Request) {
	// Get user from context (set by AuthMiddleware)
	claims, ok := r.Context().Value("user").(*utils.Claims)
	if !ok {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "Unauthorized"})
		return
	}

	// Parse request body
	var req models.BookingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request format"})
		return
	}

	// Parse date and time
	bookingDate, err := time.Parse("2006-01-02", req.BookingDate)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid date format. Use YYYY-MM-DD"})
		return
	}

	// Create full datetime strings by combining date and time
	startDateTimeStr := req.BookingDate + "T" + req.StartTime + ":00Z"
	endDateTimeStr := req.BookingDate + "T" + req.EndTime + ":00Z"

	// Parse datetime strings
	startTime, err := time.Parse(time.RFC3339, startDateTimeStr)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid start time format. Use HH:MM"})
		return
	}

	endTime, err := time.Parse(time.RFC3339, endDateTimeStr)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid end time format. Use HH:MM"})
		return
	}

	// Check if booking is in the past
	if startTime.Before(time.Now()) {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Cannot book in the past"})
		return
	}

	// Check if booking duration is valid (max 2 hours)
	if endTime.Sub(startTime) > 2*time.Hour {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Booking duration cannot exceed 2 hours"})
		return
	}

	// Get court by number
	court, err := h.courtRepo.FindByCourtNumber(r.Context(), req.CourtNumber)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Court not found"})
		return
	}

	// Check if court is active
	if !court.IsActive {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Court is not available"})
		return
	}

	// Check if court is available at the specified time
	isAvailable, err := h.bookingRepo.IsCourtAvailable(
		r.Context(),
		req.CourtNumber,
		bookingDate,
		startTime,
		endTime,
	)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to check court availability"})
		return
	}

	if !isAvailable {
		w.WriteHeader(http.StatusConflict)
		json.NewEncoder(w).Encode(map[string]string{"error": "Court is not available at the specified time"})
		return
	}

	// Get user ID from token
	userID, err := primitive.ObjectIDFromHex(claims.Subject)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid user ID"})
		return
	}

	// Create new booking
	booking := &models.Booking{
		UserID:      userID,
		StudentID:   claims.StudentID,
		CourtID:     court.ID,
		CourtNumber: court.CourtNumber,
		BookingDate: bookingDate,
		StartTime:   startTime,
		EndTime:     endTime,
		Status:      "active",
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	// Save booking to database
	if err := h.bookingRepo.Create(r.Context(), booking); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to create booking"})
		return
	}

	// Create response
	response := models.BookingResponse{
		ID:          booking.ID.Hex(),
		CourtNumber: booking.CourtNumber,
		BookingDate: req.BookingDate,
		StartTime:   req.StartTime,
		EndTime:     req.EndTime,
		Status:      booking.Status,
		CreatedAt:   booking.CreatedAt,
	}

	// Return success response
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

// GetUserBookings returns bookings for the authenticated user
func (h *Handler) GetUserBookings(w http.ResponseWriter, r *http.Request) {
	// Get user from context (set by AuthMiddleware)
	claims, ok := r.Context().Value("user").(*utils.Claims)
	if !ok {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "Unauthorized"})
		return
	}

	// Get query parameter to fetch only active bookings
	onlyActive := r.URL.Query().Get("active") == "true"

	var bookings []*models.Booking
	var err error

	// Get bookings based on the filter
	if onlyActive {
		bookings, err = h.bookingRepo.FindActiveBookingsByStudentID(r.Context(), claims.StudentID)
	} else {
		bookings, err = h.bookingRepo.FindByStudentID(r.Context(), claims.StudentID)
	}

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to fetch bookings"})
		return
	}

	// Convert to response format
	var responses []models.BookingResponse
	for _, booking := range bookings {
		responses = append(responses, models.BookingResponse{
			ID:          booking.ID.Hex(),
			CourtNumber: booking.CourtNumber,
			BookingDate: booking.BookingDate.Format("2006-01-02"),
			StartTime:   booking.StartTime.Format("15:04"),
			EndTime:     booking.EndTime.Format("15:04"),
			Status:      booking.Status,
			CreatedAt:   booking.CreatedAt,
		})
	}

	// Return bookings
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(responses)
}

// CancelBooking handles cancellation of a booking
func (h *Handler) CancelBooking(w http.ResponseWriter, r *http.Request) {
	// Get user from context (set by AuthMiddleware)
	claims, ok := r.Context().Value("user").(*utils.Claims)
	if !ok {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "Unauthorized"})
		return
	}

	// Get booking ID from URL params
	vars := mux.Vars(r)
	bookingID, err := primitive.ObjectIDFromHex(vars["id"])
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid booking ID"})
		return
	}

	// Find booking
	booking, err := h.bookingRepo.FindByID(r.Context(), bookingID)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Booking not found"})
		return
	}

	// Check if booking belongs to the user or user is admin
	if booking.StudentID != claims.StudentID && claims.Role != "admin" {
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(map[string]string{"error": "You don't have permission to cancel this booking"})
		return
	}

	// Check if booking is already cancelled
	if booking.Status != "active" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Booking is already cancelled"})
		return
	}

	// Cancel booking
	if err := h.bookingRepo.CancelBooking(r.Context(), bookingID); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to cancel booking"})
		return
	}

	// Return success response
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Booking cancelled successfully"})
}

// GetAllBookings returns all bookings (admin only)
func (h *Handler) GetAllBookings(w http.ResponseWriter, r *http.Request) {
	// Logic for admin to get all bookings
	// This is a placeholder - you would implement similar logic to GetUserBookings but without filtering by studentID
	w.WriteHeader(http.StatusNotImplemented)
	json.NewEncoder(w).Encode(map[string]string{"message": "Not implemented yet"})
}
