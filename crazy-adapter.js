// Optional SDK bridge. No external SDK loaded in the standalone build.
(()=>{let active=false;function game(){return window.CrazyGames?.SDK?.game;}window.NSDPlatform={start(){if(active)return;active=true;try{game()?.gameplayStart();}catch(e){}},stop(){if(!active)return;active=false;try{game()?.gameplayStop();}catch(e){}}};})();
