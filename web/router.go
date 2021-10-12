package web

import (
	"log"
	"net/http"

	"github.com/madappgang/identifo/model"
	"github.com/madappgang/identifo/web/admin"
	"github.com/madappgang/identifo/web/adminpanel"
	"github.com/madappgang/identifo/web/api"
	"github.com/madappgang/identifo/web/authorization"
	"github.com/madappgang/identifo/web/html"
)

const (
	adminpanelPath    = "/adminpanel"
	adminpanelAPIPath = "/admin"
	apiPath           = "/api"
	loginAppPath      = "/web"
)

// RouterSetting contains settings for root http router.
type RouterSetting struct {
	Server              model.Server
	Logger              *log.Logger
	ServeAdminPanel     bool
	APIRouterSettings   []func(*api.Router) error
	WebRouterSettings   []func(*html.Router) error
	AdminRouterSettings []func(*admin.Router) error
	LoggerSettings      model.LoggerSettings
}

// NewRouter creates and inits root http router.
func NewRouter(settings RouterSetting) (model.Router, error) {
	r := Router{}
	var err error
	authorizer := authorization.NewAuthorizer()

	r.APIRouter, err = api.NewRouter(
		settings.Server,
		settings.Logger,
		authorizer,
		settings.LoggerSettings,
		settings.APIRouterSettings...,
	)
	if err != nil {
		return nil, err
	}

	r.WebRouter, err = html.NewRouter(
		settings.Server,
		settings.Logger,
		authorizer,
		settings.WebRouterSettings...,
	)
	if err != nil {
		return nil, err
	}

	if settings.ServeAdminPanel {
		// init admin panel api router
		r.AdminRouter, err = admin.NewRouter(
			settings.Server,
			settings.Logger,
			settings.AdminRouterSettings...,
		)
		if err != nil {
			return nil, err
		}
		r.AdminRouterPath = adminpanelAPIPath
		// init admin panel web app
		r.AdminPanelRouter, err = adminpanel.NewRouter()
		if err != nil {
			return nil, err
		}
		r.AdminPanelRouterPath = adminpanelPath
	}

	r.APIRouterPath = apiPath
	r.WebRouterPath = loginAppPath

	r.setupRoutes()
	return &r, nil
}

// Router is a root router to handle REST API, web, and admin requests.
type Router struct {
	APIRouter        model.Router
	WebRouter        model.Router
	AdminRouter      model.Router
	AdminPanelRouter model.Router
	RootRouter       *http.ServeMux

	APIRouterPath        string
	WebRouterPath        string
	AdminRouterPath      string
	AdminPanelRouterPath string
}

// ServeHTTP implements identifo.Router interface.
func (ar *Router) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// Reroute to our internal implementation.
	ar.RootRouter.ServeHTTP(w, r)
}

func (ar *Router) setupRoutes() {
	ar.RootRouter = http.NewServeMux()
	ar.RootRouter.Handle("/", ar.APIRouter)
	ar.RootRouter.Handle(ar.WebRouterPath+"/", http.StripPrefix(ar.WebRouterPath, ar.WebRouter))
	if ar.AdminRouter != nil && ar.AdminPanelRouter != nil {
		ar.RootRouter.Handle(ar.AdminRouterPath+"/", http.StripPrefix(ar.AdminRouterPath, ar.AdminRouter))
		ar.RootRouter.Handle(ar.AdminPanelRouterPath+"/", http.StripPrefix(ar.AdminPanelRouterPath, ar.AdminPanelRouter))
	}
}
