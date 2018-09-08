package model

//TokenStorage  implements storage of issued refresh tokens
type TokenStorage interface {
	SaveToken(token string) error
	HasToken(token string) bool
	RevokeToken(token string) error
}
