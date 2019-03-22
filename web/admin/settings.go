package admin

import (
	"net/http"
)

type databaseSettings struct {
	Type     string `json:"type"`
	Region   string `json:"region"`
	Name     string `json:"name"`
	Endpoint string `json:"endpoint"`
}

// FetchDatabaseSettings provides info about used database engine.
func (ar *Router) FetchDatabaseSettings() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		dbset := databaseSettings{
			Type:     ar.DBType,
			Region:   ar.DBRegion,
			Name:     ar.DBName,
			Endpoint: ar.DBEndpoint,
		}

		ar.ServeJSON(w, http.StatusOK, dbset)
		return
	}
}
