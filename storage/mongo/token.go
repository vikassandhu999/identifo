package mongo

import (
	"context"
	"time"

	"github.com/madappgang/identifo/v2/model"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

const blacklistedTokensCollectionName = "BlacklistedTokens"

// NewTokenBlacklist creates new MongoDB-backed token blacklist.
func NewTokenBlacklist(settings model.MongodDatabaseSettings) (model.TokenBlacklist, error) {
	if len(settings.ConnectionString) == 0 || len(settings.DatabaseName) == 0 {
		return nil, ErrorEmptyConnectionStringDatabase
	}

	// create database
	db, err := NewDB(settings.ConnectionString, settings.DatabaseName)
	if err != nil {
		return nil, err
	}

	coll := db.Database.Collection(blacklistedTokensCollectionName)
	return &TokenBlacklist{coll: coll, timeout: 30 * time.Second}, nil
}

// TokenBlacklist is a MongoDB-backed token blacklist.
type TokenBlacklist struct {
	coll    *mongo.Collection
	timeout time.Duration
}

// Add adds token to the blacklist.
func (tb *TokenBlacklist) Add(token string) error {
	if len(token) == 0 {
		return model.ErrorWrongDataFormat
	}

	ctx, cancel := context.WithTimeout(context.Background(), tb.timeout)
	defer cancel()

	t := Token{Token: token, ID: primitive.NewObjectID().Hex()}
	_, err := tb.coll.InsertOne(ctx, t)
	return err
}

// IsBlacklisted returns true if the token is present in the blacklist.
func (tb *TokenBlacklist) IsBlacklisted(token string) bool {
	ctx, cancel := context.WithTimeout(context.Background(), tb.timeout)
	defer cancel()

	var t Token
	if err := tb.coll.FindOne(ctx, bson.M{"token": token}).Decode(&t); err != nil {
		return false
	}
	if t.Token == token {
		return true
	}
	return false
}

// Close is a no-op.
func (tb *TokenBlacklist) Close() {}
