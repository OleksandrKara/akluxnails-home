/**
 * GA4 loader that keeps an ad visitor counted as an ad visitor (owner request 2026-10-19).
 *
 * gtag.js reads the page address when it runs, not when the page opened. Loading it late (for
 * PageSpeed) meant a visitor from an ad who moved to another page first was recorded without
 * their gclid/UTM: GA4 called the session "Direct" and Google Ads never got its click cookie, so
 * a later booking or text didn't count for the ad. This inline <head> script fixes that:
 * - the landing address and referrer are captured in the first milliseconds and the first
 *   page_view is sent with them, whenever gtag.js actually loads;
 * - a visitor arriving with an ad click id or UTM gets the tags right away (PageSpeed runs carry
 *   no such parameters, so lab scores are unaffected);
 * - a gclid is written to the Google Ads click cookie (_gcl_aw) at once, in case the page
 *   changes before gtag.js does it itself.
 * Everyone else: loaded on first interaction or once the page is idle after load, as before.
 */
export function googleTagsLoader(opts: { ga4Id: string; adsId?: string; gtmId?: string; fallbackMs?: number }): string {
  const { ga4Id, adsId, gtmId, fallbackMs } = opts;
  return `window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
(function(){
var L=location.href,R=document.referrer,q=location.search,done=false;
var AD=/[?&](gclid|gbraid|wbraid|gad_source|gad_campaignid|dclid|msclkid|fbclid|ttclid|utm_source|utm_medium|utm_campaign)=/i.test(q);
try{var g=q.match(/[?&]gclid=([^&#]+)/);if(g&&document.cookie.indexOf('_gcl_aw=')<0){var h=location.hostname.split('.').slice(-2).join('.');
document.cookie='_gcl_aw=GCL.'+Math.round(Date.now()/1000)+'.'+g[1]+';max-age=7776000;path=/;domain=.'+h+';SameSite=Lax';}}catch(e){}
gtag('js',new Date());
gtag('config','${ga4Id}',{send_page_view:false});
gtag('event','page_view',{send_to:'${ga4Id}',page_location:L,page_referrer:R});
${adsId ? `gtag('config','${adsId}',{page_location:L,page_referrer:R});\n` : ""}${gtmId ? `dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'});\n` : ""}var ev=['pointerdown','touchstart','scroll','mousemove','keydown','wheel'];
function add(src){var s=document.createElement('script');s.async=true;s.src=src;document.head.appendChild(s);}
function go(){if(done)return;done=true;ev.forEach(function(e){removeEventListener(e,go,{passive:true});});
if(location.href!==L)gtag('event','page_view',{send_to:'${ga4Id}'});
add('https://www.googletagmanager.com/gtag/js?id=${ga4Id}');
${gtmId ? `add('https://www.googletagmanager.com/gtm.js?id=${gtmId}');` : ""}}
if(AD){go();return;}
ev.forEach(function(e){addEventListener(e,go,{passive:true});});
function later(){${fallbackMs ? `setTimeout(go,${fallbackMs})` : `(window.requestIdleCallback||setTimeout)(go)`};}
if(document.readyState==='complete')later();else addEventListener('load',later);})();`;
}

export default function GoogleTagsHead({ ga4Id }: { ga4Id: string }) {
  return <script id="google-tags" dangerouslySetInnerHTML={{ __html: googleTagsLoader({ ga4Id }) }} />;
}
