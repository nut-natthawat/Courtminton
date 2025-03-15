package main

import (
	"context"
	"fmt"
	"log"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var client *mongo.Client

func ConnectMongodb() {
	clientoptions := options.Client().ApplyURI("mongodb+srv://Admin:Admin@cluster0.qt2of.mongodb.net/")
	var error error
	client, error = mongo.Connect(context.TODO(), clientoptions)
	if error != nil {
		log.Fatal(error)
	}
	fmt.Println("Connected to MongoDB!")
}
