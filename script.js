(() => {
  'use strict';

  const W = 480;
  const H = 800;
  const TAU = Math.PI * 2;
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d', { alpha: false });
  ctx.imageSmoothingEnabled = false;
  window.__nsdError = null;
  window.addEventListener('error', (event) => {
    window.__nsdError = (event.message || 'erro') + ' @ ' + (event.filename || '') + ':' + (event.lineno || 0);
  });
  window.addEventListener('unhandledrejection', (event) => {
    window.__nsdError = 'promise: ' + String(event.reason);
  });

  const $ = (id) => document.getElementById(id);
  const shell = $('shell');
  const dom = {
    hud: $('hud'),
    score: $('score'),
    wave: $('wave'),
    lives: $('lives'),
    pauseBtn: $('pauseBtn'),
    hudSoundBtn: $('hudSoundBtn'),
    powerups: $('powerups'),
    bossbar: $('bossbar'),
    bossHp: $('bossHp'),
    bossHpText: $('bossHpText'),
    banner: $('banner'),
    bannerTitle: $('bannerTitle'),
    bannerSub: $('bannerSub'),
    menuScreen: $('menuScreen'),
    howtoScreen: $('howtoScreen'),
    recordsScreen: $('recordsScreen'),
    pauseScreen: $('pauseScreen'),
    gameoverScreen: $('gameoverScreen'),
    menuBest: $('menuBest'),
    playBtn: $('playBtn'),
    howtoBtn: $('howtoBtn'),
    recordsBtn: $('recordsBtn'),
    howtoBackBtn: $('howtoBackBtn'),
    recordsBackBtn: $('recordsBackBtn'),
    recordsList: $('recordsList'),
    soundBtn: $('soundBtn'),
    pauseSoundBtn: $('pauseSoundBtn'),
    resumeBtn: $('resumeBtn'),
    restartBtn: $('restartBtn'),
    pauseMenuBtn: $('pauseMenuBtn'),
    finalScore: $('finalScore'),
    recordNotice: $('recordNotice'),
    retryBtn: $('retryBtn'),
    gameoverMenuBtn: $('gameoverMenuBtn')
  };
  const screens = [dom.menuScreen, dom.howtoScreen, dom.recordsScreen, dom.pauseScreen, dom.gameoverScreen, $('hangarScreen'), $('achScreen'), $('missionScreen'), $('platinumScreen')];

  const fleet = [{name:'VANGUARD',cost:0,desc:'Balanced fighter',speed:345,rate:0.145,damage:1,tint:'#3df6ff'},{name:'PHANTOM',cost:60,desc:'Fast interceptor • rapid fire',speed:440,rate:0.105,damage:1,tint:'#ff68db'},{name:'TITAN',cost:140,desc:'Heavy fighter • double damage',speed:285,rate:0.19,damage:2,tint:'#ffbd55'}];
  fleet.push({name:'NOVA',cost:220,desc:'Twin plasma cannons',speed:360,rate:.17,damage:1,tint:'#78ffb8'},{name:'ECLIPSE',cost:340,desc:'Triple spread cannon',speed:330,rate:.22,damage:1,tint:'#a99aff'},{name:'SOLARIS',cost:500,desc:'Heavy twin pulse',speed:300,rate:.24,damage:2,tint:'#ff8055'});
  const profileKey = 'neonstar.profile.v3';
  let profile = {credits:0,owned:[0],selected:0};
  try { const v=JSON.parse(localStorage.getItem(profileKey)); if(v && Number.isFinite(v.credits) && Array.isArray(v.owned)) { profile={credits:Math.max(0,Math.floor(v.credits)),owned:[0,...v.owned.filter(i=>Number.isInteger(i)&&i>0&&i<fleet.length)],selected:0}; if(profile.owned.includes(v.selected)) profile.selected=v.selected; } } catch(e){}
  function saveProfile(){try{localStorage.setItem(profileKey,JSON.stringify(profile));}catch(e){}}
  function earn(n){profile.credits+=n;saveProfile();}
  function hangar(){state.mode='hangar';showScreen($('hangarScreen'));$('credits').textContent=profile.credits+tr(' CREDITS • Earn credits by defeating enemies',' CRÉDITOS • Ganhe créditos derrotando inimigos');const list=$('shipList');list.replaceChildren();fleet.forEach((ship,i)=>{const card=document.createElement('div');card.className='info-card ship-card';const title=document.createElement('h3');title.textContent=ship.name;title.style.color=ship.tint;const desc=document.createElement('p');desc.textContent=tr(ship.desc,['Caça equilibrado','Interceptador veloz • tiro rápido','Caça pesado • dano duplo','Canhões duplos de plasma','Canhão triplo disperso','Pulso duplo pesado'][i]);const b=document.createElement('button');b.className='btn btn-small';b.textContent=profile.selected===i?tr('EQUIPPED','EQUIPADA'):profile.owned.includes(i)?tr('EQUIP','EQUIPAR'):tr('UNLOCK','DESBLOQUEAR')+' • '+ship.cost;b.disabled=profile.selected===i||(!profile.owned.includes(i)&&profile.credits<ship.cost);b.onclick=()=>{if(!profile.owned.includes(i)){if(profile.credits<ship.cost)return;profile.credits-=ship.cost;profile.owned.push(i);}profile.selected=i;saveProfile();hangar();};const preview=document.createElement('canvas');preview.width=96;preview.height=96;preview.className='ship-preview';const pc=preview.getContext('2d');pc.imageSmoothingEnabled=false;pc.drawImage(shipArt[i].canvas,12,12,72,72);const up=document.createElement('button');up.className='btn btn-small';const level=premium.levels[i],price=80*(level+1);up.textContent=level===3?tr('MAX LEVEL','NÍVEL MÁXIMO'):tr('UPGRADE','EVOLUIR')+' '+(level+1)+' · '+price+' CR';up.disabled=level===3||!profile.owned.includes(i)||profile.credits<price;up.onclick=()=>{if(up.disabled)return;profile.credits-=price;premium.levels[i]++;saveProfile();savePremium();hangar();};card.append(preview,title,desc,b,up);list.append(card);});}
  $('hangarBtn').onclick=hangar; $('hangarBack').onclick=()=>goMenu();
  let progress={kills:0,bosses:0,wave:0};try{Object.assign(progress,JSON.parse(localStorage.getItem('nsd31.progress')||'{}'));}catch(e){}
  function saveProgress(){try{localStorage.setItem('nsd31.progress',JSON.stringify(progress));}catch(e){}}
  $('achBtn').onclick=()=>{state.mode='achievements';showScreen($('achScreen'));const list=$('achList');list.replaceChildren();for(const [name,key,steps] of [['Enemy hunter','kills',[10,25,50,100,200,350,500,750,1000,2000]],['Boss breaker','bosses',[1,2,3,5,8,10,15,20,30,50]],['Explorer','wave',[2,3,5,8,10,15,20,25,30,50]]])for(const n of steps){const d=document.createElement('div');d.className='info-card';d.textContent=(progress[key]>=n?'✓ ':'○ ')+tr(name,{'Enemy hunter':'Caçador de inimigos','Boss breaker':'Destruidor de chefes','Explorer':'Explorador'}[name])+' '+n+' — '+Math.min(progress[key],n)+'/'+n;list.append(d);}};
  $('achBack').onclick=()=>goMenu();
  const sectors=['ORION GATE','CRIMSON RIFT','FROZEN NEBULA','VOID FRONTIER'];
  let combo=0,comboTime=0,runCredits=0,musicClock=0,musicStep=0;
  function updateRunStats(){const t=$('runStats');const label='×'+(1+Math.min(4,Math.floor(combo/4)))+' COMBO  •  +'+runCredits+' CR  •  '+sectors[Math.floor((state.wave-1)/5)%4];if(t.textContent!==label)t.textContent=label;}
  const premiumKey='nsd32.premium';
  let premium={levels:[0,0,0,0,0,0],claimed:[],lang:'en'};
  try {const q=JSON.parse(localStorage.getItem(premiumKey)||'{}');if(Array.isArray(q.levels))premium.levels=premium.levels.map((_,i)=>Math.max(0,Math.min(3,Math.floor(Number(q.levels[i])||0))));if(Array.isArray(q.claimed))premium.claimed=q.claimed.filter(x=>typeof x==='string');if(q.lang==='pt')premium.lang='pt';}catch(e){}
  function savePremium(){try{localStorage.setItem(premiumKey,JSON.stringify(premium));}catch(e){}}
  const tr=(en,pt)=>premium.lang==='pt'?pt:en;
  const words={'AUDIO':'ÁUDIO','PLAY':'JOGAR','HANGAR':'HANGAR','HOW TO PLAY':'COMO JOGAR','ACHIEVEMENTS':'CONQUISTAS','HIGH SCORES':'RECORDES','MISSIONS':'MISSÕES','TRAINING':'TREINO','BACK':'VOLTAR','DIFFICULTY':'DIFICULDADE','EASY':'FÁCIL','NORMAL':'NORMAL','HARD':'DIFÍCIL','SCORE':'PONTOS','WAVE':'ONDA','PAUSED':'PAUSADO','RESUME':'CONTINUAR','RESTART':'REINICIAR','MENU':'MENU','GAME OVER':'FIM DE JOGO','PLAY AGAIN':'JOGAR NOVAMENTE','BACK TO MENU':'VOLTAR AO MENU','FINAL SCORE':'PONTUAÇÃO FINAL','MOTHERSHIP':'NAVE-MÃE','Break the blockade. Defend the galaxy.':'Rompa o bloqueio. Defenda a galáxia.','HIGH SCORE':'RECORDE','SOUND: ON':'SOM: LIGADO','SOUND: OFF':'SOM: DESLIGADO'};
  Object.assign(words, {'PILOT HQ':'CENTRAL DO PILOTO','30 career milestones':'30 marcos de carreira','The battle is waiting for you.':'A batalha espera por você.','SIGNAL LOST':'SINAL PERDIDO','DESKTOP':'COMPUTADOR','MOBILE':'CELULAR','ENEMIES':'INIMIGOS','TEMPORARY POWER-UPS':'PODERES TEMPORÁRIOS','BOSSES':'CHEFES','The top five pilots on this browser.':'Os cinco melhores pilotos deste navegador.','The top 5 scores are saved in this browser.':'Os cinco melhores recordes são salvos neste navegador.'});
  const platinumKey='nsd33.platinum';
  let platinum={owned:['standard'],weapon:'standard',daily:'',runs:0,seconds:0,quality:'auto'};
  try {const q=JSON.parse(localStorage.getItem(platinumKey)||'{}');if(Array.isArray(q.owned))platinum.owned=['standard',...q.owned.filter(x=>['rail','storm'].includes(x))];if(platinum.owned.includes(q.weapon))platinum.weapon=q.weapon;if(typeof q.daily==='string')platinum.daily=q.daily;for(const k of ['runs','seconds'])if(Number.isFinite(q[k]))platinum[k]=Math.max(0,q[k]);if(q.quality==='low')platinum.quality='low';}catch(e){}
  function savePlatinum(){try{localStorage.setItem(platinumKey,JSON.stringify(platinum));}catch(e){}}
  function pilotHQ(){state.mode='platinum';showScreen($('platinumScreen'));const list=$('platinumList');list.replaceChildren();function card(title,body,action,fn,disabled=false){const d=document.createElement('div');d.className='info-card';const h=document.createElement('h3');h.textContent=title;const p=document.createElement('p');p.textContent=body;d.append(h,p);if(action){const b=document.createElement('button');b.className='btn btn-small';b.textContent=action;b.disabled=disabled;b.onclick=fn;d.append(b);}list.append(d);}
  const now=new Date(),day=now.getFullYear()+'-'+(now.getMonth()+1)+'-'+now.getDate();card(tr('Daily supply','Suprimento diário'),tr('40 credits once per local day','40 créditos por dia local'),platinum.daily===day?tr('CLAIMED','RESGATADO'):tr('CLAIM','RESGATAR'),()=>{if(platinum.daily===day)return;platinum.daily=day;savePlatinum();earn(40);pilotHQ();},platinum.daily===day);
  card(tr('Career statistics','Estatísticas de carreira'),`${tr('Runs','Partidas')}: ${platinum.runs} · ${tr('Minutes','Minutos')}: ${Math.floor(platinum.seconds/60)} · ${tr('Kills','Abates')}: ${progress.kills} · ${tr('Bosses','Chefes')}: ${progress.bosses} · ${tr('Wave','Onda')}: ${progress.wave}`);
  card(tr('Medals','Medalhas'),[5,15,30,50].map((n,i)=>(progress.wave>=n?'★':'☆')+' '+tr(['Bronze','Silver','Gold','Platinum'][i],['Bronze','Prata','Ouro','Platina'][i])+' '+n).join(' · '));
  for(const [id,cost,en,pt,desc,descpt] of [['standard',0,'Standard','Padrão','Original ship weapon','Arma original da nave'],['rail',180,'Rail cannon','Canhão magnético','Focused high damage','Dano concentrado'],['storm',260,'Storm cannon','Canhão tempestade','Five parallel shots','Cinco tiros paralelos']]){const owned=platinum.owned.includes(id);card(tr(en,pt),tr(desc,descpt),platinum.weapon===id?tr('EQUIPPED','EQUIPADO'):owned?tr('EQUIP','EQUIPAR'):tr('UNLOCK','DESBLOQUEAR')+' '+cost+' CR',()=>{if(!owned){if(profile.credits<cost)return;profile.credits-=cost;platinum.owned.push(id);saveProfile();}platinum.weapon=id;savePlatinum();pilotHQ();},platinum.weapon===id||(!owned&&profile.credits<cost));}
  card(tr('Graphics','Gráficos'),platinum.quality==='low'?tr('Reduced effects','Efeitos reduzidos'):tr('Full effects','Efeitos completos'),tr('SWITCH','ALTERNAR'),()=>{platinum.quality=platinum.quality==='low'?'auto':'low';savePlatinum();pilotHQ();});translateUI();}
  $('platinumBtn').onclick=pilotHQ;$('platinumBack').onclick=()=>goMenu();
  const originals=new Map();
  function translateUI(){document.documentElement.lang=premium.lang==='pt'?'pt-BR':'en';for(const el of document.querySelectorAll('button,h2,h3,option,[data-i18n],.stat-label,.tagline,.best-badge span,.bossbar-label span,.final-score span,.screen-sub,.small-note,.kicker')){if(!originals.has(el)&&words[el.textContent.trim()])originals.set(el,el.textContent.trim());if(originals.has(el)&&!['soundBtn','pauseSoundBtn'].includes(el.id))el.textContent=tr(originals.get(el),words[originals.get(el)]);}$('langBtn').textContent=tr('PT-BR','EN');}
  $('langBtn').onclick=()=>{premium.lang=tr('pt','en');savePremium();translateUI();updateSoundUI();};
  const missions=[['hunter','kills',50,35,'Destroy 50 enemies','Destrua 50 inimigos'],['boss','bosses',3,70,'Defeat 3 bosses','Derrote 3 chefes'],['frontier','wave',15,100,'Reach wave 15','Chegue à onda 15'],['elite','wave',30,180,'Reach wave 30','Chegue à onda 30']];
  function missionMenu(){state.mode='missions';showScreen($('missionScreen'));const list=$('missionList');list.replaceChildren();for(const [id,key,target,reward,en,pt] of missions){const d=document.createElement('div');d.className='info-card';const title=document.createElement('h3');title.textContent=tr(en,pt);const p=document.createElement('p');p.textContent=Math.min(progress[key],target)+' / '+target+' · '+reward+' CR';const b=document.createElement('button');b.className='btn btn-small';b.textContent=premium.claimed.includes(id)?tr('CLAIMED','RESGATADO'):tr('CLAIM','RESGATAR');b.disabled=progress[key]<target||premium.claimed.includes(id);b.onclick=()=>{if(b.disabled||premium.claimed.includes(id))return;premium.claimed.push(id);savePremium();earn(reward);missionMenu();};d.append(title,p,b);list.append(d);}translateUI();}
  $('missionBtn').onclick=missionMenu;$('missionBack').onclick=()=>goMenu();
  let abilityCooldown=0,training=false,trainingStep=0,trainingOrigin=null,trainingClock=0;
  function pulse(){if(state.mode!=='playing'||!state.player||abilityCooldown>0||state.pendingOver>0)return;abilityCooldown=18;state.enemyBullets.length=0;for(const e of state.enemies)if(!e.dead)killEnemy(e);if(state.boss&&!state.boss.dead)damageBoss(state.boss,12+premium.levels[profile.selected]*4);addRing(state.player.x,state.player.y,'#70ffff',650,.65);Sound.pulse();if(training&&trainingStep===2)trainingStep=3;}
  $('abilityBtn').onclick=pulse;
  $('trainingBtn').onclick=()=>{startGame();training=true;trainingStep=0;trainingClock=0;trainingOrigin={x:state.player.x,y:state.player.y};state.power.shield=999;};
  function premiumTick(dt){abilityCooldown=Math.max(0,abilityCooldown-dt);const b=$('abilityBtn');const label=abilityCooldown>0?tr('PULSE','PULSO')+' · '+Math.ceil(abilityCooldown)+'s':tr('PULSE · READY','PULSO · PRONTO');if(b.textContent!==label)b.textContent=label;b.disabled=abilityCooldown>0;const hint=$('trainingHint');hint.classList.toggle('hidden',!training);if(!training)return;trainingClock+=dt;if(trainingStep===0&&Math.hypot(state.player.x-trainingOrigin.x,state.player.y-trainingOrigin.y)>45)trainingStep=1;if(trainingStep===1&&state.bullets.length>0)trainingStep=2;if(trainingStep===3){training=false;state.power.shield=8;hint.classList.add('hidden');showBanner(tr('TRAINING COMPLETE','TREINO CONCLUÍDO'),tr('Keep fighting!','Continue lutando!'));return;}hint.textContent=[tr('1 · Move your ship','1 · Mova sua nave'),tr('2 · Fire (Space / touch)','2 · Atire (Espaço / toque)'),tr('3 · Activate PULSE (Q or button)','3 · Ative PULSO (Q ou botão)')][trainingStep];}
  function layoutView() {
    const width = shell.clientWidth || 360;
    shell.style.setProperty('--u', (width / W).toFixed(4) + 'px');
  }
  if (window.ResizeObserver) new ResizeObserver(layoutView).observe(shell);
  window.addEventListener('resize', layoutView, { passive: true });
  window.addEventListener('orientationchange', () => setTimeout(layoutView, 160));
  layoutView();

  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const rand = (a, b) => a + Math.random() * (b - a);
  const irand = (a, b) => Math.floor(rand(a, b + 1));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const chance = (p) => Math.random() < p;
  const padScore = (n) => String(Math.max(0, Math.floor(n))).padStart(6, '0');

  function showScreen(target) {
    for (const screen of screens) {
      if (screen) screen.classList.toggle('hidden', screen !== target);
    }
  }

  function setHudVisible(visible) {
    dom.hud.classList.toggle('hidden', !visible);
  }

  const SCORE_KEY = 'neonstar.records.v1';
  const MUTE_KEY = 'neonstar.muted.v1';
  let memoryRecords = [];

  function readRecords() {
    try {
      const raw = localStorage.getItem(SCORE_KEY);
      if (!raw) return memoryRecords.slice();
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter((item) => item && Number.isFinite(Number(item.score)))
        .map((item) => ({
          score: Math.max(0, Math.floor(Number(item.score))),
          date: typeof item.date === 'string' ? item.date : ''
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
    } catch (error) {
      return memoryRecords.slice();
    }
  }

  function writeRecords(list) {
    memoryRecords = list.slice(0, 5);
    try {
      localStorage.setItem(SCORE_KEY, JSON.stringify(memoryRecords));
    } catch (error) {
      /* memória local continua valendo nesta sessão */
    }
  }

  function addRecord(score) {
    if (!Number.isFinite(score) || score <= 0) return 0;
    const entry = { score: Math.floor(score), date: new Date().toISOString() };
    const list = readRecords();
    list.push(entry);
    list.sort((a, b) => b.score - a.score);
    const position = list.indexOf(entry);
    writeRecords(list.slice(0, 5));
    return position >= 0 && position < 5 ? position + 1 : 0;
  }

  function bestScore() {
    const list = readRecords();
    return list.length ? list[0].score : 0;
  }

  function formatDate(iso) {
    if (!iso) return '';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US');
  }

  function refreshMenuBest() {
    dom.menuBest.textContent = padScore(bestScore());
  }

  function renderRecords() {
    const list = readRecords();
    dom.recordsList.innerHTML = '';
    if (!list.length) {
      const empty = document.createElement('li');
      empty.className = 'empty-records';
      empty.innerHTML = '<span class="big">···</span><span>No high scores yet.<br>Enter the arena and make your mark.</span>';
      dom.recordsList.appendChild(empty);
      return;
    }
    list.forEach((entry, index) => {
      const row = document.createElement('li');
      row.className = 'record-row' + (index === 0 ? ' top1' : '');
      const rank = document.createElement('span');
      rank.className = 'record-rank';
      rank.textContent = String(index + 1).padStart(2, '0');
      const meta = document.createElement('span');
      meta.className = 'record-meta';
      const label = document.createElement('span');
      label.className = 'record-label';
      label.textContent = index === 0 ? 'TOP PILOT' : 'PILOT';
      const date = document.createElement('span');
      date.className = 'record-date';
      date.textContent = formatDate(entry.date) || '—';
      meta.append(label, date);
      const score = document.createElement('span');
      score.className = 'record-score';
      score.textContent = padScore(entry.score);
      row.append(rank, meta, score);
      dom.recordsList.appendChild(row);
    });
  }

  const audioDefaults = {master:100,music:60,effects:85,alerts:75};
  const audioKey = 'nsd_audio_mix_v1';
  const mix = {...audioDefaults};
  try {const saved=JSON.parse(localStorage.getItem(audioKey)||'{}');for(const k of Object.keys(mix))if(Number.isFinite(saved[k]))mix[k]=Math.max(0,Math.min(100,saved[k]));}catch(e){}
  const audio = { ctx: null, master: null, muted: false, shotFlip: false, buses:{}, voices:0, noise:null };
  function applyMix(){if(!audio.master)return;const t=audio.ctx.currentTime;audio.master.gain.setTargetAtTime(audio.muted?0:mix.master/100,t,.015);for(const k of ['music','effects','alerts'])audio.buses[k].gain.setTargetAtTime(mix[k]/100,t,.015);}
  function saveMix(){try{localStorage.setItem(audioKey,JSON.stringify(mix));}catch(e){}applyMix();}
  try {
    audio.muted = localStorage.getItem(MUTE_KEY) === '1';
  } catch (error) {
    audio.muted = false;
  }

  function ensureAudio() {
    if (!audio.ctx) {
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtor) return;
      try {
        audio.ctx = new AudioCtor();
        audio.master = audio.ctx.createGain();
        audio.master.gain.value = audio.muted?0:mix.master/100;
        const compressor=audio.ctx.createDynamicsCompressor();compressor.threshold.value=-12;compressor.knee.value=12;compressor.ratio.value=12;compressor.attack.value=.003;compressor.release.value=.12;
        audio.master.connect(compressor);compressor.connect(audio.ctx.destination);
        for(const k of ['music','effects','alerts']){const bus=audio.ctx.createGain();bus.gain.value=mix[k]/100;bus.connect(audio.master);audio.buses[k]=bus;}
        audio.noise=audio.ctx.createBuffer(1,audio.ctx.sampleRate,audio.ctx.sampleRate);const samples=audio.noise.getChannelData(0);for(let i=0;i<samples.length;i++)samples[i]=Math.random()*2-1;
      } catch (error) {
        audio.ctx = null;
      }
    }
    if (audio.ctx && audio.ctx.state === 'suspended') audio.ctx.resume().catch(() => {});
  }

  function tone(freq, duration, options = {}) {
    if (audio.muted) return;
    ensureAudio();
    if (!audio.ctx || !audio.master || audio.voices>=48) return;
    const { type = 'square', volume = 0.05, slide = 0, delay = 0, endFreq = null, bus = 'effects' } = options;
    const start = audio.ctx.currentTime + delay;
    const osc = audio.ctx.createOscillator();
    const gain = audio.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(20, freq), start);
    const target = endFreq !== null ? endFreq : Math.max(20, freq + slide);
    if (target !== freq) osc.frequency.exponentialRampToValueAtTime(target, start + duration);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, Math.min(.42,volume*(bus==='music'?2.4:4.5))), start + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain);
    gain.connect(audio.buses[bus]);
    audio.voices++;osc.onended=()=>{audio.voices--;osc.disconnect();gain.disconnect();};
    osc.start(start);
    osc.stop(start + duration + 0.03);
  }

  function noiseBurst(duration, volume = .1, cutoff = 1400, delay = 0, bus='effects') {
    if(audio.muted)return;ensureAudio();if(!audio.ctx||!audio.noise||audio.voices>=48)return;
    const t=audio.ctx.currentTime+delay, source=audio.ctx.createBufferSource(), filter=audio.ctx.createBiquadFilter(), gain=audio.ctx.createGain();
    source.buffer=audio.noise;filter.type='lowpass';filter.frequency.value=cutoff;
    gain.gain.setValueAtTime(Math.min(.55,volume*4),t);gain.gain.exponentialRampToValueAtTime(.0001,t+duration);
    source.connect(filter);filter.connect(gain);gain.connect(audio.buses[bus]);audio.voices++;source.onended=()=>{audio.voices--;source.disconnect();filter.disconnect();gain.disconnect();};source.start(t,0,duration);
  }

  const Sound = {
    ui() { tone(620, 0.05, { type: 'square', volume: 0.028, slide: 180 }); },
    start() {
      tone(220, 0.12, { type: 'sawtooth', bus: 'alerts', volume: 0.04 });
      tone(330, 0.14, { type: 'square', bus: 'alerts', volume: 0.03, delay: 0.09 });
      tone(660, 0.18, { type: 'triangle', bus: 'alerts', volume: 0.04, delay: 0.18 });
    },
    waveStart() {
      tone(330, 0.1, { type: 'square', bus: 'alerts', volume: 0.03 });
      tone(495, 0.14, { type: 'square', bus: 'alerts', volume: 0.026, delay: 0.1 });
    },
    shoot(weapon='standard') {
      if(weapon==='rail'){tone(420,.14,{type:'sawtooth',volume:.065,endFreq:125});tone(1450,.055,{type:'triangle',volume:.035,endFreq:350});return;}
      if(weapon==='storm'){[0,.025,.05].forEach((delay,i)=>tone(740+i*220,.065,{type:'square',volume:.025,endFreq:360,delay}));return;}
      audio.shotFlip=!audio.shotFlip;tone(audio.shotFlip?1160:1000,.055,{type:'triangle',volume:.045,endFreq:560});
    },
    pulse(){tone(180,.35,{type:'sine',volume:.085,endFreq:1200});tone(1200,.42,{type:'triangle',volume:.06,endFreq:180,delay:.12});noiseBurst(.28,.065,3200,.12);},
    enemyShoot() { tone(300, 0.08, { type: 'sawtooth', volume: 0.016, endFreq: 180 }); },
    hit() {
      noiseBurst(0.07, 0.045, 2600);
      tone(190, 0.08, { type: 'square', volume: 0.025, endFreq: 120 });
    },
    explode() {
      noiseBurst(0.24, 0.1, 1100);
      tone(110, 0.22, { type: 'triangle', volume: 0.05, endFreq: 45 });
    },
    bigExplode() {
      noiseBurst(0.6, 0.16, 900);
      tone(80, 0.55, { type: 'sawtooth', volume: 0.06, endFreq: 30 });
    },
    playerHit() {
      noiseBurst(0.38, 0.16, 1300, 0, 'alerts');
      tone(220, 0.4, { type: 'sawtooth', bus: 'alerts', volume: 0.07, endFreq: 55 });
    },
    shieldBreak() {
      tone(740, 0.12, { type: 'triangle', bus: 'alerts', volume: 0.05, endFreq: 240 });
      noiseBurst(0.18, 0.06, 2800, 0, 'alerts');
    },
    pickup() {
      tone(523, 0.08, { type: 'square', bus: 'alerts', volume: 0.035 });
      tone(784, 0.09, { type: 'square', bus: 'alerts', volume: 0.032, delay: 0.075 });
      tone(1047, 0.14, { type: 'triangle', bus: 'alerts', volume: 0.04, delay: 0.15 });
    },
    waveClear() {
      [440, 554, 659, 880].forEach((f, i) => tone(f, 0.12, { type: 'triangle', bus: 'alerts', volume: 0.035, delay: i * 0.085 }));
    },
    alarm() {
      for (let i = 0; i < 3; i++) {
        tone(180, 0.18, { type: 'sawtooth', bus: 'alerts', volume: 0.04, delay: i * 0.36 });
        tone(140, 0.18, { type: 'square', bus: 'alerts', volume: 0.03, delay: i * 0.36 + 0.18 });
      }
    },
    bossSpawn() {
      tone(70, 0.9, { type: 'sawtooth', bus: 'alerts', volume: 0.06, endFreq: 120 });
      noiseBurst(0.9, 0.07, 600, 0, 'alerts');
    },
    bossCharge() { tone(130, 0.22, { type: 'square', bus: 'alerts', volume: 0.025, endFreq: 520 }); },
    bossShot() {
      tone(340, 0.16, { type: 'sawtooth', volume: 0.03, endFreq: 90 });
      noiseBurst(0.18, 0.05, 1800);
    },
    bossDown() {
      this.bigExplode();
      [330, 262, 196].forEach((f, i) => tone(f, 0.35, { type: 'triangle', bus: 'alerts', volume: 0.05, delay: 0.5 + i * 0.16 }));
    },
    gameOver() {
      [392, 330, 262, 196].forEach((f, i) => tone(f, 0.28, { type: 'triangle', bus: 'alerts', volume: 0.045, delay: i * 0.18 }));
      noiseBurst(0.5, 0.05, 700, 0.3, 'alerts');
    },
    record() {
      [880, 1108, 1318, 1760].forEach((f, i) => tone(f, 0.12, { type: 'square', bus: 'alerts', volume: 0.03, delay: i * 0.08 }));
    }
  };

  function updateSoundUI() {
    const label = audio.muted ? tr('SOUND: OFF','SOM: DESLIGADO') : tr('SOUND: ON','SOM: LIGADO');
    dom.soundBtn.textContent = label;
    dom.pauseSoundBtn.textContent = label;
    dom.hudSoundBtn.textContent = audio.muted ? '×' : '♪';
    dom.hudSoundBtn.setAttribute('aria-label', audio.muted ? 'Enable sound' : 'Mute sound');
    dom.hudSoundBtn.title = audio.muted ? 'Enable sound' : 'Mute sound';
  }

  function setMuted(muted, withSound = false) {
    audio.muted = muted;
    applyMix();
    try { localStorage.setItem(MUTE_KEY, muted ? '1' : '0'); } catch (error) { /* sem storage */ }
    updateSoundUI();
    if (!muted) {
      ensureAudio();
      if (withSound) Sound.ui();
    }
  }

  function toggleMute() { setMuted(!audio.muted, true); }

  const palette = {
    c: '#3df6ff', C: '#b9fdff', d: '#0c7fa0', w: '#f3ffff',
    m: '#ff3fa4', M: '#ff9ecb', p: '#9b5bff', P: '#cfb1ff',
    k: '#170a36', y: '#ffe066', o: '#ff9b4a', g: '#6dffc0', r: '#ff5b6e'
  };

  function makeSprite(rows, scale = 4) {
    const width = Math.max(...rows.map((row) => row.length));
    const height = rows.length;
    const output = document.createElement('canvas');
    output.width = width * scale;
    output.height = height * scale;
    const paint = output.getContext('2d');
    for (let y = 0; y < height; y++) {
      const row = rows[y];
      const offset = Math.floor((width - row.length) / 2);
      for (let x = 0; x < row.length; x++) {
        const color = palette[row[x]];
        if (!color) continue;
        paint.fillStyle = color;
        paint.fillRect((x + offset) * scale, y * scale, scale, scale);
      }
    }
    return { canvas: output, w: width, h: height };
  }

  const sprites = {
    player: makeSprite([
      '......w......',
      '.....wcw.....',
      '.....ccc.....',
      '....ccwcc....',
      '....ccccc....',
      '...ccmcmcc...',
      '...ccccccc...',
      '..ccccmcccc..',
      'ccccccccccccc',
      '.ccccccccccc.',
      '...cc...cc...',
      '..p.......p..',
      '..p.......p..',
      '.pp.......pp.',
      'ppp.......ppp'
    ]),
    scout: makeSprite([
      '....mmm....',
      '...mmmmm...',
      '..mmwmwmm..',
      '.mmmmmmmmm.',
      'mmmmmmmmmmm',
      '.mm.mmm.mm.',
      '..m.mmm.m..',
      '...m.m.m...',
      '....p.p....',
      '.....p.....'
    ]),
    serpent: makeSprite([
      '.....p.....',
      '....ppp....',
      '...pcccp...',
      '..pccmccp..',
      '.pcccccccp.',
      'ppcccmcccpp',
      '.pcccccccp.',
      '..pcccccp..',
      '...pcccp...',
      '....ppp....',
      '.....p.....'
    ]),
    gunner: makeSprite([
      '....mmmmm....',
      '...mmmmmmm...',
      '..mmwmmmwmm..',
      '.mmmmmmmmmmm.',
      'mmmmmmmmmmmmm',
      'mm.mmmmmmm.mm',
      '.m..mmmmm..m.',
      '....ooooo....',
      '.....ooo.....',
      '.....ooo.....',
      '......o......',
      '......y......'
    ])
  };

  function makeBossSprite() {
    const scale = 5;
    const width = 35;
    const height = 22;
    const output = document.createElement('canvas');
    output.width = width * scale;
    output.height = height * scale;
    const paint = output.getContext('2d');
    const rect = (x, y, w, h, color) => {
      paint.fillStyle = color;
      paint.fillRect(x * scale, y * scale, w * scale, h * scale);
    };

    rect(15, 0, 5, 2, '#2a0b4f');
    rect(12, 2, 11, 2, '#2a0b4f');
    rect(8, 4, 19, 3, '#2a0b4f');
    rect(4, 7, 27, 5, '#2a0b4f');
    rect(1, 12, 33, 4, '#2a0b4f');
    rect(4, 16, 11, 2, '#2a0b4f');
    rect(20, 16, 11, 2, '#2a0b4f');
    rect(16, 0, 3, 2, '#9b5bff');
    rect(13, 2, 9, 2, '#9b5bff');
    rect(9, 4, 17, 3, '#8a44ff');
    rect(5, 7, 25, 5, '#7d33f0');
    rect(2, 12, 31, 4, '#6b23db');
    rect(5, 16, 9, 2, '#7d33f0');
    rect(21, 16, 9, 2, '#7d33f0');
    rect(9, 4, 17, 1, '#c9a5ff');
    rect(5, 7, 25, 1, '#a35bff');
    rect(2, 12, 31, 1, '#9b5bff');
    rect(1, 8, 5, 7, '#4c158f');
    rect(29, 8, 5, 7, '#4c158f');
    rect(2, 9, 4, 1, '#b07bff');
    rect(29, 9, 4, 1, '#b07bff');
    rect(2, 15, 4, 4, '#ff3fa4');
    rect(29, 15, 4, 4, '#ff3fa4');
    rect(3, 19, 2, 2, '#ffe066');
    rect(30, 19, 2, 2, '#ffe066');
    rect(11, 6, 13, 10, '#ff3fa4');
    rect(13, 8, 9, 8, '#ff7fc0');
    rect(15, 9, 5, 6, '#2a0b4f');
    rect(16, 10, 3, 4, '#3df6ff');
    rect(17, 11, 1, 2, '#ffffff');
    rect(7, 8, 4, 2, '#ffe066');
    rect(24, 8, 4, 2, '#ffe066');
    rect(8, 8, 2, 1, '#ffffff');
    rect(25, 8, 2, 1, '#ffffff');
    rect(6, 9, 2, 4, '#ff9b4a');
    rect(27, 9, 2, 4, '#ff9b4a');
    rect(14, 16, 2, 3, '#ff9b4a');
    rect(17, 17, 1, 3, '#ffe066');
    rect(19, 16, 2, 3, '#ff9b4a');

    return { canvas: output, w: width, h: height };
  }
  sprites.boss = makeBossSprite();
  const shipArt=fleet.map((ship,i)=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.translate(32,32);const poly=(pts,col)=>{g.fillStyle=col;g.beginPath();pts.forEach(([x,y],n)=>n?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();};const wings=[[[0,-28],[12,-5],[29,22],[10,15],[0,24],[-10,15],[-29,22],[-12,-5]],[[0,-30],[8,-8],[30,-20],[23,20],[0,12],[-23,20],[-30,-20],[-8,-8]],[[0,-25],[20,-17],[28,20],[12,27],[-12,27],[-28,20],[-20,-17]],[[0,-28],[14,-12],[30,0],[25,25],[8,16],[-8,16],[-25,25],[-30,0],[-14,-12]],[[0,-28],[29,-5],[18,25],[0,14],[-18,25],[-29,-5]],[[0,-30],[13,-14],[29,-12],[29,25],[0,18],[-29,25],[-29,-12],[-13,-14]]];poly(wings[i],'#15233f');g.scale(.88,.88);poly(wings[i],ship.tint);poly([[0,-27],[9,1],[7,19],[-7,19],[-9,1]],'#e4f5ff');poly([[0,-18],[6,-3],[0,7],[-6,-3]],'#17456d');g.fillStyle='#fff';g.fillRect(-2,-12,3,7);g.fillStyle=ship.tint;g.fillRect(-12,19,5,8);g.fillRect(7,19,5,8);return {canvas:c,w:64,h:64};});
  const bossArt=Array.from({length:5},(_,i)=>{const c=document.createElement('canvas');c.width=160;c.height=100;const g=c.getContext('2d');const colors=['#f455a5','#ff704d','#6deaff','#b58aff','#f8ce62'];g.translate(80,50);g.fillStyle='#17213e';g.beginPath();g.moveTo(0,-46);g.lineTo(24,-30);g.lineTo(72,-42+i*13);g.lineTo(78,18);g.lineTo(40,38);g.lineTo(0,46);g.lineTo(-40,38);g.lineTo(-78,18);g.lineTo(-72,-42+i*13);g.lineTo(-24,-30);g.closePath();g.fill();g.strokeStyle=colors[i];g.lineWidth=4;g.stroke();for(const side of [-1,1]){g.fillStyle=colors[i];g.fillRect(side*42-12,-12,24,9);g.fillStyle='#8396bd';g.fillRect(side*49-9,5,18,20);g.fillStyle='#ff9c45';g.fillRect(side*49-5,25,10,8);}g.fillStyle=colors[i];g.beginPath();g.arc(0,0,17+i*2,0,TAU);g.fill();g.fillStyle='#fff';g.fillRect(-8,-8,16,16);return {canvas:c,w:160,h:100};});

  function drawSprite(sprite, x, y, worldWidth, alpha = 1) {
    const worldHeight = worldWidth * (sprite.h / sprite.w);
    if (alpha !== 1) ctx.globalAlpha = alpha;
    ctx.drawImage(sprite.canvas, Math.round(x - worldWidth / 2), Math.round(y - worldHeight / 2), worldWidth, worldHeight);
    if (alpha !== 1) ctx.globalAlpha = 1;
  }

  const background = document.createElement('canvas');
  background.width = W;
  background.height = H;

  function buildBackground() {
    const paint = background.getContext('2d');
    paint.fillStyle = '#04020c';
    paint.fillRect(0, 0, W, H);
    const clouds = [
      [70, 120, 300, 'rgba(112,45,220,.30)'],
      [420, 540, 340, 'rgba(10,120,190,.18)'],
      [390, 100, 230, 'rgba(255,63,164,.13)'],
      [120, 700, 300, 'rgba(120,45,220,.16)'],
      [240, 330, 260, 'rgba(50,30,140,.22)']
    ];
    for (const [x, y, radius, color] of clouds) {
      const gradient = paint.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, 'rgba(4,2,12,0)');
      paint.fillStyle = gradient;
      paint.fillRect(0, 0, W, H);
    }
    const planet = paint.createRadialGradient(392, 742, 12, 402, 752, 150);
    planet.addColorStop(0, 'rgba(122,60,220,.48)');
    planet.addColorStop(0.5, 'rgba(52,22,110,.32)');
    planet.addColorStop(1, 'rgba(8,4,24,0)');
    paint.fillStyle = planet;
    paint.beginPath();
    paint.arc(402, 752, 152, 0, TAU);
    paint.fill();
    paint.strokeStyle = 'rgba(61,246,255,.18)';
    paint.lineWidth = 1.5;
    paint.beginPath();
    paint.ellipse(402, 748, 166, 42, -0.34, 0, TAU);
    paint.stroke();
    for (let i = 0; i < 90; i++) {
      const x = rand(0, W);
      const y = rand(0, H);
      const bright = rand(0.1, 0.4);
      paint.fillStyle = chance(0.5) ? `rgba(255,255,255,${bright})` : `rgba(120,220,255,${bright})`;
      paint.fillRect(Math.floor(x), Math.floor(y), 1, 1);
    }
    paint.strokeStyle = 'rgba(120,70,255,.035)';
    paint.lineWidth = 1;
    for (let i = -H; i < W + H; i += 46) {
      paint.beginPath();
      paint.moveTo(i, 0);
      paint.lineTo(i - 160, H);
      paint.stroke();
    }
  }
  buildBackground();

  const stars = [];
  for (let i = 0; i < 120; i++) {
    const layer = i < 60 ? 0 : i < 100 ? 1 : 2;
    stars.push({
      x: rand(0, W),
      y: rand(0, H),
      layer,
      size: layer === 2 ? 2 : 1,
      speed: layer === 0 ? 14 : layer === 1 ? 34 : 72,
      alpha: layer === 0 ? 0.32 : layer === 1 ? 0.55 : 0.85,
      twinkle: rand(0, TAU),
      tint: chance(0.22) ? (chance(0.5) ? '#ff9ecb' : '#b9fdff') : '#ffffff'
    });
  }

  const ambientShips = [
    { type: 'scout', x: 86, y: 112, phase: 1.2, speed: 12 },
    { type: 'serpent', x: 398, y: 208, phase: 3.4, speed: 9 },
    { type: 'gunner', x: 108, y: 636, phase: 5.1, speed: 8 },
    { type: 'scout', x: 386, y: 700, phase: 2.2, speed: 11 }
  ];

  const state = {
    mode: 'menu',
    score: 0,
    lives: 3,
    wave: 1,
    time: 0,
    menuTime: 0,
    player: null,
    bullets: [],
    enemies: [],
    enemyBullets: [],
    particles: [],
    rings: [],
    pickups: [],
    floaters: [],
    boss: null,
    power: { shield: 0, double: 0, rapid: 0 },
    waveInfo: null,
    keys: Object.create(null),
    autofire: false,
    coarse: false,
    pendingOver: 0,
    shake: 0,
    flash: 0,
    flashColor: '#ffffff',
    bannerTimer: 0,
    muted: audio.muted
  };

  const coarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  state.coarse = !!coarsePointer || ('ontouchstart' in window && navigator.maxTouchPoints > 0);
  state.autofire = state.coarse;

  let shownScore = -1;
  let shownWave = -1;
  let shownLives = -1;
  const chipElements = {};

  function updateScoreHUD(force = false) {
    if (!force && shownScore === state.score) return;
    shownScore = state.score;
    dom.score.textContent = padScore(state.score);
  }

  function updateWaveHUD(force = false) {
    if (!force && shownWave === state.wave) return;
    shownWave = state.wave;
    dom.wave.textContent = String(state.wave).padStart(2, '0');
  }

  function updateLivesHUD(force = false) {
    if (!force && shownLives === state.lives) return;
    shownLives = state.lives;
    if (dom.lives.children.length !== 3) {
      dom.lives.innerHTML = '';
      for (let i = 0; i < 3; i++) {
        const life = document.createElement('span');
        life.className = 'life';
        dom.lives.appendChild(life);
      }
    }
    Array.from(dom.lives.children).forEach((el, index) => {
      el.classList.toggle('lost', index >= state.lives);
    });
  }

  const powerMeta = {
    shield: { label: 'SHIELD', icon: 'S', className: 'shield' },
    double: { label: 'DOUBLE SHOT', icon: '2', className: 'double' },
    rapid: { label: 'RAPID FIRE', icon: 'R', className: 'rapid' }
  };

  function updatePowerHUD() {
    for (const type of Object.keys(powerMeta)) {
      const active = state.power[type] > 0;
      let chip = chipElements[type];
      if (active && !chip) {
        const meta = powerMeta[type];
        chip = document.createElement('div');
        chip.className = 'chip ' + meta.className;
        const icon = document.createElement('span');
        icon.className = 'chip-icon';
        icon.textContent = meta.icon;
        const label = document.createElement('span');
        label.className = 'chip-label';
        const bar = document.createElement('span');
        bar.className = 'chip-bar';
        const fill = document.createElement('i');
        bar.appendChild(fill);
        chip.append(icon, label, bar);
        dom.powerups.appendChild(chip);
        chipElements[type] = { root: chip, label, fill };
        chip = chipElements[type];
      } else if (!active && chip) {
        chip.root.remove();
        delete chipElements[type];
        chip = null;
      }
      if (active && chip) {
        const seconds = Math.ceil(state.power[type]);
        chip.label.textContent = powerMeta[type].label + ' ' + seconds + 's';
        chip.fill.style.width = clamp((state.power[type] / 12) * 100, 0, 100) + '%';
      }
    }
  }

  function clearPowerHUD() {
    dom.powerups.innerHTML = '';
    for (const key of Object.keys(chipElements)) delete chipElements[key];
  }

  function updateBossBar() {
    if (!state.boss || state.boss.dead) {
      dom.bossbar.classList.add('hidden');
      return;
    }
    const ratio = clamp(state.boss.hp / state.boss.maxHp, 0, 1);
    dom.bossbar.classList.remove('hidden');
    dom.bossHp.style.width = (ratio * 100).toFixed(1) + '%';
    dom.bossHpText.textContent = Math.ceil(ratio * 100) + '%';
  }

  function showBanner(title, subtitle, warn = false, duration = 1.6) {
    dom.bannerTitle.textContent = title;
    dom.bannerSub.textContent = subtitle || '';
    dom.banner.classList.remove('hidden');
    dom.banner.classList.toggle('warn', !!warn);
    dom.banner.style.animation = 'none';
    void dom.banner.offsetWidth;
    dom.banner.style.animation = '';
    state.bannerTimer = duration;
  }

  function hideBanner() {
    dom.banner.classList.add('hidden');
    state.bannerTimer = 0;
  }

  function makePlayer() {
    return { x: W / 2, y: H - 108, r: 9, cool: 0, invuln: 0, shieldFlash: 0 };
  }

  function difficulty(){return Number($('difficulty').value)||1;}
  function resetGame() {
    combo=0;comboTime=0;runCredits=0;musicClock=0;musicStep=0;abilityCooldown=0;training=false;
    state.score = 0;
    state.lives = 3;
    state.wave = 1;
    state.time = 0;
    state.player = makePlayer();
    state.bullets.length = 0;
    state.enemies.length = 0;
    state.enemyBullets.length = 0;
    state.particles.length = 0;
    state.rings.length = 0;
    state.pickups.length = 0;
    state.floaters.length = 0;
    state.boss = null;
    state.power = { shield: 0, double: 0, rapid: 0 };
    state.pendingOver = 0;
    state.shake = 0;
    state.flash = 0;
    state.autofire = state.coarse;
    state.waveInfo = { spawnQueue: [], spawnTimer: 0, active: false, cleared: false, clearTimer: 0, bossTimer: 0, bossPending: false, kills: 0 };
    dom.bossbar.classList.add('hidden');
    dom.banner.classList.add('hidden');
    dom.banner.classList.remove('warn');
    clearPowerHUD();
    updateScoreHUD(true);
    updateWaveHUD(true);
    updateLivesHUD(true);
  }

  function startGame() {
    ensureAudio();
    try {
      audio.muted = localStorage.getItem(MUTE_KEY) === '1';
    } catch (error) {
      /* sem acesso ao storage: mantém o estado atual */
    }
    updateSoundUI();
    resetGame();
    state.mode = 'playing';
    showScreen(null);
    setHudVisible(true);
    startWave(1);
    platinum.runs++;savePlatinum();window.NSDPlatform?.start();
    state.power.shield=difficulty()===.8?14:difficulty()===1.25?4:8;
    updateRunStats();
    Sound.start();
  }

  function goMenu() {
    window.NSDPlatform?.stop();savePlatinum();
    state.mode = 'menu';
    training=false;
    state.player = null;
    state.bullets.length = 0;
    state.enemies.length = 0;
    state.enemyBullets.length = 0;
    state.pickups.length = 0;
    state.particles.length = 0;
    state.rings.length = 0;
    state.floaters.length = 0;
    state.boss = null;
    state.waveInfo = null;
    state.pendingOver = 0;
    state.flash = 0;
    state.shake = 0;
    setHudVisible(false);
    dom.bossbar.classList.add('hidden');
    hideBanner();
    showScreen(dom.menuScreen);
    refreshMenuBest();
    layoutView();
  }

  function waveSubtitle(n) {
    if (n === 1) return state.coarse ? 'DRAG TO MOVE • AUTO FIRE' : 'WASD / ARROWS • SPACE TO FIRE';
    if (n % 5 === 4) return 'SOMETHING BIG IS COMING';
    return 'INCOMING INVADERS';
  }

  function buildWaveQueue(n) {
    const queue = [];
    const total = Math.min(26, 8 + Math.floor((n - 1) * 1.5));
    const types = ['scout'];
    if (n >= 2) types.push('serpent');
    if (n >= 3) types.push('gunner');
    if(n>=6)types.push('interceptor');if(n>=11)types.push('armored');
    for (let i = 0; i < total; i++) {
      let type = types[i % types.length];
      if (i > 0 && type === 'gunner' && n < 4) type = 'scout';
      if (chance(0.16)) type = pick(types);
      queue.push(type);
    }
    return queue;
  }

  function startWave(n) {
    state.wave = n;progress.wave=Math.max(progress.wave,n);saveProgress();
    updateRunStats();
    updateWaveHUD();
    state.waveInfo = {
      spawnQueue: [], spawnTimer: 0, active: true, cleared: false,
      clearTimer: 0, bossTimer: 0, bossPending: false, kills: 0
    };
    state.boss = null;
    state.enemies.length = 0;
    state.enemyBullets.length = 0;
    dom.bossbar.classList.add('hidden');
    if (n % 5 === 0) {
      state.waveInfo.bossPending = true;
      state.waveInfo.bossTimer = 2.2;
      showBanner('WARNING', 'MOTHERSHIP DETECTED', true, 2.2);
      Sound.alarm();
      return;
    }
    state.waveInfo.spawnQueue = buildWaveQueue(n);
    state.waveInfo.spawnTimer = 0.35;
    showBanner('WAVE ' + String(n).padStart(2, '0'), waveSubtitle(n), false, 1.6);
    Sound.waveStart();
  }

  const enemyConfig = {
    interceptor:{hp:2,r:13,speed:190,score:210,width:28}, armored:{hp:7,r:23,speed:65,score:400,width:48},
    scout: { hp: 1, r: 15, speed: 108, score: 100, width: 32 },
    serpent: { hp: 2, r: 16, speed: 80, score: 160, width: 35 },
    gunner: { hp: 3, r: 18, speed: 74, score: 240, width: 38 }
  };

  function spawnEnemy(type) {
    const cfg = enemyConfig[type];
    const wave = state.wave;
    const x = wave % 3 === 1 ? 55 + ((state.waveInfo.spawnQueue.length * 73) % 370) : rand(52, W - 52);
    const difficulty = 1 + (wave - 1) * 0.035;
    const enemy = {
      type,
      x,
      y: -46,
      baseX: x,
      age: 0,
      hp: cfg.hp + (wave >= 9 && type !== 'scout' ? 1 : 0),
      maxHp: cfg.hp + (wave >= 9 && type !== 'scout' ? 1 : 0),
      r: cfg.r,
      width: cfg.width,
      speed: cfg.speed * difficulty,
      score: cfg.score,
      flash: 0,
      phase: rand(0, TAU),
      amp: rand(42, 88),
      freq: rand(1.7, 2.6),
      stopY: rand(130, 250),
      fireTimer: rand(1.4, 2.4),
      driftDir: chance(0.5) ? 1 : -1,
      dead: false
    };
    state.enemies.push(enemy);
  }

  function updateWave(dt) {
    const wi = state.waveInfo;
    if (!wi || !wi.active || state.mode !== 'playing') return;
    if (wi.bossPending) {
      wi.bossTimer -= dt;
      if (wi.bossTimer <= 0) {
        wi.bossPending = false;
        spawnBoss();
      }
      return;
    }
    if (state.boss) return;
    if (wi.spawnQueue.length) {
      wi.spawnTimer -= dt;
      if (wi.spawnTimer <= 0) {
        spawnEnemy(wi.spawnQueue.shift());
        wi.spawnTimer = Math.max(0.3, 0.65 - state.wave * 0.024);
      }
    }
    if (!wi.cleared && wi.spawnQueue.length === 0 && state.enemies.length === 0) {
      wi.cleared = true;
      const bonus = 120 * state.wave;
      addPoints(bonus);
      showBanner('WAVE CLEARED', '+' + bonus + ' BONUS', false, 1.6);
      Sound.waveClear();
      wi.clearTimer = 1.9;
    }
    if (wi.cleared) {
      wi.clearTimer -= dt;
      if (wi.clearTimer <= 0) {
        wi.active = false;
        startWave(state.wave + 1);
      }
    }
  }

  function addPoints(points) {
    if (!points) return;
    state.score += Math.floor(points);
    updateScoreHUD();
  }

  function addFloater(text, x, y, color = '#b9fdff', size = 13) {
    state.floaters.push({ text, x, y, life: 0.9, maxLife: 0.9, color, size });
  }

  function addRing(x, y, color = '#3df6ff', maxRadius = 40, life = 0.4) {
    state.rings.push({ x, y, radius: 4, maxRadius, life, maxLife: life, color });
  }

  function explode(x, y, count = 14, color = null, big = false) {
    const colors = color ? [color] : ['#3df6ff', '#ff3fa4', '#ffe066', '#b9fdff'];
    for (let i = 0; i < count; i++) {
      const angle = rand(0, TAU);
      const speed = rand(30, big ? 280 : 190);
      const life = rand(0.28, big ? 0.85 : 0.62);
      state.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life, maxLife: life,
        size: rand(big ? 3 : 2, big ? 7 : 5),
        color: pick(colors),
        drag: 1.8
      });
    }
    addRing(x, y, color || (big ? '#ff3fa4' : '#3df6ff'), big ? 90 : 42, big ? 0.6 : 0.4);
    state.shake = Math.max(state.shake, big ? 12 : 4);
  }

  function spawnPickup(type, x, y) {
    state.pickups.push({
      type, x, y: y || -30, vy: 62, phase: rand(0, TAU), life: 16, r: 17
    });
  }

  function dropPickup(x, y) {
    const types = ['shield', 'double', 'rapid'];
    const type = pick(types);
    spawnPickup(type, x, y);
    addRing(x, y, type === 'shield' ? '#6dffc0' : type === 'double' ? '#ff3fa4' : '#a35bff', 34, 0.35);
  }

  function updateParticles(dt) {
    for (let i = state.particles.length - 1; i >= 0; i--) {
      const p = state.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        state.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= Math.max(0, 1 - p.drag * dt);
      p.vy *= Math.max(0, 1 - p.drag * dt);
      p.vy += 34 * dt;
    }
    for (let i = state.rings.length - 1; i >= 0; i--) {
      const ring = state.rings[i];
      ring.life -= dt;
      if (ring.life <= 0) {
        state.rings.splice(i, 1);
        continue;
      }
      const t = 1 - ring.life / ring.maxLife;
      ring.radius = 4 + (ring.maxRadius - 4) * t;
    }
    for (let i = state.floaters.length - 1; i >= 0; i--) {
      const f = state.floaters[i];
      f.life -= dt;
      f.y -= 26 * dt;
      if (f.life <= 0) state.floaters.splice(i, 1);
    }
  }

  function playerShoot() {
    const p = state.player;
    if (!p) return;
    const offset = state.power.double > 0 ? 9 : 0;
    const shots = platinum.weapon==='storm'?[-24,-12,0,12,24]:platinum.weapon==='rail'?[0]:profile.selected===4 ? [-13,0,13] : profile.selected>=3 ? [-10,10] : offset ? [-offset, offset] : [0];
    for (const dx of shots) {
      state.bullets.push({ x: p.x + dx, y: p.y - 20, vy: -880, r: 4, dmg: (fleet[profile.selected].damage + premium.levels[profile.selected]*0.35)*(platinum.weapon==='rail'?2.5:platinum.weapon==='storm'?.65:1) });
      for (let i = 0; i < 2; i++) {
        state.particles.push({
          x: p.x + dx + rand(-2, 2), y: p.y - 22,
          vx: rand(-30, 30), vy: rand(-60, -20),
          life: 0.12, maxLife: 0.12, size: 2, color: '#b9fdff', drag: 3
        });
      }
    }
    Sound.shoot(platinum.weapon);
  }

  function updatePlayer(dt) {
    const p = state.player;
    if (!p) return;
    p.cool = Math.max(0, p.cool - dt);
    p.invuln = Math.max(0, p.invuln - dt);
    p.shieldFlash = Math.max(0, p.shieldFlash - dt);

    let dx = 0;
    let dy = 0;
    if (state.keys.ArrowLeft || state.keys.KeyA) dx -= 1;
    if (state.keys.ArrowRight || state.keys.KeyD) dx += 1;
    if (state.keys.ArrowUp || state.keys.KeyW) dy -= 1;
    if (state.keys.ArrowDown || state.keys.KeyS) dy += 1;
    if (dx || dy) {
      const length = Math.hypot(dx, dy);
      const speed = fleet[profile.selected].speed * (1+premium.levels[profile.selected]*0.04);
      p.x += (dx / length) * speed * dt;
      p.y += (dy / length) * speed * dt;
    }
    p.x = clamp(p.x, 17, W - 17);
    p.y = clamp(p.y, 82, H - 32);

    const firing = state.keys.Space || state.keys.KeyJ || state.autofire;
    if (firing && p.cool <= 0 && state.pendingOver <= 0) {
      playerShoot();
      p.cool = fleet[profile.selected].rate * (1-premium.levels[profile.selected]*0.06) * (state.power.rapid > 0 ? 0.55 : 1);
    }

    if (Math.random() < 0.55) {
      if(state.particles.length<450)state.particles.push({
        x: p.x + rand(-4, 4), y: p.y + 18,
        vx: rand(-16, 16), vy: rand(50, 110),
        life: rand(0.16, 0.3), maxLife: 0.3, size: rand(1, 2),
        color: chance(0.55) ? '#ff9b4a' : '#3df6ff', drag: 1
      });
    }
  }

  function updatePowerTimers(dt) {
    for (const type of Object.keys(state.power)) {
      if (state.power[type] > 0) {
        state.power[type] = Math.max(0, state.power[type] - dt);
      }
    }
  }

  function moveBullets(dt) {
    for (let i = state.bullets.length - 1; i >= 0; i--) {
      const b = state.bullets[i];
      b.y += b.vy * dt;
      if (b.y < -24) state.bullets.splice(i, 1);
    }
  }

  function enemyShoot(e) {
    const p = state.player;
    if (!p) return;
    const angle = Math.atan2(p.y - e.y, p.x - e.x);
    const speed = 190 + state.wave * 4;
    for (const spread of [-0.06, 0, 0.06]) {
      state.enemyBullets.push({
        x: e.x, y: e.y + 18,
        vx: Math.cos(angle + spread) * speed,
        vy: Math.sin(angle + spread) * speed,
        r: 4.5, kind: 'pink', life: 6
      });
    }
    Sound.enemyShoot();
  }

  function updateEnemies(dt) {
    for (let i = state.enemies.length - 1; i >= 0; i--) {
      const e = state.enemies[i];
      e.age += dt;
      e.flash = Math.max(0, e.flash - dt);
      if(e.type==='interceptor'){e.y+=e.speed*dt;e.x=clamp(e.baseX+Math.sin(e.age*4+e.phase)*65,25,W-25);}else if(e.type==='armored'){e.y+=e.speed*dt;e.fireTimer-=dt;if(e.fireTimer<=0){enemyShoot(e);e.fireTimer=2.1;}}else if (e.type === 'scout') {
        e.y += e.speed * dt;
        e.x = e.baseX + Math.sin(e.age * 1.6 + e.phase) * 10;
      } else if (e.type === 'serpent') {
        e.y += e.speed * 0.76 * dt;
        e.x = clamp(e.baseX + Math.sin(e.age * e.freq + e.phase) * e.amp, 26, W - 26);
      } else {
        if (e.y < e.stopY) {
          e.y += e.speed * dt;
        } else {
          e.y += Math.sin(e.age * 0.9 + e.phase) * 9 * dt;
          e.x = clamp(e.x + Math.cos(e.age * 1.1 + e.phase) * 34 * e.driftDir * dt, 34, W - 34);
          e.fireTimer -= dt;
          if (e.fireTimer <= 0) {
            enemyShoot(e);
            e.fireTimer = Math.max(1.0, rand(1.8, 2.6) - state.wave * 0.035);
          }
        }
      }
      if (e.y > H + 60) {
        state.enemies.splice(i, 1);
      }
    }

    for (let i = state.enemyBullets.length - 1; i >= 0; i--) {
      const b = state.enemyBullets[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life -= dt;
      if (b.life <= 0 || b.x < -30 || b.x > W + 30 || b.y < -30 || b.y > H + 40) {
        state.enemyBullets.splice(i, 1);
      }
    }
  }

  function updatePickups(dt) {
    for (let i = state.pickups.length - 1; i >= 0; i--) {
      const item = state.pickups[i];
      item.y += item.vy * dt;
      item.phase += dt * 2.2;
      item.x += Math.sin(item.phase) * 16 * dt;
      item.life -= dt;
      if (item.y > H + 30 || item.life <= 0) state.pickups.splice(i, 1);
    }
  }

  function spawnBoss() {
    const maxHp = Math.round((70 + state.wave * 8)*difficulty());
    document.querySelector('.bossbar-label span').textContent=['MOTHERSHIP','INFERNO','GLACIER','WRAITH','SUN EATER'][(Math.floor(state.wave/5)-1+5)%5];
    state.boss = {
      x: W / 2, y: -110, targetY: 225, age: 0, t: 0,
      hp: maxHp, maxHp, r: 58, entering: true, dead: false,
      deathTimer: 0, flash: 0, telegraph: false, shootTimer: 2.3,
      pattern: (Math.floor(state.wave/5)-1)%3, hurtFlash: 0
    };
    dom.bossbar.classList.remove('hidden');
    dom.bossHp.style.width = '100%';
    dom.bossHpText.textContent = '100%';
    Sound.bossSpawn();
  }

  function bossAttack(boss) {
    const p = state.player;
    if (!p || boss.dead) return;
    if (boss.pattern === 0) {
      const base = Math.atan2(p.y - boss.y, p.x - boss.x);
      const speed = 185 + state.wave * 3;
      for (let i = -3; i <= 3; i++) {
        const angle = base + i * ([.135,.20,.10,.24,.16][(Math.floor(state.wave/5)-1)%5]||.135);
        state.enemyBullets.push({
          x: boss.x, y: boss.y + 34,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          r: 5, kind: 'pink', life: 8
        });
      }
      boss.pattern = 1;
      boss.shootTimer = boss.hp < boss.maxHp/2 ? 1.35 : 2.35;
    } else {
      const count = [16,12,20,14,18][(Math.floor(state.wave/5)-1)%5] || 16;
      const speed = 125 + state.wave * 2;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * TAU + boss.t * 0.6;
        state.enemyBullets.push({
          x: boss.x, y: boss.y + 18,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          r: 5, kind: 'purple', life: 8
        });
      }
      const aim = Math.atan2(p.y - boss.y, p.x - boss.x);
      for (let i = -1; i <= 1; i++) {
        const angle = aim + i * 0.09;
        state.enemyBullets.push({
          x: boss.x, y: boss.y + 30,
          vx: Math.cos(angle) * 250,
          vy: Math.sin(angle) * 250,
          r: 4, kind: 'orange', life: 8
        });
      }
      boss.pattern = 0;
      boss.shootTimer = 4.0;
    }
    if(boss.stage>=2)boss.shootTimer*=boss.stage===3?.62:.8;
    Sound.bossShot();
  }

  function onBossDefeated(boss) {
    const bonus = 1000 + state.wave * 250;
    earn(15);runCredits+=15;progress.bosses++;saveProgress();
    addPoints(bonus);
    showBanner('MOTHERSHIP DESTROYED', '+' + bonus + ' BONUS', false, 2.1);
    explode(boss.x, boss.y, 44, null, true);
    Sound.bossDown();
    spawnPickup('shield', boss.x - 44, boss.y + 20);
    spawnPickup(chance(0.5) ? 'double' : 'rapid', boss.x + 44, boss.y + 20);
    state.boss = null;
    dom.bossbar.classList.add('hidden');
    const wi = state.waveInfo;
    if (wi) {
      wi.cleared = true;
      wi.clearTimer = 2.5;
    }
  }

  function updateBoss(dt) {
    const boss = state.boss;
    if (!boss) return;
    boss.age += dt;
    boss.t += dt;
    boss.hurtFlash = Math.max(0, boss.hurtFlash - dt);
    boss.flash = Math.max(0, boss.flash - dt);
    if (boss.dead) {
      boss.deathTimer -= dt;
      if (Math.random() < 0.55) {
        explode(rand(boss.x - 58, boss.x + 58), rand(boss.y - 32, boss.y + 34), 5, null, false);
      }
      if (boss.deathTimer <= 0) onBossDefeated(boss);
      return;
    }
    if (boss.entering) {
      boss.y += (boss.targetY - boss.y) * Math.min(1, dt * 4.2);
      if (Math.abs(boss.y - boss.targetY) < 1.5) {
        boss.y = boss.targetY;
        boss.entering = false;
      }
      return;
    }
    boss.x = W / 2 + Math.sin(boss.t * 0.62) * 132;
    boss.y = boss.targetY + Math.sin(boss.t * 1.35) * 11;
    boss.shootTimer -= dt;
    if (boss.shootTimer <= 0.42 && !boss.telegraph) {
      boss.telegraph = true;
      boss.flash = 0.42;
      Sound.bossCharge();
    }
    if (boss.shootTimer <= 0) {
      boss.telegraph = false;
      bossAttack(boss);
    }
  }

  function killEnemy(enemy) {
    enemy.dead = true;
    combo++;comboTime=3.5;earn(1);runCredits++; progress.kills++; saveProgress();
    const multiplier=1+Math.min(4,Math.floor(combo/4));
    addPoints(enemy.score*multiplier);
    addFloater('+' + enemy.score*multiplier, enemy.x, enemy.y - 12, '#b9fdff', 13);
    explode(enemy.x, enemy.y, enemy.type === 'gunner' ? 28 : 19);addRing(enemy.x,enemy.y,'#ffb96a',32,.3);
    Sound.explode();
    const wi = state.waveInfo;
    if (wi) {
      wi.kills += 1;
      if (wi.kills === 2) {
        dropPickup(enemy.x, enemy.y);
      } else if (chance(0.12)) {
        dropPickup(enemy.x, enemy.y);
      }
    }
  }

  function damageBoss(boss, amount) {
    if (boss.dead) return;
    boss.hp -= amount;
    const stage=boss.hp<=boss.maxHp*.3?3:boss.hp<=boss.maxHp*.65?2:1;if(boss.hp>0&&stage>(boss.stage||1)){boss.stage=stage;boss.shootTimer=Math.min(boss.shootTimer,1.2);showBanner(tr('BOSS PHASE ','FASE DO CHEFE ')+stage,tr('ATTACK INTENSIFIES','ATAQUE INTENSIFICADO'),true,1.3);}
    boss.hurtFlash = 0.08;
    addPoints(5);
    if (boss.hp <= 0) {
      boss.hp = 0;
      boss.dead = true;
      boss.deathTimer = 1.45;
      state.shake = Math.max(state.shake, 16);
      state.flash = 0.35;
      state.flashColor = '#ff3fa4';
      state.enemyBullets.length = 0;
      Sound.bigExplode();
    }
  }

  function handleBulletCollisions() {
    for (let i = state.bullets.length - 1; i >= 0; i--) {
      const bullet = state.bullets[i];
      let hit = false;
      for (const enemy of state.enemies) {
        if (enemy.dead) continue;
        const dx = enemy.x - bullet.x;
        const dy = enemy.y - bullet.y;
        if (dx * dx + dy * dy < (enemy.r + bullet.r) * (enemy.r + bullet.r)) {
          enemy.hp -= bullet.dmg;
          enemy.flash = 0.1;
          hit = true;
          if (enemy.hp <= 0) {
            killEnemy(enemy);
          } else {
            Sound.hit();
            state.particles.push({
              x: bullet.x, y: bullet.y, vx: rand(-40, 40), vy: rand(-30, 40),
              life: 0.18, maxLife: 0.18, size: 2, color: '#ffe066', drag: 2
            });
          }
          break;
        }
      }
      if (!hit && state.boss && !state.boss.dead) {
        const boss = state.boss;
        const dx = boss.x - bullet.x;
        const dy = boss.y - bullet.y;
        if (dx * dx + dy * dy < (boss.r + bullet.r) * (boss.r + bullet.r)) {
          damageBoss(boss, bullet.dmg);
          hit = true;
        }
      }
      if (hit) state.bullets.splice(i, 1);
    }
    state.enemies = state.enemies.filter((enemy) => !enemy.dead);

    const p = state.player;
    if (!p) return;
    for (let i = state.enemyBullets.length - 1; i >= 0; i--) {
      const bullet = state.enemyBullets[i];
      const dx = bullet.x - p.x;
      const dy = bullet.y - p.y;
      if (dx * dx + dy * dy < (bullet.r + 7) * (bullet.r + 7)) {
        state.enemyBullets.splice(i, 1);
        hitPlayer();
        break;
      }
    }
    if (state.pendingOver > 0) return;
    for (const enemy of state.enemies) {
      if (enemy.dead) continue;
      const dx = enemy.x - p.x;
      const dy = enemy.y - p.y;
      if (dx * dx + dy * dy < (enemy.r + 9) * (enemy.r + 9)) {
        killEnemy(enemy);
        hitPlayer();
        break;
      }
    }
    state.enemies = state.enemies.filter((enemy) => !enemy.dead);
    if (state.boss && !state.boss.dead) {
      const boss = state.boss;
      const dx = boss.x - p.x;
      const dy = boss.y - p.y;
      if (dx * dx + dy * dy < (boss.r + 10) * (boss.r + 10)) hitPlayer();
    }
    for (let i = state.pickups.length - 1; i >= 0; i--) {
      const item = state.pickups[i];
      const dx = item.x - p.x;
      const dy = item.y - p.y;
      if (dx * dx + dy * dy < (item.r + 14) * (item.r + 14)) {
        applyPickup(item.type);
        state.pickups.splice(i, 1);
      }
    }
  }

  function applyPickup(type) {
    state.power[type] = 12;
    const labels = { shield: 'SHIELD ACTIVE', double: 'DOUBLE SHOT', rapid: 'RAPID FIRE' };
    const colors = { shield: '#6dffc0', double: '#ff9ecb', rapid: '#cfb1ff' };
    const p = state.player;
    addFloater(labels[type], p.x, p.y - 46, colors[type], 14);
    addRing(p.x, p.y, colors[type], 58, 0.5);
    explode(p.x, p.y, 16, colors[type], false);
    state.flash = 0.16;
    state.flashColor = colors[type];
    Sound.pickup();
  }

  function hitPlayer() {
    const p = state.player;
    if (!p || state.pendingOver > 0 || state.mode !== 'playing' || p.invuln > 0) return;
    if (state.power.shield > 0) {
      state.power.shield = 0;
      p.invuln = 1.0;
      p.shieldFlash = 0.4;
      state.flash = 0.24;
      state.flashColor = '#6dffc0';
      addFloater('SHIELD BROKEN', p.x, p.y - 40, '#6dffc0', 13);
      explode(p.x, p.y, 22, '#6dffc0', false);
      Sound.shieldBreak();
      return;
    }
    combo=0;comboTime=0;
    state.lives -= 1;
    updateLivesHUD(true);
    state.shake = 16;
    state.flash = 0.42;
    state.flashColor = '#ff3fa4';
    explode(p.x, p.y, 38, '#ff3fa4', true);
    Sound.playerHit();
    p.x = W / 2;
    p.y = H - 108;
    p.invuln = 2.5;
    p.cool = 0.4;
    for (let i = state.enemyBullets.length - 1; i >= 0; i--) {
      const bullet = state.enemyBullets[i];
      const dx = bullet.x - p.x;
      const dy = bullet.y - p.y;
      if (dx * dx + dy * dy < 175 * 175) state.enemyBullets.splice(i, 1);
    }
    if (state.lives <= 0) {
      state.pendingOver = 1.15;
      showBanner('SHIP DESTROYED', 'SIGNAL LOST', true, 1.2);
    }
  }

  function endGame() {
    window.NSDPlatform?.stop();savePlatinum();
    if (state.mode !== 'playing') return;
    state.mode = 'gameover';
    state.pendingOver = 0;
    const placement = addRecord(state.score);
    dom.finalScore.textContent = padScore(state.score);
    if (placement === 1) {
      dom.recordNotice.textContent = 'NEW HIGH SCORE!';
      Sound.record();
    } else if (placement > 0) {
      dom.recordNotice.textContent = 'YOU MADE THE TOP 5 · #' + placement;
      Sound.record();
    } else {
      dom.recordNotice.textContent = 'KEEP TRYING, PILOT';
    }
    setHudVisible(false);
    dom.bossbar.classList.add('hidden');
    hideBanner();
    showScreen(dom.gameoverScreen);
    refreshMenuBest();
    Sound.gameOver();
  }

  function updatePlaying(dt) {
    state.time += dt;
    if(!training){platinum.seconds+=dt;if(Math.floor(platinum.seconds)%10===0&&Math.floor(platinum.seconds)!==lastSavedSecond){lastSavedSecond=Math.floor(platinum.seconds);savePlatinum();}}
    premiumTick(dt);
    comboTime-=dt;if(comboTime<=0)combo=0;updateRunStats();
    musicClock-=dt;if(musicClock<=0){musicClock=state.boss?.22:.32;const notes=state.boss?[82.41,82.41,123.47,98,82.41,146.83,123.47,98]:[110,110,165,130.81,110,196,165,130.81];const note=notes[musicStep++%notes.length];tone(note*2,.19,{type:'triangle',volume:.024,bus:'music'});tone(note*4,.12,{type:'sine',volume:.012,bus:'music'});}

    if (state.bannerTimer > 0) {
      state.bannerTimer -= dt;
      if (state.bannerTimer <= 0) hideBanner();
    }
    state.flash = Math.max(0, state.flash - dt * 2.4);
    state.shake = Math.max(0, state.shake - dt * 34);
    updateParticles(dt);
    if (state.pendingOver > 0) {
      state.pendingOver -= dt;
      if (state.pendingOver <= 0) endGame();
      return;
    }
    updatePlayer(dt);
    updatePowerTimers(dt);
    moveBullets(dt);
    updateEnemies(dt);
    updateBoss(dt);
    updatePickups(dt);
    handleBulletCollisions();
    updateWave(dt);
    updatePowerHUD();
    updateBossBar();
  }

  function updateStars(dt) {
    const speedFactor = state.mode === 'playing' || state.mode === 'paused' ? 1 : 0.35;
    for (const star of stars) {
      star.y += star.speed * speedFactor * dt;
      star.twinkle += dt * 2.5;
      if (star.y > H + 3) {
        star.y = -3;
        star.x = rand(0, W);
      }
    }
  }

  function drawStars() {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const star of stars) {
      const alpha = star.alpha * (0.72 + Math.sin(star.twinkle) * 0.28);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = star.tint;
      ctx.fillRect(Math.round(star.x), Math.round(star.y), star.size, star.size);
    }
    ctx.restore();
  }

  function drawGlow(x, y, radius, color, alpha = 0.55) {
    if(platinum.quality==='low')return;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = alpha;
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawAmbientShips(dt) {
    for (const ship of ambientShips) {
      ship.y += Math.sin(state.menuTime * 0.5 + ship.phase) * ship.speed * dt;
      ship.x += Math.cos(state.menuTime * 0.3 + ship.phase) * ship.speed * 0.45 * dt;
      const sprite = sprites[ship.type];
      ctx.save();
      ctx.globalAlpha = 0.5;
      drawSprite(sprite, ship.x, ship.y, ship.type === 'gunner' ? 44 : 36, 0.5);
      ctx.restore();
    }
  }

  function drawPlayer() {
    const p = state.player;
    if (!p) return;
    if (p.invuln > 0 && Math.floor(p.invuln * 14) % 2 === 0) return;
    const flicker = 0.55 + Math.sin(state.time * 40) * 0.25;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(p.x, p.y + 4, 30, 'rgba(61,246,255,.65)', 0.55);
    ctx.fillStyle = 'rgba(255,155,74,.9)';
    ctx.fillRect(Math.round(p.x - 4), Math.round(p.y + 15), 8, Math.round(8 + flicker * 9));
    ctx.fillStyle = 'rgba(255,224,102,.9)';
    ctx.fillRect(Math.round(p.x - 2), Math.round(p.y + 15), 4, Math.round(6 + flicker * 7));
    ctx.restore();
    drawSprite(shipArt[profile.selected], p.x, p.y, 48);
    if (state.power.shield > 0) {
      const pulse = 1 + Math.sin(state.time * 8) * 0.05;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = 'rgba(109,255,192,.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 24 * pulse, 0, TAU);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(109,255,192,.25)';
      ctx.lineWidth = 6;
      ctx.stroke();
      ctx.restore();
    }
    if (p.shieldFlash > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = 'rgba(255,255,255,.85)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 30 + (0.4 - p.shieldFlash) * 80, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawEnemies() {
    for (const enemy of state.enemies) {
      const sprite = sprites[enemy.type] || sprites[enemy.type==='interceptor'?'serpent':'gunner'];
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const aura = enemy.type === 'scout' ? 'rgba(255,63,164,.5)' : enemy.type === 'serpent' ? 'rgba(163,91,255,.55)' : 'rgba(255,155,74,.5)';
      drawGlow(enemy.x, enemy.y, enemy.r + 14, aura, 0.42);
      ctx.restore();
      drawSprite(sprite, enemy.x, enemy.y, enemy.width, enemy.flash > 0 ? 0.65 : 1);
      if (enemy.flash > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        drawGlow(enemy.x, enemy.y, enemy.r + 10, 'rgba(255,255,255,.9)', 0.6);
        ctx.restore();
      }
      if (enemy.maxHp > 1 && enemy.hp < enemy.maxHp) {
        ctx.fillStyle = 'rgba(0,0,0,.5)';
        ctx.fillRect(Math.round(enemy.x - 12), Math.round(enemy.y - enemy.r - 9), 24, 3);
        ctx.fillStyle = '#ff3fa4';
        ctx.fillRect(Math.round(enemy.x - 12), Math.round(enemy.y - enemy.r - 9), Math.round(24 * (enemy.hp / enemy.maxHp)), 3);
      }
    }
  }

  function drawBullets() {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const bullet of state.bullets) {
      ctx.fillStyle = 'rgba(61,246,255,.22)';
      ctx.fillRect(Math.round(bullet.x - 3), Math.round(bullet.y - 12), 6, 22);
      ctx.fillStyle = '#b9fdff';
      ctx.fillRect(Math.round(bullet.x - 1), Math.round(bullet.y - 8), 2, 14);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(Math.round(bullet.x - 1), Math.round(bullet.y - 8), 2, 4);
    }
    for (const bullet of state.enemyBullets) {
      const color = bullet.kind === 'purple' ? '#a35bff' : bullet.kind === 'orange' ? '#ff9b4a' : '#ff3fa4';
      drawGlow(bullet.x, bullet.y, bullet.r + 8, color, 0.5);
      ctx.fillStyle = color;
      ctx.fillRect(Math.round(bullet.x - bullet.r), Math.round(bullet.y - bullet.r), bullet.r * 2, bullet.r * 2);
      ctx.fillStyle = 'rgba(255,255,255,.9)';
      ctx.fillRect(Math.round(bullet.x - 1), Math.round(bullet.y - 1), 2, 2);
    }
    ctx.restore();
  }

  function drawBoss() {
    const boss = state.boss;
    if (!boss) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const coreAlpha = boss.telegraph ? 0.85 : 0.4 + Math.sin(boss.t * 5) * 0.15;
    drawGlow(boss.x, boss.y + 8, 92, boss.telegraph ? 'rgba(255,255,255,.8)' : 'rgba(255,63,164,.55)', coreAlpha);
    drawGlow(boss.x, boss.y - 6, 34, 'rgba(61,246,255,.6)', 0.5);
    ctx.restore();
    const flicker = boss.dead && Math.floor(boss.deathTimer * 18) % 2 === 0;
    drawSprite(bossArt[(Math.floor(state.wave/5)-1+5)%5], boss.x, boss.y, 160, flicker ? 0.5 : 1);
  }

  function drawPickups() {
    for (const item of state.pickups) {
      const colors = { shield: '#6dffc0', double: '#ff3fa4', rapid: '#a35bff' };
      const labels = { shield: 'S', double: '2', rapid: 'R' };
      const color = colors[item.type];
      const pulse = 1 + Math.sin(state.time * 6 + item.phase) * 0.08;
      ctx.save();
      ctx.translate(item.x, item.y);
      ctx.rotate(Math.sin(state.time * 2 + item.phase) * 0.25);
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(0, 0, 34 * pulse, color, 0.55);
      ctx.fillStyle = 'rgba(5,2,14,.9)';
      ctx.fillRect(-13, -13, 26, 26);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(-13, -13, 26, 26);
      ctx.fillStyle = color;
      ctx.font = 'bold 16px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(labels[item.type], 0, 1);
      ctx.restore();
    }
  }

  function drawParticles() {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const particle of state.particles) {
      const alpha = clamp(particle.life / particle.maxLife, 0, 1);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      const size = particle.size * (0.4 + alpha * 0.6);
      ctx.fillRect(Math.round(particle.x - size / 2), Math.round(particle.y - size / 2), size, size);
    }
    for (const ring of state.rings) {
      const alpha = clamp(ring.life / ring.maxLife, 0, 1);
      ctx.globalAlpha = alpha * 0.8;
      ctx.strokeStyle = ring.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(ring.x, ring.y, ring.radius, 0, TAU);
      ctx.stroke();
    }
    ctx.restore();
    ctx.save();
    ctx.textAlign = 'center';
    for (const f of state.floaters) {
      ctx.globalAlpha = clamp(f.life / f.maxLife, 0, 1);
      ctx.fillStyle = f.color;
      ctx.font = 'bold ' + f.size + 'px "Courier New", monospace';
      ctx.fillText(f.text, Math.round(f.x), Math.round(f.y));
    }
    ctx.restore();
  }

  function drawGame(dt) {
    drawPickups();
    drawEnemies();
    drawBoss();
    drawBullets();
    if (state.player && state.pendingOver <= 0) drawPlayer();
    drawParticles();
  }

  function render(dt) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#04020c';
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    if (state.shake > 0.2) {
      ctx.translate(rand(-state.shake, state.shake), rand(-state.shake, state.shake));
    }
    ctx.drawImage(background, 0, 0);
    const orbit=(state.menuTime*5+state.time*8)%1100;const px=state.wave%2?385:85;const py=orbit-150;ctx.save();ctx.globalAlpha=.55;const pg=ctx.createRadialGradient(px-35,py-40,4,px,py,110);pg.addColorStop(0,['#8d91ff','#ff9470','#a8eaff','#d7a1ff'][Math.floor((state.wave-1)/5)%4]);pg.addColorStop(1,'#10112c');ctx.fillStyle=pg;ctx.beginPath();ctx.arc(px,py,110,0,TAU);ctx.fill();ctx.strokeStyle='#8393ca';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(px,py,140,28,-.3,0,TAU);ctx.stroke();ctx.restore();
    const sector=Math.floor((state.wave-1)/5)%4;
    if(sector){ctx.fillStyle=['transparent','rgba(150,20,30,.19)','rgba(0,130,180,.17)','rgba(100,20,170,.22)'][sector];ctx.fillRect(0,0,W,H);}
    if(state.player && state.mode==='playing'){ctx.strokeStyle=fleet[profile.selected].tint;ctx.globalAlpha=.32;ctx.beginPath();ctx.arc(state.player.x,state.player.y,23,0,TAU);ctx.stroke();ctx.globalAlpha=1;}

    drawStars();
    const showGame = state.player && (state.mode === 'playing' || state.mode === 'paused' || state.mode === 'gameover');
    if (showGame) {
      drawGame(dt);
    } else if (state.mode === 'menu') {
      drawAmbientShips(dt);
      if (state.mode === 'menu' && state.player === null) {
        const bob = Math.sin(state.menuTime * 1.4) * 6;
        ctx.save();
        ctx.globalAlpha = 0.92;
        ctx.globalCompositeOperation = 'lighter';
        drawGlow(W / 2, 688 + bob, 46, 'rgba(61,246,255,.6)', 0.4);
        ctx.restore();
        drawSprite(shipArt[profile.selected], W / 2, 688 + bob, 80);
      }
    }
    ctx.restore();

    if (state.flash > 0) {
      ctx.globalAlpha = clamp(state.flash, 0, 0.5);
      ctx.fillStyle = state.flashColor;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }
    if (state.mode === 'playing' && state.lives === 1 && state.pendingOver <= 0) {
      const pulse = 0.12 + Math.sin(state.time * 4) * 0.05;
      const gradient = ctx.createRadialGradient(W / 2, H / 2, H * 0.32, W / 2, H / 2, H * 0.72);
      gradient.addColorStop(0, 'rgba(255,63,164,0)');
      gradient.addColorStop(1, 'rgba(255,63,164,' + pulse.toFixed(3) + ')');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, W, H);
    }
  }

  function pauseGame() {
    if (state.mode !== 'playing') return;
    window.NSDPlatform?.stop();savePlatinum();
    state.mode = 'paused';
    state.keys = Object.create(null);
    showScreen(dom.pauseScreen);
    updateSoundUI();
    Sound.ui();
  }

  function resumeGame() {
    if (state.mode !== 'paused') return;
    state.mode = 'playing';
    window.NSDPlatform?.start();
    showScreen(null);
    Sound.ui();
  }

  let lastSavedSecond=-1;
  let drag = null;
  let lastTime = 0, fpsValue=0, frames=0, fpsStart=0;

  function frame(timestamp) {
    if (!fpsStart) fpsStart=timestamp; frames++; if(timestamp-fpsStart>=1000){fpsValue=Math.round(frames*1000/(timestamp-fpsStart));frames=0;fpsStart=timestamp; $('fpsReadout').textContent=fpsValue+' FPS';}
    if (!lastTime) lastTime = timestamp;
    let dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;
    if (!Number.isFinite(dt) || dt < 0) dt = 0;
    dt = Math.min(dt, 0.05);

    if (state.mode === 'playing') {
      updatePlaying(dt);
    } else if (state.mode === 'menu' || state.mode === 'howto' || state.mode === 'records') {
      state.menuTime += dt;
    }
    if(state.particles.length>(platinum.quality==='low'?150:600))state.particles.splice(0,state.particles.length-(platinum.quality==='low'?150:600));
    updateStars(dt);
    render(dt);
    requestAnimationFrame(frame);
  }

  dom.playBtn.addEventListener('click', () => {
    ensureAudio();
    Sound.ui();
    startGame();
  });
  dom.howtoBtn.addEventListener('click', () => {
    Sound.ui();
    state.mode = 'howto';
    showScreen(dom.howtoScreen);
  });
  dom.recordsBtn.addEventListener('click', () => {
    Sound.ui();
    renderRecords();
    state.mode = 'records';
    showScreen(dom.recordsScreen);
  });
  dom.howtoBackBtn.addEventListener('click', () => { Sound.ui(); goMenu(); });
  dom.recordsBackBtn.addEventListener('click', () => { Sound.ui(); goMenu(); });
  dom.pauseBtn.addEventListener('click', () => pauseGame());
  dom.resumeBtn.addEventListener('click', () => resumeGame());
  dom.restartBtn.addEventListener('click', () => {
    Sound.ui();
    startGame();
  });
  dom.pauseMenuBtn.addEventListener('click', () => { Sound.ui(); goMenu(); });
  dom.retryBtn.addEventListener('click', () => {
    ensureAudio();
    Sound.ui();
    startGame();
  });
  dom.gameoverMenuBtn.addEventListener('click', () => { Sound.ui(); goMenu(); });

  const audioDialog=$('audioDialog');
  function openAudioPanel(){ensureAudio();$('audioTitle').textContent=tr('Audio settings','Configurações de áudio');$('audioClose').textContent=tr('Close','Fechar');$('audioReset').textContent=tr('Restore defaults','Restaurar padrão');$('audioMute').textContent=audio.muted?tr('Enable sound','Ativar som'):tr('Mute sound','Silenciar');
    const labels={master:tr('Master volume','Volume geral'),music:tr('Music','Música'),effects:tr('Sound effects','Efeitos sonoros'),alerts:tr('Combat alerts','Alertas de combate')};
    for(const k of Object.keys(mix)){$('label-'+k).textContent=labels[k];$('mix-'+k).value=mix[k];$('value-'+k).textContent=mix[k]+'%';}audioDialog.showModal();}
  for(const k of Object.keys(mix))$('mix-'+k).addEventListener('input',e=>{mix[k]=Number(e.target.value);$('value-'+k).textContent=mix[k]+'%';saveMix();});
  $('audioReset').onclick=()=>{Object.assign(mix,audioDefaults);saveMix();for(const k of Object.keys(mix)){$('mix-'+k).value=mix[k];$('value-'+k).textContent=mix[k]+'%';}};
  $('audioMute').onclick=()=>{toggleMute();$('audioMute').textContent=audio.muted?tr('Enable sound','Ativar som'):tr('Mute sound','Silenciar');};
  $('audioClose').onclick=()=>audioDialog.close();
  for(const b of document.querySelectorAll('[data-sound-test]'))b.onclick=()=>{const k=b.dataset.soundTest;if(['standard','rail','storm'].includes(k))Sound.shoot(k);else if(k==='music'){[220,330,440].forEach((f,i)=>tone(f,.2,{type:'triangle',volume:.035,bus:'music',delay:i*.18}));}else Sound[k]();};
  $('audioMenuBtn').onclick=openAudioPanel;$('audioPauseBtn').onclick=openAudioPanel;
  dom.soundBtn.addEventListener('click', toggleMute);
  dom.pauseSoundBtn.addEventListener('click', toggleMute);
  dom.hudSoundBtn.addEventListener('click', toggleMute);

  window.addEventListener('keydown', (event) => {
    if ($('audioDialog').open) return;
    const code = event.code;
    if (code === 'Escape') {
      if (state.mode === 'playing') {
        event.preventDefault();
        pauseGame();
      } else if (state.mode === 'paused') {
        event.preventDefault();
        resumeGame();
      }
      return;
    }
    if (code === 'Space' || code.startsWith('Arrow')) event.preventDefault();
    if (code === 'Enter' && state.mode === 'menu') {
      ensureAudio();
      startGame();
      return;
    }
    if (state.mode === 'playing') {
      if(code==='KeyQ'&&!event.repeat)pulse();
      if(code==='KeyF'&&!event.repeat)state.autofire=!state.autofire;
      state.keys[code] = true;
      if (code === 'Space') ensureAudio();
    }
  });

  window.addEventListener('keyup', (event) => {
    state.keys[event.code] = false;
  });

  window.addEventListener('blur', () => {
    state.keys = Object.create(null);
    if (state.mode === 'playing') pauseGame();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && state.mode === 'playing') pauseGame();
  });

  canvas.addEventListener('pointerdown', (event) => {
    if (state.mode !== 'playing') return;
    ensureAudio();
    if (event.pointerType === 'touch' || event.pointerType === 'pen') {
      state.autofire = true;
    }
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY };
    try { canvas.setPointerCapture(event.pointerId); } catch (error) { /* alguns navegadores não suportam */ }
    event.preventDefault();
  }, { passive: false });

  canvas.addEventListener('pointermove', (event) => {
    if (!drag || drag.id !== event.pointerId || state.mode !== 'playing' || !state.player) return;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const p = state.player;
    p.x = clamp(p.x + (event.clientX - drag.x) * (W / rect.width), 17, W - 17);
    p.y = clamp(p.y + (event.clientY - drag.y) * (H / rect.height), 82, H - 32);
    drag.x = event.clientX;
    drag.y = event.clientY;
    event.preventDefault();
  }, { passive: false });

  function endDrag(event) {
    if (drag && event.pointerId === drag.id) drag = null;
  }
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);
  canvas.addEventListener('lostpointercapture', endDrag);

  document.addEventListener('touchmove', (event) => {
    if (!event.target.closest || !event.target.closest('.scroll-panel')) {
      event.preventDefault();
    }
  }, { passive: false });
  document.addEventListener('gesturestart', (event) => event.preventDefault());
  document.addEventListener('contextmenu', (event) => {
    if (event.target.closest && event.target.closest('#shell')) event.preventDefault();
  });

  function snapshot() {
    return {
      mode: state.mode,
      score: state.score,
      lives: state.lives,
      wave: state.wave,
      enemies: state.enemies.length,
      enemyTypes: state.enemies.map((enemy) => enemy.type),
      bullets: state.bullets.length,
      enemyBullets: state.enemyBullets.length,
      pickups: state.pickups.map((item) => item.type),
      boss: state.boss ? {
        hp: state.boss.hp,
        maxHp: state.boss.maxHp,
        dead: state.boss.dead,
        entering: state.boss.entering,
        shootTimer: Number(state.boss.shootTimer.toFixed(2)),
        pattern: state.boss.pattern,
        x: Math.round(state.boss.x),
        y: Math.round(state.boss.y)
      } : null,
      player: state.player ? {
        x: Math.round(state.player.x),
        y: Math.round(state.player.y),
        invuln: Number(state.player.invuln.toFixed(2))
      } : null,
      power: {
        shield: Number(state.power.shield.toFixed(2)),
        double: Number(state.power.double.toFixed(2)),
        rapid: Number(state.power.rapid.toFixed(2))
      },
      autofire: state.autofire,
      records: readRecords(),
      hudVisible: !dom.hud.classList.contains('hidden'),
      bossbarVisible: !dom.bossbar.classList.contains('hidden'),
      pauseVisible: !dom.pauseScreen.classList.contains('hidden'),
      gameoverVisible: !dom.gameoverScreen.classList.contains('hidden'),
      bannerVisible: !dom.banner.classList.contains('hidden'),
      bannerText: dom.bannerTitle.textContent,
      finalScore: dom.finalScore.textContent,
      recordNotice: dom.recordNotice.textContent
    };
  }

  window.addEventListener('pagehide',()=>{savePlatinum();saveProfile();savePremium();saveProgress();window.NSDPlatform?.stop();});
  translateUI();
  window.NSD = {version:'3.3.2',get fps(){return fpsValue;}};
  updateSoundUI();
  refreshMenuBest();
  renderRecords();
  updateLivesHUD(true);
  updateScoreHUD(true);
  updateWaveHUD(true);
  showScreen(dom.menuScreen);
  setHudVisible(false);
  requestAnimationFrame(frame);
})();

