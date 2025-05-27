package main

import (
	"github.com/gin-gonic/gin"
)

func main() {

	ConnectMongodb()
	r := gin.Default()

	r.POST("/register", Register)
	r.POST("/login", Login)

	auth := r.Group("/")
	auth.Use(authMiddleware())

	r.Run(":8080")

}
