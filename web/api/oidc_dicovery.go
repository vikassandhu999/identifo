package api

import (
	"crypto/ecdsa"
	"crypto/rsa"
	"encoding/base64"
	"math/big"
	"net/http"
)

// OIDCConfiguration describes OIDC configuration.
// Additional info: https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata.
// Identifo is not an OIDC provider, that's why we only provide the information for token validation.
type OIDCConfiguration struct {
	Issuer                 string   `json:"issuer"`
	JwksURI                string   `json:"jwks_uri"`
	ScopesSupported        []string `json:"scopes_supported"`
	SupportedIDSigningAlgs []string `json:"id_token_signing_alg_values_supported"`
}

type jwk struct {
	Alg string   `json:"alg,omitempty"` // The "alg" (algorithm) parameter identifies the algorithm intended for use with the key.
	Kty string   `json:"kty,omitempty"` //"EC" | "RSA".  The "kty" (key type) parameter identifies the cryptographic algorithm family used with the key, such as "RSA" or "EC".
	Use string   `json:"use,omitempty"` //"sig". The "use" (public key use) parameter identifies the intended use of the public key.  The "use" parameter is employed to indicate whether a public key is used for encrypting data or verifying the signature on data.
	X5c []string `json:"x5c,omitempty"` // The "x5c" (X.509 certificate chain) parameter contains a chain of one
	// or more PKIX certificates [RFC5280].  The certificate chain is
	// represented as a JSON array of certificate value strings.  Each
	// string in the array is a base64-encoded (Section 4 of [RFC4648] --
	// not base64url-encoded) DER [ITU.X690.1994] PKIX certificate value.
	Kid string `json:"kid,omitempty"` // Identifo used X5t as kid
	X5t string `json:"x5t,omitempty"` // The "x5t" (X.509 certificate SHA-1 thumbprint) parameter is a
	// base64url-encoded SHA-1 thumbprint (a.k.a. digest) of the DER
	// encoding of an X.509 certificate [RFC5280].  Note that certificate
	// thumbprints are also sometimes known as certificate fingerprints.
	N string `json:"n,omitempty"`
	E string `json:"e,omitempty"` // The RSA Key blinding operation [Kocher], which is a defense against
	//some timing attacks, requires all of the RSA key values "n", "e", and
	//"d".
	Crv string `json:"crv,omitempty"` // P-256
	X   string `json:"x,omitempty"`   // It is represented as the base64url encoding of
	// the octet string representation of the coordinate, as defined in
	// Section 2.3.5 of SEC1 [SEC1].
	Y string `json:"y,omitempty"` // An Elliptic Curve public key is represented by a pair of coordinates
	// drawn from a finite field, which together define a point on an
	// Elliptic Curve.  The following members MUST be present for all
	// Elliptic Curve public keys: crv, x, y

}

// OIDCConfiguration provides an OpenID Connect Discovery information (https://openid.net/specs/openid-connect-discovery-1_0.html).
// It should return RFC5785-compatible documentation (https://tools.ietf.org/html/rfc5785).
// This endpoint allows using Identifo as Federated identity provider.
// For example, AWS AppSync (https://docs.aws.amazon.com/appsync/latest/devguide/security.html#openid-connect-authorization).
func (ar *Router) OIDCConfiguration() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if ar.oidcConfiguration == nil {
			ar.oidcConfiguration = &OIDCConfiguration{
				Issuer:                 ar.server.Services().Token.Issuer(),
				JwksURI:                ar.server.Services().Token.Issuer() + "/.well-known/jwks.json",
				ScopesSupported:        ar.server.Settings().General.SupportedScopes,
				SupportedIDSigningAlgs: []string{ar.server.Services().Token.Algorithm()},
			}
		}
		ar.ServeJSON(w, http.StatusOK, ar.oidcConfiguration)
	}
}

// OIDCJwks returns JSON Web Keys object.
// Identifo supports two algorithms for signing JSON Web Tokens (JWTs): RS256 and ES256.
// RS256 and ES256 generate an asymmetric signature, which means a private key must be used to sign the JWT,
// and a different public key must be used to verify the signature.
//
// At the most basic level, the JWKS is a set of keys containing the public keys that should
// be used to verify any JWT issued by the authorization server.
// This endpoint exposes a JWKS endpoint for each tenant, which can be found at https://YOUR_IDENTIFO_DOMAIN/.well-known/jwks.json.
// Currently Identifo only supports a single JWK for signing,
// however it is important to assume this endpoint technically could contain multiple JWKs.
func (ar *Router) OIDCJwks() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if ar.jwk != nil {
			// A JSON object that represents a set of JWKs. The JSON object MUST have a keys member, which is an array of JWKs.
			result := map[string]interface{}{"keys": []interface{}{ar.jwk}}
			ar.ServeJSON(w, http.StatusOK, result)
			return
		}

		ar.jwk = &jwk{
			Use: "sig",
			Alg: ar.server.Services().Token.Algorithm(),
			Kid: ar.server.Services().Token.KeyID(),
		}

		switch pub := ar.server.Services().Token.PublicKey().(type) {
		case *rsa.PublicKey:
			// https://tools.ietf.org/html/rfc7518#section-6.3.1
			ar.jwk.Kty = "RSA"
			ar.jwk.N = base64.RawURLEncoding.EncodeToString(pub.N.Bytes())
			ar.jwk.E = base64.RawURLEncoding.EncodeToString(big.NewInt(int64(pub.E)).Bytes())
		case *ecdsa.PublicKey:
			// https://tools.ietf.org/html/rfc7518#section-6.2.1
			p := pub.Curve.Params()
			n := p.BitSize / 8
			if p.BitSize%8 != 0 {
				n++
			}
			x := pub.X.Bytes()
			if n > len(x) {
				x = append(make([]byte, n-len(x)), x...)
			}
			y := pub.Y.Bytes()
			if n > len(y) {
				y = append(make([]byte, n-len(y)), y...)
			}
			ar.jwk.Kty = "EC"
			ar.jwk.Crv = p.Name
			ar.jwk.X = base64.RawURLEncoding.EncodeToString(x)
			ar.jwk.Y = base64.RawURLEncoding.EncodeToString(y)
		}

		result := map[string]interface{}{"keys": []interface{}{ar.jwk}}
		ar.ServeJSON(w, http.StatusOK, result)
	}
}

// ServeADDAFile lets Apple servers download apple-developer-domain-association.txt.
// func (ar *Router) ServeADDAFile() http.HandlerFunc {
// TODO: Jack, reimplement this completely
// data, err := ar.server.Storages().Static.GetAppleFile(model.AppleFilenames.DeveloperDomainAssociation)
// if err != nil {
// 	ar.logger.Fatalln("Cannot read Apple Domain Association file path:", err)
// }
// if data == nil {
// 	ar.logger.Println("Apple Developer Domain Association file does not exist, so won't be served.")
// 	return func(w http.ResponseWriter, r *http.Request) { ar.ServeJSON(w, http.StatusNotFound, nil) }
// }

// return func(w http.ResponseWriter, r *http.Request) {
// 	w.Header().Set("Content-Disposition", "attachment; filename=apple-developer-domain-association.txt")
// 	w.Header().Set("Content-Type", r.Header.Get("Content-Type"))
// 	http.ServeContent(w, r, "apple-developer-domain-association.txt", time.Now(), bytes.NewReader(data))
// }
// }

// ServeAASAFile lets Apple servers download apple-app-site-association file.
// func (ar *Router) ServeAASAFile() http.HandlerFunc {
// TODO: Jack, reimplement this completely

// data, err := ar.server.Storages().Static.GetAppleFile(model.AppleFilenames.AppSiteAssociation)
// if err != nil {
// 	ar.logger.Fatalln("Cannot read Apple App Site Association file path:", err)
// }
// if data == nil {
// 	ar.logger.Println("Apple App Site Association file does not exist, so won't be served.")
// 	return func(w http.ResponseWriter, r *http.Request) { ar.ServeJSON(w, http.StatusNotFound, nil) }
// }

// return func(w http.ResponseWriter, r *http.Request) {
// 	w.Header().Set("Content-Disposition", "attachment; filename=apple-app-site-association")
// 	w.Header().Set("Content-Type", "application/pkcs7-mime")
// 	http.ServeContent(w, r, "apple-app-site-association", time.Now(), bytes.NewReader(data))
// }
// }
