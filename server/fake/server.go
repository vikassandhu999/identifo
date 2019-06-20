package fake

import (
	"github.com/madappgang/identifo/model"
	"github.com/madappgang/identifo/server"
)

// NewServer creates new in-memory backend service.
func NewServer(settings model.ServerSettings, options ...func(*DatabaseComposer) error) (model.Server, error) {
	dbComposer, err := NewComposer(settings, options...)
	if err != nil {
		return nil, err
	}
	return server.NewServer(settings, dbComposer)
}
