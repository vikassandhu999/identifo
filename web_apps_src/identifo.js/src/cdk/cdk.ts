import { BehaviorSubject } from 'rxjs';
import { StateLoginPhone, StateLoginPhoneVerify } from '..';
import {
  ApiError,
  APIErrorCodes,
  AppSettingsResponse,
  FederatedLoginProvider,
  LoginResponse,
  ServerSettingsLoginTypes,
  TFAStatus,
  TFAType,
} from '../api/model';
import IdentifoAuth from '../IdentifoAuth';
import { IdentifoConfig } from '../types/types';
import {
  LoginTypes,
  Routes,
  State,
  StateCallback,
  StateError,
  StateLogout,
  StatePasswordForgotTFASelect,
  StatePasswordForgotTFAVerify,
  States,
  StateTFASetupSelect,
  StateTFAVerifyApp,
  StateTFAVerifyEmailSms,
  StateTFAVerifySelect,
  StateWithError,
  typeToPasswordForgotTFAVerifyRoute,
  typeToTFAVerifyRoute,
} from './model';

const emailRegex =
  // eslint-disable-next-line max-len
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const phoneRegex = /^[\+][0-9]{9,15}$/;

export class CDK {
  auth: IdentifoAuth;

  settings!: AppSettingsResponse;

  lastError!: ApiError;

  callbackUrl?: string;

  postLogoutRedirectUri?: string;

  scopes: Set<string> = new Set();

  state: BehaviorSubject<States> = new BehaviorSubject({ route: Routes.LOADING } as States);

  constructor() {
    this.auth = new IdentifoAuth();
  }

  // eslint-disable-next-line max-statements
  async configure(authConfig: IdentifoConfig, callbackUrl: string): Promise<void> {
    this.state.next({ route: Routes.LOADING });

    this.callbackUrl = callbackUrl;
    this.scopes = new Set(authConfig.scopes ?? []);

    this.postLogoutRedirectUri = window.location.origin + window.location.pathname;
    // this.postLogoutRedirectUri = this.postLogoutRedirectUri || window.location.origin + window.location.pathname;

    if (!authConfig.appId) {
      this.state.next({
        route: Routes.ERROR,
        error: { message: 'app-id param is empty', name: 'app-id empty' },
      } as StateError);
      return;
    }
    if (!authConfig.url) {
      this.state.next({
        route: Routes.ERROR,
        error: { message: 'url param is empty', name: 'url empty' },
      } as StateError);
      return;
    }

    this.auth.configure(authConfig);
    try {
      this.settings = await this.auth.api.getAppSettings(callbackUrl);
    } catch (err) {
      this.state.next({
        route: Routes.ERROR,
        error: err as ApiError,
      } as StateError);
      return;
    }
    this.settings.tfaType = Array.isArray(this.settings.tfaType) ? this.settings.tfaType : [this.settings.tfaType];

    // // If we have provider and state then we need to complete federated login
    const href = new URL(window.location.href);
    if (!!href.searchParams.get('provider') && !!href.searchParams.get('state')) {
      // Also we clear all url params after parsing
      const u = new URL(window.location.href);
      const sp = new URLSearchParams();
      const appId = href.searchParams.get('appId');
      if (appId === null) {
        this.state.next({
          route: Routes.ERROR,
          error: { message: 'app-id param is empty', name: 'app-id empty' },
        } as StateError);
        return;
      }
      sp.set('appId', appId);
      window.history.replaceState({}, document.title, `${u.pathname}?${sp.toString()}`);
      this.auth.api
        .federatedLoginComplete(u.searchParams)
        .then(this.afterLoginRedirect)
        .catch(this.loginCatchRedirect)
        .catch((e) => this.processError(e));
    }
  }

  login(): void {
    // check for allowed login with
    switch (true) {
      case (!this.auth.config.loginWith && this.settings.loginWith['phone']) ||
        (this.auth.config.loginWith === 'phone' && this.settings.loginWith['phone']):
        return this.loginWithPhone();
      case (!this.auth.config.loginWith && this.settings.loginWith['email']) ||
        (this.auth.config.loginWith === 'email' && this.settings.loginWith['email']):
        return this.loginWithPassword();
      default:
        throw 'Unsupported login way';
    }
  }
  loginWithPhone(): void {
    this.state.next({
      route: Routes.LOGIN_PHONE,
      registrationForbidden: this.settings?.registrationForbidden,
      error: this.lastError,
      federatedProviders: this.settings?.federatedProviders,
      loginTypes: this.getLoginTypes('phone'),
      requestCode: async (phone: string, remember?: boolean): Promise<void> => {
        if (!this.validatePhone(phone)) {
          return;
        }
        const scopes = new Set(this.scopes);
        if (remember) {
          scopes.add('offline');
        }
        await this.auth.api
          .requestPhoneCode(phone)
          .then(() => this.loginWithPhoneVerify(phone, remember))
          .catch((e) => this.processError(e));
      },
      socialLogin: async (provider: FederatedLoginProvider) => {
        this.state.next({ route: Routes.LOADING });
        const federatedRedirectUrl = window.location.origin + window.location.pathname;
        return this.auth.api.federatedLogin(provider, [...this.scopes], federatedRedirectUrl, this.callbackUrl);
      },
    } as StateLoginPhone);
  }
  loginWithPhoneVerify(phone: string, remember?: boolean): void {
    this.state.next({
      route: Routes.LOGIN_PHONE_VERIFY,
      error: this.lastError,
      phone: phone,
      resendTimeout: this.settings.tfaResendTimeout * 1000,
      resendCode: async () => {
        await this.auth.api.requestPhoneCode(phone);
      },
      login: async (code: string): Promise<void> => {
        const scopes = new Set(this.scopes);
        if (remember) {
          scopes.add('offline');
        }
        await this.auth.api
          .phoneLogin(phone, code, [...this.scopes])
          .then(this.afterLoginRedirect)
          .catch(this.loginCatchRedirect)
          .catch((e) => this.processError(e));
      },
      goback: async (): Promise<void> => {
        this.login();
      },
    } as StateLoginPhoneVerify);
  }
  loginWithPassword(): void {
    this.state.next({
      route: Routes.LOGIN,
      registrationForbidden: this.settings?.registrationForbidden,
      error: this.lastError,
      federatedProviders: this.settings?.federatedProviders,
      loginTypes: this.getLoginTypes('email'),
      signup: async (): Promise<void> => {
        this.register();
      },
      signin: async (email: string, password: string, remember?: boolean): Promise<void> => {
        if (!this.validateEmail(email)) {
          return;
        }
        const scopes = new Set(this.scopes);
        if (remember) {
          scopes.add('offline');
        }
        await this.auth.api
          .login(email, password, '', [...Array.from(scopes)])
          .then(this.afterLoginRedirect)
          .catch(this.loginCatchRedirect)
          .catch((e) => this.processError(e));
      },
      socialLogin: async (provider: FederatedLoginProvider) => {
        this.state.next({ route: Routes.LOADING });
        const federatedRedirectUrl = window.location.origin + window.location.pathname;
        return this.auth.api.federatedLogin(provider, [...this.scopes], federatedRedirectUrl, this.callbackUrl);
      },
      passwordForgot: async () => {
        this.forgotPassword();
      },
    });
  }

  register(): void {
    this.state.next({
      route: Routes.REGISTER,
      signup: async (email: string, password: string, token?: string): Promise<void> => {
        if (!this.validateEmail(email)) {
          return;
        }
        await this.auth.api
          .register(email, password, [...this.scopes], token)
          .then(this.afterLoginRedirect)
          .catch(this.loginCatchRedirect)
          .catch((e) => this.processError(e));
      },
      goback: async (): Promise<void> => {
        this.login();
      },
    });
  }

  forgotPassword(): void {
    this.state.next({
      route: Routes.PASSWORD_FORGOT,
      restorePassword: async (email: string): Promise<void> => {
        return this.auth.api
          .requestResetPassword(email)
          .then(async (response) => {
            if (response.result === 'tfa-required') {
              await this.redirectTfaForgot(email);
              return;
            }
            if (response.result === 'ok') {
              this.forgotPasswordSuccess();
            }
          })
          .catch((e) => this.processError(e));
      },
      goback: async (): Promise<void> => {
        this.login();
      },
    });
  }

  forgotPasswordSuccess(): void {
    this.state.next({
      route: Routes.PASSWORD_FORGOT_SUCCESS,
      goback: async (): Promise<void> => {
        this.login();
      },
    });
  }

  passwordReset(): void {
    this.state.next({
      route: Routes.PASSWORD_RESET,
      setNewPassword: async (password: string): Promise<void> => {
        this.auth.api
          .resetPassword(password)
          .then(() => {
            this.login();
          })
          .catch((e) => this.processError(e));
      },
    });
  }

  callback(result: LoginResponse): void {
    this.state.next({
      route: Routes.CALLBACK,
      callbackUrl: this.callbackUrl,
      result,
    } as StateCallback);
    if (this.callbackUrl) {
      const url = new URL(this.callbackUrl);
      if (result.access_token) {
        url.searchParams.set('token', result.access_token);
      }
      if (result.refresh_token) {
        url.searchParams.set('refresh_token', result.refresh_token);
      }
      window.location.href = url.toString();
    }
  }

  validateEmail(email: string): boolean {
    if (!emailRegex.test(email)) {
      this.processError({
        detailedMessage: 'Email address is not valid',
        name: 'Validation error',
        message: 'Email address is not valid',
      } as ApiError);
      return false;
    }
    return true;
  }

  validatePhone(email: string): boolean {
    if (!phoneRegex.test(email)) {
      this.processError({
        detailedMessage: 'Phone is not valid',
        name: 'Validation error',
        message: 'Phone is not valid',
      } as ApiError);
      return false;
    }
    return true;
  }

  async tfaSetup(loginResponse: LoginResponse, type: TFAType): Promise<void> {
    switch (type) {
      case TFAType.TFATypeApp: {
        this.state.next({
          route: Routes.TFA_SETUP_APP,
          provisioningURI: '',
          provisioningQR: '',
          setupTFA: async () => {},
          goback: async (): Promise<void> => {
            this.login();
          },
        });
        const tfa = await this.auth.api.enableTFA({});
        if (tfa.provisioning_uri) {
          this.state.next({
            route: Routes.TFA_SETUP_APP,
            provisioningURI: tfa.provisioning_uri,
            provisioningQR: tfa.provisioning_qr || '',
            setupTFA: async () => this.tfaVerify(loginResponse, type),
            goback: async (): Promise<void> => {
              this.login();
            },
          });
        }
        break;
      }
      case TFAType.TFATypeEmail: {
        this.state.next({
          route: Routes.TFA_SETUP_EMAIL,
          email: loginResponse.user.email || '',
          setupTFA: async (email: string) => {
            await this.auth.api.enableTFA({ email });
            return this.tfaVerify({ ...loginResponse, user: { ...loginResponse.user, email } }, type);
          },
          goback: async (): Promise<void> => {
            this.login();
          },
        });
        break;
      }
      case TFAType.TFATypeSMS: {
        this.state.next({
          route: Routes.TFA_SETUP_SMS,
          phone: loginResponse.user.phone || '',
          setupTFA: async (phone: string) => {
            await this.auth.api.enableTFA({ phone });
            return this.tfaVerify({ ...loginResponse, user: { ...loginResponse.user, phone } }, type);
          },
          goback: async (): Promise<void> => {
            this.login();
          },
        });
        break;
      }
      default:
    }
  }

  async tfaVerify(loginResponse: LoginResponse, type: TFAType): Promise<void> {
    const state = {
      route: typeToTFAVerifyRoute[type],
      email: loginResponse.user.email,
      phone: loginResponse.user.phone,
      verifyTFA: async (code: string) => {
        await this.auth.api
          .verifyTFA(code, [...this.scopes])
          .then(this.afterLoginRedirect)
          .catch(this.loginCatchRedirect)
          .catch((e) => this.processError(e));
      },
    };
    switch (type) {
      case TFAType.TFATypeApp: {
        this.state.next({ ...state } as StateTFAVerifyApp);
        break;
      }
      case TFAType.TFATypeEmail:
      case TFAType.TFATypeSMS: {
        this.state.next({
          ...state,
          resendTimeout: this.settings.tfaResendTimeout * 1000, // in ms
          resendTFA: async () => {
            await this.auth.api.resendTFA();
          },
        } as StateTFAVerifyEmailSms);
        break;
      }
      default:
    }
  }

  async passwordForgotTFAVerify(email: string, type: TFAType): Promise<void> {
    this.state.next({
      route: typeToPasswordForgotTFAVerifyRoute[type],
      verifyTFA: async (code: string) => {
        this.auth.api
          .requestResetPassword(email, code)
          .then(() => {
            this.forgotPasswordSuccess();
          })
          .catch((e) => this.processError(e));
      },
    } as StatePasswordForgotTFAVerify);
  }

  async logout(): Promise<void> {
    this.state.next({
      route: Routes.LOGOUT,
      logout: async () => this.auth.api.logout(),
    } as StateLogout);
  }

  // restorePassword(token: string): void {}

  private processError(e: ApiError) {
    e.detailedMessage = e.detailedMessage?.trim();
    e.message = e.message?.trim();

    this.state.next({
      ...this.state.getValue(),
      error: e,
    } as State & StateWithError);
  }

  private async redirectTfaSetup(loginResponse: LoginResponse): Promise<void> {
    if (this.settings.tfaType.length === 1) {
      await this.tfaSetup(loginResponse, this.settings.tfaType[0] as TFAType);
      return;
    }
    this.tfaSetupSelect(loginResponse);
  }

  private tfaSetupSelect(loginResponse: LoginResponse): void {
    this.state.next({
      route: Routes.TFA_SETUP_SELECT,
      tfaStatus: this.settings.tfaStatus,
      tfaTypes: this.settings.tfaType,
      select: async (type: TFAType) => {
        await this.tfaSetup(loginResponse, type);
      },
      setupNextTime: () => {
        this.callback(loginResponse);
      },
    } as StateTFASetupSelect);
  }

  private async redirectTfaVerify(e: LoginResponse): Promise<void> {
    if (this.settings.tfaType.length === 1) {
      await this.tfaVerify(e, this.settings.tfaType[0] as TFAType);
      return;
    }
    this.state.next({
      route: Routes.TFA_VERIFY_SELECT,
      tfaStatus: this.settings.tfaStatus,
      tfaTypes: this.settings.tfaType,
      select: async (type: TFAType) => {
        await this.tfaVerify(e, type);
      },
    } as StateTFAVerifySelect);
  }

  private async redirectTfaForgot(email: string): Promise<void> {
    if (this.settings.tfaType.length === 1) {
      await this.passwordForgotTFAVerify(email, this.settings.tfaType[0] as TFAType);
      return;
    }
    this.state.next({
      route: Routes.PASSWORD_FORGOT_TFA_SELECT,
      tfaStatus: this.settings.tfaStatus,
      tfaTypes: this.settings.tfaType,
      select: async (type: TFAType) => {
        await this.passwordForgotTFAVerify(email, type);
      },
    } as StatePasswordForgotTFASelect);
  }

  // eslint-disable-next-line complexity
  private afterLoginRedirect = async (loginResponse: LoginResponse): Promise<void> => {
    if (loginResponse.require_2fa) {
      if (!loginResponse.enabled_2fa) {
        await this.redirectTfaSetup(loginResponse);
        return;
      }
      if (loginResponse.enabled_2fa) {
        await this.redirectTfaVerify(loginResponse);
        return;
      }
    }
    // Ask about tfa on login only
    if (
      this.settings.tfaStatus === TFAStatus.OPTIONAL &&
      [Routes.LOGIN, Routes.REGISTER].includes(this.state.getValue().route)
    ) {
      this.tfaSetupSelect(loginResponse);
      return;
    }
    if (loginResponse.access_token && loginResponse.refresh_token) {
      this.callback(loginResponse);
      return;
    }
    if (loginResponse.access_token && !loginResponse.refresh_token) {
      this.callback(loginResponse);
      return;
    }
    this.login();
  };

  private loginCatchRedirect = (data: ApiError): void => {
    if (data.id === APIErrorCodes.PleaseEnableTFA) {
      // this.redirectTfaSetup();
      return;
    }
    throw data;
  };
  private getLoginTypes(current: keyof ServerSettingsLoginTypes): LoginTypes {
    const result: LoginTypes = {};
    Object.entries(this.settings.loginWith)
      .filter((v) => v[1] && v[0] !== current)
      .forEach((v) => {
        result[v[0] as keyof ServerSettingsLoginTypes] = {
          type: v[0] as keyof ServerSettingsLoginTypes,
          click: () => {
            this.auth.config.loginWith = v[0] as keyof ServerSettingsLoginTypes;
            this.login();
          },
        };
      });
    return result;
  }
}
