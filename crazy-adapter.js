/* CrazyGames HTML5 SDK v3; standalone fallback, no ads. */
(()=>{'use strict';let desired=false,reported=false,ready=false,loaded=false,muted=false,sdk;
function call(name){try{sdk.game[name]();return true;}catch(e){return false;}}
function sync(){if(ready&&desired!==reported&&call(desired?'gameplayStart':'gameplayStop'))reported=desired;}
function settings(v){muted=Boolean(v?.muteAudio);window.dispatchEvent(new Event('nsd-platform-audio'));}
window.NSDPlatform={start(){desired=true;sync();},stop(){desired=false;sync();},loaded(){loaded=true;if(ready)call('loadingStop');},get ready(){return ready;},get muted(){return muted;}};
async function init(){try{sdk=window.CrazyGames.SDK;await sdk.init();if(sdk.environment==='disabled')return;ready=true;if(!loaded)call('loadingStart');settings(sdk.game.settings);sdk.game.addSettingsChangeListener?.(settings);sync();}catch(e){/* standalone fallback */}}
if(window.CrazyGames?.SDK)init();else if(/crazygames/i.test(location.hostname+' '+document.referrer)||window.parent!==window||['localhost','127.0.0.1'].includes(location.hostname)||new URLSearchParams(location.search).has('useLocalSdk')){const s=document.createElement('script');s.src='https://sdk.crazygames.com/crazygames-sdk-v3.js';s.onload=init;document.head.append(s);}
})();
