package api

import (
	"fmt"
	"net/http"

	"github.com/madappgang/identifo/v2/model"
	"github.com/madappgang/identifo/v2/web/authorization"
	"github.com/madappgang/identifo/v2/web/middleware"
)

type registrationData struct {
	Username  string   `json:"username"`
	Phone     string   `json:"phone"`
	Email     string   `json:"email"`
	FullName  string   `json:"full_name"`
	Password  string   `json:"password"`
	Scopes    []string `json:"scopes"`
	Anonymous bool     `json:"anonymous"`
	Invite    string   `json:"invite"`
}

func (rd *registrationData) validate() error {
	emailLen := len(rd.Email)
	phoneLen := len(rd.Phone)
	usernameLen := len(rd.Username)
	pswdLen := len(rd.Password)

	if emailLen > 0 {
		if !model.EmailRegexp.MatchString(rd.Email) {
			return fmt.Errorf("invalid email")
		}
	}
	if phoneLen > 0 {
		if !model.PhoneRegexp.MatchString(rd.Phone) {
			return fmt.Errorf("invalid phone")
		}
	}

	if usernameLen > 0 {
		if usernameLen < 6 || usernameLen > 130 {
			return fmt.Errorf("incorrect username length %d, expected a number between 6 and 130", usernameLen)
		}
	}

	if emailLen == 0 && phoneLen == 0 && usernameLen == 0 {
		return fmt.Errorf("username, phone or/and email are quired for registration")
	}

	if pswdLen < 6 || pswdLen > 50 {
		return fmt.Errorf("incorrect password length %d, expected a number between 6 and 130", pswdLen)
	}
	return nil
}

/*
 * Password rules:
 * at least 6 letters
 * at least 1 upper case
 */

// RegisterWithPassword registers new user with password.
func (ar *Router) RegisterWithPassword() http.HandlerFunc {
	type registrationResponse struct {
		AccessToken  string     `json:"access_token,omitempty"`
		RefreshToken string     `json:"refresh_token,omitempty"`
		User         model.User `json:"user,omitempty"`
	}

	return func(w http.ResponseWriter, r *http.Request) {
		app := middleware.AppFromContext(r.Context())
		if len(app.ID) == 0 {
			ar.logger.Println("error getting App")
			ar.Error(w, ErrorAPIRequestAppIDInvalid, http.StatusBadRequest, "App is not in context.", "RegisterWithPassword.AppFromContext")
			return
		}

		if app.RegistrationForbidden {
			ar.Error(w, ErrorAPIAppRegistrationForbidden, http.StatusForbidden, "Registration is forbidden in app.", "RegisterWithPassword.RegistrationForbidden")
			return
		}

		// Check if it makes sense to create new user.
		azi := authorization.AuthzInfo{
			App:         app,
			UserRole:    app.NewUserDefaultRole,
			ResourceURI: r.RequestURI,
			Method:      r.Method,
		}
		if err := ar.Authorizer.Authorize(azi); err != nil {
			ar.Error(w, ErrorAPIAppAccessDenied, http.StatusForbidden, err.Error(), "RegisterWithPassword.Authorizer")
			return
		}

		// Parse registration data.
		rd := registrationData{}
		if ar.MustParseJSON(w, r, &rd) != nil {
			return
		}

		if rd.Anonymous && !app.AnonymousRegistrationAllowed {
			ar.Error(w, ErrorAPIAppRegistrationForbidden, http.StatusForbidden, "Anonymous login forbidden in the app", "RegisterWithPassword.AnonymousRegistrationForbidden")
			return
		}

		if err := rd.validate(); err != nil {
			ar.Error(w, ErrorAPIRequestBodyParamsInvalid, http.StatusBadRequest, err.Error(), "RegisterWithPassword.validate")
			return
		}

		// Validate password.
		if err := model.StrongPswd(rd.Password); err != nil {
			ar.Error(w, ErrorAPIRequestPasswordWeak, http.StatusBadRequest, err.Error(), "RegisterWithPassword.StrongPswd")
			return
		}

		// merge scopes for user
		scopes := model.MergeScopes(app.Scopes, app.NewUserDefaultScopes, rd.Scopes)

		// Create new user.
		um := model.User{
			Username: rd.Username,
			Email:    rd.Email,
			Phone:    rd.Phone,
			FullName: rd.FullName,
			Scopes:   scopes,
		}

		userRole := app.NewUserDefaultRole

		if rd.Invite != "" {
			parsedInviteToken, err := ar.server.Services().Token.Parse(rd.Invite)
			if err != nil {
				ar.Error(w, ErrorAPIInviteTokenServerError, http.StatusBadRequest, err.Error(), "RegisterWithPassword.ParseInviteToken")
				return
			}

			email, ok := parsedInviteToken.Payload()["email"].(string)
			if !ok || email != rd.Email {
				ar.Error(w, ErrorAPIInviteTokenServerError, http.StatusBadRequest, "Invite email not equal registration data email", "RegisterWithPassword.ParseInviteToken")
				return
			}

			role, ok := parsedInviteToken.Payload()["role"].(string)
			if !ok {
				ar.Error(w, ErrorAPIInviteTokenServerError, http.StatusBadRequest, "Can't get role from invite", "RegisterWithPassword.ParseInviteToken")
				return
			}
			userRole = role
		}

		user, err := ar.server.Storages().User.AddUserWithPassword(um, rd.Password, userRole, rd.Anonymous)
		if err == model.ErrorUserExists {
			ar.Error(w, ErrorAPIUsernameEmailOrPhoneTaken, http.StatusBadRequest, err.Error(), "RegisterWithPassword.AddUserWithPassword")
			return
		}
		if err != nil {
			ar.Error(w, ErrorAPIInternalServerError, http.StatusInternalServerError, err.Error(), "RegisterWithPassword.AddUserWithPassword")
			return
		}

		// Do login flow.
		authResult, err := ar.loginFlow(app, user, rd.Scopes)
		if err != nil {
			ar.Error(w, ErrorAPIInternalServerError, http.StatusInternalServerError, err.Error(), "RegisterWithPassword.LoginFlowError")
			return
		}

		ar.ServeJSON(w, http.StatusOK, authResult)
	}
}
