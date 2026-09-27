// 31 面目以降の自動生成。型（TPL）と種（seed）と難しさ d(0〜1) から面を作る。
// どの種を使うかは GEN_TABLE（ブラウザで模範解答を走らせて合格した物だけ）で決まる。
"use strict";
(function(){
const W=1280;
const rect=(x0,x1,top,bot=1000)=>[[x0,top],[x1,top],[x1,bot],[x0,bot]];
const cliffL=(x1,top)=>[[-60,top],[x1,top],[x1-40,1000],[-60,1000]];
const cliffR=(x0,top)=>[[x0,top],[W+60,top],[W+60,1000],[x0+40,1000]];
function rng(seed){let a=seed>>>0;return ()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);
  t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
const lerp=(a,b,t)=>a+(b-a)*t, rd=v=>Math.round(v);

// 飛ばす面: 飛ぶ距離は線の長さで決まる（modes.js の fire と同じ式）。y=x·tanθ − x²/(3.73·len·cos²θ)
function launchTpl(r,d,kind){const R=(a,b)=>a+(b-a)*r();
  const Y=rd(R(470,500)),px=rd(R(260,320)),plen=280,py=Y-30,fx=px-(plen/2-26),sy=py-30;
  let D=rd(lerp(380,700,d)+R(-30,30));if(kind==="wall")D=Math.max(D,560);const bw=rd(lerp(180,140,d)),bx=fx+D;
  let by=Y,ground=[rect(-60,px+180,Y)],name="布団へ",hint="シーソーの反対側に線を落とすと、おっさんが飛ぶ。線が長いほど遠くへ！";
  if(kind==="water"){ground.push(rect(bx-bw/2-20,W+60,Y));}
  if(kind==="tower"){by=Y-rd(Math.min(R(80,170),D*.45));ground.push(rect(bx-bw/2-20,bx+bw/2+20,by));name="塔の上の布団";hint="布団は塔の上。高く遠くへ。";}
  if(kind==="wall"){ground.push(rect(bx-bw/2-20,W+60,Y));const wx=rd(fx+D*R(.45,.6));ground.push(rect(wx-18,wx+18,Y-rd(R(120,180)),Y));name="壁ごえ";hint="あいだに壁。越えて布団へ。";}
  const th=55*Math.PI/180,dx=bx-fx,up=sy-(by-30),len=Math.max(60,dx*dx/(3.73*Math.cos(th)**2*(dx*Math.tan(th)-up)));
  const x0=px+plen/2-30,a=90*Math.PI/180; // 板の端に、立てた線を落とす
  return {name,hint,mode:"launch",ground,car:[-400,300],goal:[bx,by],saw:[px,py,plen],bed:[bx-bw/2,bx+bw/2,by],
    noDraw:[[bx-bw/2-10,0,bw+20,by-70]],
    sol:[[x0,py-40],[rd(x0+len*Math.cos(a)),rd(py-40-len*Math.sin(a))]]};}
const TPL={
 bridge(r,d){const R=(a,b)=>a+(b-a)*r();
  const Y=rd(R(380,480)),g=rd(lerp(220,600,d)+R(-40,40)),L=rd(R(330,Math.max(340,W-g-300))),X=L+g;
  const o={name:"谷",hint:"谷に橋をかけよう。",ground:[cliffL(L,Y),cliffR(X,Y)],car:[Math.max(90,L-240),Y],
    goal:[Math.min(X+220,1180),Y],sol:[[L-50,Y-30],[X+50,Y-30]]};
  if(r()<d*.7){o.noDraw=[[L-60,0,g+120,Y-80]];o.hint="低いところにしか描けない。";o.sol=[[L-50,Y-40],[X+50,Y-40]];}
  return o;},
 slope(r,d){const R=(a,b)=>a+(b-a)*r();
  const up=r()<.6,dh=rd(lerp(40,150,d)*(up?1:-1)),Y=rd(up?R(420,490):R(320,380)),top=Y-dh;
  const g=rd(Math.max(Math.abs(dh)/.42,R(200,320))),L=rd(R(360,Math.max(370,W-g-320))),X=L+g;
  const o={name:up?"のぼり坂":"くだり坂",hint:up?"向こう岸が高い。坂を作ろう。":"ゆるやかな下り坂を。",
    ground:[cliffL(L,Y),cliffR(X,top)],car:[Math.max(90,L-240),Y],goal:[Math.min(X+220,1180),top],
    sol:[[L-40,Y-24],[X+50,top-24]]};
  if(up&&dh>80&&r()<.6){o.pins=[[L-8,Y-14]];o.hint="けわしい坂。くぎで滑り止め。";}
  return o;},
 drawbridge(r,d){const R=(a,b)=>a+(b-a)*r();
  const g=rd(lerp(170,320,d)+R(-15,15)),Y=rd(Math.min(500,Math.max(R(400,480),g+140))),L=rd(R(390,Math.max(400,W-g-340))),X=L+g;
  return {name:"はね橋",hint:"谷の上には描けない。くぎから上へ線をのばして倒そう。",
    ground:[cliffL(L,Y),cliffR(X,Y)],car:[Math.max(80,L-320),Y],goal:[Math.min(X+220,1180),Y],
    pins:[[L+8,Y-16]],noDraw:[[L+35,0,X-L-35,600]],sol:[[L+6,Y-10],[L+29,Y-16-(g+80)]]};},
 revbridge(r,d){const R=(a,b)=>a+(b-a)*r();
  const g=rd(lerp(150,240,d)+R(-10,10)),Y=rd(R(420,480)),X=rd(R(700,860)),L=X-g;
  return {name:"逆はね橋",hint:"くぎは向こう岸。こっちへ倒そう。",
    ground:[cliffL(L,Y),cliffR(X,Y)],car:[Math.max(60,L-420),Y],goal:[Math.min(X+300,1180),Y],
    pins:[[X+140,Y-8]],noDraw:[[L,0,g,600]],
    // 倒れた時に左岸へ 70px ほど乗る長さにする（長すぎると岸の側面に刺さる）
    sol:[[X+144,Y-4],[X+12,Math.max(30,Y-8-Math.sqrt(Math.max(0,(g+210)**2-128*128)))]]};},
 wall(r,d){const R=(a,b)=>a+(b-a)*r();
  const Y=rd(R(470,500)),h=rd(lerp(60,160,d)+R(-10,10)),run=h/.45,x0=rd(R(Math.max(560,280+run),780)),w=rd(R(100,160));
  return {name:"かべ",hint:"壁は三角形の坂でのりこえる。",ground:[rect(-60,W+60,Y),rect(x0,x0+w,Y-h)],car:[150,Y],
    goal:[Math.min(x0+w+230,1180),Y],sol:[[x0-10-run,Y-8],[x0-10,Y-h-8],[x0-10,Y-8],[x0-10-run+20,Y-8]]};},
 stairs(r,d){const R=(a,b)=>a+(b-a)*r();
  const n=2+Math.floor(d*2.99),sh=rd(lerp(40,60,d)),Y=480,X0=rd(R(380,470));
  let sw=rd(Math.max(sh/.40,R(110,170)));sw=Math.min(sw,rd((W-250-X0)/Math.max(1,n-1)));
  const ground=[rect(-60,X0,Y)];
  for(let i=1;i<=n;i++)ground.push(rect(X0+(i-1)*sw,i===n?W+60:X0+i*sw,Y-i*sh));
  const k=sh/sw,y0=Y-sh-11,xs=X0-(sh+2)/k,xe=X0+(n-1)*sw+40;
  return {name:"階段",hint:"段は高くて登れない。角をまとめて一本の坂に。",ground,car:[120,Y],
    goal:[Math.min(X0+(n-1)*sw+200,1180),Y-n*sh],sol:[[xs,y0+k*(X0-xs)],[xe,y0-k*(xe-X0)]]};},
 tent(r,d){const R=(a,b)=>a+(b-a)*r();
  const Y=rd(R(440,490)),hp=rd(lerp(40,90,d)),half=rd(Math.max((hp+20)/.42+30,R(170,230))),pc=rd(R(560,700)),L=pc-half,X=pc+half;
  return {name:"山越え",hint:"まん中の岩をまたぐ山の形。",ground:[cliffL(L,Y),rect(pc-20,pc+20,Y-hp),cliffR(X,Y)],
    car:[Math.max(90,L-240),Y],goal:[Math.min(X+220,1180),Y],
    sol:[[L-80,Y-8],[L-2,Y-8],[pc,Y-hp-20],[X+2,Y-8],[X+80,Y-8]]};},
 valley(r,d){const R=(a,b)=>a+(b-a)*r();
  const Y=rd(R(360,410)),hv=rd(lerp(60,110,d)),side=rd(Math.max(hv/.45,R(180,240))),pw=rd(R(100,140)),L=rd(R(360,420)),
    P0=L+side,P1=P0+pw,X=P1+side;
  return {name:"谷底",hint:"低い岩をくぐる谷の形。",ground:[cliffL(L,Y),rect(P0,P1,Y+hv),cliffR(X,Y)],
    car:[Math.max(90,L-240),Y],goal:[Math.min(X+200,1180),Y],
    sol:[[L-80,Y-8],[L-2,Y-8],[P0+10,Y+hv-7],[P1-10,Y+hv-7],[X+2,Y-8],[X+80,Y-8]]};},
 needle(r,d){const R=(a,b)=>a+(b-a)*r();
  const Y=rd(R(420,470)),L=rd(R(220,300)),X=rd(R(980,1060)),b=rd(lerp(14,8,d)),nb=Y-8-b;
  const p1=rd(lerp(L,X,.33)),p2=rd(lerp(L,X,.66));
  return {name:"ぬい針",hint:"赤いところのすき間を、まっすぐ通して。",
    ground:[cliffL(L,Y),rect(p1-35,p1+35,Y+20),rect(p2-35,p2+35,Y+20),cliffR(X,Y)],car:[100,Y],goal:[1150,Y],
    noDraw:[[p1-35,0,70,nb-6],[p2-35,0,70,nb-6]],sol:[[L-10,Y-8-b/2],[X+10,Y-8-b/2]]};},
 tunnel(r,d){const R=(a,b)=>a+(b-a)*r();
  const Y=rd(R(420,480)),g=rd(lerp(250,480,d)),L=rd(R(360,Math.max(370,W-g-300))),X=L+g,C=rd(Y-lerp(112,98,d));
  return {name:"トンネル",hint:"天井が低い。車がぶつからない高さで。",
    ground:[cliffL(L,Y),cliffR(X,Y),rect(L-40,X+40,-200,C)],car:[Math.max(90,L-240),Y],goal:[Math.min(X+220,1180),Y],
    sol:[[L-30,Y-36],[X+30,Y-36]]};},
 drop(r,d){const R=(a,b)=>a+(b-a)*r();
  const dh=r()<.5?0:rd(R(40,90)),Y=rd(R(430,480)),g=rd(lerp(220,380,d)),L=rd(R(380,Math.max(390,W-g-320))),X=L+g;
  return {name:dh?"落とす坂":"落とす橋",hint:"谷の近くには描けない。上から落とそう。",
    ground:[cliffL(L,Y),cliffR(X,Y-dh)],car:[Math.max(90,L-260),Y],goal:[Math.min(X+220,1180),Y-dh],
    noDraw:[[L-120,140,g+240,460]],sol:[[L-50,100+dh],[X+50,100-dh*.4]]};},
 long(r,d){const R=(a,b)=>a+(b-a)*r();
  const Y=rd(R(430,470)),L=rd(R(180,240)),X=rd(R(1020,1090));
  const ground=[cliffL(L,Y),cliffR(X,Y)];const np=r()<.5?1:2;
  for(let i=1;i<=np;i++){const p=rd(lerp(L,X,i/(np+1)));ground.push(rect(p-20,p+20,Y+30));}
  return {name:"ながーい橋",hint:"低いところにしか描けない。長い一本を。",ground,car:[90,Y],goal:[1170,Y],
    noDraw:[[0,0,1280,Y-rd(lerp(70,50,d))]],sol:[[L-20,Y-24],[X+20,Y-24]]};},
 pit(r,d){const R=(a,b)=>a+(b-a)*r();
  const Y=rd(R(420,470)),g=rd(lerp(220,480,d)),L=rd(R(360,Math.max(370,W-g-300))),X=L+g;
  return {name:"深い穴",hint:"落ちたら出られない穴。",ground:[rect(-60,L,Y),rect(L,X,Y+130),rect(X,W+60,Y)],
    car:[Math.max(90,L-240),Y],goal:[Math.min(X+220,1180),Y],noDraw:[[L,0,g,Y-50]],sol:[[L-20,Y-22],[X+20,Y-22]]};},
 high(r,d){const R=(a,b)=>a+(b-a)*r();
  const Y=rd(R(470,500)),g=rd(lerp(150,240,d)),dh=rd(lerp(40,90,d)),L=rd(R(560,720)),X=L+g;
  return {name:"高台",hint:"ゴールは高いところ。",ground:[rect(-60,L,Y),rect(X,Math.min(X+300,W+60),Y-dh)],
    car:[150,Y],goal:[X+60,Y-dh],sol:[[L-10,Y-14],[X+30,Y-dh-30]]};},
 walls2(r,d){const R=(a,b)=>a+(b-a)*r();
  const Y=480,h=rd(lerp(50,85,d)),w1=rd(R(470,540)),D=rd(R(240,380)),w2=w1+80+D;
  return {name:"かべ2枚",hint:"壁から壁へ。のぼる坂とわたる橋をいっぺんに。",
    ground:[rect(-60,W+60,Y),rect(w1,w1+80,Y-h),rect(w2,w2+80,Y-h)],car:[150,Y],goal:[Math.min(w2+300,1180),Y],
    sol:[[w1-Math.max(150,h/.5),Y-8],[w1-10,Y-h-8],[w2+86,Y-h-8]]};},
 rockfall(r,d){const R=(a,b)=>a+(b-a)*r();
  const Y=rd(R(460,490)),w=rd(lerp(170,260,d)),x0=rd(R(520,760-w/2)),x1=x0+w,sl=r()<d?rd(R(-30,30)):0,py=Y-122;
  return {name:"落石",hint:"石が落ちてくる！ くぎ2本に線を通して屋根を作ろう。",ground:[rect(-60,W+60,Y)],car:[150,Y],goal:[1120,Y],
    pins:[[x0-12,py],[x1+12,py+sl]],rocks:[x0+12,x1-12,+lerp(.26,.18,d).toFixed(2)],
    sol:[[x0-40,py-sl*28/(w+24)],[x1+40,py+sl+sl*28/(w+24)]]};},
 skycar(r,d){const R=(a,b)=>a+(b-a)*r();
  const Y=rd(R(440,500)),X=rd(lerp(520,780,d)+R(-30,30)),px=100,py=228;
  return {name:"空から車",hint:"車が空から落ちてくる！ くぎに引っかけて滑り台を。",ground:[rect(X,W+60,Y)],car:[150,170],air:true,
    goal:[Math.min(X+280,1180),Y],pins:[[px,py]],sol:[[70,py+4],[X+40,Y-12]]};},
 jumppad(r,d){const R=(a,b)=>a+(b-a)*r();
  const Y=rd(R(440,480)),L=rd(R(440,520)),g=rd(lerp(320,430,d)),X=L+g,Y2=Y+rd(R(-20,40));
  return {name:"ジャンプ台",hint:"ジャンプ台で飛ぶ！ 着地できる所を作ろう。",ground:[cliffL(L,Y),cliffR(X,Y2)],car:[120,Y],
    pads:[[L-200,L-50,Y]],goal:[Math.min(X+230,1180),Y2],pins:[[X-150,Y2+30]],noDraw:[[L+30,0,Math.max(40,g-200),600]],
    sol:[[X-168,Y2+36],[X+50,Y2-24]]};},
 boulder(r,d){const R=(a,b)=>a+(b-a)*r();
  const Y=480,x1=rd(R(700,800)),y1=Y-150,top=x=>60+(y1-60)*(1300-x)/(1300-x1),xm=rd(lerp(x1+180,x1+120,d));
  return {name:"大岩",hint:"大岩が転がってくる！ くぎ2本に線を通して止めよう。",
    ground:[rect(-60,W+60,Y),[[1300,60],[x1,y1],[x1,y1+40],[1300,100]]],car:[150,Y],goal:[1150,Y],
    boulder:[1190,top(1190)-34,30],pins:[[xm,rd(top(xm)-22)],[xm-6,rd(top(xm)-90)]],
    sol:[[xm+2,rd(top(xm)-10)],[xm-8,rd(top(xm)-110)]]};},
 mill(r,d){const R=(a,b)=>a+(b-a)*r();
  const Y=480,mx=rd(R(560,760)),mr=100,my=Y-mr-14;
  return {name:"風車",hint:"風車がじゃま！ 線をはさんで止めよう。",ground:[rect(-60,W+60,Y)],car:[150,Y],goal:[1150,Y],
    mill:[mx,my,mr,+lerp(.05,.08,d).toFixed(3)],sol:[[mx-150,Y-8],[mx-20,Y-60]]};},
 /* ---------- スイッチを押せ（L.mode="switch"） ---------- */
 swShelf(r,d){const R=(a,b)=>a+(b-a)*r();
  const Y=rd(R(440,490)),gx=rd(R(640,900));let sx=rd(R(260,1060));if(Math.abs(sx-gx)<130)sx=gx>700?rd(R(260,480)):rd(R(960,1080));
  const sy=rd(R(200,Math.max(210,Y-170)));
  const o={name:"スイッチ",hint:"遮断機が道をふさいでいる。線を落としてボタンを押そう。",mode:"switch",
    ground:[rect(-60,W+60,Y),rect(sx-60,sx+60,sy,sy+26)],car:[150,Y],goal:[Math.min(gx+300,1180),Y],gate:[gx,0,Y],btns:[[sx,sy]],
    sol:[[sx-45,sy-40],[sx+45,sy-40]]};
  if(d>.5){o.noDraw=[[sx-80,0,160,sy-110]];o.hint="ボタンの真上は描けない。";}
  return o;},
 swCup(r,d){const R=(a,b)=>a+(b-a)*r();
  const Y=rd(R(440,490)),gx=rd(R(620,760)),cx=rd(R(900,1080)),cy=rd(R(260,Y-140)),op=rd(lerp(120,70,d)),hw=op/2;
  return {name:"カップの底",hint:"ボタンはカップの底。すき間に落とそう。",mode:"switch",
    ground:[rect(-60,W+60,Y),rect(cx-hw-60,cx+hw+60,cy,cy+24),rect(cx-hw-24,cx-hw,cy-90,cy),rect(cx+hw,cx+hw+24,cy-90,cy)],
    car:[150,Y],goal:[Math.min(gx+260,1180),Y],gate:[gx,0,Y],btns:[[cx,cy,op-14]],
    sol:[[cx,cy-170],[cx,cy-120]]};},
 swPillar(r,d){const R=(a,b)=>a+(b-a)*r();
  const Y=rd(R(420,480)),g=rd(lerp(300,440,d)+R(-20,20)),L=rd(R(330,Math.max(340,W-g-300))),X=L+g,pm=rd(L+g*R(.35,.65)),pY=Y+rd(R(30,90));
  return {name:"柱のボタン",hint:"ボタンを押すと橋が出る。柱の上の細いすき間から。",mode:"switch",
    ground:[cliffL(L,Y),cliffR(X,Y),rect(pm-20,pm+20,pY)],car:[Math.max(90,L-250),Y],goal:[Math.min(X+220,1180),Y],
    btns:[[pm,pY,34]],bridge:[L,X,Y],noDraw:[[L,0,pm-26-L,600],[pm+26,0,X-pm-26,600]],
    sol:[[pm,pY-150],[pm,pY-100]]};},
 swTwo(r,d){const R=(a,b)=>a+(b-a)*r();
  const Y=rd(R(440,490)),gx=rd(R(900,1000)),a=rd(R(260,420)),sp=rd(lerp(180,340,d)),b=a+sp,ya=rd(R(220,330)),yb=d>.4?ya+rd(R(-60,60)):ya;
  return {name:"ボタン2つ",hint:"ボタンは2つ。いっぺんに押そう。",mode:"switch",
    ground:[rect(-60,W+60,Y),rect(a-40,a+40,ya,ya+24),rect(b-40,b+40,yb,yb+24)],car:[150,Y],goal:[Math.min(gx+220,1180),Y],gate:[gx,0,Y],
    btns:[[a,ya,56],[b,yb,56]],sol:[[a-50,ya-36],[b+50,yb-36]]};},
 /* ---------- 守れ（L.mode="guard"。車は止まったまま） ---------- */
 gdRain(r,d){const R=(a,b)=>a+(b-a)*r();
  const Y=rd(R(440,500)),cx=rd(R(420,860)),sp=rd(lerp(80,130,d));
  return {name:"岩の雨",hint:"岩がふってくる！ 線で屋根を作って守ろう。",mode:"guard",guard:rd(lerp(4,6,d)),
    ground:[rect(-60,W+60,Y)],car:[cx,Y],goal:[cx,Y-40],rocks:[cx-sp,cx+sp,+lerp(.32,.2,d).toFixed(2)],
    sol:[[cx-120,Y-4],[cx,Y-200],[cx+120,Y-4]]};},
 gdCannon(r,d){const R=(a,b)=>a+(b-a)*r();
  const Y=rd(R(440,500)),cx=rd(R(700,960)),kx=rd(R(90,180)),ky=Y-rd(R(40,lerp(60,200,d))),wx=cx-rd(R(110,160));
  return {name:"大砲",hint:"大砲が撃ってくる！ くぎ2本に線を通して盾に。",mode:"guard",guard:rd(lerp(4,6,d)),
    ground:[rect(-60,W+60,Y)],car:[cx,Y],goal:[cx,Y-40],cannon:[kx,ky,rd(lerp(11,15,d)),null,+lerp(1.2,.8,d).toFixed(2),.7],
    pins:[[wx,Y-40],[wx,Y-170]],sol:[[wx,Y-14],[wx,Y-250]]};},
 gdMeteor(r,d){const R=(a,b)=>a+(b-a)*r();
  const Y=rd(R(440,500)),cx=rd(R(760,980));
  return {name:"隕石",hint:"ななめ上から飛んでくる！ 車を守ろう。",mode:"guard",guard:rd(lerp(4,6,d)),
    ground:[rect(-60,W+60,Y)],car:[cx,Y],goal:[cx,Y-40],cannon:[80,120,rd(R(8,10)),null,+lerp(1,.7,d).toFixed(2),.6],
    rocks:d>.5?[cx-60,cx+60,.45]:undefined,
    sol:[[cx-130,Y-4],[cx-10,Y-210],[cx+110,Y-4]]};},
 /* ---------- おっさんを起こせ（L.mode="wake"。車は出ない） ---------- */
 wkOpen(r,d){const R=(a,b)=>a+(b-a)*r();
  const Y=rd(R(440,500)),ox=rd(R(420,1000));
  return {name:"おきて！",hint:"おっさんが寝ている。線を落として起こそう。",mode:"wake",ground:[rect(-60,W+60,Y)],car:[-400,300],goal:[ox,Y],oji:[ox,Y],
    sol:[[ox-50,Y-200],[ox+60,Y-200]]};},
 wkPit(r,d){const R=(a,b)=>a+(b-a)*r();
  const Y=rd(R(380,440)),w=rd(R(200,240)),L=rd(R(360,800)),X=L+w,op=rd(lerp(100,60,d)),lip=(w-op)/2,fy=Y+rd(R(90,150));
  return {name:"穴の底",hint:"おっさんは穴の底。すき間から落とそう。",mode:"wake",
    ground:[rect(-60,L,Y),rect(X,W+60,Y),rect(L,X,fy),rect(L,L+lip,Y,Y+20),rect(X-lip,X,Y,Y+20)],car:[-400,300],goal:[L+w/2,fy],oji:[L+w/2,fy],
    sol:[[L+w/2,Y-120],[L+w/2,Y-70]]};},
 wkSwing(r,d){const R=(a,b)=>a+(b-a)*r();
  const Y=rd(R(460,500)),ox=rd(R(640,960)),px=ox-rd(R(30,50)),py=Y-rd(R(220,250)),ln=Y-12-py;
  return {name:"振り子",hint:"真上からは描けない。くぎに線を留めて、振り子で起こそう。",mode:"wake",
    ground:[rect(-60,W+60,Y)],car:[-400,300],goal:[ox,Y],oji:[ox,Y],
    pins:[[px,py]],noDraw:[[px+22,0,W-px-22,Y-60]],sol:[[px+4,py],[px-ln,py-4]]};},
 wkTopple(r,d){const R=(a,b)=>a+(b-a)*r();
  const Y=rd(R(460,500)),wx=rd(R(480,760)),wh=rd(R(140,180)),ox=wx+rd(R(110,150));
  return {name:"壁の向こう",hint:"壁の向こうで寝ている。壁の上のくぎから線を立てて、倒そう。",mode:"wake",
    ground:[rect(-60,W+60,Y),rect(wx-15,wx+15,Y-wh,Y)],car:[-400,300],goal:[ox,Y],oji:[ox,Y],
    pins:[[wx+32,Y-wh-12]],noDraw:[[wx+64,0,W-wx-64,600]],sol:[[wx+32,Y-wh-8],[wx+44,Y-wh-80],[wx+46,Y-wh-262]]};},
 /* ---------- おっさんを飛ばせ（L.mode="launch"。線が長いほど遠くへ） ---------- */
 lnWater(r,d){return launchTpl(r,d,"water");},
 lnTower(r,d){return launchTpl(r,d,"tower");},
 lnWall(r,d){return launchTpl(r,d,"wall");},
 gapstep(r,d){const R=(a,b)=>a+(b-a)*r();
  const Y=rd(R(440,480)),L=rd(R(340,400)),g=rd(lerp(240,320,d)),X=L+g,sx=X+rd(R(200,260)),sh=rd(lerp(40,60,d));
  return {name:"谷と段",hint:"谷をわたった先に段差。一本で両方なんとかしよう。",
    ground:[cliffL(L,Y),rect(X,W+60,Y),rect(sx,sx+100,Y-sh)],car:[Math.max(90,L-240),Y],goal:[Math.min(sx+240,1180),Y],
    sol:[[L-20,Y-20],[X+40,Y-20],[sx-10,Y-sh-7],[sx+30,Y-sh-11]]};},
};
// 発想（遊んだ時に何を考えるか）: 同じ発想が続かないように並べる
const IDEA={bridge:"span",long:"span",needle:"span",pit:"span",tunnel:"span",slope:"ramp",high:"ramp",stairs:"ramp",gapstep:"ramp",
  tent:"shape",valley:"shape",wall:"wedge",walls2:"wedge",drawbridge:"rotate",revbridge:"rotate",drop:"drop",rockfall:"roof",
  skycar:"slide",jumppad:"catch",boulder:"fence",mill:"jam",
  swShelf:"switch",swCup:"switch",swPillar:"switch",swTwo:"switch",gdRain:"guard",gdCannon:"guard",gdMeteor:"guard",
  wkOpen:"wake",wkPit:"wake",wkSwing:"wake",wkTopple:"wake",lnWater:"launch",lnTower:"launch",lnWall:"launch"};
const ORDER=Object.keys(IDEA);
// 世界ごとに新しく出る物（1 面目で教える）
const WORLD_NEW=[null,["drop"],["skycar","rev"],["jumppad"],["rockfall"],["boulder"],["revbridge"],["cars"],["cargo","size"],[]];
function mirror(o){ // 左右反転（車が右から左へ走る）
  const fx=x=>W-x;o.ground=o.ground.map(poly=>poly.map(([x,y])=>[fx(x),y]).reverse());
  o.car=[fx(o.car[0]),o.car[1]];o.goal=[fx(o.goal[0]),o.goal[1]];
  if(o.pins)o.pins=o.pins.map(([x,y])=>[fx(x),y]);
  if(o.noDraw)o.noDraw=o.noDraw.map(([x,y,w,h])=>[W-x-w,y,w,h]);
  if(o.rocks)o.rocks=[fx(o.rocks[1]),fx(o.rocks[0]),o.rocks[2]];
  if(o.pads)o.pads=o.pads.map(([a,b,y])=>[fx(b),fx(a),y]);
  if(o.boulder)o.boulder=[fx(o.boulder[0]),o.boulder[1],o.boulder[2]];
  if(o.mill)o.mill=[fx(o.mill[0]),o.mill[1],o.mill[2],-o.mill[3]];
  if(o.btns)o.btns=o.btns.map(([x,y,w])=>[fx(x),y,w]);
  if(o.gate)o.gate=[fx(o.gate[0]),o.gate[1],o.gate[2]];
  if(o.bridge)o.bridge=[fx(o.bridge[1]),fx(o.bridge[0]),o.bridge[2]];
  if(o.cannon)o.cannon=[fx(o.cannon[0]),o.cannon[1],-o.cannon[2],...o.cannon.slice(3)];
  if(o.oji)o.oji=[fx(o.oji[0]),o.oji[1]];
  if(o.saw){o.saw=[fx(o.saw[0]),o.saw[1],o.saw[2]];o.sawDir=-1;}
  if(o.bed)o.bed=[fx(o.bed[1]),fx(o.bed[0]),o.bed[2]];
  o.sol=o.sol.map(([x,y])=>[fx(x),y]);o.dir=-1;o.name+="（ぎゃく）";return o;
}
function gimmick(o,g,intro){
  if(g==="cars"){o.cars=2;o.name+="（2台）";o.hint=(intro?"あたらしい！ ":"")+"車が2台。2台とも旗まで。";}
  if(g==="cargo"){o.cargo=true;o.name+="（荷物）";o.hint=(intro?"あたらしい！ ":"")+"屋根の荷物を落とさないで！ "+o.hint;}
  if(g==="size"){o.size=1.55;o.name+="（でっかい車）";o.hint=(intro?"あたらしい！ ":"")+"でっかい車！ "+o.hint;o.car=[o.dir===-1?Math.min(o.car[0],W-160):Math.max(o.car[0],160),o.car[1]];}
  return o;
}
// 難しさ: 世界が進むほど上がり、世界の中でも少し上がる。4・8 面目はひと休み、1 面目（教える面）は易しく
function diff(idx){const w=Math.floor(idx/10),s=idx%10;let d=Math.min(1,w/9*.8+s/10*.25);if(s===4||s===8)d*=.4;if(s===0)d*=.3;return d;}
// e = {t:型, s:種, m:反転, g:仕掛け, n:教える面か}
function build(e,idx){const d=diff(idx);const o=TPL[e.t](rng(e.s*7919+idx*31),d);
  o.sol=o.sol.map(p=>[Math.round(p[0]),Math.round(p[1])]);o.tpl=e.t;o.idea=IDEA[e.t];
  if(e.n&&!e.g)o.hint="あたらしい！ "+o.hint;
  if(e.m)mirror(o);
  if(e.m&&e.n&&!e.g)o.hint="あたらしい！ 車が右から左へ走る。"+o.hint.replace("あたらしい！ ","");
  if(e.g)gimmick(o,e.g,e.n);
  return o;}
function genLevel(idx){const e=window.GEN_TABLE[idx];if(!e||e.t==="hand")return null;return build(e,idx);}
window.GEN={TPL,ORDER,IDEA,WORLD_NEW,rng,diff,build,genLevel,mirror};
window.GEN_TABLE=window.GEN_TABLE||[];
})();
