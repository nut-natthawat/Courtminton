package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"courtopia-reserve/backend/internal/models"
)

// GetCourts returns all courts
func (h *Handler) GetCourts(w http.ResponseWriter, r *http.Request) {
	// Get courts from database
	courts, err := h.courtRepo.FindAll(r.Context())
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to fetch courts"})
		return
	}

	// Return courts
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(courts)
}

// GetCourt returns details of a specific court
func (h *Handler) GetCourt(w http.ResponseWriter, r *http.Request) {
	// Get court ID from URL params
	vars := mux.Vars(r)
	courtID, err := primitive.ObjectIDFromHex(vars["id"])
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid court ID"})
		return
	}

	// Find court by ID
	court, err := h.courtRepo.FindByID(r.Context(), courtID)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Court not found"})
		return
	}

	// Return court details
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(court)
}

// GetAvailableCourts returns courts available for booking
func (h *Handler) GetAvailableCourts(w http.ResponseWriter, r *http.Request) {
	// Parse query parameters
	queryParams := r.URL.Query()
	bookingDate := queryParams.Get("date")
	startTimeStr := queryParams.Get("startTime")
	endTimeStr := queryParams.Get("endTime")

	// Validate required parameters
	if bookingDate == "" || startTimeStr == "" || endTimeStr == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Date, start time, and end time are required"})
		return
	}

	// Parse date and time
	date, err := time.Parse("2006-01-02", bookingDate)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid date format. Use YYYY-MM-DD"})
		return
	}

	// Create full datetime strings by combining date and time
	startDateTimeStr := bookingDate + "T" + startTimeStr + ":00Z"
	endDateTimeStr := bookingDate + "T" + endTimeStr + ":00Z"

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

	// Check if booking duration is valid (max 2 hours)
	if endTime.Sub(startTime) > 2*time.Hour {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Booking duration cannot exceed 2 hours"})
		return
	}

	// Get available courts
	availableCourts, err := h.bookingRepo.GetAvailableCourts(r.Context(), date, startTime, endTime, h.courtRepo)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to check court availability"})
		return
	}

	// Create response
	response := models.AvailabilityResponse{
		BookingDate: bookingDate,
		StartTime:   startTimeStr,
		EndTime:     endTimeStr,
		Courts:      availableCourts,
	}

	// Return response
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// CheckAvailability checks if a specific court is available
func (h *Handler) CheckAvailability(w http.ResponseWriter, r *http.Request) {
	// Decode request body
	var req models.AvailabilityRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request format"})
		return
	}

	// Parse date and time
	date, err := time.Parse("2006-01-02", req.BookingDate)
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

	// Check if booking duration is valid (max 2 hours)
	if endTime.Sub(startTime) > 2*time.Hour {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Booking duration cannot exceed 2 hours"})
		return
	}

	// Check court availability
	isAvailable, err := h.bookingRepo.IsCourtAvailable(r.Context(), req.CourtNumber, date, startTime, endTime)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to check court availability"})
		return
	}

	// Return availability status
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]bool{"isAvailable": isAvailable})
}

// UpdateCourtStatus updates the active status of a court (admin only)
func (h *Handler) UpdateCourtStatus(w http.ResponseWriter, r *http.Request) {
	// Get court ID from URL params
	vars := mux.Vars(r)
	courtID, err := primitive.ObjectIDFromHex(vars["id"])
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid court ID"})
		return
	}

	// Parse request body
	var req struct {
		IsActive bool `json:"isActive"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request format"})
		return
	}

	// Update court status
	if err := h.courtRepo.UpdateStatus(r.Context(), courtID, req.IsActive); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to update court status"})
		return
	}

	// Return success response
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Court status updated successfully"})
}
