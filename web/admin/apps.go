package admin

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/madappgang/identifo/v2/model"
)

const (
	defaultAppSkip  = 0
	defaultAppLimit = 20
)

// GetApp fetches app by ID from the database.
func (ar *Router) GetApp() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		appID := getRouteVar("id", r)

		app, err := ar.server.Storages().App.AppByID(appID)
		if err != nil {
			if err == model.ErrorNotFound {
				ar.Error(w, err, http.StatusNotFound, "")
				return
			}
			ar.Error(w, err, http.StatusInternalServerError, "")
			return
		}
		ar.ServeJSON(w, http.StatusOK, app)
	}
}

// FetchApps fetches apps from the database.
func (ar *Router) FetchApps() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		filterStr := strings.TrimSpace(r.URL.Query().Get("search"))

		skip, limit, err := ar.parseSkipAndLimit(r, defaultAppSkip, defaultAppLimit, 0)
		if err != nil {
			ar.Error(w, ErrorWrongInput, http.StatusBadRequest, "")
			return
		}

		apps, total, err := ar.server.Storages().App.FetchApps(filterStr, skip, limit)
		if err != nil {
			ar.Error(w, ErrorInternalError, http.StatusInternalServerError, "")
			return
		}
		for i, app := range apps {
			apps[i] = app.Sanitized()
		}

		searchResponse := struct {
			Apps  []model.AppData `json:"apps"`
			Total int             `json:"total"`
		}{
			Apps:  apps,
			Total: total,
		}
		ar.ServeJSON(w, http.StatusOK, &searchResponse)
	}
}

// CreateApp adds new app to the database.
func (ar *Router) CreateApp() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ad := model.AppData{}
		if ar.mustParseJSON(w, r, &ad) != nil {
			return
		}

		appSecret, err := ar.generateAppSecret(w)
		if err != nil {
			return
		}
		ad.Secret = appSecret

		app, err := ar.server.Storages().App.CreateApp(ad)
		if err != nil {
			ar.Error(w, err, http.StatusBadRequest, "")
			return
		}
		ar.ServeJSON(w, http.StatusOK, app)
	}
}

// UpdateApp updates app in the database.
func (ar *Router) UpdateApp() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		appID := getRouteVar("id", r)

		ad := model.AppData{}
		if ar.mustParseJSON(w, r, &ad) != nil {
			return
		}

		if lenSecret := len(ad.Secret); lenSecret < 24 || lenSecret > 48 {
			err := fmt.Errorf("Incorrect appsecret string length %d, expecting 24 to 48 symbols inclusively", lenSecret)
			ar.Error(w, err, http.StatusBadRequest, err.Error())
			return
		}
		if !isBase64(ad.Secret) {
			err := fmt.Errorf("Expecting appsecret to be base64 encoded")
			ar.Error(w, err, http.StatusBadRequest, err.Error())
			return
		}

		app, err := ar.server.Storages().App.UpdateApp(appID, ad)
		if err != nil {
			ar.Error(w, ErrorInternalError, http.StatusInternalServerError, err.Error())
			return
		}

		if err = ar.updateAllowedOrigins(); err != nil {
			ar.logger.Printf("Error occurred during updating allowed origins for App %s, error: %v", appID, err)
		}

		ar.logger.Printf("App %s updated", appID)

		ar.ServeJSON(w, http.StatusOK, app)
	}
}

// DeleteApp deletes app from the database by id.
func (ar *Router) DeleteApp() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		appID := getRouteVar("id", r)
		if err := ar.server.Storages().App.DeleteApp(appID); err != nil {
			ar.Error(w, ErrorInternalError, http.StatusInternalServerError, "")
			return
		}

		ar.logger.Printf("App %s deleted", appID)

		ar.ServeJSON(w, http.StatusOK, nil)
	}
}

// DeleteAllApps delete all current apps for some reason?
// now we are using it for tests
func (ar *Router) DeleteAllApps() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		apps, _, err := ar.server.Storages().App.FetchApps("", 0, 1_000_000) // just fetch one million, looks ugly, but ...
		if err != nil {
			ar.Error(w, ErrorInternalError, http.StatusInternalServerError, err.Error())
		}
		var errs []error
		for _, a := range apps {
			err := ar.server.Storages().App.DeleteApp(a.ID)
			if err != nil {
				errs = append(errs, err)
				ar.logger.Printf("Error deleting app: %s, error: %s. Ignoring and moving next.", a.ID, err)
			}
		}
		if len(errs) > 0 {
			ar.Error(w, ErrorInternalError, http.StatusInternalServerError, fmt.Sprintf("%v", errs))
		}
		ar.ServeJSON(w, http.StatusOK, nil)
	}
}

func (ar *Router) generateAppSecret(w http.ResponseWriter) (string, error) {
	secret := make([]byte, 16)
	if _, err := io.ReadFull(rand.Reader, secret); err != nil {
		ar.Error(w, err, http.StatusInternalServerError, "Cannot create app secret")
		return "", err
	}
	return base64.StdEncoding.EncodeToString(secret), nil
}

func (ar *Router) updateAllowedOrigins() error {
	if ar.originUpdate == nil {
		return nil
	}
	return ar.originUpdate()
}

func isBase64(s string) bool {
	_, err := base64.StdEncoding.DecodeString(s)
	return err == nil
}
