import{p as promiseResolve,b as bootstrapLazy}from"./index-b085f682.js";var patchBrowser=function(){var r=import.meta.url;var e={};if(r!==""){e.resourcesUrl=new URL(".",r).href}return promiseResolve(e)};patchBrowser().then((function(r){return bootstrapLazy([["identifo-form",[[1,"identifo-form",{route:[1537],token:[1],appId:[513,"app-id"],url:[513],theme:[1],scopes:[1],callbackUrl:[1,"callback-url"],federatedRedirectUrl:[1,"federated-redirect-url"],postLogoutRedirectUri:[1,"post-logout-redirect-uri"],debug:[4],auth:[32],username:[32],password:[32],phone:[32],email:[32],registrationForbidden:[32],tfaCode:[32],tfaType:[32],federatedProviders:[32],tfaMandatory:[32],provisioningURI:[32],provisioningQR:[32],success:[32],lastError:[32],lastResponse:[32]}]]]],r)}));