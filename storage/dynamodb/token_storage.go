package dynamodb

import (
	"log"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/service/dynamodb"
	"github.com/aws/aws-sdk-go/service/dynamodb/dynamodbattribute"
	"github.com/madappgang/identifo/model"
)

const tokensTableName = "RefreshTokens"

// NewTokenStorage creates new DynamoDB token storage.
func NewTokenStorage(settings model.DynamoDatabaseSettings) (model.TokenStorage, error) {
	if len(settings.Endpoint) == 0 || len(settings.Region) == 0 {
		return nil, ErrorEmptyEndpointRegion
	}

	// create database
	db, err := NewDB(settings.Endpoint, settings.Region)
	if err != nil {
		return nil, err
	}

	ts := &TokenStorage{db: db}
	err = ts.ensureTable()
	return ts, err
}

// TokenStorage is a DynamoDB token storage.
type TokenStorage struct {
	db *DB
}

// ensureTable ensures that token storage exists in the database.
func (ts *TokenStorage) ensureTable() error {
	exists, err := ts.db.IsTableExists(tokensTableName)
	if err != nil {
		log.Printf("Error while checking if %s exists: %v", tokensTableName, err)
		return err
	}
	if exists {
		return nil
	}

	input := &dynamodb.CreateTableInput{
		AttributeDefinitions: []*dynamodb.AttributeDefinition{
			{
				AttributeName: aws.String("token"),
				AttributeType: aws.String("S"),
			},
		},
		KeySchema: []*dynamodb.KeySchemaElement{
			{
				AttributeName: aws.String("token"),
				KeyType:       aws.String("HASH"),
			},
		},
		BillingMode: aws.String("PAY_PER_REQUEST"),
		TableName:   aws.String(tokensTableName),
	}

	if _, err = ts.db.C.CreateTable(input); err != nil {
		log.Printf("Error while creating %s table: %v", tokensTableName, err)
		return err
	}
	return nil
}

// SaveToken saves token in the database.
func (ts *TokenStorage) SaveToken(token string) error {
	if len(token) == 0 {
		return model.ErrorWrongDataFormat
	}
	if ts.HasToken(token) {
		return nil
	}

	t, err := dynamodbattribute.MarshalMap(Token{Token: token})
	if err != nil {
		log.Println(err)
		return ErrorInternalError
	}

	input := &dynamodb.PutItemInput{
		Item:      t,
		TableName: aws.String(tokensTableName),
	}

	if _, err = ts.db.C.PutItem(input); err != nil {
		log.Println("Error while putting token to db:", err)
		return ErrorInternalError
	}
	return nil
}

// HasToken returns true if token is present in the storage.
func (ts *TokenStorage) HasToken(token string) bool {
	if len(token) == 0 {
		return false
	}

	result, err := ts.db.C.GetItem(&dynamodb.GetItemInput{
		TableName: aws.String(tokensTableName),
		Key: map[string]*dynamodb.AttributeValue{
			"token": {
				S: aws.String(token),
			},
		},
	})
	if err != nil {
		log.Println("Error while fetching token from db:", err)
		return false
	}
	// empty result
	if result.Item == nil {
		return false
	}
	return true
}

// DeleteToken removes token from the storage.
func (ts *TokenStorage) DeleteToken(token string) error {
	if !ts.HasToken(token) {
		return model.ErrorNotFound
	}
	if _, err := ts.db.C.DeleteItem(&dynamodb.DeleteItemInput{
		TableName: aws.String(tokensTableName),
		Key: map[string]*dynamodb.AttributeValue{
			"token": {
				S: aws.String(token),
			},
		},
	}); err != nil {
		log.Println("Error while deleting token from db:", err)
		return ErrorInternalError
	}
	return nil
}

// Close does nothing here.
func (ts *TokenStorage) Close() {}

// Token is a struct to store tokens in the database.
type Token struct {
	Token string `json:"token,omitempty"`
}
