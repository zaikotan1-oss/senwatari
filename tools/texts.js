// 画面に出る字を 1 つの一覧（id つき）にする。改善ループの採点・直しに使う
// node tools/texts.js dump <out.json> <facts.txt>   … 一覧と、面の中身の要約を書く
// node tools/texts.js apply <edits.json>             … {id:新しい字} を本体へ書き戻す
const fs=require("fs"),path=require("path");
const ROOT=path.join(__dirname,"..");
const rd=f=>fs.readFileSync(path.join(ROOT,f),"utf8"),wr=(f,s)=>fs.writeFileSync(path.join(ROOT,f),s);
function stages(){global.window={};eval(rd("stages.js"));return window.STAGES;}
// index.html の手作り面（HAND）の名前とヒント
function hand(){const s=rd("index.html");const out=[];const re=/\{name:"([^"]*)",hint:"([^"]*)"/g;let m;
  const a=s.indexOf("const LEVELS"),b=s.indexOf("const HAND_SOLS");const part=s.slice(a>0?a:0,b>0?b:s.length);
  while((m=re.exec(part)))out.push({name:m[1],hint:m[2]});return out;}
function looks(){const s=rd("looks.js");const T={},C=[],TH=[];
  const ta=s.slice(s.indexOf("const TALK={"),s.indexOf("};",s.indexOf("const TALK={")));
  for(const m of ta.matchAll(/(\w+):\[("[^\]]*")\]/g))T[m[1]]=JSON.parse("["+m[2]+"]");
  for(const m of s.matchAll(/\{w:\[("[^\]]*")\],d\(c\)/g))C.push(JSON.parse("["+m[1]+"]"));
  const th=s.slice(s.indexOf("const THEMES=["),s.indexOf("\n];",s.indexOf("const THEMES=[")));
  for(const m of th.matchAll(/\{name:"([^"]*)"/g))TH.push(m[1]);return {T,C,TH};}
// 画面の文（失敗・札・ボタン）。key はその文で判定している言葉（言いかえる時に残す）
const UI=[["index.html","ハチに さされた！"],["index.html","おおいわに ぶつかっちゃった！","おおいわ"],["index.html","いしが あたっちゃった！","いしが"],
 ["index.html","ようがんに おちちゃった…"],["index.html","うちゅうに おちちゃった…"],["index.html","せんろに おちちゃった…"],["index.html","くるまが おちちゃった…"],
 ["index.html","ひっくりかえっちゃった…","ひっくり"],["index.html","にもつを おとしちゃった…","にもつ"],["index.html","じかんぎれ… くるまが すすめなかった","じかん"],
 ["index.html","うごけなく なっちゃった…","うごけなく"],["index.html","トゲにささっちゃった！","トゲ"],["modes.js","トゲにささっちゃった！","トゲ"],
 ["index.html","ゴムの せん"],["index.html","こおりの せん"],["index.html","とまる せん"],["index.html","うく せん"],["index.html","てつの せん"],
 ["index.html","インク すこし"],["index.html","つぎへ ▶"],["index.html","ステージを えらぶ"],["index.html","やりなおす"],["index.html","もう いっかい"],["index.html","よこむきに して あそんでね"],
 ["modes.js","おっさんが とんでいっちゃった…","とんでいっちゃった"],["modes.js","ボールが おちちゃった…"],["modes.js","じかんぎれ…","じかん"],
 ["modes.js","🏁 はたまで"],["modes.js","🛡 まもれ"],["modes.js","くるまで あてて！"],["modes.js","ぶつけて！"],["modes.js","ここに ちゃくち"],["modes.js","ナイス ちゃくち！"]];
function all(){const S=stages(),H=hand(),{T,C,TH}=looks();const L=[];
  S.forEach((st,i)=>{const o=st.hand!==undefined?H[st.hand]:st;L.push({id:`s${i+1}.name`,text:o.name},{id:`s${i+1}.hint`,text:o.hint||""});});
  for(const k in T)T[k].forEach((t,j)=>L.push({id:`talk.${k}.${j}`,text:t,note:["まつ","はしる","クリア","しっぱい"][j]}));
  C.forEach((w,i)=>w.forEach((t,j)=>L.push({id:`cheer.${i}.${j}`,text:t,note:`${i*5+1}〜${i*5+5}めん`+(i<4?`と ${i*5+101}〜${i*5+105}めん`:"")+"の クリアで みものやくが いう"})));
  TH.forEach((t,i)=>L.push({id:`theme.${i}`,text:t,note:`${i*5+1}〜${i*5+5}めんの せかいの なまえ`}));
  const seen=new Set();UI.forEach(([f,t,key])=>{if(seen.has(t))return;seen.add(t);L.push({id:`ui.${t}`,text:t,...(key?{keep:key}:{})});});
  return L;}
function facts(){const S=stages(),H=hand(),{TH}=looks();let o="";
  S.forEach((st,i)=>{const s=st.hand!==undefined?{...H[st.hand],hand:1}:st;const objs={};(s.objs||[]).forEach(q=>objs[q.k]=(objs[q.k]||0)+1);
    o+=`${i+1}めん「${s.name}」 せかい:${TH[Math.min(TH.length-1,Math.floor(i/5))]}`+(s.line?` せん:${s.line}`:"")+` もくてき:${(s.goals||["flag"]).join("+")}`+(s.guard?` まもる:${s.guard}びょう`:"")
      +(s.cars?` くるま:${s.cars}だい`:"")+(s.dir===-1?" みぎから ひだりへ":"")+(s.turn!==undefined?" いってもどる":"")+(s.air?" くるまは そらから":"")+(s.ink?` インク:${s.ink}`:"")+(s.rocks?" いわが ふる":"")+(s.boulder?" おおいわが ころがる":"")
      +(s.mode?` しかけ:${s.mode}`:"")+` おきもの:${JSON.stringify(objs)}`+(s.sol?` こたえの せん:${JSON.stringify(s.sol)}`:"")+`\n   ヒント: ${s.hint||""}\n`;});return o;}
// 線の性質（【とまる せん】）と まもる秒数は画面の札に出るので、ヒントに無くてもよい
// 機械で数える軸: 軸A（よめる: 漢字・長さ・すきま）と 軸B（ただしい: ヒントと面の中身）
const WORDS=[["ハチ",["bees"]],["トゲ",["toge"]],["ジャンプだい",["jump"]],["ボタン",["btn","hit"]],["しゃだんき",["gate","bridge"]],["もん",["gate"]],["ボール",["ball"]],["はこ",["box","balloon"]],
 ["カゴ",["basket"]],["たいほう",["cannon"]],["バネ",["spring"]],["せんぷうき",["fan"]],["ドミノ",["domino"]],["エレベーター",["plat"]],["ワープ",["warp"]],["ふうせん",["balloon"]],["てこ",["lever"]],["ベルト",["conv"]],["おおいわ",["boulder"]],["めざまし",["oji"]],["おっさん",["guy","saw","oji"]],["ふとん",["saw"]],["シーソー",["saw","lever"]]];
function check(){const L=all(),S=stages(),H=hand();const bad=[];const K=/[一-鿿]/;
  for(const x of L){const t=x.text.replace(/\{[^}]*\}/g,"");
    if(K.test(t))bad.push([x.id,"A","漢字が のこっている"]);
    if(/  |^ | $| [、。！？…]/.test(x.text))bad.push([x.id,"A","すきまが へん"]);
    if(x.id.endsWith(".name")&&x.text.length>16)bad.push([x.id,"A",`なまえが ながい（${x.text.length}じ）`]);
    if(x.id.endsWith(".hint")&&x.text.length>90)bad.push([x.id,"A",`ヒントが ながい（${x.text.length}じ）`]);
    if((x.id.startsWith("talk")||x.id.startsWith("cheer"))&&x.text.replace(/\{([^|}]+)\|[^}]+\}/g,"$1").length>18)bad.push([x.id,"A","ふきだしが ながい"]);}
  const names={};S.forEach((st,i)=>{const n=(st.hand!==undefined?H[st.hand]:st).name;(names[n]=names[n]||[]).push(i+1);});
  for(const n in names)if(names[n].length>1)names[n].forEach(k=>bad.push([`s${k}.name`,"B",`おなじ なまえが ${names[n].join("・")}めん`]));
  S.forEach((st,i)=>{const s=st.hand!==undefined?H[st.hand]:st,h=s.hint||"",ks=new Set((s.objs||[]).map(q=>q.k));if(s.rocks)ks.add("rocks");if(s.boulder)ks.add("boulder");if(s.mode==="launch")ks.add("saw");if(s.mode==="guard"||s.mode==="wake")ks.add("guy");
    for(const [w,k] of WORDS)if(new RegExp(w+(w==="はこ"?"(?![ばぶぼべ])":"")).test(h)&&!k.some(z=>ks.has(z))&&!(w==="もん"&&h.includes("もんだい")))bad.push([`s${i+1}.hint`,"B",`ヒントに「${w}」と あるが 面に ない`]);
    const th=looks().TH[Math.min(23,Math.floor(i/5))];for(const w of ["つき","うちゅう","うみ","ゆき","かざん"])if(new RegExp("(^|[ 、。！])"+w+"(の|に|で|は|でも)").test((s.name||"")+" "+h)){const ok={つき:["つき"],うちゅう:["つき","ぎんが"],うみ:["うみの そこ","みなみの しま"],ゆき:["ゆきやま"],かざん:["かざん"]}[w];if(!ok.includes(th))bad.push([`s${i+1}.name`,"B",`「${w}」と あるが せかいは ${th}`]);}
    const m=h.match(/(\d+)\s*びょう/);if(m&&+m[1]!==s.guard)bad.push([`s${i+1}.hint`,"B",`ヒントは ${m[1]}びょう、面は ${s.guard}びょう`]);
});
  return bad;}
const [cmd,a,b]=process.argv.slice(2);
if(cmd==="check"){const r=check();if(a)fs.writeFileSync(a,JSON.stringify(r,null,1));const c={A:0,B:0};r.forEach(x=>c[x[1]]++);console.log(JSON.stringify(c));r.forEach(x=>console.log(x.join(" | ")));}
if(cmd==="dump"){const L=all();fs.writeFileSync(a,JSON.stringify(L,null,1));if(b)fs.writeFileSync(b,facts());console.log("items",L.length);}
if(cmd==="apply"){const E=JSON.parse(fs.readFileSync(a,"utf8")),L=all(),by=Object.fromEntries(L.map(x=>[x.id,x]));let n=0;
  // 面: stages.js を順番に 1 面ずつ探して置きかえる（同じ名前が別の面にあっても、その面のだけ変える）
  let s=rd("stages.js");const S=stages();let pos=0;
  S.forEach((st,i)=>{if(st.hand!==undefined)return;for(const f of ["name","hint"]){const id=`s${i+1}.${f}`,old=st[f];if(old===undefined)continue;
      const j=s.indexOf(JSON.stringify(old),pos);if(j<0)throw new Error("not found "+id);
      if(E[id]!==undefined&&E[id]!==old){s=s.slice(0,j)+JSON.stringify(E[id])+s.slice(j+JSON.stringify(old).length);n++;}
      pos=j+1;}});
  wr("stages.js",s);
  const files={"index.html":rd("index.html"),"modes.js":rd("modes.js"),"looks.js":rd("looks.js")};
  for(const [id,t] of Object.entries(E)){if(id.startsWith("s")&&/^s\d+\./.test(id)){
      const k=+id.slice(1,id.indexOf(".")),st=S[k-1];if(st.hand===undefined)continue; // HAND の面は index.html
      const old=by[id].text;const q=JSON.stringify(old);if(files["index.html"].split(q).length!==2)throw new Error("HAND not unique "+id);
      files["index.html"]=files["index.html"].replace(q,JSON.stringify(t));n++;continue;}
    const it=by[id];if(!it)throw new Error("no id "+id);if(it.text===t)continue;
    if(it.keep&&!t.includes(it.keep))throw new Error(`${id} は「${it.keep}」を残すこと`);
    const f=id.startsWith("ui.")?Object.keys(files).filter(f=>files[f].includes(JSON.stringify(it.text))):["looks.js"];
    if(!f.length)throw new Error("not found "+id);
    for(const ff of f){const q=JSON.stringify(it.text);
      if(id.startsWith("ui."))files[ff]=files[ff].split(q).join(JSON.stringify(t));
      else{if(files[ff].split(q).length!==2)throw new Error("not unique "+id);files[ff]=files[ff].replace(q,JSON.stringify(t));}}
    n++;}
  for(const f in files)wr(f,files[f]);console.log("applied",n);}
