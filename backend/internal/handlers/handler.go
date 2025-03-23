package handlers

import (
	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/mongo"

	"courtopia-reserve/backend/internal/middleware"
	"courtopia-reserve/backend/internal/repository"
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

// RegisterRoutes registers all API routes
func (h *Handler) RegisterRoutes(r *mux.Router) {
	// Public routes
	authRoutes := r.PathPrefix("/auth").Subrouter()
	authRoutes.HandleFunc("/register", h.Register).Methods("POST", "OPTIONS")
	authRoutes.HandleFunc("/login", h.Login).Methods("POST", "OPTIONS")

	// Public court routes
	courtRoutes := r.PathPrefix("/courts").Subrouter()
	courtRoutes.HandleFunc("", h.GetCourts).Methods("GET", "OPTIONS")
	courtRoutes.HandleFunc("/available", h.GetAvailableCourts).Methods("GET", "OPTIONS")
	courtRoutes.HandleFunc("/{id}", h.GetCourt).Methods("GET", "OPTIONS")

	// Protected routes
	bookingRoutes := r.PathPrefix("/bookings").Subrouter()
	bookingRoutes.Use(middleware.AuthMiddleware(h.jwtSecret))
	bookingRoutes.HandleFunc("", h.CreateBooking).Methods("POST", "OPTIONS")
	bookingRoutes.HandleFunc("", h.GetUserBookings).Methods("GET", "OPTIONS")
	bookingRoutes.HandleFunc("/check", h.CheckAvailability).Methods("POST", "OPTIONS")
	bookingRoutes.HandleFunc("/{id}", h.CancelBooking).Methods("DELETE", "OPTIONS")

	// Admin routes
	adminRoutes := r.PathPrefix("/admin").Subrouter()
	adminRoutes.Use(middleware.AuthMiddleware(h.jwtSecret))
	adminRoutes.Use(middleware.AdminMiddleware)
	adminRoutes.HandleFunc("/courts/{id}/status", h.UpdateCourtStatus).Methods("PATCH", "OPTIONS")
	adminRoutes.HandleFunc("/bookings", h.GetAllBookings).Methods("GET", "OPTIONS")
}
