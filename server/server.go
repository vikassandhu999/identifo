package server

import (
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"

	"github.com/madappgang/identifo/external_services/mail/mailgun"
	emailMock "github.com/madappgang/identifo/external_services/mail/mock"
	"github.com/madappgang/identifo/external_services/mail/ses"
	smsMock "github.com/madappgang/identifo/external_services/sms/mock"
	"github.com/madappgang/identifo/external_services/sms/nexmo"
	"github.com/madappgang/identifo/external_services/sms/routemobile"
	"github.com/madappgang/identifo/external_services/sms/twilio"
	ijwt "github.com/madappgang/identifo/jwt"
	jwtService "github.com/madappgang/identifo/jwt/service"
	"github.com/madappgang/identifo/model"
	"github.com/madappgang/identifo/server/utils/originchecker"
	dynamodb "github.com/madappgang/identifo/sessions/dynamodb"
	mem "github.com/madappgang/identifo/sessions/mem"
	redis "github.com/madappgang/identifo/sessions/redis"
	staticStoreDynamo "github.com/madappgang/identifo/static/storage/dynamodb"
	staticStoreLocal "github.com/madappgang/identifo/static/storage/local"
	staticStoreS3 "github.com/madappgang/identifo/static/storage/s3"
	"github.com/madappgang/identifo/web"
	"github.com/madappgang/identifo/web/admin"
	"github.com/madappgang/identifo/web/api"
	"github.com/madappgang/identifo/web/html"
	"github.com/rs/cors"
)

var defaultCors = model.CorsOptions{
	API: &cors.Options{AllowedHeaders: []string{"*", "x-identifo-clientid"}, AllowedMethods: []string{"HEAD", "GET", "POST", "PUT", "PATCH", "DELETE"}},
}

// NewServer creates backend service.
func NewServer(storages model.ServerStorageCollection, options ...func(*Server) error) (model.Server, error) {
	if storages.Config == nil {
		return nil, fmt.Errorf("unable create sever with empty config storage")
	}

	settings, err := storages.Config.LoadServerSettings(false)
	if err != nil {
		return nil, err
	}

	s := Server{
		appStorage:              storages.App,
		userStorage:             storages.User,
		tokenStorage:            storages.Token,
		tokenBlacklist:          storages.Blocklist,
		verificationCodeStorage: storages.Verification,
		configurationStorage:    storages.Config,
		staticFilesStorage:      storages.Static,
		settings:                settings,
	}

	sessionStorage, err := initSessionStorage(settings.SessionStorage)
	if err != nil {
		return nil, err
	}
	sessionService := model.NewSessionManager(settings.SessionStorage.SessionDuration, sessionStorage)

	ms, err := initEmailService(settings.ExternalServices.EmailService, storages.Static)
	if err != nil {
		return nil, err
	}

	sms, err := initSMSService(settings.ExternalServices.SMSService)
	if err != nil {
		return nil, err
	}

	// env variable can rewrite host option
	hostName := os.Getenv("HOST_NAME")
	if len(hostName) == 0 {
		hostName = settings.General.Host
	}

	originChecker := originchecker.NewOriginChecker()

	// validate, try to fetch apps
	apps, _, err := storages.App.FetchApps("", 0, 0)
	if err != nil {
		return nil, err
	}

	for _, a := range apps {
		originChecker.AddRawURLs(a.RedirectURLs)
	}

	routerSettings := web.RouterSetting{
		AppStorage:              appStorage,
		UserStorage:             userStorage,
		TokenStorage:            tokenStorage,
		VerificationCodeStorage: verificationCodeStorage,
		TokenService:            tokenService,
		TokenBlacklist:          tokenBlacklist,
		InviteStorage:           inviteStorage,
		SessionService:          sessionService,
		SessionStorage:          sessionStorage,
		ConfigurationStorage:    configurationStorage,
		StaticFilesStorage:      staticFilesStorage,
		ServeAdminPanel:         settings.StaticFilesStorage.ServeAdminPanel,
		SMSService:              sms,
		EmailService:            ms,
		WebRouterSettings: []func(*html.Router) error{
			html.HostOption(hostName),
			html.StaticFilesStorageSettings(&settings.StaticFilesStorage),
			html.CorsOption(defaultCors),
		},
		APIRouterSettings: []func(*api.Router) error{
			api.HostOption(hostName),
			api.SupportedLoginWaysOption(settings.Login.LoginWith),
			api.TFATypeOption(settings.Login.TFAType),
			api.CorsOption(defaultCors, originChecker),
		},
		AdminRouterSettings: []func(*admin.Router) error{
			admin.HostOption(hostName),
			admin.ServerConfigPathOption(settings.StaticFilesStorage.ServerConfigPath),
			admin.ServerSettingsOption(&settings),
			admin.CorsOption(defaultCors, originChecker),
		},
		LoggerSettings: settings.Logger,
	}

	r, err := web.NewRouter(routerSettings)
	if err != nil {
		return nil, err
	}
	s.MainRouter = r.(*web.Router)

	for _, option := range options {
		if err := option(&s); err != nil {
			return nil, err
		}
	}
	return &s, nil
}

// Server is a server.
type Server struct {
	MainRouter              *web.Router
	appStorage              model.AppStorage
	userStorage             model.UserStorage
	configurationStorage    model.ConfigurationStorage
	tokenStorage            model.TokenStorage
	tokenBlacklist          model.TokenBlacklist
	staticFilesStorage      model.StaticFilesStorage
	verificationCodeStorage model.VerificationCodeStorage
	settings                model.ServerSettings
}

// Router returns server's main router.
func (s *Server) Router() model.Router {
	return s.MainRouter
}

func (s *Server) Settings() model.ServerSettings {
	return s.settings
}

func (s *Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	s.MainRouter.ServeHTTP(w, r)
}

// AppStorage returns server's app storage.
func (s *Server) AppStorage() model.AppStorage {
	return s.appStorage
}

// UserStorage returns server's user storage.
func (s *Server) UserStorage() model.UserStorage {
	return s.userStorage
}

// TokenStorage returns server's token storage.
func (s *Server) TokenStorage() model.TokenStorage {
	return s.tokenStorage
}

// TokenBlacklist returns server's token blacklist.
func (s *Server) TokenBlacklist() model.TokenBlacklist {
	return s.tokenBlacklist
}

// VerificationCodeStorage returns server's token storage.
func (s *Server) VerificationCodeStorage() model.VerificationCodeStorage {
	return s.verificationCodeStorage
}

// ConfigurationStorage returns server's configuration storage.
func (s *Server) ConfigurationStorage() model.ConfigurationStorage {
	return s.configurationStorage
}

// StaticFilesStorage returns server's static files storage.
func (s *Server) StaticFilesStorage() model.StaticFilesStorage {
	return s.staticFilesStorage
}

// Close closes all database connections.
func (s *Server) Close() {
	s.AppStorage().Close()
	s.UserStorage().Close()
	s.TokenStorage().Close()
	s.TokenBlacklist().Close()
	s.VerificationCodeStorage().Close()
	s.StaticFilesStorage().Close()
}

func initTokenService(generalSettings model.GeneralServerSettings, configStorage model.ConfigurationStorage, tokenStorage model.TokenStorage, appStorage model.AppStorage, userStorage model.UserStorage) (jwtService.TokenService, error) {
	tokenServiceAlg, ok := ijwt.StrToTokenSignAlg[generalSettings.Algorithm]
	if !ok {
		return nil, fmt.Errorf("Unknown token service algorithm %s", generalSettings.Algorithm)
	}

	keys, err := configStorage.LoadKeys(tokenServiceAlg)
	if err != nil {
		return nil, err
	}

	tokenService, err := jwtService.NewJWTokenService(
		keys,
		generalSettings.Issuer,
		tokenStorage,
		appStorage,
		userStorage,
	)
	return tokenService, err
}

func initSessionStorage(settings model.SessionStorageSettings) (model.SessionStorage, error) {
	switch settings.Type {
	case model.SessionStorageRedis:
		return redis.NewSessionStorage(settings)
	case model.SessionStorageMem:
		return mem.NewSessionStorage()
	case model.SessionStorageDynamoDB:
		return dynamodb.NewSessionStorage(settings)
	}
	return nil, fmt.Errorf("Session storage of type '%s' is not supported", settings.Type)
}

func initStaticFilesStorage(settings model.StaticFilesStorageSettings) (model.StaticFilesStorage, error) {
	localStaticFilesStorage, err := staticStoreLocal.NewStaticFilesStorage(settings)
	if err != nil {
		return nil, err
	}
	switch settings.Type {
	case model.StaticFilesStorageTypeLocal:
		return localStaticFilesStorage, nil
	case model.StaticFilesStorageTypeS3:
		return staticStoreS3.NewStaticFilesStorage(settings, localStaticFilesStorage)
	case model.StaticFilesStorageTypeDynamoDB:
		return staticStoreDynamo.NewStaticFilesStorage(settings, localStaticFilesStorage)
	}
	return nil, fmt.Errorf("Session storage of type '%s' is not supported", settings.Type)
}

func initSMSService(settings model.SMSServiceSettings) (model.SMSService, error) {
	switch settings.Type {
	case model.SMSServiceTwilio:
		return twilio.NewSMSService(settings)
	case model.SMSServiceNexmo:
		return nexmo.NewSMSService(settings)
	case model.SMSServiceRouteMobile:
		return routemobile.NewSMSService(settings)
	case model.SMSServiceMock:
		return smsMock.NewSMSService()
	}
	return nil, fmt.Errorf("SMS service of type '%s' is not supported", settings.Type)
}

func initEmailService(ess model.EmailServiceSettings, sfs model.StaticFilesStorage) (model.EmailService, error) {
	tpltr, err := model.NewEmailTemplater(sfs)
	if err != nil {
		return nil, err
	}
	if tpltr == nil {
		return nil, errors.New("Email templater holds nil value")
	}

	switch ess.Type {
	case model.EmailServiceMailgun:
		return mailgun.NewEmailService(ess, tpltr), nil
	case model.EmailServiceAWS:
		return ses.NewEmailService(ess, tpltr)
	case model.EmailServiceMock:
		return emailMock.NewEmailService(), nil
	}
	return nil, fmt.Errorf("Email service of type '%s' is not supported", ess.Type)
}

// ImportApps imports apps from file.
func (s *Server) ImportApps(filename string) error {
	data, err := dataFromFile(filename)
	if err != nil {
		return err
	}
	return s.AppStorage().ImportJSON(data)
}

// ImportUsers imports users from file.
func (s *Server) ImportUsers(filename string) error {
	data, err := dataFromFile(filename)
	if err != nil {
		return err
	}
	return s.UserStorage().ImportJSON(data)
}

func dataFromFile(filename string) ([]byte, error) {
	file, err := os.Open(filename)
	if err != nil {
		return nil, err
	}
	defer file.Close()
	return ioutil.ReadAll(file)
}
