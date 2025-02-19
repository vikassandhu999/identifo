package boltdb

import (
	"fmt"
	"log"

	"github.com/madappgang/identifo/v2/model"
	bolt "go.etcd.io/bbolt"
)

const (
	// VerificationCodesBucket is a bucket with verification codes.
	VerificationCodesBucket = "VerificationCodes"
)

// NewVerificationCodeStorage creates and inits BoltDB verification code storage.
func NewVerificationCodeStorage(settings model.BoltDBDatabaseSettings) (model.VerificationCodeStorage, error) {
	if len(settings.Path) == 0 {
		return nil, ErrorEmptyDatabasePath
	}

	// init database
	db, err := InitDB(settings.Path)
	if err != nil {
		return nil, err
	}

	vcs := &VerificationCodeStorage{db: db}

	if err := db.Update(func(tx *bolt.Tx) error {
		if _, err := tx.CreateBucketIfNotExists([]byte(VerificationCodesBucket)); err != nil {
			return fmt.Errorf("create bucket: %s", err)
		}
		return nil
	}); err != nil {
		return nil, err
	}

	return vcs, nil
}

// VerificationCodeStorage implements verification code storage interface.
type VerificationCodeStorage struct {
	db *bolt.DB
}

// IsVerificationCodeFound checks whether verification code can be found.
func (vcs *VerificationCodeStorage) IsVerificationCodeFound(phone, code string) (bool, error) {
	err := vcs.db.View(func(tx *bolt.Tx) error {
		vcb := tx.Bucket([]byte(VerificationCodesBucket))
		code := vcb.Get([]byte(phone))
		if code == nil {
			return model.ErrorNotFound
		}
		return nil
	})
	return err == nil, nil
}

// CreateVerificationCode inserts new verification code to the database.
func (vcs *VerificationCodeStorage) CreateVerificationCode(phone, code string) error {
	err := vcs.db.Update(func(tx *bolt.Tx) error {
		vcb := tx.Bucket([]byte(VerificationCodesBucket))
		if err := vcb.Delete([]byte(phone)); err != nil {
			return err
		}

		return vcb.Put([]byte(phone), []byte(code))
	})
	return err
}

// Close closes underlying database.
func (vcs *VerificationCodeStorage) Close() {
	if err := CloseDB(vcs.db); err != nil {
		log.Printf("Error closing verification code storage: %s\n", err)
	}
}
