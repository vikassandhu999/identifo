/*! For license information please see 4.257a8f2c.chunk.js.LICENSE.txt */
(this.webpackJsonpidentifo_project=this.webpackJsonpidentifo_project||[]).push([[4],{53:function(t,e,r){"use strict";r.r(e),r.d(e,"scopeCss",(function(){return B}));var n=r(26),c="-shadowcsshost",o="-shadowcssslotted",s="-shadowcsscontext",a=")(?:\\(((?:\\([^)(]*\\)|[^)(]*)+?)\\))?([^,{]*)",i=new RegExp("(-shadowcsshost"+a,"gim"),u=new RegExp("(-shadowcsscontext"+a,"gim"),l=new RegExp("(-shadowcssslotted"+a,"gim"),h="-shadowcsshost-no-combinator",p=/-shadowcsshost-no-combinator([^\s]*)/,f=[/::shadow/g,/::content/g],g=/-shadowcsshost/gim,d=/:host/gim,v=/::slotted/gim,m=/:host-context/gim,x=/\/\*\s*[\s\S]*?\*\//g,w=/\/\*\s*#\s*source(Mapping)?URL=[\s\S]+?\*\//g,_=/(\s*)([^;\{\}]+?)(\s*)((?:{%BLOCK%}?\s*;?)|(?:\s*;))/g,b=/([{}])/g,S="%BLOCK%",O=function(t,e){var r=j(t),n=0;return r.escapedString.replace(_,(function(){var t=arguments.length<=2?void 0:arguments[2],c="",o=arguments.length<=4?void 0:arguments[4],s="";o&&o.startsWith("{%BLOCK%")&&(c=r.blocks[n++],o=o.substring(S.length+1),s="{");var a={selector:t,content:c},i=e(a);return"".concat(arguments.length<=1?void 0:arguments[1]).concat(i.selector).concat(arguments.length<=3?void 0:arguments[3]).concat(s).concat(i.content).concat(o)}))},j=function(t){for(var e=t.split(b),r=[],n=[],c=0,o=[],s=0;s<e.length;s++){var a=e[s];"}"===a&&c--,c>0?o.push(a):(o.length>0&&(n.push(o.join("")),r.push(S),o=[]),r.push(a)),"{"===a&&c++}return o.length>0&&(n.push(o.join("")),r.push(S)),{escapedString:r.join(""),blocks:n}},W=function(t,e,r){return t.replace(e,(function(){for(var t=arguments.length,e=new Array(t),n=0;n<t;n++)e[n]=arguments[n];if(e[2]){for(var c=e[2].split(","),o=[],s=0;s<c.length;s++){var a=c[s].trim();if(!a)break;o.push(r(h,a,e[3]))}return o.join(",")}return h+e[3]}))},k=function(t,e,r){return t+e.replace(c,"")+r},E=function(t,e,r){return e.indexOf(c)>-1?k(t,e,r):t+e+r+", "+e+" "+t+r},R=function(t,e){return!function(t){return t=t.replace(/\[/g,"\\[").replace(/\]/g,"\\]"),new RegExp("^("+t+")([>\\s~+[.,{:][\\s\\S]*)?$","m")}(e).test(t)},C=function(t,e,r){for(var n,c="."+(e=e.replace(/\[is=([^\]]*)\]/g,(function(t){return arguments.length<=1?void 0:arguments[1]}))),o=function(t){var n=t.trim();if(!n)return"";if(t.indexOf(h)>-1)n=function(t,e,r){if(g.lastIndex=0,g.test(t)){var n=".".concat(r);return t.replace(p,(function(t,e){return e.replace(/([^:]*)(:*)(.*)/,(function(t,e,r,c){return e+n+r+c}))})).replace(g,n+" ")}return e+" "+t}(t,e,r);else{var o=t.replace(g,"");if(o.length>0){var s=o.match(/([^:]*)(:*)(.*)/);s&&(n=s[1]+c+s[2]+s[3])}}return n},s=function(t){var e=[],r=0;return{content:(t=t.replace(/(\[[^\]]*\])/g,(function(t,n){var c="__ph-".concat(r,"__");return e.push(n),r++,c}))).replace(/(:nth-[-\w]+)(\([^)]+\))/g,(function(t,n,c){var o="__ph-".concat(r,"__");return e.push(c),r++,n+o})),placeholders:e}}(t),a="",i=0,u=/( |>|\+|~(?!=))\s*/g,l=!((t=s.content).indexOf(h)>-1);null!==(n=u.exec(t));){var f=n[1],d=t.slice(i,n.index).trim(),v=(l=l||d.indexOf(h)>-1)?o(d):d;a+="".concat(v," ").concat(f," "),i=u.lastIndex}var m,x=t.substring(i);return a+=(l=l||x.indexOf(h)>-1)?o(x):x,m=s.placeholders,a.replace(/__ph-(\d+)__/g,(function(t,e){return m[+e]}))},L=function t(e,r,n,c,o){return O(e,(function(e){var o=e.selector,s=e.content;return"@"!==e.selector[0]?o=function(t,e,r,n){return t.split(",").map((function(t){return n&&t.indexOf("."+n)>-1?t.trim():R(t,e)?C(t,e,r).trim():t.trim()})).join(", ")}(e.selector,r,n,c):(e.selector.startsWith("@media")||e.selector.startsWith("@supports")||e.selector.startsWith("@page")||e.selector.startsWith("@document"))&&(s=t(e.content,r,n,c)),{selector:o.replace(/\s{2,}/g," ").trim(),content:s}}))},T=function(t,e,r,n,a){var p=function(t,e){var r="."+e+" > ",n=[];return t=t.replace(l,(function(){for(var t=arguments.length,e=new Array(t),c=0;c<t;c++)e[c]=arguments[c];if(e[2]){for(var o=e[2].trim(),s=e[3],a=r+o+s,i="",u=e[4]-1;u>=0;u--){var l=e[5][u];if("}"===l||","===l)break;i=l+i}var p=i+a,f="".concat(i.trimRight()).concat(a.trim());if(p.trim()!==f.trim()){var g="".concat(f,", ").concat(p);n.push({orgSelector:p,updatedSelector:g})}return a}return h+e[3]})),{selectors:n,cssText:t}}(t=function(t){return W(t,u,E)}(t=function(t){return W(t,i,k)}(t=t.replace(m,s).replace(d,c).replace(v,o))),n);return t=function(t){return f.reduce((function(t,e){return t.replace(e," ")}),t)}(t=p.cssText),e&&(t=L(t,e,r,n)),{cssText:(t=(t=t.replace(/-shadowcsshost-no-combinator/g,".".concat(r))).replace(/>\s*\*\s+([^{, ]+)/gm," $1 ")).trim(),slottedSelectors:p.selectors}},B=function(t,e,r){var c=e+"-h",o=e+"-s",s=t.match(w)||[];t=function(t){return t.replace(x,"")}(t);var a=[];if(r){var i=function(t){var e="/*!@___".concat(a.length,"___*/"),r="/*!@".concat(t.selector,"*/");return a.push({placeholder:e,comment:r}),t.selector=e+t.selector,t};t=O(t,(function(t){return"@"!==t.selector[0]?i(t):t.selector.startsWith("@media")||t.selector.startsWith("@supports")||t.selector.startsWith("@page")||t.selector.startsWith("@document")?(t.content=O(t.content,i),t):t}))}var u=T(t,e,c,o);return t=[u.cssText].concat(Object(n.a)(s)).join("\n"),r&&a.forEach((function(e){var r=e.placeholder,n=e.comment;t=t.replace(r,n)})),u.slottedSelectors.forEach((function(e){t=t.replace(e.orgSelector,e.updatedSelector)})),t}}}]);
//# sourceMappingURL=4.257a8f2c.chunk.js.map