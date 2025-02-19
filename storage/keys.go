package storage

import (
	"fmt"

	"github.com/madappgang/identifo/v2/model"
	"github.com/madappgang/identifo/v2/storage/fs"
	"github.com/madappgang/identifo/v2/storage/s3"
)

func NewKeyStorage(settings model.KeyStorageSettings) (model.KeyStorage, error) {
	switch settings.Type {
	case model.KeyStorageTypeLocal:
		return fs.NewKeyStorage(settings.File)
	case model.KeyStorageTypeS3:
		return s3.NewKeyStorage(settings.S3)
	default:
		return nil, fmt.Errorf("unknown key storage type: %s", settings.Type)
	}
}
