/* 面の部品とクリアの条件（2026-09-28 作り直し）
   L.goals: クリアの条件の並び（全部そろったらクリア）
     "flag"  車が全部旗まで      "guard" L.guard 秒守る（車は止まったまま）
     "wake"  おっさんを全員起こす  "bed"  シーソーで飛ばしたおっさんを布団へ
     "ball"  ボールをカゴへ        "btn"  goal 印のボタンを全部押す
   L.objs: 部品の並び {k:種類, ...}。id を持つ部品は、ボタンの act で動き出す（門が開く・橋が出る・足場が動く・扇風機が回る・目覚ましが鳴る）
     btn gate bridge plat spin conv spring fan grav warp pool balloon domino ball box basket oji saw cannon guy bees lever
     lever {x,y,len,dens,a0}: 真ん中をくぎで留めた板（てこ・シーソー）。btn の side:"d" は天井のボタン（下から押す）。oji の pass:1 は線が通りぬける（当たれば起きる）。btn の by:"thing" は線と車以外だけ、by:"car" は車だけ。saw の free:1 は布団なし。warp の only:"car"/"ball" は車だけ／ボールだけ通す、stop:1 は出口で止まってまっすぐ落ちる
   古い形（L.mode と L.btns/gate/bridge/oji/saw/bed/cannon）は normalize で部品に直す */
const MODE=(()=>{
  const M={};let FZ=[],P=[],G=[],byId={},flagDone=false,doneT=0,flashT=0,warpCD=new Map(),talkQ=[];
  const dt=()=>DT/1000;
  // ---------- 古い書き方を部品に直す ----------
  function normalize(L){
    if(L._norm)return;L._norm=true;
    const objs=L.objs?[...L.objs]:[];let goals=L.goals?[...L.goals]:null;
    if(L.mode==="switch"){const ids=[];
      if(L.gate){objs.push({k:"gate",id:"g0",x:L.gate[0],top:L.gate[1],bot:L.gate[2]});ids.push("g0");}
      if(L.bridge){objs.push({k:"bridge",id:"b0",x0:L.bridge[0],x1:L.bridge[1],y:L.bridge[2]});ids.push("b0");}
      for(const [x,y,w] of (L.btns||[]))objs.push({k:"btn",x,y,w,by:"line",act:ids,all:true});
      goals=goals||["flag"];}
    if(L.mode==="guard"){if(L.cannon)objs.push({k:"cannon",x:L.cannon[0],y:L.cannon[1],vx:L.cannon[2],vy:L.cannon[3],iv:L.cannon[4],delay:L.cannon[5]});goals=goals||["guard"];}
    if(L.mode==="wake"){objs.push({k:"oji",x:L.oji[0],y:L.oji[1]});goals=goals||["wake"];L.car=null;}
    if(L.mode==="launch"){objs.push({k:"saw",x:L.saw[0],y:L.saw[1],len:L.saw[2],dir:L.sawDir||1,bed:L.bed});goals=goals||["bed"];L.car=null;}
    L.objs=objs;L.goals=goals||["flag"];
  }
  M.prep=L=>{normalize(L);if(!L.car){L.car=[-400,300];L.nocar=true;}
    if(!L.goal){const t=L.objs.find(o=>o.k==="oji"||o.k==="guy"||o.k==="basket");L.goal=t?[t.x!==undefined?t.x:(t.x0+t.x1)/2,t.y]:[W/2,400];}};
  M.noCar=()=>!!(L&&L.nocar);
  M.has=g=>L&&L.goals&&L.goals.includes(g);
  M.flag=()=>M.has("flag");
  M.driveOff=()=>!M.has("flag")||P.some(o=>o.k==="plat"&&o.ride&&o.go&&o.ph<1)
    ||L.goals.length>1&&cars.every(c=>!c.waiting&&(c.chassis.position.x-L.goal[0])*DIR>0); // 旗に着いたら止まって、ほかの条件を待つ // エレベーターで運ばれている間は待つ
  M.flagDone=v=>{flagDone=v;};
  // ---------- 作る ----------
  const ST=(b)=>{Composite.add(world,b);return b;};
  M.load=()=>{P=[];FZ=[];byId={};flagDone=false;doneT=0;flashT=0;warpCD=new Map();
    if(L.nocar)for(const c of cars)for(const b of [c.chassis,c.wA,c.wB])Body.setStatic(b,true);
    for(const o0 of L.objs){const o={...o0,on:o0.on!==undefined?o0.on:!o0.id||o0.k==="oji"||o0.k==="fan"&&o0.on!==false,t:0};
      if(o.k==="fan"||o.k==="plat"||o.k==="spin")o.on=o0.on!==undefined?o0.on:!o0.id;
      MAKE[o.k]&&MAKE[o.k](o);P.push(o);
      if(!o.live)for(const b of [o.body,o.box,o.ball,...(o.bodies||[])])if(b&&!b.isStatic&&(o.k==="ball"||o.k==="box"||o.k==="domino"||o.k==="balloon"||o.k==="lever")){Body.setStatic(b,true);FZ.push(b);}if(o.id)(byId[o.id]=byId[o.id]||[]).push(o);}
  };
  const MAKE={
    btn(o){o.w=o.w||64;o.down=false;},
    gate(o){o.body=ST(Bodies.rectangle(o.x,(o.top+o.bot)/2,30,o.bot-o.top,{isStatic:true,friction:.5}));o.y0=o.body.position.y;},
    bridge(o){o.k2=0;o.body=null;},
    plat(o){o.w=o.w||140;o.h=o.h||18;o.a=[o.x,o.y];o.b=o.to;o.T=o.T||3;o.ph=0;
      o.body=ST(Bodies.rectangle(o.x,o.y+o.h/2,o.w,o.h,{isStatic:true,friction:1,frictionStatic:4}));},
    spin(o){o.len=o.len||200;o.av=o.av||1.2;
      const parts=[Bodies.rectangle(o.x,o.y,o.len,16)];if(o.cross)parts.push(Bodies.rectangle(o.x,o.y,16,o.len));
      o.body=ST(Body.create({parts,isStatic:true,friction:.6}));Body.setAngle(o.body,o.a0||0);},
    conv(o){o.body=ST(Bodies.rectangle((o.x0+o.x1)/2,o.y+10,o.x1-o.x0,20,{isStatic:true,friction:1,frictionStatic:3}));},
    spring(o){o.w=o.w||70;o.v=o.v||17;o.vx=o.vx||0;o.sq=0;o.body=ST(Bodies.rectangle(o.x,o.y-7,o.w,14,{isStatic:true,friction:.8}));o.body.plugin.spring=o;},
    fan(o){},grav(o){},warp(o){o.r=o.r||36;},pool(o){},
    balloon(o){o.r=o.r||28;o.lift=o.lift||1.7;
      o.box=Bodies.rectangle(o.x,o.y+(o.rope||90),o.bw||40,o.bh||40,{density:.004,friction:.8});
      o.ball=Bodies.circle(o.x,o.y,o.r,{density:.0008,frictionAir:.04,restitution:.2});o.ball.plugin.balloon=o;
      o.rope=Constraint.create({bodyA:o.ball,bodyB:o.box,pointB:{x:0,y:-(o.bh||40)/2},length:o.rope||90,stiffness:.9});
      Composite.add(world,[o.box,o.ball,o.rope]);o.popped=false;},
    domino(o){o.bodies=[];const w=o.w||14,h=o.h||80;for(let i=0;i<(o.n||5);i++)o.bodies.push(ST(Bodies.rectangle(o.x+i*(o.gap||50)*(o.dir||1),o.y-h/2,w,h,{density:.002,friction:.5})));},
    ball(o){o.r=o.r||18;o.body=ST(Bodies.circle(o.x,o.y,o.r,{density:o.dens||.002,friction:.05,frictionStatic:.1,restitution:.3}));o.body.plugin.ballId=o.id||"ball";},
    lever(o){o.len=o.len||300;o.body=Bodies.rectangle(o.x,o.y,o.len,14,{density:o.dens||.003,friction:.8,frictionStatic:2});Body.setAngle(o.body,o.a0||0); // てこ: 真ん中をくぎで留めた板
      o.pin=Constraint.create({pointA:{x:o.x,y:o.y},bodyB:o.body,pointB:{x:0,y:0},length:0,stiffness:1});Composite.add(world,[o.body,o.pin]);},
    box(o){o.body=ST(Bodies.rectangle(o.x,o.y,o.w||50,o.h||50,{density:o.dens||.002,friction:.7}));},
    basket(o){const {x0,x1,y}=o;o.bodies=[ST(Bodies.rectangle((x0+x1)/2,y+6,x1-x0,12,{isStatic:true})),ST(Bodies.rectangle(x0,y-30,12,72,{isStatic:true})),ST(Bodies.rectangle(x1,y-30,12,72,{isStatic:true}))];o.done=0;},
    hit(o){o.w=o.w||(o.flip?120:160);if(o.flip)o.body=ST(Bodies.rectangle(o.x,o.y+15,o.w,30,{isStatic:true,friction:.8}));else{const a=o.w/2,t=a-36; // 床の台は両脇を坂にして車が乗りこえられるように
        o.body=ST(Bodies.fromVertices(o.x,o.y-12,[[{x:-a,y:0},{x:a,y:0},{x:t,y:-30},{x:-t,y:-30}]],{isStatic:true,friction:.8}));Body.setPosition(o.body,{x:o.x,y:o.y-(o.body.bounds.max.y-o.body.bounds.min.y)/2});}o.body.plugin.hit=o;o.down=false;o.dt=0;}, // 当てるスイッチ台（物をぶつけると押せる）
    oji(o){o.body=ST(Bodies.rectangle(o.x,o.y+(o.flip?15:-15),120,30,{isStatic:true,friction:.8,isSensor:!!o.pass}));o.body.plugin.oji=o;o.woke=0;o.on=true;},
    saw(o){const sd=o.dir||1;o.body=ST(Bodies.rectangle(o.x,o.y,o.len,14,{isStatic:true,friction:1,frictionStatic:3,collisionFilter:{category:0x0004}}));o.body.plugin.saw=o;
      const fx=o.x-sd*(o.len/2-26);
      o.rider=Body.create({parts:[Bodies.rectangle(fx,o.y-24,30,34),Bodies.circle(fx,o.y-52,14)],density:.0012,friction:1,frictionStatic:4,restitution:.05});
      o.rider.plugin.rider=o;Composite.add(world,o.rider);Body.setStatic(o.rider,true);o.fired=0;o.a=0;o.landT=0;o.still=0;
      const [x0,x1,y]=o.bed,wall=x=>Bodies.rectangle(x,y-22,14,44,{isStatic:true});
      o.bedB=[ST(Bodies.rectangle((x0+x1)/2,y+6,x1-x0,12,{isStatic:true,friction:1})),ST(wall(x0)),ST(wall(x1))];},
    cannon(o){o.cd=o.delay||.6;},
    guy(o){o.body=ST(Bodies.rectangle(o.x,o.y-40,40,80,{isStatic:true}));o.body.plugin.guy=o;},
    bees(o){o.cd=o.delay||.4;o.left=o.n||8;o.list=[];},
  };
  M.go=()=>{for(const b of FZ)Body.setStatic(b,false);FZ=[];}; // 線を離したら動き出す
  // ---------- 動かす ----------
  function activate(id){if(id[0]==="!"){for(const o of (byId[id.slice(1)]||[])){o.on=false;if(o.k==="cannon")for(const b of rocks)if(b.plugin.shell)b.plugin.dead=true;} // 大砲が止まったら出ている弾も消える
    tone(200,.3,"square",.05,80);return;} // "!id" は止める
    for(const o of (byId[id]||[])){if(o.on&&o.k!=="oji")continue;
    if(o.k==="oji"){if(!o.woke){o.woke=.001;o.alarm=1;tone(1400,.08,"square",.08);tone(1400,.08,"square",.08,0,.12);tone(1400,.08,"square",.08,0,.24);}continue;}
    o.on=true;o.t=0;tone(300,.4,"sawtooth",.05,600);}}
  const dyn=()=>Composite.allBodies(world).filter(b=>!b.isStatic);
  const carOf=b=>cars.find(c=>!c.waiting&&(b===c.chassis||b===c.wA||b===c.wB));
  function moveCar(c,dx,dy){for(const b of [c.chassis,c.wA,c.wB])Body.setPosition(b,{x:b.position.x+dx,y:b.position.y+dy});}
  function touching(o,bd,by){ // ボタンの上に何か乗っているか
    for(const b of dyn()){if(by==="line"&&!strokes.some(s=>s.body===b))continue;if(by==="thing"&&(strokes.some(s=>s.body===b)||carOf(b)))continue;if(by==="car"&&!carOf(b))continue;if(b.plugin&&(b.plugin.balloon))continue;
      const parts=b.parts.length>1?b.parts.slice(1):[b];if(Query.region(parts,bd).length)return true;}return false;}
  const KICK=[];
  M.step=()=>{const d=dt();for(const [bs,o] of KICK)for(const b2 of bs)Body.setVelocity(b2,{x:b2.velocity.x+o.vx,y:-o.v});KICK.length=0;if(flashT>0)flashT-=d;
    const running=state==="go";
    for(const o of P){o.t+=d;
      if(o.k==="btn"&&!o.down&&running){const bd=o.side==="l"?{min:{x:o.x-20,y:o.y-o.w/2},max:{x:o.x+2,y:o.y+o.w/2}}:o.side==="d"?{min:{x:o.x-o.w/2,y:o.y-2},max:{x:o.x+o.w/2,y:o.y+20}}:{min:{x:o.x-o.w/2,y:o.y-20},max:{x:o.x+o.w/2,y:o.y+2}}; // side:"l" は壁の左面のボタン
        if(touching(o,bd,o.by)){o.down=true;tone(660,.1,"square",.08);tone(990,.15,"square",.08,0,.1);
          const grp=P.filter(q=>q.k==="btn"&&q.all&&q.act+""===o.act+"");
          if(!o.all||grp.every(q=>q.down))(o.act||[]).forEach(activate);}}
      if(o.k==="gate"&&o.on){const lift=Math.min(1,o.t/.6)*(o.bot-o.top+20);Body.setPosition(o.body,{x:o.x,y:o.y0-lift});}
      if(o.k==="bridge"&&o.on&&o.k2<1){o.k2=Math.min(1,o.t/.5);const len=o.x1-o.x0,cx=o.x0+len/2,sd=o.from==="r"?-1:1;
        if(!o.body){o.body=ST(Bodies.rectangle(cx,o.y+10,len,20,{isStatic:true,friction:.9,frictionStatic:2}));}
        Body.setPosition(o.body,{x:cx-(1-o.k2)*len*sd,y:o.y+10});}
      if(o.k==="plat"&&o.on&&running&&o.ride&&!o.go){const b=o.body.bounds; // 車が乗ったら動き出す
        if(cars.some(c=>!c.waiting&&c.chassis.position.x>b.min.x+20&&c.chassis.position.x<b.max.x-20&&Math.abs(c.chassis.position.y-b.min.y)<70))o.go=1;}
      if(o.k==="plat"&&o.on&&running&&(!o.ride||o.go)){o.ph+=d/o.T;let u=o.once?Math.min(1,o.ph):(1-Math.cos(o.ph*Math.PI))/2;if(o.once)u=(1-Math.cos(u*Math.PI))/2;
        const x=o.a[0]+(o.b[0]-o.a[0])*u,y=o.a[1]+(o.b[1]-o.a[1])*u+o.h/2,pv={...o.body.position};
        Body.setPosition(o.body,{x,y});Body.setVelocity(o.body,{x:x-pv.x,y:y-pv.y});
        for(const b of dyn()){if(b.bounds.max.y>o.body.bounds.min.y-6&&b.bounds.max.y<o.body.bounds.min.y+10&&b.position.x>o.body.bounds.min.x-10&&b.position.x<o.body.bounds.max.x+10){
          const c=carOf(b);if(c){if(b===c.chassis)moveCar(c,x-pv.x,y-pv.y);}else if(!b.parent.plugin.rider||!b.isStatic)Body.setPosition(b,{x:b.position.x+x-pv.x,y:b.position.y+Math.min(0,y-pv.y)});}}}
      if(o.k==="spin"&&o.on&&running){const a=o.body.angle+o.av*d;Body.setAngle(o.body,a);Body.setAngularVelocity(o.body,o.av*d);}
      if(o.k==="conv"&&running){const top=o.y;for(const b of dyn()){if(b.bounds.max.y>top-6&&b.bounds.max.y<top+8&&b.position.x>o.x0&&b.position.x<o.x1){
          const c=carOf(b);const vx=b.velocity.x+(o.v-b.velocity.x)*(c?.05:.2);Body.setVelocity(b,{x:vx,y:b.velocity.y});}}}
      if(o.k==="spring")o.sq=Math.max(0,o.sq-d*4);
      if((o.k==="fan"||o.k==="grav")&&(o.on||o.k==="grav")&&(running||o.k==="grav")){
        const gx=o.k==="grav"?o.gx-0:o.fx||0,gy=o.k==="grav"?o.gy-(engine.gravity.y):o.fy||0;
        for(const b of dyn()){const p=b.position;if(p.x>o.x&&p.x<o.x+o.w&&p.y>o.y&&p.y<o.y+o.h){
          if(b.plugin&&b.plugin.balloon)continue;Body.applyForce(b,p,{x:gx*b.mass*.001,y:gy*b.mass*.001});}}}
      if(o.k==="warp"&&running){for(const b of dyn()){const cd=warpCD.get(b.id);if(cd&&cd.o===o&&time<cd.t)continue;/* 同じワープにすぐ戻らない（別のワープには入れる） */if(o.only==="car"&&!carOf(b))continue;if(o.only==="ball"&&!b.plugin.ballId)continue;
        const p=b.position;for(const [A,B] of [[o.a,o.b],[o.b,o.a]]){if(Math.hypot(p.x-A[0],p.y-A[1])<o.r){
          const c=carOf(b);const dx=B[0]-A[0],dy=B[1]-A[1];
          if(c){if(b!==c.chassis)break;moveCar(c,dx,dy);for(const q of [c.chassis,c.wA,c.wB])warpCD.set(q.id,{t:time+.8,o});}
          else{Body.setPosition(b,{x:p.x+dx,y:p.y+dy});if(o.stop)Body.setVelocity(b,{x:0,y:0});warpCD.set(b.id,{t:time+.8,o});}
          tone(900,.15,"sine",.08,300);break;}}}}
      if(o.k==="pool"){for(const b of dyn()){const bb=b.bounds;if(bb.max.x<o.x0||bb.min.x>o.x1||bb.max.y<o.y)continue;
          const h=Math.max(1,bb.max.y-bb.min.y),f=Math.max(0,Math.min(1,(bb.max.y-o.y)/h));
          Body.applyForce(b,b.position,{x:0,y:-f*(o.k2||1.9)*b.mass*.001*engine.gravity.y});
          Body.setVelocity(b,{x:b.velocity.x*(1-.03*f),y:b.velocity.y*(1-.06*f)});}}
      if(o.k==="balloon"&&!o.popped){const k=Math.max(.2,Math.min(1.8,1+(o.ball.position.y-o.y)/40)); // 元の高さでふわふわ止まる
        Body.applyForce(o.ball,o.ball.position,{x:0,y:-k*(o.ball.mass+o.box.mass)*.001*engine.gravity.y});}
      if(o.k==="cannon"&&running&&o.on){o.cd-=d;if(o.cd<=0){o.cd=o.iv||1;flashT=.15;
        const b=Bodies.circle(o.x,o.y,15,{density:.006,restitution:.2,friction:.3,frictionAir:0});b.plugin.rock=true;b.plugin.ball=true;b.plugin.shell=true;Composite.add(world,b);
        let vy=o.vy;if(vy===null||vy===undefined){const tgt=car.chassis.position,t=Math.max(8,Math.abs((tgt.x-o.x)/o.vx)),g=engine.gravity.y*.001*DT*DT;vy=(tgt.y-10-o.y-.5*g*t*t)/t;}
        Body.setVelocity(b,{x:o.vx,y:vy});rocks.push(b);tone(120,.2,"square",.12,50);}}
      if(o.k==="oji"&&o.woke)o.woke+=d;
      if(o.k==="bees"&&running){o.cd-=d;if(o.cd<=0&&o.left>0&&o.on!==false){o.cd=o.iv||.45;o.left--;
          const b=Bodies.circle(o.x,o.y,9,{density:.001,frictionAir:.02,restitution:.6,friction:0});b.plugin.bee=o;b.plugin.born=time;Composite.add(world,b);o.list.push(b);tone(220,.3,"sawtooth",.02,260);}
        const tg=P.find(q=>q.k==="guy")||{x:car.chassis.position.x,y:car.chassis.position.y+40};
        for(const b of o.list){if(b.plugin.dead&&!b.plugin.gone){b.plugin.gone=1;Composite.remove(world,b);}if(!b.plugin.dead){const p=b.position,dx=tg.x-p.x,dy=tg.y-45-p.y,l=Math.hypot(dx,dy)||1,sp=o.sp||.9;
          // 重さを打ち消して、狙いに向かって飛ぶ（ときどきふらつく）
          Body.applyForce(b,p,{x:b.mass*.001*(dx/l*sp+Math.sin(time*7+b.id)*.6),y:b.mass*.001*(dy/l*sp-engine.gravity.y+Math.cos(time*6+b.id)*.6)});
          const v=b.velocity,vl=Math.hypot(v.x,v.y),mx=o.max||4.5;if(vl>mx)Body.setVelocity(b,{x:v.x/vl*mx,y:v.y/vl*mx});}}}
      if(o.k==="saw"){if(o.fired){o.a=Math.min(1,(time-o.fired)/.12)*.35*(o.dir||1);Body.setAngle(o.body,o.a);}
        if(running&&!o.rider.isStatic){const p=o.rider.position,[x0,x1,y]=o.bed;const inBed=p.x>x0&&p.x<x1&&p.y<y&&p.y>y-90;
          o.landT=inBed?o.landT+d:0;o.still=!inBed&&Math.hypot(o.rider.velocity.x,o.rider.velocity.y)<.25?o.still+d:0;
          if(p.y>WATER_Y+40||p.x<-80||p.x>W+80)return finish(false,"おっさんが飛んでいっちゃった…");
          if(o.still>.7&&!o.landed&&!o.free)return finish(false,"とどかなかった…"); // free: 布団なし（飛んだ先でボタン等を押す）
          if(o.landT>.35)o.landed=true;}}
      if(o.k==="basket"){const inB=P.filter(q=>q.k==="ball"&&q.body.position.x>o.x0&&q.body.position.x<o.x1&&q.body.position.y<o.y&&q.body.position.y>o.y-70).length>=(o.need||1);o.done=inB?o.done+d:0;}
      if(o.k==="ball"&&running&&o.body.position.y>WATER_Y+80&&!o.lost){o.lost=1;if(M.has("ball"))return finish(false,"ボールが落ちちゃった…");}
    }
    if(!running)return;
    // クリアの判定（全部そろったら）
    const ok={flag:()=>flagDone,guard:()=>goT>=L.guard,wake:()=>P.filter(o=>o.k==="oji").every(o=>o.woke>.5),
      bed:()=>P.filter(o=>o.k==="saw").every(o=>o.landed),ball:()=>P.filter(o=>o.k==="basket").every(o=>o.done>.3),
      btn:()=>P.filter(o=>o.k==="btn"&&o.goal).every(o=>o.down)};
    if(L.goals.every(g=>ok[g]&&ok[g]())){doneT+=d;if(doneT>.15)finish(true);}else doneT=0;
    if(goT>(L.limit||(M.has("guard")?L.guard+3:M.has("flag")?24:14))&&state==="go")finish(false,M.has("wake")?"起きなかった… ぐっすり":"時間切れ…");
  };
  function fire(o,stroke){if(o.fired)return;o.fired=time;const pts=stroke.plugin.pts;let len=0;for(let i=1;i<pts.length;i++)len+=Math.hypot(pts[i].x-pts[i-1].x,pts[i].y-pts[i-1].y);
    const v=(o.k2||.72)*Math.sqrt(len*(TH.gravity||1)),an=(o.ang||55)*Math.PI/180,r=o.rider,sd=o.dir||1;
    for(const q of r.parts)q.collisionFilter.mask=~(0x0004|0x0002);r.collisionFilter.mask=~(0x0004|0x0002);r.frictionAir=0;
    Body.setStatic(r,false);Body.setVelocity(r,{x:sd*v*Math.cos(an),y:-v*Math.sin(an)});Body.setAngularVelocity(r,sd*.12);tone(180,.25,"square",.12,700);}
  // 当たった時（a と b は部品。どちらも親をたどる）
  M.onHit=(a,b)=>{const A=a.parent,B=b.parent;if(state!=="go")return;
    for(const [x,y] of [[A,B],[B,A]]){
      if(y.plugin.oji&&!x.isStatic&&!y.plugin.oji.woke&&!strokes.some(s=>s.body===x)){  // 線が当たっても起きない（物をぶつけて起こす）
        y.plugin.oji.woke=.001;tone(880,.15,"square",.1);tone(1320,.2,"square",.1,0,.12);}
      if(y.plugin.hit&&!x.isStatic&&!y.plugin.hit.down&&!strokes.some(s=>s.body===x)&&(y.plugin.hit.by==="car"?carOf(x):!carOf(x))){const o=y.plugin.hit;o.down=true;o.dt=time;
        tone(660,.1,"square",.08);tone(990,.15,"square",.08,0,.1);const grp=P.filter(q=>(q.k==="btn"||q.k==="hit")&&q.all&&q.act+""===o.act+"");
        if(!o.all||grp.every(q=>q.down))(o.act||[]).forEach(activate);}
      if(y.plugin.saw&&strokes.some(s=>s.body===x)&&(x.position.x-y.plugin.saw.x)*(y.plugin.saw.dir||1)>0)fire(y.plugin.saw,x);
      if(y.plugin.spring&&!x.isStatic){const o=y.plugin.spring;if(x.position.y<o.y-4){o.sq=1;const c=carOf(x)||carOf(a)||null;
        if(!KICK.some(k=>k[0][0]===(c?c.chassis:x)))KICK.push([c?[c.chassis,c.wA,c.wB]:[x],o]);tone(300,.15,"sine",.1,900);}}
      if(y.plugin.balloon&&!y.plugin.balloon.popped&&x!==y.plugin.balloon.box&&!x.isStatic){const o=y.plugin.balloon;o.popped=true;
        Composite.remove(world,[o.ball,o.rope]);tone(1200,.08,"square",.1,200);for(let k=0;k<10;k++)parts.push({x:o.ball.position.x,y:o.ball.position.y,vx:(Math.random()-.5)*8,vy:(Math.random()-.5)*8,t:.4,c:"#ff4a6a"});}}};
  M.busy=()=>dyn().some(b=>!carOf(b)&&Math.hypot(b.velocity.x,b.velocity.y)>.3)||P.some(o=>(o.k==="plat"&&o.on&&(!o.once||o.ph<1))||(o.k==="gate"&&o.on&&o.t<.8)||(o.k==="bridge"&&o.on&&o.k2<1));
  M.inGrav=b=>P.some(o=>o.k==="grav"&&b.position.x>o.x&&b.position.x<o.x+o.w&&b.position.y>o.y&&b.position.y<o.y+o.h);
  M.focus=()=>{const oj=P.find(o=>o.k==="oji");const sw=P.find(o=>o.k==="saw");
    if(L.nocar){if(sw&&!sw.rider.isStatic)return sw.rider.position;if(oj)return {x:oj.x,y:oj.y-20};const bl=P.find(o=>o.k==="ball");if(bl)return bl.body.position;return {x:W/2,y:300};}
    return car.chassis.position;};
  // ---------- 描画 ----------
  M.draw=()=>{
    for(const o of P)DRAW[o.k]&&DRAW[o.k](o);
    if(M.has("guard")&&(state==="draw"||state==="go")){const left=Math.max(0,L.guard-(state==="go"?goT:0));
      ctx.font="bold 40px sans-serif";ctx.textAlign="center";ctx.lineWidth=8;ctx.strokeStyle="#fff";ctx.fillStyle=left<1.5?"#ff3b3b":"#222";
      const s=`あと ${left.toFixed(1)} びょう まもれ！`;ctx.strokeText(s,W/2,60);ctx.fillText(s,W/2,60);ctx.textAlign="left";}
    if(L.goals.length>1&&state==="draw"){ // 条件が 2 つ以上の時は、左上に並べて見せる
      const JP={flag:"🏁 旗まで",guard:"🛡 守れ",wake:"⏰ 起こせ",bed:"🛏 布団へ",ball:"⚽ カゴへ",btn:"🔴 ボタン"};
      ctx.font="bold 22px sans-serif";let y=100;for(const g of L.goals){const s=JP[g];const w=ctx.measureText(s).width+20;
        ctx.fillStyle="#fffffff0";rr(18,y-24,w,32,10);ctx.fill();ctx.fillStyle="#222";ctx.fillText(s,28,y);y+=38;}}
  };
  const arrow=(x,y,dx,dy,c)=>{const a=Math.atan2(dy,dx);ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(14,0);ctx.lineTo(-8,-9);ctx.lineTo(-8,9);ctx.fill();ctx.restore();};
  const DRAW={
    btn(o){if(o.side==="l"){ctx.save();ctx.translate(o.x,o.y);ctx.rotate(-Math.PI/2);ctx.translate(-o.x,-o.y);DRAW.btn({...o,side:0});ctx.restore();return;}
      if(o.side==="d"){ctx.save();ctx.translate(o.x,o.y);ctx.rotate(Math.PI);ctx.translate(-o.x,-o.y);DRAW.btn({...o,side:0});ctx.restore();return;} // 天井のボタン（下から押す）
      const h=o.down?5:14;ctx.fillStyle="#555";rr(o.x-o.w/2-6,o.y-8,o.w+12,8,3);ctx.fill();
      ctx.fillStyle=o.down?"#3ac060":o.goal?"#ff9a1a":"#ff3b3b";ctx.beginPath();ctx.ellipse(o.x,o.y-8,o.w/2-4,h,0,Math.PI,0);ctx.fill();ctx.strokeStyle="#0006";ctx.lineWidth=2;ctx.stroke();
      if(!o.down&&state==="draw"){const bob=Math.sin(time*5)*5;ctx.fillStyle="#ff3b3b";ctx.font="bold 20px sans-serif";ctx.textAlign="center";
        ctx.strokeStyle="#fff";ctx.lineWidth=5;ctx.strokeText("おして ▼",o.x,o.y-34+bob);ctx.fillText("おして ▼",o.x,o.y-34+bob);ctx.textAlign="left";}},
    hit(o){const {x,y}=o,w=o.w;ctx.save();if(o.flip){ctx.translate(0,2*y);ctx.scale(1,-1);}
      const r=o.flip?0:36;ctx.fillStyle="#6b7280";ctx.beginPath();ctx.moveTo(x-w/2,y);ctx.lineTo(x+w/2,y);ctx.lineTo(x+w/2-r,y-30);ctx.lineTo(x-w/2+r,y-30);ctx.fill();ctx.fillStyle="#9aa3af";rr(x-w/2+38,y-30,w-76,6,3);ctx.fill();
      ctx.fillStyle="#ffd23f";for(let i=0;i<Math.floor((w-40)/24);i++){ctx.beginPath();ctx.moveTo(x-w/2+26+i*24,y-4);ctx.lineTo(x-w/2+36+i*24,y-18);ctx.lineTo(x-w/2+42+i*24,y-18);ctx.lineTo(x-w/2+32+i*24,y-4);ctx.fill();}
      const h=o.down?4:16;ctx.fillStyle=o.down?"#3ac060":"#ff3b3b";ctx.beginPath();ctx.ellipse(x,y-30,Math.max(12,w/2-40),h,0,Math.PI,0);ctx.fill();ctx.strokeStyle="#0006";ctx.lineWidth=2;ctx.stroke();ctx.restore();
      if(!o.down&&state==="draw"){const bob=Math.sin(time*5)*5,ty=o.flip?y+62:y-58;ctx.fillStyle="#ff3b3b";ctx.font="bold 20px sans-serif";ctx.textAlign="center";
        const t=o.by==="car"?"車で当てて！":"ぶつけて！";ctx.strokeStyle="#fff";ctx.lineWidth=5;ctx.strokeText(t,x,ty+bob);ctx.fillText(t,x,ty+bob);ctx.textAlign="left";}},
    gate(o){const p=o.body.position,h=o.bot-o.top;ctx.save();ctx.translate(p.x,p.y);ctx.beginPath();ctx.rect(-15,-h/2,30,h);ctx.clip();
      for(let y=-h/2-30;y<h/2;y+=30){ctx.fillStyle=(Math.round(y/30)%2)?"#222":"#ffd23f";ctx.beginPath();ctx.moveTo(-15,y);ctx.lineTo(15,y+15);ctx.lineTo(15,y+45);ctx.lineTo(-15,y+30);ctx.fill();}
      ctx.restore();ctx.strokeStyle="#222";ctx.lineWidth=3;ctx.strokeRect(p.x-15,p.y-h/2,30,h);},
    bridge(o){if(o.body){const p=o.body.position,len=o.x1-o.x0;ctx.fillStyle="#8a6a4a";ctx.fillRect(p.x-len/2,p.y-10,len,20);
        ctx.strokeStyle="#4a3420";ctx.lineWidth=3;ctx.strokeRect(p.x-len/2,p.y-10,len,20);ctx.fillStyle="#ccc";for(let x=p.x-len/2+14;x<p.x+len/2;x+=40){ctx.beginPath();ctx.arc(x,p.y,3,0,7);ctx.fill();}}
      else{ctx.save();ctx.setLineDash([10,8]);ctx.strokeStyle="#ffffffaa";ctx.lineWidth=3;ctx.strokeRect(o.x0,o.y,o.x1-o.x0,20);ctx.restore();}},
    plat(o){const b=o.body.bounds;ctx.save();ctx.setLineDash([6,8]);ctx.strokeStyle="#ffffff88";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(o.a[0],o.a[1]+o.h/2);ctx.lineTo(o.b[0],o.b[1]+o.h/2);ctx.stroke();ctx.restore();
      ctx.fillStyle="#5a6a8a";ctx.fillRect(b.min.x,b.min.y,b.max.x-b.min.x,b.max.y-b.min.y);ctx.fillStyle="#ffd23f";
      for(let x=b.min.x+6;x<b.max.x-10;x+=24)ctx.fillRect(x,b.min.y+3,12,4);ctx.strokeStyle="#223";ctx.lineWidth=2;ctx.strokeRect(b.min.x,b.min.y,b.max.x-b.min.x,b.max.y-b.min.y);
      if(o.id&&!o.on){ctx.fillStyle="#ff3b3b";ctx.beginPath();ctx.arc(b.max.x-8,b.min.y-8,6,0,7);ctx.fill();}},
    spin(o){ctx.save();ctx.translate(o.body.position.x,o.body.position.y);ctx.rotate(o.body.angle);ctx.fillStyle="#b8404a";ctx.strokeStyle="#401015";ctx.lineWidth=3;
      for(const [w,h] of o.cross?[[o.len,16],[16,o.len]]:[[o.len,16]]){ctx.fillRect(-w/2,-h/2,w,h);ctx.strokeRect(-w/2,-h/2,w,h);}
      ctx.fillStyle="#ddd";ctx.beginPath();ctx.arc(0,0,9,0,7);ctx.fill();ctx.restore();},
    conv(o){const w=o.x1-o.x0;ctx.fillStyle="#333";rr(o.x0,o.y,w,20,10);ctx.fill();ctx.fillStyle="#777";
      const s=(time*o.v*60*.5)%24;for(let x=o.x0+((s%24)+24)%24;x<o.x1-6;x+=24)ctx.fillRect(x,o.y+3,10,4);
      for(const x of [o.x0+10,o.x1-10]){ctx.fillStyle="#999";ctx.beginPath();ctx.arc(x,o.y+10,8,0,7);ctx.fill();}
      arrow(o.x0+w/2,o.y-14,o.v,0,"#ffd23f");},
    spring(o){const h=16-o.sq*10;ctx.strokeStyle="#888";ctx.lineWidth=4;ctx.beginPath();for(let k=0;k<=6;k++){const x=o.x-o.w/2+8+k*(o.w-16)/6,y=o.y-(k%2?h:0);k?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();
      ctx.fillStyle="#3ac0ff";rr(o.x-o.w/2,o.y-h-8,o.w,8,3);ctx.fill();},
    fan(o){const dx=o.fx||0,dy=o.fy||0,base=dy<0?[o.x+o.w/2,o.y+o.h]:dy>0?[o.x+o.w/2,o.y]:dx>0?[o.x,o.y+o.h/2]:[o.x+o.w,o.y+o.h/2];
      if(o.on){ctx.strokeStyle="#ffffff90";ctx.lineWidth=2;for(let k=0;k<7;k++){const t=((time*1.2+k*.37)%1);
        const x=dx?(dx>0?o.x+t*o.w:o.x+o.w-t*o.w):o.x+(k+.5)*o.w/7,y=dy?(dy>0?o.y+t*o.h:o.y+o.h-t*o.h):o.y+(k+.5)*o.h/7;
        ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-Math.sign(dx)*24,y-Math.sign(dy)*24);ctx.stroke();}}
      ctx.save();ctx.translate(base[0],base[1]);ctx.rotate(Math.atan2(dy,dx)-Math.PI/2);ctx.fillStyle="#445";rr(-40,-6,80,18,6);ctx.fill();
      ctx.fillStyle=o.on?"#9ad8ff":"#889";const sp=o.on?time*20:0;for(let k=0;k<3;k++){ctx.beginPath();ctx.ellipse(Math.cos(sp+k*2.1)*22,-10,14,6,0,0,7);ctx.fill();}ctx.restore();},
    grav(o){ctx.fillStyle="#b070ff18";ctx.fillRect(o.x,o.y,o.w,o.h);ctx.strokeStyle="#b070ff80";ctx.setLineDash([8,6]);ctx.lineWidth=2;ctx.strokeRect(o.x,o.y,o.w,o.h);ctx.setLineDash([]);
      for(let i=0;i<3;i++)for(let j=0;j<2;j++){const t=(time*.8+i*.3)%1;arrow(o.x+(i+.5)*o.w/3+o.gx*t*20,o.y+(j+.5)*o.h/2+o.gy*t*20,o.gx,o.gy,"#b070ffa0");}},
    warp(o){for(const [x,y] of [o.a,o.b]){for(let k=0;k<3;k++){ctx.strokeStyle=`hsla(${(time*120+k*40)%360},90%,60%,.9)`;ctx.lineWidth=5;ctx.beginPath();ctx.arc(x,y,o.r-k*9,time*3+k,time*3+k+4.5);ctx.stroke();}}},
    pool(o){ctx.fillStyle="#3aa0ff70";ctx.fillRect(o.x0,o.y,o.x1-o.x0,(o.bot||WATER_Y)-o.y);ctx.strokeStyle="#ffffffaa";ctx.lineWidth=2;ctx.beginPath();
      for(let x=o.x0;x<=o.x1;x+=10){const y=o.y+Math.sin(x*.05+time*3)*3;x===o.x0?ctx.moveTo(x,y):ctx.lineTo(x,y);}ctx.stroke();},
    balloon(o){if(!o.popped){ctx.strokeStyle="#555";ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(o.ball.position.x,o.ball.position.y+o.r);ctx.lineTo(o.box.position.x,o.box.position.y-20);ctx.stroke();
        ctx.fillStyle="#ff4a6a";ctx.beginPath();ctx.ellipse(o.ball.position.x,o.ball.position.y,o.r*.9,o.r,0,0,7);ctx.fill();ctx.fillStyle="#ffffff70";ctx.beginPath();ctx.ellipse(o.ball.position.x-8,o.ball.position.y-10,6,9,-.4,0,7);ctx.fill();}
      const b=o.box;ctx.save();ctx.translate(b.position.x,b.position.y);ctx.rotate(b.angle);ctx.fillStyle="#c89050";ctx.fillRect(-(o.bw||40)/2,-(o.bh||40)/2,o.bw||40,o.bh||40);ctx.strokeStyle="#6a4420";ctx.lineWidth=3;ctx.strokeRect(-(o.bw||40)/2,-(o.bh||40)/2,o.bw||40,o.bh||40);ctx.restore();},
    lever(o){const b=o.body,p=b.position;ctx.fillStyle="#666";ctx.beginPath();ctx.moveTo(o.x,o.y);ctx.lineTo(o.x-22,o.y+60);ctx.lineTo(o.x+22,o.y+60);ctx.fill();
      ctx.save();ctx.translate(p.x,p.y);ctx.rotate(b.angle);ctx.fillStyle="#c08a4a";ctx.fillRect(-o.len/2,-7,o.len,14);ctx.strokeStyle="#4a3420";ctx.lineWidth=2;ctx.strokeRect(-o.len/2,-7,o.len,14);ctx.restore();
      ctx.fillStyle="#ddd";ctx.beginPath();ctx.arc(o.x,o.y,5,0,7);ctx.fill();},
    domino(o){for(const b of o.bodies){ctx.save();ctx.translate(b.position.x,b.position.y);ctx.rotate(b.angle);const w=o.w||14,h=o.h||80;ctx.fillStyle="#f4f0e0";ctx.fillRect(-w/2,-h/2,w,h);ctx.strokeStyle="#222";ctx.lineWidth=2;ctx.strokeRect(-w/2,-h/2,w,h);
      ctx.fillStyle="#222";ctx.beginPath();ctx.arc(0,-h/4,2.5,0,7);ctx.arc(0,h/4,2.5,0,7);ctx.fill();ctx.restore();}},
    ball(o){const b=o.body;ctx.save();ctx.translate(b.position.x,b.position.y);ctx.rotate(b.angle);ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(0,0,o.r,0,7);ctx.fill();ctx.strokeStyle="#222";ctx.lineWidth=2;ctx.stroke();
      ctx.fillStyle="#222";ctx.beginPath();ctx.arc(0,0,o.r*.35,0,7);ctx.fill();for(let k=0;k<5;k++){ctx.beginPath();ctx.arc(Math.cos(k*1.256)*o.r*.8,Math.sin(k*1.256)*o.r*.8,o.r*.18,0,7);ctx.fill();}ctx.restore();},
    box(o){const b=o.body;ctx.save();ctx.translate(b.position.x,b.position.y);ctx.rotate(b.angle);const w=o.w||50,h=o.h||50;ctx.fillStyle="#c89050";ctx.fillRect(-w/2,-h/2,w,h);ctx.strokeStyle="#6a4420";ctx.lineWidth=3;ctx.strokeRect(-w/2,-h/2,w,h);ctx.beginPath();ctx.moveTo(-w/2,-h/2);ctx.lineTo(w/2,h/2);ctx.stroke();ctx.restore();},
    basket(o){ctx.fillStyle="#d0a060";ctx.fillRect(o.x0-6,o.y-66,12,72);ctx.fillRect(o.x1-6,o.y-66,12,72);ctx.fillRect(o.x0,o.y,o.x1-o.x0,12);
      ctx.strokeStyle="#8a6030";ctx.lineWidth=2;for(let x=o.x0;x<o.x1;x+=14){ctx.beginPath();ctx.moveTo(x,o.y-60);ctx.lineTo(x+14,o.y);ctx.stroke();}
      if(state==="draw"){ctx.fillStyle="#ff3b3b";ctx.font="bold 20px sans-serif";ctx.textAlign="center";ctx.fillText("⚽ ここへ",(o.x0+o.x1)/2,o.y-78);ctx.textAlign="left";}},
    oji(o){const {x,y}=o;ctx.save();if(o.flip){ctx.translate(0,2*y);ctx.scale(1,-1);}ctx.fillStyle="#fff";rr(x+36,y-26,34,16,6);ctx.fill();
      ctx.fillStyle="#6a8ad0";rr(x-62,y-28,104,28,8);ctx.fill();ctx.strokeStyle="#223";ctx.lineWidth=2.5;ctx.stroke();
      ctx.fillStyle="#fff";for(let k=0;k<6;k++){ctx.beginPath();ctx.arc(x-52+k*17,y-14,3,0,7);ctx.fill();}
      if(o.id){ctx.fillStyle="#e8e8e8";ctx.beginPath();ctx.arc(x-80,y-16,14,0,7);ctx.fill();ctx.strokeStyle="#c00";ctx.lineWidth=3;ctx.stroke();ctx.strokeStyle="#222";ctx.beginPath();ctx.moveTo(x-80,y-16);ctx.lineTo(x-80,y-24);ctx.moveTo(x-80,y-16);ctx.lineTo(x-74,y-16);ctx.stroke();}
      const sy=o.flip?-1:1;
      if(o.woke){const j=Math.min(1,o.woke*6)*26;ojiHead(x+50,y-30-j,1,0);ctx.restore();talk(x+50,y-110*sy,o.alarm?"うるさっ！":"はっ！！");}
      else{ojiHead(x+52,y-26,.95,-.4,true);ctx.restore();ctx.fillStyle="#223";ctx.font="bold 22px sans-serif";
        for(let k=0;k<3;k++){const t=(time*.6+k*.33)%1;ctx.globalAlpha=1-t;ctx.fillText("Z",x+64+k*8+t*24,y-(56+t*50)*sy);}ctx.globalAlpha=1;
        if(state==="draw"&&!o.quiet)talk(x+(x<W-300?200:-200),y-110*sy,"ぐぅ…（起こして）");}},
    saw(o){const pl=o.body;ctx.fillStyle="#6a5a4a";ctx.beginPath();ctx.moveTo(o.x,o.y);ctx.lineTo(o.x-26,o.y+46);ctx.lineTo(o.x+26,o.y+46);ctx.fill();
      ctx.save();ctx.translate(pl.position.x,pl.position.y);ctx.rotate(pl.angle);ctx.fillStyle="#c8904a";ctx.fillRect(-o.len/2,-7,o.len,14);ctx.strokeStyle="#5a3a1a";ctx.lineWidth=3;ctx.strokeRect(-o.len/2,-7,o.len,14);ctx.restore();
      const [x0,x1,y]=o.bed;ctx.fillStyle="#6a8ad0";rr(x0+6,y-16,x1-x0-12,20,6);ctx.fill();ctx.fillStyle="#fff";rr(x1-44,y-26,34,14,6);ctx.fill();
      ctx.fillStyle="#8a6a4a";ctx.fillRect(x0-7,y-44,14,50);ctx.fillRect(x1-7,y-44,14,50);ctx.fillRect(x0,y,x1-x0,12);
      if(state==="draw"){ctx.fillStyle="#ff3b3b";ctx.font="bold 20px sans-serif";ctx.textAlign="center";ctx.fillText("ここに着地",(x0+x1)/2,y-58);ctx.textAlign="left";}
      const r=o.rider,p=r.position;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(r.angle);
      ctx.fillStyle="#fff";rr(-16,-16,32,24,6);ctx.fill();ctx.strokeStyle="#bbb";ctx.lineWidth=1.5;ctx.stroke();ctx.fillStyle="#e0d4b0";ctx.fillRect(-16,4,32,12);ctx.restore();
      if(r.parts[2])ojiHead(r.parts[2].position.x,r.parts[2].position.y,1,r.angle);
      const s=state==="win"?"ナイス着地！":state==="fail"?"うそやろ〜":state==="go"?(r.velocity.y<-2?"ぎゃあああ":"え？"):"…なにするの？";talk(p.x,p.y-90,s);},
    guy(o){const {x,y}=o,sh=state==="fail"?Math.sin(time*40)*3:0;ctx.strokeStyle="#4a3020";ctx.lineWidth=7;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(x-8+sh,y);ctx.lineTo(x-6,y-30);ctx.moveTo(x+8+sh,y);ctx.lineTo(x+6,y-30);ctx.stroke();
      ctx.fillStyle="#e8dcc0";rr(x-16,y-40,32,14,4);ctx.fill();ctx.fillStyle="#fff";ctx.beginPath();ctx.ellipse(x,y-56,18,20,0,0,7);ctx.fill();ctx.strokeStyle="#bbb";ctx.lineWidth=1.5;ctx.stroke();
      ctx.strokeStyle=SKIN;ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(x-14,y-62);ctx.lineTo(x-24,y-40+sh);ctx.moveTo(x+14,y-62);ctx.lineTo(x+24,y-40-sh);ctx.stroke();
      ojiHead(x,y-86,1,0);const s=state==="fail"?"いったぁぁ！":state==="win"?"たすかった〜":state==="go"?"ひぃぃ！":"ハチこわい…";talk(x,y-140,s);},
    bees(o){ctx.fillStyle="#b07a30";ctx.beginPath();ctx.ellipse(o.x,o.y,30,36,0,0,7);ctx.fill();ctx.strokeStyle="#7a5018";ctx.lineWidth=3;for(let k=-2;k<=2;k++){ctx.beginPath();ctx.ellipse(o.x,o.y+k*12,30-Math.abs(k)*5,4,0,0,Math.PI);ctx.stroke();}
      ctx.fillStyle="#3a2008";ctx.beginPath();ctx.arc(o.x,o.y+10,7,0,7);ctx.fill();
      for(const b of o.list){if(b.plugin.dead)continue;const p=b.position,f=Math.sin(time*60+b.id)*4;ctx.fillStyle="#ffffffc0";ctx.beginPath();ctx.ellipse(p.x-3,p.y-8,6,4+f*.3,-.5,0,7);ctx.ellipse(p.x+4,p.y-8,6,4-f*.3,.5,0,7);ctx.fill();
        ctx.fillStyle="#ffd23f";ctx.beginPath();ctx.ellipse(p.x,p.y,11,8,Math.atan2(b.velocity.y,b.velocity.x),0,7);ctx.fill();ctx.fillStyle="#222";ctx.fillRect(p.x-3,p.y-7,3,14);ctx.fillRect(p.x+3,p.y-7,3,14);}
      if(state==="draw"){ctx.fillStyle="#222";ctx.font="bold 18px sans-serif";ctx.textAlign="center";ctx.fillText("ブーン…",o.x,o.y-46);ctx.textAlign="left";}},
    cannon(o){const vy=o.vy==null?-1:o.vy,a=Math.atan2(vy,o.vx);ctx.save();ctx.translate(o.x,o.y);ctx.rotate(a);
      ctx.fillStyle="#2a2a30";rr(-40,-16,64,32,8);ctx.fill();ctx.fillStyle="#44444c";ctx.fillRect(18,-19,10,38);
      if(flashT>0){ctx.fillStyle="#ffd040";ctx.beginPath();ctx.arc(40,0,22,0,7);ctx.fill();}ctx.restore();
      ctx.fillStyle="#5a3a1a";ctx.beginPath();ctx.arc(o.x,o.y+12,16,0,7);ctx.fill();},
  };
  function talk(x,y,s){ctx.font="bold 22px sans-serif";const w=ctx.measureText(s).width+24;x=Math.max(w/2+6,Math.min(W-w/2-6,x));
    ctx.fillStyle="#fffffff0";ctx.strokeStyle="#333";ctx.lineWidth=2.5;rr(x-w/2,y-20,w,36,14);ctx.fill();ctx.stroke();
    ctx.fillStyle="#222";ctx.textAlign="center";ctx.fillText(s,x,y+6);ctx.textAlign="left";}
  M.talk=talk;
  return M;
})();
