package main

import (
	"context"
	"net/http"
	"time"
	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"golang.org/x/crypto/bcrypt"
)

var jwtSecret = []byte("NutPuiSuperAIss5")

func createToken(username string) (string, error) {
	claims := jwt.MapClaims{
		"username": username,
		"exp":      time.Now().Add(time.Hour * 14).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

func Register(c *gin.Context) {

	var user struct {
		Username string `json:"username"`
		Password string `json:"password"`
		Email    string `json:"email"`
	}

	if error := c.BindJSON(&user); error != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": error.Error()})
		return
	}

	hash, _ := bcrypt.GenerateFromPassword([]byte(user.Password), 10)
	user.Password = string(hash)

	collection := client.Database("courtminton").Collection("user")
	_, error := collection.InsertOne(context.TODO(), user)

	if error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error while inserting user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User registered successfully"})
}

func Login(c *gin.Context) {

	var user struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	if error := c.BindJSON(&user); error != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": error.Error()})
		return
	}

	collection := client.Database("courtminton").Collection("user")
	var foundUser struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	error := collection.FindOne(context.TODO(), bson.M{"username": user.Username}).Decode(&foundUser)
	if error != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username"})
		return
	}

	error = bcrypt.CompareHashAndPassword([]byte(foundUser.Password), []byte(user.Password))
	if error != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid password"})
		return
	}

	token, _ := createToken(user.Username)
	c.JSON(http.StatusOK, gin.H{"token": token})
}

func Profile(c *gin.Context) {
	user, _ := c.Get("user")
	c.JSON(http.StatusOK, gin.H{"user": user})
}
