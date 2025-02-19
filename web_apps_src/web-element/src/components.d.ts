/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
import { ApiError, LoginResponse, LoginTypes, Routes } from "@identifo/identifo-auth-js";
export namespace Components {
    interface IdentifoForm {
        "appId": string;
        "callbackUrl": string;
        "debug": boolean;
        "federatedRedirectUrl": string;
        "loginWith": keyof LoginTypes;
        "postLogoutRedirectUri": string;
        "route": Routes;
        "theme": 'dark' | 'light' | 'auto';
        "url": string;
    }
    interface IdentifoFormCallback {
    }
    interface IdentifoFormError {
    }
    interface IdentifoFormErrorAlert {
    }
    interface IdentifoFormForgot {
    }
    interface IdentifoFormForgotSuccess {
        "selectedTheme": 'dark' | 'light';
    }
    interface IdentifoFormGoback {
    }
    interface IdentifoFormLogin {
    }
    interface IdentifoFormLoginPhone {
    }
    interface IdentifoFormLoginPhoneVerify {
    }
    interface IdentifoFormLoginWays {
    }
    interface IdentifoFormPasswordReset {
    }
    interface IdentifoFormRegister {
    }
    interface IdentifoFormTfaSelect {
    }
    interface IdentifoFormTfaSetup {
    }
    interface IdentifoFormTfaSetupApp {
    }
    interface IdentifoFormTfaSetupEmail {
    }
    interface IdentifoFormTfaSetupSms {
    }
    interface IdentifoFormTfaVerify {
    }
}
declare global {
    interface HTMLIdentifoFormElement extends Components.IdentifoForm, HTMLStencilElement {
    }
    var HTMLIdentifoFormElement: {
        prototype: HTMLIdentifoFormElement;
        new (): HTMLIdentifoFormElement;
    };
    interface HTMLIdentifoFormCallbackElement extends Components.IdentifoFormCallback, HTMLStencilElement {
    }
    var HTMLIdentifoFormCallbackElement: {
        prototype: HTMLIdentifoFormCallbackElement;
        new (): HTMLIdentifoFormCallbackElement;
    };
    interface HTMLIdentifoFormErrorElement extends Components.IdentifoFormError, HTMLStencilElement {
    }
    var HTMLIdentifoFormErrorElement: {
        prototype: HTMLIdentifoFormErrorElement;
        new (): HTMLIdentifoFormErrorElement;
    };
    interface HTMLIdentifoFormErrorAlertElement extends Components.IdentifoFormErrorAlert, HTMLStencilElement {
    }
    var HTMLIdentifoFormErrorAlertElement: {
        prototype: HTMLIdentifoFormErrorAlertElement;
        new (): HTMLIdentifoFormErrorAlertElement;
    };
    interface HTMLIdentifoFormForgotElement extends Components.IdentifoFormForgot, HTMLStencilElement {
    }
    var HTMLIdentifoFormForgotElement: {
        prototype: HTMLIdentifoFormForgotElement;
        new (): HTMLIdentifoFormForgotElement;
    };
    interface HTMLIdentifoFormForgotSuccessElement extends Components.IdentifoFormForgotSuccess, HTMLStencilElement {
    }
    var HTMLIdentifoFormForgotSuccessElement: {
        prototype: HTMLIdentifoFormForgotSuccessElement;
        new (): HTMLIdentifoFormForgotSuccessElement;
    };
    interface HTMLIdentifoFormGobackElement extends Components.IdentifoFormGoback, HTMLStencilElement {
    }
    var HTMLIdentifoFormGobackElement: {
        prototype: HTMLIdentifoFormGobackElement;
        new (): HTMLIdentifoFormGobackElement;
    };
    interface HTMLIdentifoFormLoginElement extends Components.IdentifoFormLogin, HTMLStencilElement {
    }
    var HTMLIdentifoFormLoginElement: {
        prototype: HTMLIdentifoFormLoginElement;
        new (): HTMLIdentifoFormLoginElement;
    };
    interface HTMLIdentifoFormLoginPhoneElement extends Components.IdentifoFormLoginPhone, HTMLStencilElement {
    }
    var HTMLIdentifoFormLoginPhoneElement: {
        prototype: HTMLIdentifoFormLoginPhoneElement;
        new (): HTMLIdentifoFormLoginPhoneElement;
    };
    interface HTMLIdentifoFormLoginPhoneVerifyElement extends Components.IdentifoFormLoginPhoneVerify, HTMLStencilElement {
    }
    var HTMLIdentifoFormLoginPhoneVerifyElement: {
        prototype: HTMLIdentifoFormLoginPhoneVerifyElement;
        new (): HTMLIdentifoFormLoginPhoneVerifyElement;
    };
    interface HTMLIdentifoFormLoginWaysElement extends Components.IdentifoFormLoginWays, HTMLStencilElement {
    }
    var HTMLIdentifoFormLoginWaysElement: {
        prototype: HTMLIdentifoFormLoginWaysElement;
        new (): HTMLIdentifoFormLoginWaysElement;
    };
    interface HTMLIdentifoFormPasswordResetElement extends Components.IdentifoFormPasswordReset, HTMLStencilElement {
    }
    var HTMLIdentifoFormPasswordResetElement: {
        prototype: HTMLIdentifoFormPasswordResetElement;
        new (): HTMLIdentifoFormPasswordResetElement;
    };
    interface HTMLIdentifoFormRegisterElement extends Components.IdentifoFormRegister, HTMLStencilElement {
    }
    var HTMLIdentifoFormRegisterElement: {
        prototype: HTMLIdentifoFormRegisterElement;
        new (): HTMLIdentifoFormRegisterElement;
    };
    interface HTMLIdentifoFormTfaSelectElement extends Components.IdentifoFormTfaSelect, HTMLStencilElement {
    }
    var HTMLIdentifoFormTfaSelectElement: {
        prototype: HTMLIdentifoFormTfaSelectElement;
        new (): HTMLIdentifoFormTfaSelectElement;
    };
    interface HTMLIdentifoFormTfaSetupElement extends Components.IdentifoFormTfaSetup, HTMLStencilElement {
    }
    var HTMLIdentifoFormTfaSetupElement: {
        prototype: HTMLIdentifoFormTfaSetupElement;
        new (): HTMLIdentifoFormTfaSetupElement;
    };
    interface HTMLIdentifoFormTfaSetupAppElement extends Components.IdentifoFormTfaSetupApp, HTMLStencilElement {
    }
    var HTMLIdentifoFormTfaSetupAppElement: {
        prototype: HTMLIdentifoFormTfaSetupAppElement;
        new (): HTMLIdentifoFormTfaSetupAppElement;
    };
    interface HTMLIdentifoFormTfaSetupEmailElement extends Components.IdentifoFormTfaSetupEmail, HTMLStencilElement {
    }
    var HTMLIdentifoFormTfaSetupEmailElement: {
        prototype: HTMLIdentifoFormTfaSetupEmailElement;
        new (): HTMLIdentifoFormTfaSetupEmailElement;
    };
    interface HTMLIdentifoFormTfaSetupSmsElement extends Components.IdentifoFormTfaSetupSms, HTMLStencilElement {
    }
    var HTMLIdentifoFormTfaSetupSmsElement: {
        prototype: HTMLIdentifoFormTfaSetupSmsElement;
        new (): HTMLIdentifoFormTfaSetupSmsElement;
    };
    interface HTMLIdentifoFormTfaVerifyElement extends Components.IdentifoFormTfaVerify, HTMLStencilElement {
    }
    var HTMLIdentifoFormTfaVerifyElement: {
        prototype: HTMLIdentifoFormTfaVerifyElement;
        new (): HTMLIdentifoFormTfaVerifyElement;
    };
    interface HTMLElementTagNameMap {
        "identifo-form": HTMLIdentifoFormElement;
        "identifo-form-callback": HTMLIdentifoFormCallbackElement;
        "identifo-form-error": HTMLIdentifoFormErrorElement;
        "identifo-form-error-alert": HTMLIdentifoFormErrorAlertElement;
        "identifo-form-forgot": HTMLIdentifoFormForgotElement;
        "identifo-form-forgot-success": HTMLIdentifoFormForgotSuccessElement;
        "identifo-form-goback": HTMLIdentifoFormGobackElement;
        "identifo-form-login": HTMLIdentifoFormLoginElement;
        "identifo-form-login-phone": HTMLIdentifoFormLoginPhoneElement;
        "identifo-form-login-phone-verify": HTMLIdentifoFormLoginPhoneVerifyElement;
        "identifo-form-login-ways": HTMLIdentifoFormLoginWaysElement;
        "identifo-form-password-reset": HTMLIdentifoFormPasswordResetElement;
        "identifo-form-register": HTMLIdentifoFormRegisterElement;
        "identifo-form-tfa-select": HTMLIdentifoFormTfaSelectElement;
        "identifo-form-tfa-setup": HTMLIdentifoFormTfaSetupElement;
        "identifo-form-tfa-setup-app": HTMLIdentifoFormTfaSetupAppElement;
        "identifo-form-tfa-setup-email": HTMLIdentifoFormTfaSetupEmailElement;
        "identifo-form-tfa-setup-sms": HTMLIdentifoFormTfaSetupSmsElement;
        "identifo-form-tfa-verify": HTMLIdentifoFormTfaVerifyElement;
    }
}
declare namespace LocalJSX {
    interface IdentifoForm {
        "appId"?: string;
        "callbackUrl"?: string;
        "debug"?: boolean;
        "federatedRedirectUrl"?: string;
        "loginWith"?: keyof LoginTypes;
        "onComplete"?: (event: CustomEvent<LoginResponse>) => void;
        "onError"?: (event: CustomEvent<ApiError>) => void;
        "postLogoutRedirectUri"?: string;
        "route"?: Routes;
        "theme"?: 'dark' | 'light' | 'auto';
        "url"?: string;
    }
    interface IdentifoFormCallback {
    }
    interface IdentifoFormError {
    }
    interface IdentifoFormErrorAlert {
    }
    interface IdentifoFormForgot {
    }
    interface IdentifoFormForgotSuccess {
        "selectedTheme"?: 'dark' | 'light';
    }
    interface IdentifoFormGoback {
    }
    interface IdentifoFormLogin {
    }
    interface IdentifoFormLoginPhone {
    }
    interface IdentifoFormLoginPhoneVerify {
    }
    interface IdentifoFormLoginWays {
    }
    interface IdentifoFormPasswordReset {
    }
    interface IdentifoFormRegister {
    }
    interface IdentifoFormTfaSelect {
    }
    interface IdentifoFormTfaSetup {
    }
    interface IdentifoFormTfaSetupApp {
    }
    interface IdentifoFormTfaSetupEmail {
    }
    interface IdentifoFormTfaSetupSms {
    }
    interface IdentifoFormTfaVerify {
    }
    interface IntrinsicElements {
        "identifo-form": IdentifoForm;
        "identifo-form-callback": IdentifoFormCallback;
        "identifo-form-error": IdentifoFormError;
        "identifo-form-error-alert": IdentifoFormErrorAlert;
        "identifo-form-forgot": IdentifoFormForgot;
        "identifo-form-forgot-success": IdentifoFormForgotSuccess;
        "identifo-form-goback": IdentifoFormGoback;
        "identifo-form-login": IdentifoFormLogin;
        "identifo-form-login-phone": IdentifoFormLoginPhone;
        "identifo-form-login-phone-verify": IdentifoFormLoginPhoneVerify;
        "identifo-form-login-ways": IdentifoFormLoginWays;
        "identifo-form-password-reset": IdentifoFormPasswordReset;
        "identifo-form-register": IdentifoFormRegister;
        "identifo-form-tfa-select": IdentifoFormTfaSelect;
        "identifo-form-tfa-setup": IdentifoFormTfaSetup;
        "identifo-form-tfa-setup-app": IdentifoFormTfaSetupApp;
        "identifo-form-tfa-setup-email": IdentifoFormTfaSetupEmail;
        "identifo-form-tfa-setup-sms": IdentifoFormTfaSetupSms;
        "identifo-form-tfa-verify": IdentifoFormTfaVerify;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            "identifo-form": LocalJSX.IdentifoForm & JSXBase.HTMLAttributes<HTMLIdentifoFormElement>;
            "identifo-form-callback": LocalJSX.IdentifoFormCallback & JSXBase.HTMLAttributes<HTMLIdentifoFormCallbackElement>;
            "identifo-form-error": LocalJSX.IdentifoFormError & JSXBase.HTMLAttributes<HTMLIdentifoFormErrorElement>;
            "identifo-form-error-alert": LocalJSX.IdentifoFormErrorAlert & JSXBase.HTMLAttributes<HTMLIdentifoFormErrorAlertElement>;
            "identifo-form-forgot": LocalJSX.IdentifoFormForgot & JSXBase.HTMLAttributes<HTMLIdentifoFormForgotElement>;
            "identifo-form-forgot-success": LocalJSX.IdentifoFormForgotSuccess & JSXBase.HTMLAttributes<HTMLIdentifoFormForgotSuccessElement>;
            "identifo-form-goback": LocalJSX.IdentifoFormGoback & JSXBase.HTMLAttributes<HTMLIdentifoFormGobackElement>;
            "identifo-form-login": LocalJSX.IdentifoFormLogin & JSXBase.HTMLAttributes<HTMLIdentifoFormLoginElement>;
            "identifo-form-login-phone": LocalJSX.IdentifoFormLoginPhone & JSXBase.HTMLAttributes<HTMLIdentifoFormLoginPhoneElement>;
            "identifo-form-login-phone-verify": LocalJSX.IdentifoFormLoginPhoneVerify & JSXBase.HTMLAttributes<HTMLIdentifoFormLoginPhoneVerifyElement>;
            "identifo-form-login-ways": LocalJSX.IdentifoFormLoginWays & JSXBase.HTMLAttributes<HTMLIdentifoFormLoginWaysElement>;
            "identifo-form-password-reset": LocalJSX.IdentifoFormPasswordReset & JSXBase.HTMLAttributes<HTMLIdentifoFormPasswordResetElement>;
            "identifo-form-register": LocalJSX.IdentifoFormRegister & JSXBase.HTMLAttributes<HTMLIdentifoFormRegisterElement>;
            "identifo-form-tfa-select": LocalJSX.IdentifoFormTfaSelect & JSXBase.HTMLAttributes<HTMLIdentifoFormTfaSelectElement>;
            "identifo-form-tfa-setup": LocalJSX.IdentifoFormTfaSetup & JSXBase.HTMLAttributes<HTMLIdentifoFormTfaSetupElement>;
            "identifo-form-tfa-setup-app": LocalJSX.IdentifoFormTfaSetupApp & JSXBase.HTMLAttributes<HTMLIdentifoFormTfaSetupAppElement>;
            "identifo-form-tfa-setup-email": LocalJSX.IdentifoFormTfaSetupEmail & JSXBase.HTMLAttributes<HTMLIdentifoFormTfaSetupEmailElement>;
            "identifo-form-tfa-setup-sms": LocalJSX.IdentifoFormTfaSetupSms & JSXBase.HTMLAttributes<HTMLIdentifoFormTfaSetupSmsElement>;
            "identifo-form-tfa-verify": LocalJSX.IdentifoFormTfaVerify & JSXBase.HTMLAttributes<HTMLIdentifoFormTfaVerifyElement>;
        }
    }
}
