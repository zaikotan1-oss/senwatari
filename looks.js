/* 絵柄 20 種（5 面ごとにガラッと変わる）と、走る物の見た目
   ・ふつうの絵柄: 空→遠くの山→遠景の飾り→水 を index.html の render が描く
   ・bg を持つ絵柄: 背景を丸ごと BG[bg] が描く（描き方そのものが違う: 落書き・ドット絵・設計図…）
   ・rider: 走る物（当たり判定は車と同じ。車体 -48..48 × -13..13、車輪は ±32, +20, 半径 19）
   ・post: "pixel" は荒いドットに、"gb" はさらに緑 4 色に
   ・gravity: 91〜100 面（月・銀河）は重力が弱い。面の合格はこの重力で確かめてある */
// sky:空 hill:遠くの山 ground:土(上,下) grass:表面 edge:ふち water:水 line:描いた線 car:本体,屋根,ふち
const THEMES=[
 {name:"みどりの谷",sky:["#5fb8ff","#d9f1ff"],hill:["#9cc9e8","#86bcdf"],ground:["#b07a45","#6e4526"],grass:["#5cc443","#46a834"],edge:"#4a2e18",
  water:["#2d8fe0","#1552a0"],line:["#151827","#3a4166"],car:["#ff5a4e","#e8412f","#9c2518"],deco:"clouds",rider:"car"},
 {name:"ノートの落書き",bg:"sketch",ground:["#eee6cf","#e4dbc0"],grass:["#fbf8ef","#fbf8ef"],noGrass:1,noStripe:1,edge:"#2a2a2a",edgeW:3,rough:1,gpat:"hatch",
  water:["#fbf8ef","#fbf8ef"],line:["#1a3a9a","#5a88f0"],car:["#ffc4d0","#ff9ab4","#2a2a2a"],deco:"sketch",rider:"pig",wheel:"sketch"},
 {name:"地下鉄",bg:"subway",ground:["#a8a8ae","#6a6a72"],grass:["#f0d020","#c8a810"],gtop:"tactile",edge:"#2a2a30",
  water:["#1a1a1e","#0a0a0c"],line:["#1a1a2a","#e0e0f0"],car:["#f0a020","#c87a10","#3a2a10"],deco:"subway",subway:true,rider:"bridge"},
 {name:"ドット絵の国",bg:"pixel",ground:["#c84c0c","#c84c0c"],grass:["#00a800","#006800"],noStripe:1,gpat:"brick",edge:"#000000",edgeW:4,
  water:["#3050f8","#2038a8"],line:["#000000","#fcfcfc"],car:["#00a800","#006800","#003800"],deco:"pixel",rider:"tank",post:"pixel"},
 {name:"さばく",sky:["#6cc8ff","#fff3c4"],hill:["#f2c77a","#e0b060"],ground:["#e0a860","#a8743a"],grass:["#f7dc98","#e6c47a"],edge:"#7a5020",
  water:["#35c9c0","#1a8a90"],line:["#3a2410","#7a5030"],car:["#ffd23f","#f0b400","#8a6400"],deco:"desert",rider:"buggy"},
 {name:"設計図",bg:"blue",ground:["#3474c8","#2a66b8"],grass:["#ffffff","#1d56a8"],noGrass:1,noStripe:1,gpat:"xhatch",edge:"#ffffff",edgeW:2.5,
  water:["#1d56a8","#1d56a8"],line:["#ffffff","#9fd0ff"],car:["#1d56a8","#2a64b8","#ffffff"],deco:"blue",rider:"loco",wheel:"line"},
 {name:"雪山",sky:["#8cc8f5","#f0f8ff"],hill:["#dbe9f7","#c2d6ec"],ground:["#8a9bb0","#56657a"],grass:["#ffffff","#dfe9f5"],edge:"#3a4658",
  water:["#7ec8e8","#3f7fb0"],line:["#1a2440","#40507a"],car:["#2a2a38","#ffffff","#10101a"],deco:"snow",rider:"penguin"},
 {name:"ネオン街道",bg:"neon",ground:["#120020","#07000f"],grass:["#ff2a9a","#7a0a5a"],noStripe:1,gpat:"neongrid",edge:"#00f0ff",edgeW:3,glow:"#00f0ff",
  water:["#0a0018","#000000"],line:["#ff2a9a","#ffd0f0"],car:["#1a0030","#ff2a9a","#00f0ff"],deco:"neon",rider:"sports",wheel:"neon"},
 {name:"夜の町",sky:["#0b1a3a","#2a3f75"],hill:["#1f2f55","#18264a"],ground:["#4a3a5a","#241a30"],grass:["#3a8a5a","#2a6a44"],edge:"#120c1a",
  water:["#1a3a7a","#0a1a40"],line:["#fff4c0","#ffd860"],car:["#ffffff","#16161e","#556"],deco:"night",rider:"kotatsu"},
 {name:"黒板",bg:"chalk",ground:["#4a6a58","#3e5c4a"],grass:["#f4f4ec","#2e4a3a"],noGrass:1,noStripe:1,gpat:"chalk",edge:"#f4f4ec",edgeW:3,rough:1,
  water:["#2e4a3a","#2e4a3a"],line:["#fff6a0","#ffffff"],car:["#2e4a3a","#ffb0d0","#f4f4ec"],deco:"chalk",rider:"cat",wheel:"chalk"},
 {name:"秋の森",sky:["#9fd3ff","#fff0d8"],hill:["#e0a070","#c8805a"],ground:["#9a5a30","#5a3018"],grass:["#d9822b","#b8661e"],edge:"#3a1e0c",
  water:["#3a9ad0","#1a5a90"],line:["#20140a","#5a3a20"],car:["#8a5a3a","#6a3e22","#2a160a"],deco:"autumn",rider:"boar"},
 {name:"浮世絵",bg:"ukiyo",ground:["#7a5a3a","#4a3420"],grass:["#4a7a50","#2f5a38"],noStripe:1,gpat:"wood",edge:"#1a1410",edgeW:4,
  water:["#1f3a6a","#0f2448"],line:["#1a1410","#c8392b"],car:["#c8392b","#1f3a6a","#1a1410"],deco:"ukiyo",rider:"rickshaw"},
 {name:"南の島",sky:["#3fbfff","#c9f3ff"],hill:["#7fd8c8","#5cc0b0"],ground:["#f0d090","#c8a060"],grass:["#63d471","#48b858"],edge:"#8a6a30",
  water:["#1fc8d8","#0a7fb0"],line:["#0a2a40","#2a5a80"],car:["#48b858","#2e8a40","#145a24"],deco:"island",rider:"bath"},
 {name:"アメコミ",bg:"comic",ground:["#ffd23f","#f0a800"],grass:["#ff3b3b","#c81e1e"],noStripe:1,gpat:"dots",edge:"#000000",edgeW:6,
  water:["#1e6ae0","#1e6ae0"],line:["#000000","#ffffff"],car:["#ff3b3b","#ffffff","#000000"],deco:"comic",rider:"superoji",wheel:"comic"},
 {name:"火山",sky:["#2a0a0a","#a0381e"],hill:["#4a1a14","#3a120e"],ground:["#4a3434","#1e1212"],grass:["#6a5a5a","#4a3a3a"],edge:"#0a0404",
  water:["#ff8a00","#c01e00"],line:["#fff0d0","#ffc070"],car:["#8a8a90","#5a5a60","#222"],deco:"volcano",lava:true,rider:"cart"},
 {name:"ゲームボーイ",bg:"pixel",ground:["#306230","#306230"],grass:["#8bac0f","#0f380f"],noStripe:1,gpat:"brick",edge:"#0f380f",edgeW:4,
  water:["#306230","#0f380f"],line:["#0f380f","#9bbc0f"],car:["#8bac0f","#306230","#0f380f"],deco:"pixel",rider:"futon",post:"gb"},
 {name:"おかしの国",sky:["#ffb6e1","#fff0fa"],hill:["#ffd0ea","#f7b8dc"],ground:["#8a5230","#5a3018"],grass:["#ff8ac8","#ff6ab4"],edge:"#3a1a0a",
  water:["#b0e8ff","#70c0f0"],line:["#5a2a10","#8a5030"],car:["#fff4e0","#ff6ab4","#8a5230"],deco:"candy",rider:"cake"},
 {name:"海の底",bg:"sea",ground:["#d8c090","#8a7048"],grass:["#ff7a8a","#d84a6a"],noStripe:1,gpat:"sand",edge:"#4a3a20",
  water:["#020a1a","#000308"],line:["#fff4a0","#ffd040"],car:["#ffd23f","#f0b400","#6a4a00"],deco:"sea",rider:"sub"},
 {name:"月",sky:["#05040f","#1a1440"],hill:["#2a2a3a","#20202e"],ground:["#9a9aa4","#5a5a66"],grass:["#d0d0d8","#b0b0bc"],edge:"#303038",
  water:["#1a1030","#08040f"],line:["#ffffff","#b0d0ff"],car:["#e8e8f0","#c8a040","#404050"],deco:"moon",gravity:.45,space:true,rider:"rover"},
 {name:"銀河",bg:"galaxy",ground:["#4a2a7a","#1a0a3a"],grass:["#40f0ff","#2090c0"],noStripe:1,gpat:"crystal",edge:"#d0a0ff",edgeW:3,glow:"#b070ff",
  water:["#000000","#000000"],line:["#40f0ff","#e0ffff"],car:["#b8c4d8","#80ff90","#40485a"],deco:"galaxy",gravity:.45,space:true,rider:"ufo",wheel:"orb"},
];

/* ---------- 背景（bg を持つ絵柄） ---------- */
function hills(y0,a,f,ph){ctx.beginPath();ctx.moveTo(0,H);for(let x=0;x<=W;x+=40)ctx.lineTo(x,y0-Math.sin(x*f+ph)*a);ctx.lineTo(W,H);}
const BG={
 subway(th,ph){ // 地下鉄の駅: タイルの壁・線の色の帯・柱・駅名・奥を通る電車・手前は線路
  ctx.fillStyle="#e8e2d0";ctx.fillRect(0,0,W,H);
  ctx.strokeStyle="#c8c2b0";ctx.lineWidth=1.5;for(let y=90;y<520;y+=24){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
  for(let y=90,r=0;y<520;y+=24,r++)for(let x=(r%2)*24;x<W;x+=48){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y+24);ctx.stroke();}
  ctx.fillStyle="#f0a020";ctx.fillRect(0,250,W,26);ctx.fillStyle="#ffffff";ctx.fillRect(0,276,W,4);
  ctx.fillStyle="#34343c";ctx.fillRect(0,0,W,90); // 天井と蛍光灯
  for(let x=60;x<W;x+=220){const on=!(Math.floor(time*9+x)%37===0);ctx.fillStyle=on?"#fffbe8":"#8a8a80";ctx.fillRect(x,70,140,10);
    if(on){const g=ctx.createLinearGradient(0,80,0,200);g.addColorStop(0,"#fffbe855");g.addColorStop(1,"#fffbe800");ctx.fillStyle=g;ctx.fillRect(x-30,80,200,120);}}
  // 奥を通る電車（6 秒ごと）
  const tt=(time+li*1.3)%6;if(tt<2.2){const x0=W+100-(tt/2.2)*(W+1400);
    for(let k=0;k<3;k++){const x=x0+k*430;ctx.fillStyle="#c8ccd4";rr(x,300,420,170,14);ctx.fill();ctx.fillStyle="#f0a020";ctx.fillRect(x,420,420,14);
      ctx.fillStyle="#2a3040";for(let w=0;w<4;w++)rr(x+30+w*96,322,70,70,6),ctx.fill();
      ctx.fillStyle="#ffffff30";for(let w=0;w<4;w++){ctx.beginPath();ctx.arc(x+60+w*96,380,12,0,7);ctx.fill();}}
    ctx.strokeStyle="#0003";ctx.lineWidth=3;for(let k=0;k<6;k++){const y=310+k*28;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}}
  else{for(let x=110;x<W;x+=300){ctx.fillStyle="#1a3a8a";rr(x,150,180,50,6);ctx.fill(); // 駅名の看板
    ctx.fillStyle="#fff";ctx.font="bold 24px sans-serif";ctx.textAlign="center";ctx.fillText(["せんわたり","つぎは かわむこう","←のりば","出口 ↗"][(x/300|0)%4],x+90,184);ctx.textAlign="left";}}
  ctx.fillStyle="#5a5a64";for(let x=0;x<W;x+=320){ctx.fillRect(x+280,90,30,430);} // 柱
  ctx.fillStyle="#1a1a1e";ctx.fillRect(0,WATER_Y,W,H-WATER_Y); // 線路
  ctx.fillStyle="#4a3a2a";for(let x=-20;x<W;x+=36)ctx.fillRect(x,WATER_Y+46,22,16);
  ctx.fillStyle="#c8ccd4";ctx.fillRect(0,WATER_Y+40,W,6);ctx.fillRect(0,WATER_Y+82,W,6);
  const tr=(time*.8+li*.7)%4;if(tr<.6){const x=W-(tr/.6)*(W+900); // 線路を走り抜ける電車
    ctx.fillStyle="#c8ccd4";rr(x,WATER_Y-30,900,120,10);ctx.fill();ctx.fillStyle="#f0a020";ctx.fillRect(x,WATER_Y+30,900,12);ctx.fillStyle="#fff8a0";ctx.fillRect(x+4,WATER_Y+10,14,12);}
 },
 sketch(th,ph){ // 方眼ノートに鉛筆の落書き
  ctx.fillStyle="#fbf8ef";ctx.fillRect(0,0,W,H);
  ctx.strokeStyle="#9cc0e8";ctx.lineWidth=1.5;for(let y=40;y<H;y+=34){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
  ctx.strokeStyle="#f08a8a";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(70,0);ctx.lineTo(70,H);ctx.stroke();
  ctx.strokeStyle="#555";ctx.lineWidth=2.5;
  const sx=1080,sy=110;ctx.beginPath();ctx.arc(sx,sy,40,0,7);ctx.stroke(); // 太陽
  for(let k=0;k<10;k++){const a=k/10*6.28+time*.3;ctx.beginPath();ctx.moveTo(sx+Math.cos(a)*52,sy+Math.sin(a)*52);ctx.lineTo(sx+Math.cos(a)*70,sy+Math.sin(a)*70);ctx.stroke();}
  ctx.beginPath();ctx.arc(sx-13,sy-6,4,0,7);ctx.arc(sx+13,sy-6,4,0,7);ctx.stroke();ctx.beginPath();ctx.arc(sx,sy+6,16,.3,2.84);ctx.stroke();
  for(const c of clouds){const x=((c.x+time*8*c.s)%(W+300))-150; // 雲（線だけ）
   ctx.beginPath();ctx.arc(x-30*c.s,c.y,18*c.s,Math.PI*.5,Math.PI*1.5);ctx.arc(x,c.y-12*c.s,24*c.s,Math.PI,0);ctx.arc(x+32*c.s,c.y,18*c.s,Math.PI*1.5,Math.PI*.5);ctx.closePath();ctx.stroke();}
  ctx.strokeStyle="#aaa";ctx.lineWidth=2;hills(470,50,.006,ph);ctx.stroke(); // 遠くの山（輪郭だけ）
  ctx.strokeStyle="#3a70d0";ctx.lineWidth=2.5; // 水は青鉛筆のなみなみ
  for(let r=0;r<4;r++){ctx.beginPath();for(let x=0;x<=W;x+=8){const y=WATER_Y+14+r*28+Math.sin(x*.05+time*2+r)*5;x?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();}
  ctx.fillStyle="#3a70d0";ctx.font="bold 22px sans-serif";ctx.fillText("みず",20,H-20);
 },
 pixel(th,ph){ // ファミコン風: 空・ブロックの雲・丸い丘・ドットの水
  const gb=th.post==="gb";
  ctx.fillStyle=gb?"#9bbc0f":"#5c94fc";ctx.fillRect(0,0,W,H);
  ctx.fillStyle=gb?"#8bac0f":"#fcfcfc";
  for(const c of clouds){const x=Math.round((((c.x+time*10*c.s)%(W+300))-150)/12)*12,y=Math.round(c.y/12)*12;
   ctx.fillRect(x-48,y,96,24);ctx.fillRect(x-24,y-24,60,24);ctx.fillRect(x-60,y+12,120,12);}
  for(let k=0;k<4;k++){const x=((k*380+li*70)%(W+300))-150,r=90+(k%2)*60,y=WATER_Y; // 丸い丘
   ctx.fillStyle=gb?"#8bac0f":"#00a800";ctx.beginPath();ctx.arc(x,y,r,Math.PI,0);ctx.fill();
   ctx.fillStyle=gb?"#306230":"#006800";for(let j=0;j<3;j++)ctx.fillRect(x-20+j*16,y-r*.6+j*14,6,18);}
  ctx.fillStyle=th.water[0];ctx.fillRect(0,WATER_Y,W,H-WATER_Y);
  ctx.fillStyle=gb?"#8bac0f":"#fcfcfc";const o=Math.floor(time*4)%4;
  for(let x=-24;x<W;x+=48){ctx.fillRect(x+o*6,WATER_Y+12,24,6);ctx.fillRect(x+24-o*6,WATER_Y+48,24,6);}
 },
 blue(th,ph){ // 青写真: 方眼・寸法線・手書きの注記
  ctx.fillStyle="#1d56a8";ctx.fillRect(0,0,W,H);
  ctx.strokeStyle="#ffffff1c";ctx.lineWidth=1;for(let x=0;x<=W;x+=32){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
  for(let y=0;y<=H;y+=32){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
  ctx.strokeStyle="#ffffff40";for(let x=0;x<=W;x+=160){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
  for(let y=0;y<=H;y+=160){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
  ctx.strokeStyle="#ffffffaa";ctx.fillStyle="#ffffffcc";ctx.lineWidth=1.5;ctx.font="16px monospace"; // 寸法線
  ctx.beginPath();ctx.moveTo(40,40);ctx.lineTo(W-40,40);ctx.moveTo(40,32);ctx.lineTo(40,48);ctx.moveTo(W-40,32);ctx.lineTo(W-40,48);ctx.stroke();
  ctx.fillText("1200",W/2-20,34);ctx.fillText(`図番 SW-${String(li+1).padStart(3,"0")}`,W-190,H-18);
  ctx.strokeStyle="#ffffff30";ctx.lineWidth=2;ctx.beginPath();ctx.arc(160,150,70,0,7);ctx.moveTo(60,150);ctx.lineTo(260,150);ctx.moveTo(160,50);ctx.lineTo(160,250);ctx.stroke(); // 歯車の下書き
  for(let k=0;k<12;k++){const a=k/12*6.28+time*.2;ctx.beginPath();ctx.moveTo(160+Math.cos(a)*70,150+Math.sin(a)*70);ctx.lineTo(160+Math.cos(a)*86,150+Math.sin(a)*86);ctx.stroke();}
  ctx.save();ctx.beginPath();ctx.rect(0,WATER_Y,W,H-WATER_Y);ctx.clip();ctx.strokeStyle="#ffffff50";ctx.lineWidth=2; // 水＝斜線
  for(let x=-200;x<W;x+=18){ctx.beginPath();ctx.moveTo(x,H);ctx.lineTo(x+140,WATER_Y);ctx.stroke();}ctx.restore();
  ctx.strokeStyle="#ffffffcc";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,WATER_Y);ctx.lineTo(W,WATER_Y);ctx.stroke();
  ctx.fillText("WATER ▽",20,WATER_Y+30);
 },
 neon(th,ph){ // 80 年代: 縞の太陽・ワイヤーの山・光る格子
  let g=ctx.createLinearGradient(0,0,0,WATER_Y);g.addColorStop(0,"#07001a");g.addColorStop(.6,"#3a0050");g.addColorStop(1,"#ff2a8a");
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  ctx.fillStyle="#ffffffaa";for(let k=0;k<50;k++)ctx.fillRect((k*173)%W,(k*97)%260,2,2);
  ctx.save();ctx.beginPath();ctx.arc(W/2,470,180,0,7);ctx.clip(); // 縞の太陽
  g=ctx.createLinearGradient(0,290,0,650);g.addColorStop(0,"#ffe040");g.addColorStop(1,"#ff2a8a");ctx.fillStyle=g;ctx.fillRect(W/2-180,290,360,360);
  ctx.fillStyle="#3a0050";for(let k=0;k<7;k++){const y=430+k*22+((time*20)%22);ctx.fillRect(W/2-180,y,360,4+k*1.6);}ctx.restore();
  ctx.strokeStyle="#00f0ff";ctx.lineWidth=2;ctx.shadowColor="#00f0ff";ctx.shadowBlur=12; // ワイヤーの山
  for(const [x0,w,h] of [[-60,420,210],[260,300,150],[W-420,480,230],[W-640,260,120]]){
   ctx.beginPath();ctx.moveTo(x0,WATER_Y);ctx.lineTo(x0+w/2,WATER_Y-h);ctx.lineTo(x0+w,WATER_Y);
   for(let k=1;k<4;k++){ctx.moveTo(x0+w/2,WATER_Y-h);ctx.lineTo(x0+w*k/4,WATER_Y);}ctx.stroke();}
  ctx.fillStyle="#0a0018";ctx.fillRect(0,WATER_Y,W,H-WATER_Y); // 下は光る格子（奥行き）
  ctx.strokeStyle="#ff2a9a";ctx.shadowColor="#ff2a9a";
  for(let k=-12;k<=12;k++){ctx.beginPath();ctx.moveTo(W/2+k*40,WATER_Y);ctx.lineTo(W/2+k*220,H);ctx.stroke();}
  for(let k=0;k<6;k++){const t=((k+time*1.5)%6)/6,y=WATER_Y+(H-WATER_Y)*t*t;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
  ctx.shadowBlur=0;
 },
 chalk(th,ph){ // 黒板にチョーク
  ctx.fillStyle="#2e4a3a";ctx.fillRect(0,0,W,H);
  ctx.fillStyle="#ffffff07";for(let k=0;k<8;k++){ctx.beginPath();ctx.ellipse((k*311)%W,(k*173)%H,140,24,(k%3-1)*.15,0,7);ctx.fill();} // 消した跡
  ctx.strokeStyle="#f4f4ecb0";ctx.fillStyle="#f4f4ecb0";ctx.lineWidth=3;ctx.font="bold 34px 'Comic Sans MS',sans-serif";
  ctx.fillText(["1 + 1 = 2","わたれ！","3 × 4 = 12","きょうの しゅくだい"][li%4],110,90);
  ctx.save();ctx.translate(1060,120);ctx.rotate(time*.2);ctx.beginPath(); // 星
  for(let k=0;k<5;k++){const a=k*2.513-1.57;ctx.lineTo(Math.cos(a)*50,Math.sin(a)*50);const b=a+1.256;ctx.lineTo(Math.cos(b)*20,Math.sin(b)*20);}ctx.closePath();ctx.stroke();ctx.restore();
  ctx.strokeStyle="#f4f4ec60";ctx.lineWidth=2.5;hills(480,50,.006,ph);ctx.stroke();
  ctx.strokeStyle="#9ad0ff90";ctx.lineWidth=3;
  for(let r=0;r<3;r++){ctx.beginPath();for(let x=0;x<=W;x+=12){const y=WATER_Y+16+r*34+Math.sin(x*.04+time*2+r)*6;x?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();}
  ctx.fillStyle="#6a4424";ctx.fillRect(0,H-14,W,14);ctx.fillStyle="#fff";ctx.fillRect(200,H-20,40,7);ctx.fillStyle="#ffb0d0";ctx.fillRect(260,H-20,30,7); // 粉受けとチョーク
 },
 ukiyo(th,ph){ // 浮世絵: 和紙・赤い日・富士・大波
  ctx.fillStyle="#efe2c4";ctx.fillRect(0,0,W,H);
  ctx.fillStyle="#00000008";for(let k=0;k<200;k++)ctx.fillRect((k*397)%W,(k*211)%H,3,1);
  ctx.fillStyle="#c8392b";ctx.beginPath();ctx.arc(980,150,80,0,7);ctx.fill();
  ctx.fillStyle="#e8c890";for(const [x,y,w] of [[80,120,420],[600,220,360],[300,300,300]]){rr(x+Math.sin(time*.3+x)*20,y,w,26,13);ctx.fill();} // 霞
  ctx.fillStyle="#1f3a6a";ctx.beginPath();ctx.moveTo(360,WATER_Y);ctx.lineTo(620,300);ctx.lineTo(700,300);ctx.lineTo(960,WATER_Y);ctx.fill(); // 富士
  ctx.fillStyle="#f8f4ea";ctx.beginPath();ctx.moveTo(560,356);ctx.lineTo(620,300);ctx.lineTo(700,300);ctx.lineTo(760,356);
  for(let k=0;k<6;k++)ctx.lineTo(760-k*40-20,k%2?356:376);ctx.fill();
  ctx.fillStyle=th.water[0];ctx.fillRect(0,WATER_Y,W,H-WATER_Y); // 大波のうろこ
  for(let r=0;r<4;r++)for(let x=-40+(r%2)*30;x<W+40;x+=60){const y=WATER_Y+10+r*30,s=Math.sin(time*2+x*.02+r)*3;
   ctx.fillStyle=r%2?"#2f5a90":"#1f3a6a";ctx.beginPath();ctx.arc(x,y+s+22,30,Math.PI,0);ctx.fill();ctx.strokeStyle="#f8f4ea";ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y+s+22,22,Math.PI,0);ctx.stroke();}
 },
 comic(th,ph){ // アメコミ: 集中線・網点・吹き出し
  ctx.fillStyle="#58c4f0";ctx.fillRect(0,0,W,H);
  ctx.save();ctx.translate(W*.75,180);ctx.fillStyle="#ffffff50"; // 集中線
  for(let k=0;k<24;k++){ctx.rotate(Math.PI/12);ctx.beginPath();ctx.moveTo(0,-20);ctx.lineTo(1400,-40);ctx.lineTo(1400,40);ctx.fill();}ctx.restore();
  ctx.fillStyle="#1e6ae033";for(let y=10;y<WATER_Y;y+=22)for(let x=(y/22%2)*11;x<W;x+=22){ctx.beginPath();ctx.arc(x,y,3+y/200,0,7);ctx.fill();} // 網点
  const words=["POW!","ZOOM!","BAM!","VROOM!","WHAM!"],w=words[li%5];
  ctx.save();ctx.translate(210,130);ctx.rotate(-.12);ctx.fillStyle="#ffe040";ctx.strokeStyle="#000";ctx.lineWidth=5;ctx.beginPath();
  for(let k=0;k<16;k++){const a=k/16*6.28,r=k%2?70:120;ctx.lineTo(Math.cos(a)*r*1.4,Math.sin(a)*r*.8);}ctx.closePath();ctx.fill();ctx.stroke();
  ctx.font="900 54px Impact,sans-serif";ctx.textAlign="center";ctx.fillStyle="#ff3b3b";ctx.strokeText(w,0,18);ctx.fillText(w,0,18);ctx.textAlign="left";ctx.restore();
  ctx.fillStyle=th.water[0];ctx.fillRect(0,WATER_Y,W,H-WATER_Y);ctx.fillStyle="#ffffff66";
  for(let y=WATER_Y+10;y<H;y+=18)for(let x=(y/18%2)*9;x<W;x+=18){ctx.beginPath();ctx.arc(x,y,4,0,7);ctx.fill();}
  ctx.strokeStyle="#000";ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(0,WATER_Y);ctx.lineTo(W,WATER_Y);ctx.stroke();
 },
 sea(th,ph){ // 海の底: 光の筋・泡・海藻・魚
  let g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,"#1a8ab8");g.addColorStop(.6,"#0a3a6a");g.addColorStop(1,"#021428");
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  ctx.fillStyle="#ffffff10";for(let k=0;k<5;k++){const x=k*300+Math.sin(time*.4+k)*60;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+120,0);ctx.lineTo(x+300,WATER_Y);ctx.lineTo(x+140,WATER_Y);ctx.fill();}
  for(let k=0;k<5;k++){const x=((k*290+time*(40+k*10))%(W+200))-100,y=150+k*70; // 魚
   ctx.fillStyle=["#ff9a3a","#ffd23f","#ff6a8a","#5ad0ff","#b0ff6a"][k];ctx.beginPath();ctx.ellipse(x,y,26,13,0,0,7);ctx.moveTo(x-22,y);ctx.lineTo(x-40,y-12);ctx.lineTo(x-40,y+12);ctx.fill();
   ctx.fillStyle="#000";ctx.beginPath();ctx.arc(x+14,y-3,3,0,7);ctx.fill();}
  ctx.fillStyle="#1a4a5a";hills(520,40,.008,ph);ctx.fill(); // 岩場
  for(let k=0;k<9;k++){const x=((k*151+li*43)%W),h=80+(k*37)%90; // 海藻
   ctx.strokeStyle=k%2?"#2aa05a":"#4ac070";ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(x,540);
   for(let j=1;j<=6;j++)ctx.lineTo(x+Math.sin(time*1.5+j*.8+k)*12*j/6,540-h*j/6);ctx.stroke();}
  ctx.fillStyle="#000814";ctx.fillRect(0,WATER_Y,W,H-WATER_Y); // 深い海溝
  ctx.fillStyle="#80e0ff";for(let k=0;k<8;k++){const t=(time*.3+k*.13)%1;ctx.globalAlpha=.5*(1-t);ctx.beginPath();ctx.arc((k*163)%W,WATER_Y+20+(k*37)%80-t*20,3,0,7);ctx.fill();}ctx.globalAlpha=1;
  ctx.strokeStyle="#ffffff80";ctx.lineWidth=2; // 泡
  for(let k=0;k<24;k++){const x=(k*97+Math.sin(time+k)*10)%W,y=H-((time*60+k*53)%H);ctx.beginPath();ctx.arc(x,y,3+k%4,0,7);ctx.stroke();}
 },
 galaxy(th,ph){ // 銀河: 星雲・渦巻き・輪のある星
  ctx.fillStyle="#04020c";ctx.fillRect(0,0,W,H);
  for(const [x,y,r,c] of [[300,200,380,"#6a1a8a55"],[900,300,420,"#1a3a9a55"],[650,100,260,"#c8307a40"]]){
   const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,c);g.addColorStop(1,"#00000000");ctx.fillStyle=g;ctx.fillRect(0,0,W,H);}
  for(let k=0;k<120;k++){const x=(k*173+li*31)%W,y=(k*97)%H;ctx.fillStyle=k%7?"#ffffff":"#a0d0ff";ctx.globalAlpha=.3+.7*Math.abs(Math.sin(time+k));ctx.fillRect(x,y,k%9?2:3,k%9?2:3);}ctx.globalAlpha=1;
  ctx.save();ctx.translate(250,160);ctx.rotate(time*.1); // 渦巻き銀河
  for(let a=0;a<2;a++)for(let k=0;k<60;k++){const t=k/60*9,r=t*9;ctx.fillStyle=`rgba(255,${200-k*2},255,${1-k/60})`;ctx.beginPath();ctx.arc(Math.cos(t+a*Math.PI)*r,Math.sin(t+a*Math.PI)*r*.5,3-k/30,0,7);ctx.fill();}ctx.restore();
  ctx.save();ctx.translate(1050,200); // 輪のある星
  let g=ctx.createLinearGradient(-60,-60,60,60);g.addColorStop(0,"#ffb060");g.addColorStop(1,"#a03a60");ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,60,0,7);ctx.fill();
  ctx.strokeStyle="#ffe0b0aa";ctx.lineWidth=8;ctx.beginPath();ctx.ellipse(0,0,110,22,-.3,0,7);ctx.stroke();ctx.restore();
  for(let k=0;k<3;k++){const t=(time*.25+k*.33)%1;ctx.strokeStyle=`rgba(255,255,255,${1-t})`;ctx.lineWidth=2; // 流れ星
   const x=W*(1-t)+k*100,y=80+k*60+t*200;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+60,y-30);ctx.stroke();}
 },
};

/* ---------- 地面の模様（地面の形で切り抜いた中に描く） ---------- */
const GPAT={
 tactile(top){ctx.fillStyle="#c8a810";for(let x=-100;x<W+100;x+=14){ctx.beginPath();ctx.arc(x,top+7,3,0,7);ctx.fill();}
  ctx.strokeStyle="#00000020";ctx.lineWidth=2;for(let x=0;x<W;x+=60){ctx.beginPath();ctx.moveTo(x,top+19);ctx.lineTo(x,H);ctx.stroke();}},
 hatch(top){ctx.strokeStyle="#55555555";ctx.lineWidth=2;for(let x=-400;x<W;x+=14){ctx.beginPath();ctx.moveTo(x,H);ctx.lineTo(x+H-top,top);ctx.stroke();}},
 brick(top){ctx.strokeStyle=TH.post==="gb"?"#0f380f":"#000";ctx.lineWidth=3;for(let y=top+24,r=0;y<H;y+=24,r++){ctx.beginPath();ctx.moveTo(-100,y);ctx.lineTo(W+100,y);ctx.stroke();
  for(let x=(r%2)*24;x<W;x+=48){ctx.beginPath();ctx.moveTo(x,y-24);ctx.lineTo(x,y);ctx.stroke();}}
  ctx.fillStyle=TH.post==="gb"?"#8bac0f":"#fcbcb0";for(let y=top+24,r=0;y<H;y+=24,r++)for(let x=(r%2)*24;x<W;x+=48)ctx.fillRect(x+3,y-21,6,4);},
 xhatch(top){ctx.strokeStyle="#ffffff26";ctx.lineWidth=1.5;for(let x=-400;x<W;x+=16){ctx.beginPath();ctx.moveTo(x,H);ctx.lineTo(x+H-top,top);ctx.stroke();ctx.beginPath();ctx.moveTo(x,top);ctx.lineTo(x+H-top,H);ctx.stroke();}},
 neongrid(top){ctx.strokeStyle="#ff2a9a40";ctx.lineWidth=1.5;for(let y=top+20;y<H;y+=20){ctx.beginPath();ctx.moveTo(-100,y);ctx.lineTo(W+100,y);ctx.stroke();}
  for(let x=0;x<W;x+=40){ctx.beginPath();ctx.moveTo(x,top);ctx.lineTo(x,H);ctx.stroke();}},
 chalk(top){ctx.strokeStyle="#f4f4ec40";ctx.lineWidth=3;for(let x=-400;x<W;x+=22){ctx.beginPath();ctx.moveTo(x,H);ctx.lineTo(x+H-top,top);ctx.stroke();}},
 wood(top){ctx.strokeStyle="#00000030";ctx.lineWidth=2;for(let y=top+18;y<H;y+=18){ctx.beginPath();for(let x=-100;x<W+100;x+=30)ctx.lineTo(x,y+Math.sin(x*.02+y)*4);ctx.stroke();}},
 dots(top){ctx.fillStyle="#f0600060";for(let y=top+10;y<H;y+=16)for(let x=(y/16%2)*8;x<W;x+=16){ctx.beginPath();ctx.arc(x,y,3.5,0,7);ctx.fill();}},
 sand(top){ctx.fillStyle="#00000018";for(let k=0;k<160;k++)ctx.fillRect((k*97)%W,top+20+(k*53)%300,4,3);
  ctx.fillStyle="#ffffffaa";for(let k=0;k<6;k++){ctx.beginPath();ctx.arc((k*211+top*3)%W,top+50+(k*41)%120,6,0,Math.PI);ctx.fill();}},
 crystal(top){ctx.strokeStyle="#d0a0ff50";ctx.lineWidth=2;for(let k=0;k<14;k++){const x=(k*181+top)%W,y=top+40+(k*67)%200;
  ctx.beginPath();ctx.moveTo(x,y-22);ctx.lineTo(x+10,y);ctx.lineTo(x,y+22);ctx.lineTo(x-10,y);ctx.closePath();ctx.stroke();}},
};

/* ---------- 走る物 ---------- */
// 顔（どの乗り物も同じ表情の出し方）
function face(x,y,s=1){
  const mood=state==="win"?"happy":state==="fail"?"oops":state==="go"?"go":"idle";
  ctx.save();ctx.translate(x,y);ctx.scale(s,s);
  ctx.fillStyle="#fff";ctx.beginPath();ctx.ellipse(-7.5,0,7,8,0,0,7);ctx.ellipse(7.5,0,7,8,0,0,7);ctx.fill();
  ctx.fillStyle="#222";ctx.strokeStyle="#222";ctx.lineWidth=2.5;
  if(mood==="happy"){ctx.beginPath();ctx.arc(-7.5,2,4,Math.PI,0);ctx.arc(7.5,2,4,Math.PI,0);ctx.stroke();}
  else if(mood==="oops"){ctx.beginPath();ctx.arc(-7.5,0,4.5,0,7);ctx.arc(7.5,0,4.5,0,7);ctx.stroke();}
  else{const lk=mood==="go"?2:Math.sin(time*2)*1.5;ctx.beginPath();ctx.arc(-6.5+lk,1,3.2,0,7);ctx.arc(8.5+lk,1,3.2,0,7);ctx.fill();
    if(mood==="go"){ctx.beginPath();ctx.moveTo(-14,-9);ctx.lineTo(-2,-6);ctx.moveTo(1,-6);ctx.lineTo(13,-9);ctx.stroke();}}
  ctx.restore();}
function outline(edge,w=3){ctx.strokeStyle=edge;ctx.lineWidth=TH.edgeW&&TH.edgeW>4?5:w;ctx.stroke();}
// 各乗り物: (本体, 屋根/差し色, ふち)。前は +x
const RIDERS={
 car(b,r,e){ctx.fillStyle=r;rr(-30,-34,56,26,10);ctx.fill();ctx.fillStyle=TH.post==="gb"?"#9bbc0f":"#bfe8ff";rr(-23,-28,20,16,4);ctx.fill();rr(1,-28,19,16,4);ctx.fill();
  ctx.fillStyle=b;rr(-48,-13,96,26,9);ctx.fill();outline(e);ctx.fillStyle="#ffe066";ctx.fillRect(40,-7,8,7);face(25.5,-1);},
 pig(b,r,e){ctx.fillStyle=b;ctx.beginPath();ctx.ellipse(0,-6,52,26,0,0,7);ctx.fill();ctx.strokeStyle=e;ctx.lineWidth=2.5;ctx.stroke();
  ctx.beginPath();ctx.moveTo(22,-26);ctx.lineTo(30,-44);ctx.lineTo(38,-24);ctx.fillStyle=r;ctx.fill();ctx.stroke(); // 耳
  ctx.fillStyle=r;ctx.beginPath();ctx.ellipse(52,-4,9,12,0,0,7);ctx.fill();ctx.stroke();ctx.fillStyle=e;ctx.beginPath();ctx.arc(51,-8,2,0,7);ctx.arc(51,0,2,0,7);ctx.fill(); // 鼻
  ctx.beginPath();for(let k=0;k<20;k++){const a=k*.5;ctx.lineTo(-52-a*1.5-Math.cos(a*2)*5,-10-Math.sin(a*2)*5);}ctx.stroke();face(28,-12,.9);},
 moto(b,r,e){ctx.strokeStyle="#333";ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(-32,20);ctx.lineTo(-6,-4);ctx.lineTo(32,20);ctx.moveTo(22,-22);ctx.lineTo(32,20);ctx.stroke(); // 骨組み
  ctx.fillStyle=b;rr(-18,-14,44,18,8);ctx.fill();outline(e);ctx.fillStyle="#222";rr(-34,-18,26,8,4);ctx.fill(); // タンクと座席
  ctx.strokeStyle="#aaa";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(22,-22);ctx.lineTo(12,-30);ctx.stroke();
  ctx.fillStyle=r;rr(-26,-54,22,38,8);ctx.fill();outline(e,2); // 乗る人
  ctx.strokeStyle=r;ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(-10,-44);ctx.lineTo(12,-30);ctx.stroke();
  ctx.fillStyle="#ffd8b0";ctx.beginPath();ctx.arc(-12,-66,14,0,7);ctx.fill();ctx.fillStyle=b;ctx.beginPath();ctx.arc(-12,-68,15,Math.PI,0);ctx.fill();face(-6,-64,.6);},
 tank(b,r,e){ctx.fillStyle=r;ctx.beginPath();ctx.moveTo(-52,-4);ctx.lineTo(52,-4);ctx.lineTo(44,26);ctx.lineTo(-44,26);ctx.closePath();ctx.fill();outline(e); // 履帯
  ctx.fillStyle=b;rr(-44,-14,88,16,4);ctx.fill();outline(e);rr(-24,-36,44,24,8);ctx.fill();outline(e);
  ctx.fillStyle=e;ctx.fillRect(18,-30,50,8);face(-2,-24,.8);},
 buggy(b,r,e){ctx.strokeStyle="#333";ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-40,-8);ctx.lineTo(-24,-48);ctx.lineTo(14,-48);ctx.lineTo(34,-8);ctx.stroke(); // 転がり防止の枠
  ctx.fillStyle=b;ctx.beginPath();ctx.moveTo(-50,-10);ctx.lineTo(50,-10);ctx.lineTo(56,6);ctx.lineTo(-46,12);ctx.closePath();ctx.fill();outline(e);
  ctx.fillStyle="#ffd8b0";ctx.beginPath();ctx.arc(-6,-26,12,0,7);ctx.fill();ctx.fillStyle=r;ctx.beginPath();ctx.arc(-6,-28,13,Math.PI,0);ctx.fill();face(0,-24,.55);
  ctx.fillStyle="#ff5a4e";ctx.beginPath();ctx.moveTo(-24,-48);ctx.lineTo(-24,-78);ctx.lineTo(-4,-70);ctx.lineTo(-24,-62);ctx.fill();},
 loco(b,r,e){ctx.strokeStyle=e;ctx.lineWidth=2.5;ctx.fillStyle=b; // 設計図の機関車（線だけ）
  rr(-50,-44,34,52,4);ctx.fill();ctx.stroke();rr(-44,-38,22,16,2);ctx.stroke(); // 運転室
  rr(-16,-22,58,30,14);ctx.fill();ctx.stroke(); // ボイラー
  ctx.beginPath();ctx.rect(22,-44,12,22);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(18,-50);ctx.lineTo(38,-50);ctx.lineTo(34,-44);ctx.lineTo(22,-44);ctx.closePath();ctx.stroke();
  ctx.beginPath();ctx.moveTo(42,-6);ctx.lineTo(56,14);ctx.lineTo(42,14);ctx.stroke();
  ctx.setLineDash([5,5]);ctx.beginPath();ctx.moveTo(-60,20);ctx.lineTo(60,20);ctx.stroke();ctx.setLineDash([]);
  const s=(time*1.2)%1;ctx.globalAlpha=1-s;ctx.beginPath();ctx.arc(28-s*40,-60-s*30,6+s*14,0,7);ctx.stroke();ctx.globalAlpha=1; // 煙
  face(14,-8,.8);},
 penguin(b,r,e){ctx.fillStyle="#c8603a";rr(-50,8,100,8,4);ctx.fill(); // スケボー
  ctx.fillStyle=b;ctx.beginPath();ctx.ellipse(0,-26,28,36,0,0,7);ctx.fill();ctx.fillStyle=r;ctx.beginPath();ctx.ellipse(6,-20,18,28,0,0,7);ctx.fill();
  ctx.fillStyle="#ffa020";ctx.beginPath();ctx.moveTo(22,-38);ctx.lineTo(38,-34);ctx.lineTo(22,-30);ctx.fill();ctx.fillRect(-12,2,12,6);ctx.fillRect(8,2,12,6);
  ctx.fillStyle="#ff3b3b";ctx.fillRect(-26,-50,52,8);ctx.fillRect(-30,-50,8,24);face(8,-44,.7);},
 sports(b,r,e){ctx.shadowColor=e;ctx.shadowBlur=14;ctx.fillStyle=b;ctx.beginPath();ctx.moveTo(-50,10);ctx.lineTo(-50,-10);ctx.lineTo(-18,-14);ctx.lineTo(0,-30);ctx.lineTo(24,-28);ctx.lineTo(54,-2);ctx.lineTo(54,10);ctx.closePath();ctx.fill();
  ctx.strokeStyle=r;ctx.lineWidth=3;ctx.stroke();ctx.strokeStyle=e;ctx.beginPath();ctx.moveTo(-50,0);ctx.lineTo(54,0);ctx.stroke();
  ctx.fillStyle=r;ctx.fillRect(-56,-22,14,4);ctx.fillRect(-50,-22,4,12);ctx.shadowBlur=0;face(26,-12,.8);},
 police(b,r,e){ctx.fillStyle="#fff6a055";ctx.beginPath();ctx.moveTo(46,-4);ctx.lineTo(180,-40);ctx.lineTo(180,40);ctx.closePath();ctx.fill();
  ctx.fillStyle=r;rr(-30,-34,56,26,10);ctx.fill();ctx.fillStyle="#bfe8ff";rr(-23,-28,20,16,4);ctx.fill();rr(1,-28,19,16,4);ctx.fill();
  ctx.fillStyle=r;rr(-48,-13,96,26,9);ctx.fill();ctx.fillStyle=b;ctx.fillRect(-26,-13,52,26);outline(e);
  const on=Math.floor(time*6)%2;ctx.fillStyle=on?"#ff2a2a":"#551010";ctx.fillRect(-12,-44,12,10);ctx.fillStyle=on?"#1a3a70":"#3a8aff";ctx.fillRect(0,-44,12,10);
  ctx.fillStyle="#ffe066";ctx.fillRect(40,-7,8,7);face(25.5,-1);},
 cat(b,r,e){ctx.strokeStyle=e;ctx.lineWidth=3;ctx.fillStyle=b; // チョークの猫（線だけ）
  ctx.beginPath();ctx.ellipse(-4,-4,44,20,0,0,7);ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.arc(40,-26,20,0,7);ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.moveTo(26,-40);ctx.lineTo(28,-58);ctx.lineTo(40,-46);ctx.moveTo(44,-46);ctx.lineTo(56,-58);ctx.lineTo(56,-38);ctx.stroke();
  ctx.beginPath();ctx.moveTo(-46,-8);ctx.quadraticCurveTo(-70,-30,-56,-56+Math.sin(time*4)*6);ctx.stroke();
  ctx.strokeStyle=r;ctx.beginPath();ctx.moveTo(52,-20);ctx.lineTo(72,-24);ctx.moveTo(52,-16);ctx.lineTo(72,-14);ctx.stroke();face(40,-28,.7);},
 boar(b,r,e){ctx.fillStyle=b;ctx.beginPath();ctx.ellipse(-4,-8,50,26,0,0,7);ctx.fill();outline(e);
  ctx.strokeStyle=r;ctx.lineWidth=3;for(let k=-40;k<30;k+=8){ctx.beginPath();ctx.moveTo(k,-30);ctx.lineTo(k+4,-40);ctx.stroke();} // 毛
  ctx.fillStyle=r;ctx.beginPath();ctx.ellipse(44,-6,16,14,0,0,7);ctx.fill();ctx.fillStyle="#d8a080";ctx.beginPath();ctx.ellipse(58,-2,8,9,0,0,7);ctx.fill();
  ctx.fillStyle="#fff";ctx.beginPath();ctx.moveTo(50,6);ctx.lineTo(62,-6);ctx.lineTo(54,10);ctx.fill();face(30,-16,.8);},
 rickshaw(b,r,e){ctx.fillStyle=r;ctx.beginPath();ctx.moveTo(-50,-60);ctx.quadraticCurveTo(-20,-76,10,-60);ctx.lineTo(10,-54);ctx.lineTo(-50,-54);ctx.fill();outline(e); // 幌
  ctx.strokeStyle=e;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-46,-54);ctx.lineTo(-46,-10);ctx.stroke();
  ctx.fillStyle=b;rr(-50,-16,62,28,4);ctx.fill();outline(e);
  ctx.strokeStyle="#5a3a1a";ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(10,-6);ctx.lineTo(52,-6);ctx.stroke(); // 梶棒
  ctx.fillStyle="#1f3a6a";rr(40,-46,18,34,6);ctx.fill();ctx.strokeStyle="#1f3a6a";ctx.lineWidth=6; // 引く人
  const k=Math.sin(time*10)*8;ctx.beginPath();ctx.moveTo(48,-14);ctx.lineTo(44+k,14);ctx.moveTo(50,-14);ctx.lineTo(54-k,14);ctx.stroke();
  ctx.fillStyle="#f0d0a0";ctx.beginPath();ctx.arc(50,-56,11,0,7);ctx.fill();ctx.fillStyle="#d8b040";ctx.beginPath();ctx.moveTo(30,-60);ctx.lineTo(50,-76);ctx.lineTo(70,-60);ctx.fill();
  ctx.fillStyle="#ffd8b0";ctx.beginPath();ctx.arc(-22,-30,11,0,7);ctx.fill();face(-18,-30,.55);},
 turtle(b,r,e){ctx.fillStyle="#9ad070";ctx.beginPath();ctx.ellipse(48,-6,16,12,0,0,7);ctx.fill();outline(e); // 頭
  ctx.fillStyle=b;ctx.beginPath();ctx.ellipse(-2,-4,50,34,0,Math.PI,0);ctx.lineTo(48,6);ctx.lineTo(-52,6);ctx.fill();outline(e);
  ctx.strokeStyle=r;ctx.lineWidth=3;for(const [x,y] of [[-24,-18],[0,-26],[24,-18],[-12,-6],[12,-6]]){ctx.beginPath();for(let k=0;k<6;k++){const a=k/6*6.28;ctx.lineTo(x+Math.cos(a)*9,y+Math.sin(a)*8);}ctx.closePath();ctx.stroke();}
  face(50,-8,.6);},
 fire(b,r,e){ctx.fillStyle=b;rr(-50,-30,70,44,4);ctx.fill();outline(e,5);rr(18,-40,34,54,6);ctx.fill();outline(e,5); // 消防車
  ctx.fillStyle="#bfe8ff";rr(26,-34,20,16,3);ctx.fill();outline(e,3);
  ctx.strokeStyle=r;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-48,-38);ctx.lineTo(16,-44);ctx.stroke();for(let x=-42;x<14;x+=10){ctx.beginPath();ctx.moveTo(x,-36);ctx.lineTo(x+1,-45);ctx.stroke();}
  ctx.fillStyle=r;ctx.fillRect(-50,-6,70,6);const on=Math.floor(time*6)%2;ctx.fillStyle=on?"#ffe040":"#ff8a00";ctx.fillRect(30,-48,12,8);face(0,-14,.9);},
 cart(b,r,e){ctx.fillStyle="#ff8a00";for(const [x,s] of [[-20,14],[0,18],[20,12],[-6,10]]){ctx.beginPath();ctx.arc(x,-24,s,0,7);ctx.fill();} // 光る鉱石
  ctx.fillStyle="#ffe060";ctx.beginPath();ctx.arc(-2,-30,6,0,7);ctx.fill();
  ctx.fillStyle=b;ctx.beginPath();ctx.moveTo(-52,-22);ctx.lineTo(52,-22);ctx.lineTo(42,12);ctx.lineTo(-42,12);ctx.closePath();ctx.fill();outline(e);
  ctx.strokeStyle=r;ctx.lineWidth=3;for(const x of [-30,0,30]){ctx.beginPath();ctx.moveTo(x,-20);ctx.lineTo(x,10);ctx.stroke();}face(0,-6,.8);},
 cake(b,r,e){ctx.fillStyle="#c8804a";rr(-48,-6,96,20,6);ctx.fill();ctx.fillStyle=b;rr(-48,-30,96,24,6);ctx.fill();outline(e,2); // スポンジと生クリーム
  ctx.fillStyle=r;for(let x=-44;x<48;x+=16){ctx.beginPath();ctx.arc(x,-30,8,0,Math.PI);ctx.fill();}
  ctx.fillStyle="#ff3b5a";for(const x of [-30,0,30]){ctx.beginPath();ctx.moveTo(x-7,-34);ctx.quadraticCurveTo(x,-50,x+7,-34);ctx.fill();}
  ctx.fillStyle="#5ad0ff";ctx.fillRect(12,-60,5,24);ctx.fillStyle="#ffcc40";ctx.beginPath();ctx.ellipse(14.5,-66+Math.sin(time*12),4,7,0,0,7);ctx.fill();face(-16,-18,.8);},
 sub(b,r,e){ctx.fillStyle=b;ctx.beginPath();ctx.ellipse(0,-6,54,24,0,0,7);ctx.fill();outline(e);rr(-16,-44,30,22,6);ctx.fill();outline(e); // 潜水艦
  ctx.strokeStyle=e;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(4,-44);ctx.lineTo(4,-60);ctx.lineTo(16,-60);ctx.stroke();
  ctx.fillStyle="#9ae0ff";for(const x of [-30,-10]){ctx.beginPath();ctx.arc(x,-6,7,0,7);ctx.fill();outline(e,2);}
  ctx.save();ctx.translate(-56,-6);ctx.scale(1,Math.sin(time*20));ctx.fillStyle=r;ctx.fillRect(-4,-14,6,28);ctx.restore();
  ctx.strokeStyle="#ffffff90";ctx.lineWidth=2;for(let k=0;k<3;k++){const t=(time*.8+k*.33)%1;ctx.beginPath();ctx.arc(-60-t*30,-6-t*50,3+t*4,0,7);ctx.stroke();}
  face(26,-8,.8);},
 rover(b,r,e){ctx.strokeStyle=e;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-40,-14);ctx.lineTo(-40,-50);ctx.stroke(); // アンテナ
  ctx.fillStyle="#ddd";ctx.beginPath();ctx.arc(-40,-54,12,Math.PI*.2,Math.PI*1.2);ctx.fill();
  ctx.fillStyle=r;ctx.save();ctx.translate(12,-40);ctx.rotate(-.2);ctx.fillRect(-26,-4,52,8);ctx.strokeStyle="#6a5010";ctx.lineWidth=1;for(let x=-26;x<26;x+=8)ctx.strokeRect(x,-4,8,8);ctx.restore();
  ctx.strokeStyle=e;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(12,-36);ctx.lineTo(12,-14);ctx.stroke();
  ctx.fillStyle=b;rr(-50,-14,100,24,4);ctx.fill();outline(e);ctx.fillStyle=e;for(let x=-40;x<44;x+=16)ctx.fillRect(x,-8,8,4);face(34,-2,.7);},
 ufo(b,r,e){ctx.fillStyle="#a0f0ff60";ctx.beginPath();ctx.arc(0,-18,26,Math.PI,0);ctx.fill();ctx.strokeStyle="#c0f8ff";ctx.lineWidth=2;ctx.stroke(); // ガラスの屋根と宇宙人
  ctx.fillStyle=r;ctx.beginPath();ctx.ellipse(0,-22,12,14,0,0,7);ctx.fill();ctx.strokeStyle=r;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-4,-34);ctx.lineTo(-10,-46);ctx.moveTo(4,-34);ctx.lineTo(10,-46);ctx.stroke();
  face(0,-24,.55);
  ctx.fillStyle=b;ctx.beginPath();ctx.ellipse(0,-6,58,16,0,0,7);ctx.fill();outline(e);
  for(let k=0;k<6;k++){ctx.fillStyle=(k+Math.floor(time*8))%3?"#40485a":"#ffe040";ctx.beginPath();ctx.arc(-42+k*17,-4,4,0,7);ctx.fill();}},
};
// 笑いの乗り物
const SKIN="#f0c8a0";
function ojiHead(x,y,s,rot,sleep){ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.scale(s,s);
  ctx.fillStyle=SKIN;ctx.beginPath();ctx.arc(0,0,13,0,7);ctx.fill();ctx.strokeStyle="#a07050";ctx.lineWidth=1.5;ctx.stroke();
  ctx.fillStyle="#3a2a20";ctx.beginPath();ctx.arc(-11,2,4,0,7);ctx.arc(11,2,4,0,7);ctx.fill(); // 横だけ残った髪
  ctx.fillStyle="#ffffff90";ctx.beginPath();ctx.ellipse(-3,-8,5,2.5,-.4,0,7);ctx.fill(); // 頭のてかり
  if(sleep){ctx.strokeStyle="#222";ctx.lineWidth=2;ctx.beginPath();ctx.arc(-4,0,3,0,Math.PI);ctx.moveTo(7,0);ctx.arc(4,0,3,0,Math.PI);ctx.stroke();}else face(0,1,.5);
  ctx.fillStyle="#3a2a20";ctx.beginPath();ctx.ellipse(-4,8,5,2.5,.2,0,7);ctx.ellipse(4,8,5,2.5,-.2,0,7);ctx.fill(); // ひげ
  ctx.restore();}
Object.assign(RIDERS,{
 bridge(){const j=Math.sin(time*14)*(state==="go"?3:1); // ブリッジしたおっさん（足=後ろの車輪、手=前の車輪、頭は逆さにぶら下がる）
  const limb=(pts,c,w)=>{ctx.lineCap="round";ctx.lineJoin="round";ctx.beginPath();pts.forEach(([x,y],k)=>k?ctx.lineTo(x,y):ctx.moveTo(x,y));
    ctx.strokeStyle="#4a3020";ctx.lineWidth=w+4;ctx.stroke();ctx.strokeStyle=c;ctx.lineWidth=w;ctx.stroke();};
  limb([[-36,2],[-34,-30],[-12,-52]],"#e8dcc0",15); // ステテコの脚
  limb([[26,-44],[34,2]],SKIN,11); // 腕
  ctx.fillStyle=SKIN;ctx.strokeStyle="#4a3020";ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(4,-62-j,28,20+j,-.05,0,7);ctx.fill();ctx.stroke(); // おなか
  ctx.fillStyle="#fff";ctx.beginPath();ctx.moveTo(14,-78);ctx.quadraticCurveTo(34,-64,30,-40);ctx.lineTo(16,-44);ctx.quadraticCurveTo(20,-60,8,-74);ctx.closePath();ctx.fill();ctx.stroke(); // めくれたランニング
  ctx.fillStyle="#a06a48";ctx.beginPath();ctx.ellipse(0,-78-j*1.6,3,2,0,0,7);ctx.fill(); // おへそ
  ctx.strokeStyle="#4a3020";ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-10,-60-j);ctx.quadraticCurveTo(-4,-56,2,-60-j);ctx.stroke(); // すじ
  ojiHead(32,-18,1.25,Math.PI);
  if(state==="go"){ctx.fillStyle="#9ad8ff";ctx.beginPath();ctx.ellipse(46,-30,3,5,0,0,7);ctx.ellipse(-20,-80,3,5,0,0,7);ctx.fill();}}, // 汗
 kotatsu(){ctx.fillStyle="#c8392b";rr(-50,-24,100,36,6);ctx.fill();ctx.fillStyle="#ffd23f"; // こたつ（中におっさん）
  for(let x=-42;x<46;x+=16)for(let y=-16;y<10;y+=14){ctx.beginPath();ctx.arc(x+(y%28?8:0),y,3,0,7);ctx.fill();}
  ctx.fillStyle="#8a5a30";rr(-56,-32,112,9,3);ctx.fill();
  ctx.fillStyle="#ff9a1a";ctx.beginPath();ctx.arc(18,-40,9,0,7);ctx.arc(34,-40,8,0,7);ctx.fill();ctx.fillStyle="#3a8a30";ctx.fillRect(17,-50,3,4);
  ojiHead(-30,-44,.85,0);ctx.fillStyle="#fff";ctx.fillRect(-42,-58,24,5);},
 bath(){const b=Math.sin(time*3)*2; // お風呂のおっさん
  ctx.fillStyle="#ffffffaa";for(let k=0;k<3;k++){const t=(time*.6+k*.33)%1;ctx.globalAlpha=.6*(1-t);ctx.beginPath();ctx.arc(-20+k*18+Math.sin(t*6)*6,-60-t*40,8+t*8,0,7);ctx.fill();}ctx.globalAlpha=1; // 湯気
  ojiHead(-12,-34,.9,0);ctx.fillStyle="#fff";rr(-24,-52,24,8,3);ctx.fill(); // 頭にタオル
  ctx.fillStyle="#9ad8f0";rr(-48,-28,96,8,4);ctx.fill();
  ctx.fillStyle="#fff";for(let x=-40;x<44;x+=12){ctx.beginPath();ctx.arc(x,-26,6,0,7);ctx.fill();} // 泡
  ctx.fillStyle="#ffd23f";ctx.beginPath();ctx.arc(24,-34+b,8,0,7);ctx.arc(30,-40+b,6,0,7);ctx.fill();ctx.fillStyle="#ff8a00";ctx.fillRect(35,-41+b,6,3); // アヒル
  ctx.fillStyle="#f4f4f4";rr(-52,-22,104,32,14);ctx.fill();ctx.strokeStyle="#9aa";ctx.lineWidth=3;ctx.stroke();},
 superoji(){const w=Math.sin(time*10)*6; // スーパーおっさん（スケボーに腹ばいで飛ぶ）
  ctx.fillStyle="#6a4a2a";rr(-50,6,100,8,4);ctx.fill();ctx.strokeStyle="#000";ctx.lineWidth=3;ctx.stroke();
  ctx.fillStyle="#e8202a";ctx.beginPath();ctx.moveTo(18,-30);ctx.quadraticCurveTo(-30,-44+w,-66,-36+w*1.5);ctx.lineTo(-60,-14+w);ctx.quadraticCurveTo(-20,-20,10,-16);ctx.closePath();ctx.fill();ctx.stroke(); // マント
  ctx.fillStyle="#2a5ae0";ctx.beginPath();ctx.ellipse(-4,-18,42,13,0,0,7);ctx.fill();ctx.stroke(); // 体
  ctx.fillStyle="#3a6af0";ctx.beginPath();ctx.ellipse(4,-4,24,11,0,0,Math.PI);ctx.fill();ctx.stroke(); // 出たおなか
  ctx.fillStyle="#e8202a";ctx.beginPath();ctx.ellipse(-34,-18,12,11,0,0,7);ctx.fill();ctx.stroke(); // パンツ
  ctx.fillStyle="#ffd23f";ctx.beginPath();ctx.arc(8,-22,8,0,7);ctx.fill();ctx.stroke();ctx.fillStyle="#e8202a";ctx.font="bold 11px sans-serif";ctx.textAlign="center";ctx.fillText("オ",8,-18);ctx.textAlign="left";
  ctx.strokeStyle="#000";ctx.lineWidth=11;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(24,-24);ctx.lineTo(56,-32);ctx.stroke();ctx.strokeStyle=SKIN;ctx.lineWidth=7;ctx.stroke(); // 前に突き出した腕
  ctx.fillStyle=SKIN;ctx.beginPath();ctx.arc(58,-32,6,0,7);ctx.fill();ctx.strokeStyle="#000";ctx.lineWidth=2;ctx.stroke();
  ojiHead(32,-38,.95,0);ctx.fillStyle="#2a5ae0";ctx.fillRect(22,-42,22,5);}, // 目だけのマスク
 futon(){ctx.fillStyle="#fff";rr(28,-30,26,14,6);ctx.fill(); // 布団で寝たまま走るおっさん
  ojiHead(38,-30,.85,-.3,true);
  ctx.fillStyle="#6a8ad0";rr(-54,-24,86,32,8);ctx.fill();ctx.strokeStyle="#223";ctx.lineWidth=2.5;ctx.stroke();
  ctx.fillStyle="#fff";for(let x=-46;x<28;x+=16)for(let y=-16;y<6;y+=12){ctx.beginPath();ctx.arc(x+(y%24?8:0),y,3,0,7);ctx.fill();}
  ctx.fillStyle="#223";ctx.font="bold 18px sans-serif";for(let k=0;k<3;k++){const t=(time*.7+k*.33)%1;ctx.globalAlpha=1-t;ctx.fillText("Z",44+k*6+t*20,-50-t*40);}ctx.globalAlpha=1;},
});
// しゃべる乗り物（待ち・走る・クリア・失敗）
const TALK={bridge:["……","ふんっ！！","腰、無事！","腰がぁぁ！"],kotatsu:["出たくない…","出たくないぃ","みかん、うまし","こたつごと〜！"],
  bath:["ふぅ〜","いい湯だな〜","ととのった","あちちちっ"],pig:["ブヒ","ブヒー！","ブヒヒッ♪","ブヒィ…"],cat:["にゃ","にゃーっ！","にゃふん","ふにゃ〜"],
  car:["いくぞ","ブオーン！","よっしゃ！","うそーん"],tank:["……","前進！","制圧完了","撤退〜！"],buggy:["砂あつい","ヒャッホー！","最高かよ","砂がぁ"],
  loco:["シュッ","シュッポッポ！","定刻どおり","脱線〜！"],penguin:["さむ","すべる〜！","ペンッ！","ひぇ〜"],sports:["……","フゥーーッ！","イケてる","ダサッ"],
  boar:["フゴ","猪突猛進！","フゴフゴ♪","フゴォ…"],rickshaw:["へい","へいらっしゃい！","毎度あり！","お代はいらねぇ…"],cart:["あつ","熱っ熱っ！","お宝ゲット","もえつきた…"],
  cake:["あまい","とろける〜","おいしくできました","ぐちゃ…"],sub:["ぶくぶく","潜航〜！","浮上成功","浸水〜！"],rover:["ピピ","小さな一歩！","人類の大きな一歩","ヒューストン…"],
  ufo:["ワレワレハ","ワレワレハー！","チキュウ、チョロイ","カエリタイ…"],superoji:["……","とうっ！","正義は勝つ","マントが…"],futon:["zzz","むにゃ…","あと5分…","（まだ寝てる）"]};
// 失敗の擬音
function failWord(msg){return msg.includes("起きなかった")?"ぐぅ…":msg.includes("飛んでいっちゃった")?"ヒューン…":msg.includes("とどかなかった")?"ぽてっ":msg.includes("大岩")?"ドガーン！":msg.includes("落石")?"ゴンッ！":msg.includes("荷物")?"あっ…":msg.includes("ひっくり")?"ゴロン…":
  msg.includes("動けなく")||msg.includes("時間")?"シーン…":TH.lava?"ジュッ！":TH.space?"さよなら〜":TH.subway?"プァーン！":"ドボーン！";}
function drawFailWord(f){if(!f.word)return;const k=Math.min(1,(time-f.t)*5),s=k<1?k*1.3:1;
  ctx.save();ctx.translate(f.x,Math.max(70,f.y-90));ctx.rotate(-.12);ctx.scale(s,s);ctx.font="900 64px 'Hiragino Maru Gothic ProN','Arial Black',sans-serif";ctx.textAlign="center";
  ctx.lineJoin="round";ctx.lineWidth=12;ctx.strokeStyle="#000";ctx.strokeText(f.word,0,0);ctx.fillStyle="#ffd23f";ctx.fillText(f.word,0,0);ctx.restore();ctx.textAlign="left";}
// クリアした時の見物のおっさん（旗の向こうで拍手）
let winAt=0,talkAt=null;
const CHEER=["おお〜！","ナイス！","天才か","やるやん","見事！","拍手〜！"];
function drawCheer(){if(state!=="win"||!L)return;const k=Math.min(1,(time-winAt)*3),x=L.goal[0]-70*DIR,y=L.goal[1],c=Math.sin(time*18)*6;
  ctx.save();ctx.translate(x,y+(1-k)*80);
  ctx.strokeStyle="#4a3020";ctx.lineWidth=7;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(-6,0);ctx.lineTo(-4,-26);ctx.moveTo(6,0);ctx.lineTo(4,-26);ctx.stroke();
  ctx.fillStyle="#e8dcc0";rr(-12,-34,24,12,4);ctx.fill();ctx.fillStyle="#fff";ctx.beginPath();ctx.ellipse(0,-48,15,18,0,0,7);ctx.fill();ctx.strokeStyle="#bbb";ctx.lineWidth=1.5;ctx.stroke();
  ctx.strokeStyle=SKIN;ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(-12,-56);ctx.lineTo(-4+c,-72);ctx.moveTo(12,-56);ctx.lineTo(4-c,-72);ctx.stroke();
  ojiHead(0,-78,.9,0);
  const w=CHEER[li%CHEER.length];ctx.font="bold 20px sans-serif";const tw=ctx.measureText(w).width+20,bx=Math.max(-60,Math.min(60,(W/2-x)*.1));
  ctx.fillStyle="#fffffff0";ctx.strokeStyle="#333";ctx.lineWidth=2;rr(bx-tw/2,-128,tw,32,12);ctx.fill();ctx.stroke();ctx.fillStyle="#222";ctx.textAlign="center";ctx.fillText(w,bx,-106);ctx.textAlign="left";
  ctx.restore();}
function drawTalk(c,z){const t=TALK[TH.rider];if(!t||state==="title")return;
  const k=state==="win"?2:state==="fail"?3:state==="go"?1:0,s=t[k],x=c.position.x,y=c.position.y-(TH.rider==="bridge"?120:92)*z;
  ctx.font="bold 22px sans-serif";const w=ctx.measureText(s).width+24;
  ctx.fillStyle="#fffffff0";ctx.strokeStyle="#333";ctx.lineWidth=2.5;rr(x-w/2,y-20,w,36,14);ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.moveTo(x-6,y+16);ctx.lineTo(x,y+28);ctx.lineTo(x+6,y+16);ctx.fill();
  ctx.fillStyle="#222";ctx.textAlign="center";ctx.fillText(s,x,y+6);ctx.textAlign="left";}
// 車輪の描き方
function drawWheel(w,z){
  ctx.save();ctx.translate(w.position.x,w.position.y);ctx.rotate(w.angle);ctx.scale(z,z);
  const s=TH.wheel;
  if(s==="sketch"||s==="chalk"||s==="line"){const c=s==="sketch"?"#2a2a2a":s==="chalk"?"#f4f4ec":"#ffffff";
    ctx.fillStyle=s==="sketch"?"#fbf8ef":s==="chalk"?"#2e4a3a":"#1d56a8";ctx.beginPath();ctx.arc(0,0,WR,0,7);ctx.fill();
    ctx.strokeStyle=c;ctx.lineWidth=3;ctx.stroke();ctx.beginPath();for(let k=0;k<3;k++){const a=k*2.094;ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*WR,Math.sin(a)*WR);}ctx.stroke();}
  else if(s==="neon"){ctx.shadowColor="#00f0ff";ctx.shadowBlur=12;ctx.fillStyle="#000";ctx.beginPath();ctx.arc(0,0,WR,0,7);ctx.fill();
    ctx.strokeStyle="#00f0ff";ctx.lineWidth=3;ctx.stroke();ctx.beginPath();ctx.arc(0,0,8,0,4);ctx.stroke();ctx.shadowBlur=0;}
  else if(s==="orb"){const g=ctx.createRadialGradient(0,0,2,0,0,WR);g.addColorStop(0,"#ffffff");g.addColorStop(.4,"#80ff90");g.addColorStop(1,"#80ff9000");
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,WR,0,7);ctx.fill();}
  else{ctx.fillStyle=TH.post==="gb"?"#0f380f":"#222";ctx.beginPath();ctx.arc(0,0,WR,0,7);ctx.fill();if(s==="comic"){ctx.strokeStyle="#000";ctx.lineWidth=5;ctx.stroke();}
    ctx.fillStyle=TH.post==="gb"?"#8bac0f":"#ccc";ctx.beginPath();ctx.arc(0,0,9,0,7);ctx.fill();
    ctx.strokeStyle="#666";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-9,0);ctx.lineTo(9,0);ctx.moveTo(0,-9);ctx.lineTo(0,9);ctx.stroke();}
  ctx.restore();}

/* ---------- 画面全体の仕上げ（ドット絵・ゲームボーイ） ---------- */
let postCv=null,postCtx=null;
const GB=[[15,56,15],[48,98,48],[139,172,15],[155,188,15]];
function postFx(kind){
  const f=kind==="gb"?4:3,w=Math.round(W/f),h=Math.round(H/f);
  if(!postCv){postCv=document.createElement("canvas");postCtx=postCv.getContext("2d",{willReadFrequently:true});}
  if(postCv.width!==w){postCv.width=w;postCv.height=h;}
  postCtx.imageSmoothingEnabled=true;postCtx.drawImage(cv,0,0,w,h);
  if(kind==="gb"){const im=postCtx.getImageData(0,0,w,h),d=im.data;
    for(let i=0;i<d.length;i+=4){const l=(d[i]*.3+d[i+1]*.59+d[i+2]*.11)/256,c=GB[Math.min(3,Math.floor(l*4.2))];d[i]=c[0];d[i+1]=c[1];d[i+2]=c[2];}
    postCtx.putImageData(im,0,0);}
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.imageSmoothingEnabled=false;ctx.drawImage(postCv,0,0,cv.width,cv.height);ctx.restore();ctx.imageSmoothingEnabled=true;
}

/* ---------- 失敗したら爆発 ---------- */
let boomFx=[],shakeT=0,blown=false;
function boomSound(){const a=audio();if(!a)return;const t=a.currentTime,n=a.sampleRate*1.2,buf=a.createBuffer(1,n,a.sampleRate),d=buf.getChannelData(0);
  for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,2.2);
  const src=a.createBufferSource();src.buffer=buf;const lp=a.createBiquadFilter();lp.type="lowpass";lp.frequency.setValueAtTime(1800,t);lp.frequency.exponentialRampToValueAtTime(120,t+1.1);
  const g=a.createGain();g.gain.value=.9;src.connect(lp).connect(g).connect(a.destination);src.start(t);
  tone(90,.6,"sine",.35,30);}
function explode(){
  const live=cars.filter(c=>!c.waiting);if(!live.length)return;blown=true;shakeT=.6;boomSound();
  for(const c of live){const p=c.chassis.position,x=Math.max(40,Math.min(W-40,p.x)),y=Math.min(p.y,WATER_Y-20),pal=c===cars[1]?["#ffffff",TH.car[0]]:TH.car;
    boomFx.push({k:"flash",x,y,t:0});
    for(let n=0;n<12;n++)boomFx.push({k:"fire",x:x+(Math.random()-.5)*110,y:y-20+(Math.random()-.5)*80,r:20,t:-n*.035});
    for(let n=0;n<40;n++){const a=Math.random()*6.28,v=6+Math.random()*14;boomFx.push({k:"spark",x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-4,t:0});}
    for(let n=0;n<12;n++)boomFx.push({k:"bit",x,y,vx:(Math.random()-.5)*16,vy:-6-Math.random()*10,r:0,vr:(Math.random()-.5)*.6,c:pal[n%2],w:16+Math.random()*26,t:0});
    for(const s of [-1,1])boomFx.push({k:"wheel",x:x+s*30,y,vx:s*(5+Math.random()*5),vy:-9-Math.random()*6,r:0,vr:s*.3,t:0});
    if(OJI.includes(TH.rider))boomFx.push({k:"head",x,y:y-30,vx:(Math.random()-.5)*6,vy:-16,r:0,vr:.25,t:0}); // おっさんの頭は高く飛ぶ
    for(let n=0;n<6;n++)boomFx.push({k:"smoke",x:x+(Math.random()-.5)*90,y:y-20,r:24,t:-.2-n*.08});
    for(const b of [c.chassis,c.wA,c.wB,...c.cons])Composite.remove(world,b);
    // 爆風: 近くの線や岩を吹き飛ばす
    for(const b of Composite.allBodies(world)){if(b.isStatic)continue;const dx=b.position.x-x,dy=b.position.y-y,d=Math.hypot(dx,dy);
      if(d<260&&d>1){const f=(260-d)/260*14;Body.setVelocity(b,{x:b.velocity.x+dx/d*f,y:b.velocity.y+dy/d*f-3});Body.setAngularVelocity(b,(Math.random()-.5)*.3);}}}
  if(cargo)Body.setVelocity(cargo,{x:(Math.random()-.5)*10,y:-12});}
const OJI=["bridge","kotatsu","bath","superoji","futon"];
function stepBoom(){const dt=DT/1000;if(shakeT>0)shakeT-=dt;
  for(let i=boomFx.length-1;i>=0;i--){const f=boomFx[i];f.t+=dt;
    if(f.vx!==undefined){f.x+=f.vx;f.y+=f.vy;f.vy+=.45;f.vx*=.99;if(f.vr)f.r+=f.vr;}
    if(f.k==="smoke"){f.y-=1.2;f.r+=.8;}
    if(f.t>(f.k==="smoke"?2.2:f.k==="head"||f.k==="wheel"||f.k==="bit"?3:1)||f.y>H+100)boomFx.splice(i,1);}}
function drawBoom(){
  for(const f of boomFx){if(f.t<0)continue;
    if(f.k==="flash"){const a=Math.max(0,1-f.t*4);ctx.fillStyle=`rgba(255,250,210,${a*.8})`;ctx.fillRect(0,0,W,H);
      ctx.fillStyle=`rgba(255,240,150,${a})`;ctx.beginPath();ctx.arc(f.x,f.y,40+f.t*500,0,7);ctx.fill();}
    else if(f.k==="fire"){const r=f.r+f.t*300,a=Math.max(0,1-f.t*1.6);
      const g=ctx.createRadialGradient(f.x,f.y,0,f.x,f.y,r);g.addColorStop(0,`rgba(255,255,200,${a})`);g.addColorStop(.4,`rgba(255,170,30,${a})`);g.addColorStop(1,`rgba(220,40,0,0)`);
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(f.x,f.y,r,0,7);ctx.fill();}
    else if(f.k==="spark"){ctx.fillStyle=f.t<.3?"#fff6a0":"#ff8a20";ctx.fillRect(f.x-5,f.y-5,10,10);}
    else if(f.k==="smoke"){ctx.fillStyle=`rgba(60,60,60,${Math.max(0,.55-f.t*.25)})`;ctx.beginPath();ctx.arc(f.x,f.y,f.r,0,7);ctx.fill();}
    else{ctx.save();ctx.translate(f.x,f.y);ctx.rotate(f.r);
      if(f.k==="bit"){ctx.fillStyle=f.c;ctx.fillRect(-f.w/2,-7,f.w,14);ctx.strokeStyle="#0006";ctx.lineWidth=2;ctx.strokeRect(-f.w/2,-7,f.w,14);}
      else if(f.k==="wheel"){ctx.fillStyle="#222";ctx.beginPath();ctx.arc(0,0,WR,0,7);ctx.fill();ctx.fillStyle="#ccc";ctx.beginPath();ctx.arc(0,0,9,0,7);ctx.fill();
        ctx.strokeStyle="#666";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-9,0);ctx.lineTo(9,0);ctx.stroke();}
      else if(f.k==="head"){ojiHead(0,0,1.2,0);ctx.rotate(-f.r);ctx.font="bold 22px sans-serif";ctx.fillStyle="#fff";ctx.strokeStyle="#000";ctx.lineWidth=4;ctx.strokeText("ぬわーっ",-40,-30);ctx.fillText("ぬわーっ",-40,-30);}
      ctx.restore();}}}
