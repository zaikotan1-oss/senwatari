// 2026-11-17 製品らしく（本人「安っぽい感じだから、もうちょっと製品っぽくしたい」）
// タイトルのうしろで本物の面がひとりでに解かれるデモ・画面の切り替え・星 3 つ・BGM・音の入切
"use strict";
const UI=(()=>{
  const $=id=>document.getElementById(id),wrapEl=$("wrap"),TEST=location.hash==="#test";
  // ---------- 画面の切り替え（まるく閉じる → 中身を変える → まるく開く） ----------
  let wiping=false;
  function wipe(fn){if(wiping)return;wiping=true;const w=$("wipe");w.className="close";
    setTimeout(()=>{fn();w.className="open";setTimeout(()=>{w.className="";wiping=false;},320);},270);}
  // ---------- 星: 描いた線の長さを、答えの線の長さとくらべる ----------
  const plen=pts=>{let n=0;for(let i=1;i<pts.length;i++)n+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);return n;};
  function starsFor(){
    if(!lastStroke||!L.sol)return 3;
    const mine=plen(lastStroke.pts.map(p=>[p.x,p.y])),ans=plen(L.sol);
    if(mine<=ans*1.35+80)return 3;
    if(mine<=ans*2+160)return 2;
    return 1;}
  // ---------- 音: BGM は WebAudio で回す（全部読んでから鳴らすので、オフラインの写しにも入る） ----------
  const SKEY="senwatari_snd";let snd={bgm:1,sfx:1};
  try{const o=JSON.parse(localStorage.getItem(SKEY));if(o)snd={...snd,...o};}catch(e){}
  const TR={title:"bgm/16_accordion_marimba.mp3",a:"bgm/17_banjo_glockenspiel.mp3",b:"bgm/15_koto_kalimba.mp3"};
  const buf={},loading={};let cur=null,want=null;
  function load(k){if(buf[k]||loading[k])return loading[k];const a=audio();if(!a)return null;
    loading[k]=fetch(TR[k]).then(r=>r.arrayBuffer()).then(d=>new Promise((ok,ng)=>a.decodeAudioData(d,ok,ng))).then(b=>{buf[k]=b;return b;}).catch(()=>null);return loading[k];}
  function fadeOut(c){if(!c)return;const a=audio(),t=a.currentTime;c.g.gain.cancelScheduledValues(t);c.g.gain.setValueAtTime(c.g.gain.value,t);c.g.gain.linearRampToValueAtTime(0,t+.6);try{c.src.stop(t+.7);}catch(e){}}
  function music(k){want=k;if(TEST)return;if(!snd.bgm||!k){fadeOut(cur);cur=null;return;}
    if(cur&&cur.k===k)return;const a=audio();if(!a)return;
    const p=load(k);if(!p)return;p.then(b=>{if(!b||want!==k||(cur&&cur.k===k)||!snd.bgm)return;
      fadeOut(cur);const src=a.createBufferSource(),g=a.createGain();src.buffer=b;src.loop=true;g.gain.value=0;
      src.connect(g).connect(a.destination);src.start();g.gain.linearRampToValueAtTime(.32,a.currentTime+1);cur={k,src,g};});}
  function duck(on){if(!cur)return;const a=audio(),t=a.currentTime;cur.g.gain.cancelScheduledValues(t);cur.g.gain.setValueAtTime(cur.g.gain.value,t);cur.g.gain.linearRampToValueAtTime(on?.1:.32,t+.3);}
  const playTrack=()=>Math.floor(li/20)%2?"b":"a";
  function sndIcon(){document.querySelectorAll(".btn.snd").forEach(b=>{b.classList.toggle("nomusic",!snd.bgm);b.classList.toggle("off",!snd.sfx);});}
  function applySnd(){window.SFX_MUTE=!snd.sfx||demo;sndIcon();try{localStorage.setItem(SKEY,JSON.stringify(snd));}catch(e){}}
  function cycleSnd(){audio();if(snd.bgm&&snd.sfx){snd.bgm=0;toast("おんがく オフ");}else if(snd.sfx){snd.sfx=0;toast("おと ぜんぶ オフ");}else{snd={bgm:1,sfx:1};toast("おと オン");}
    applySnd();music(snd.bgm?(demo||$("titleOv").classList.contains("show")?"title":playTrack()):null);}
  $("sndBtn").onclick=cycleSnd;$("tSnd").onclick=cycleSnd;
  // ---------- タイトルのデモ: 答えの線をゆっくり描いて、車が走るのを見せる ----------
  const DEMO=[0,2,7,12,40,121,124,128,146,160,205,222,230,268,290,330,371,412,455,498,540,583].filter(i=>i<LEVELS.length&&LEVELS[i].sol);
  let demo=false,dk=Math.floor(Math.random()*DEMO.length),dT=0,dPts=null,dN=0,dTimer=0;
  function demoLoad(){const i=DEMO[dk%DEMO.length];dk++;quiet=true;loadLevel(i);quiet=false;
    // 答えの線を細かい点にする
    const s=LEVELS[i].sol;dPts=[];for(let k=1;k<s.length;k++){const [ax,ay]=s[k-1],[bx,by]=s[k],n=Math.max(1,Math.ceil(Math.hypot(bx-ax,by-ay)/7));
      for(let j=(k===1?0:1);j<=n;j++)dPts.push({x:ax+(bx-ax)*j/n,y:ay+(by-ay)*j/n});}
    dN=0;dT=0;}
  function demoTick(){if(!demo||$("selOv").classList.contains("show"))return;dT+=1/60;
    if(state==="draw"&&dPts){
      if(dT>.9){if(dN===0)beginDraw(dPts[0]);const step=Math.max(1,Math.ceil(dPts.length/50));
        for(let k=0;k<step&&dN<dPts.length;k++){dN++;if(dN<dPts.length)moveDraw(dPts[dN]);}
        if(dN>=dPts.length){endDraw();dPts=null;}}}
    if(dT>11&&!wiping)next();}
  // 面が変わる時は絵だけを消して出す（ワイプを使うと、その間に押した「あそぶ」が効かず、ロゴも隠れていた・改善ループ1）
  function next(){clearTimeout(dTimer);if(!demo)return;dT=-99;wrapEl.classList.add("dfade");
    setTimeout(()=>{if(demo)demoLoad();setTimeout(()=>wrapEl.classList.remove("dfade"),60);},260);}
  function demoStart(){if(TEST||!LEVELS.length)return;demo=true;wrapEl.classList.add("intitle");applySnd();demoLoad();}
  function demoStop(){if(!demo)return;demo=false;clearTimeout(dTimer);wrapEl.classList.remove("intitle","dfade");applySnd();drawing=null;}
  function demoWin(){winFx=[];const cols=["#ff5a4e","#ffd23f","#5cc443","#3fa7ff","#ff8ac8"];
    for(let k=0;k<60;k++)winFx.push({x:L.goal[0]+(Math.random()-.5)*200,y:L.goal[1]-120,vx:(Math.random()-.5)*9,vy:-4-Math.random()*8,r:Math.random()*6,c:cols[k%5]});
    clearTimeout(dTimer);dTimer=setTimeout(next,2200);}
  // 失敗した時・クリアした時の本体の処理に割り込む（デモの間は札もセーブも出さない）
  const finish0=finish;
  finish=function(win,msg){if(demo){if(state==="win"||state==="fail")return;state=win?"win":"fail";if(win)demoWin();else{clearTimeout(dTimer);dTimer=setTimeout(next,1200);}return;}
    finish0(win,msg);
    if(state==="win"){duck(true);setTimeout(()=>duck(false),2600);}};
  // 面を読み込むたびに曲を合わせる
  const load0=loadLevel;
  loadLevel=function(i){load0(i);if(!quiet&&!demo)music(playTrack());};
  function titleInfo(){const n=nextIdx(),got=starSum(),clr=save.stars.filter(x=>x>0).length;
    $("startSub").textContent=clr?`STAGE ${n+1} から`:"STAGE 1 から";
    $("tStars").innerHTML=`⭐ ${got} / ${LEVELS.length*3}　・　クリア ${clr} / ${LEVELS.length}`;}
  function toTitle(){wipe(()=>{$("resOv").classList.remove("show");$("selOv").classList.remove("show");titleInfo();$("titleOv").classList.add("show");demoStart();music("title");});}
  // 毎フレームのデモ
  const step0=step;step=function(){step0();if(demo)demoTick();};
  // 最初のひと押しで音を出せるようにする（ブラウザの決まり）
  addEventListener("pointerdown",()=>{if(!audio())return;if(!cur&&snd.bgm)music(want||($("titleOv").classList.contains("show")?"title":playTrack()));},{capture:true});
  applySnd();
  if(!TEST){titleInfo();demoStart();music("title");load("a");}
  if(document.fonts&&document.fonts.load){document.fonts.load('900 20px ZenMaru');document.fonts.load('700 20px ZenMaru');}
  return {wipe,starsFor,demoOn:()=>demo,_next:next,demoStop,demoWin,toTitle,music};
})();
