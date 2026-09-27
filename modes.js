/* 旗まで走る以外のクリアのしかた（L.mode）
   switch: 線でボタンを押す → 遮断機が上がる（L.gate）／橋が出る（L.bridge）→ あとは車が旗へ
   guard : 車は止まったまま。岩の雨（L.rocks）や大砲（L.cannon）から L.guard 秒しのげばクリア
   wake  : 寝ているおっさん（L.oji）に線を当てて起こす（車は出ない）
   launch: シーソー（L.saw）の端のおっさんを、反対側に線を落として飛ばし、布団のカゴ（L.bed）へ（車は出ない） */
const MODE=(()=>{
  const M={};let btns=[],gate=null,bridge=null,opened=false,openT=0,oji=null,woke=0,saw=null,rider=null,bed=[],landT=0,cannonT=0,flashT=0,shots=0;
  const noCar=()=>L.mode==="wake"||L.mode==="launch";
  M.noCar=noCar;
  M.load=()=>{
    btns=[];gate=null;bridge=null;opened=false;openT=0;oji=null;woke=0;saw=null;rider=null;bed=[];landT=0;cannonT=0;flashT=0;shots=0;
    if(!L.mode)return;
    if(noCar())for(const c of cars)for(const b of [c.chassis,c.wA,c.wB])Body.setStatic(b,true);
    if(L.mode==="switch"){
      btns=(L.btns||[]).map(([x,y,w=64])=>({x,y,w,down:false}));
      if(L.gate){const [x,top,bot]=L.gate;gate=Bodies.rectangle(x,(top+bot)/2,30,bot-top,{isStatic:true,friction:.5});gate.plugin.y0=gate.position.y;Composite.add(world,gate);}
      if(L.bridge){const [x0,x1,y]=L.bridge;bridge={x0,x1,y,k:0,body:null};}
    }
    if(L.mode==="wake"){const [x,y]=L.oji;
      oji=Bodies.rectangle(x,y-15,120,30,{isStatic:true,friction:.8});oji.plugin.oji=true;Composite.add(world,oji);}
    if(L.mode==="launch"){const [px,py,len]=L.saw,sd=L.sawDir||1; // ばね仕掛けのシーソー: 板は動かない物。線が乗ったら跳ねる
      const plank=Bodies.rectangle(px,py,len,14,{isStatic:true,friction:1,frictionStatic:3,collisionFilter:{category:0x0004}});plank.plugin.saw=true;
      const fx=px-sd*(len/2-26);
      rider=Body.create({parts:[Bodies.rectangle(fx,py-24,30,34),Bodies.circle(fx,py-52,14)],density:.0012,friction:1,frictionStatic:4,restitution:.05});
      Composite.add(world,[plank,rider]);Body.setStatic(rider,true);
      saw={plank,px,py,len,sd,fired:0,a:0};
      for(const [x0,x1,y] of [L.bed]){const wall=(x)=>Bodies.rectangle(x,y-22,14,44,{isStatic:true});
        const floor=Bodies.rectangle((x0+x1)/2,y+6,x1-x0,12,{isStatic:true,friction:1});bed=[floor,wall(x0),wall(x1)];Composite.add(world,bed);}}
  };
  M.go=()=>{if(!L.mode)return;
    if(L.cannon)cannonT=L.cannon[5]||.6;};
  // 線がボタンに乗っているか
  function pressed(b){const bd={min:{x:b.x-b.w/2,y:b.y-20},max:{x:b.x+b.w/2,y:b.y+2}};
    for(const s of strokes)if(Query.region(s.body.parts.slice(1),bd).length)return true;return false;}
  M.step=()=>{if(!L.mode)return;const dt=DT/1000;
    if(flashT>0)flashT-=dt;
    if(L.mode==="switch"){
      for(const b of btns)if(!b.down&&pressed(b)){b.down=true;tone(660,.1,"square",.08);tone(990,.15,"square",.08,0,.1);}
      if(!opened&&btns.length&&btns.every(b=>b.down)){opened=true;openT=0;tone(300,.5,"sawtooth",.06,600);}
      if(opened){openT+=dt;
        if(gate){const lift=Math.min(1,openT/.6)*(L.gate[2]-L.gate[1]+20);Body.setPosition(gate,{x:gate.position.x,y:gate.plugin.y0-lift});}
        if(bridge&&bridge.k<1){bridge.k=Math.min(1,openT/.5);const len=bridge.x1-bridge.x0,cx=bridge.x0+len/2;
          if(!bridge.body){bridge.body=Bodies.rectangle(cx,bridge.y+10,len,20,{isStatic:true,friction:.9,frictionStatic:2});Composite.add(world,bridge.body);}
          Body.setPosition(bridge.body,{x:cx-(1-bridge.k)*len*(DIR),y:bridge.y+10});}}
    }
    if(L.mode==="guard"&&state==="go"){
      if(L.cannon){cannonT-=dt;if(cannonT<=0){const [x,y,vx,vy,iv]=L.cannon;cannonT=iv;shots++;flashT=.15;
        const b=Bodies.circle(x,y,15,{density:.006,restitution:.2,friction:.3,frictionAir:0});b.plugin.rock=true;b.plugin.ball=true;
        Composite.add(world,b);let v2=vy;
        if(vy===null){const tgt=car.chassis.position,t=Math.max(8,Math.abs((tgt.x-x)/vx)),g=engine.gravity.y*.001*DT*DT; // 車めがけて撃つ
          v2=(tgt.y-10-y-.5*g*t*t)/t;}
        Body.setVelocity(b,{x:vx,y:v2});rocks.push(b);tone(120,.2,"square",.12,50);}}
      if(goT>=L.guard)finish(true);
    }
    if(L.mode==="wake"&&state==="go"){
      if(woke){woke+=dt;if(woke>.7)finish(true);}
      else if(goT>7)finish(false,"起きなかった… ぐっすり");}
    if(saw&&saw.fired){saw.a=Math.min(1,(time-saw.fired)/.12)*.35*saw.sd;Body.setAngle(saw.plank,saw.a);}
    if(L.mode==="launch"&&state==="go"&&rider){const p=rider.position,[x0,x1,y]=L.bed;
      const inBed=p.x>x0&&p.x<x1&&p.y<y&&p.y>y-90;
      landT=inBed?landT+dt:0;if(landT>.35)finish(true);
      else if(p.y>WATER_Y+40||p.x<-80||p.x>W+80)finish(false,"おっさんが飛んでいっちゃった…");
      else{const still=Math.hypot(rider.velocity.x,rider.velocity.y)<.25;saw.still=saw.fired&&still&&!inBed?(saw.still||0)+dt:0;
        if(saw.still>.7||(!saw.fired&&goT>6))finish(false,"とどかなかった…");}}
  };
  function fire(stroke){if(saw.fired)return;saw.fired=time;const pts=stroke.plugin.pts;let len=0;for(let i=1;i<pts.length;i++)len+=Math.hypot(pts[i].x-pts[i-1].x,pts[i].y-pts[i-1].y);
    const v=(L.sawK||.72)*Math.sqrt(len*(TH.gravity||1)),an=(L.sawAng||55)*Math.PI/180; // 飛ぶ距離は線の長さに比例（月でも同じ）
    for(const q of rider.parts)q.collisionFilter.mask=~(0x0004|0x0002);rider.collisionFilter.mask=~(0x0004|0x0002);rider.frictionAir=0;
    Body.setStatic(rider,false);Body.setVelocity(rider,{x:saw.sd*v*Math.cos(an),y:-v*Math.sin(an)});Body.setAngularVelocity(rider,saw.sd*.12);
    tone(180,.25,"square",.12,700);}
  M.onHit=(a,b)=>{ // a は線の部品
    if(L.mode==="launch"&&saw&&b===saw.plank&&state==="go"&&(a.parent.position.x-saw.px)*saw.sd>0)fire(a.parent);
    if(L.mode==="wake"&&!woke&&b.plugin&&b.plugin.oji&&state==="go"){woke=.001;tone(880,.15,"square",.1);tone(1320,.2,"square",.1,0,.12);}};
  M.focus=()=>{if(L.mode==="wake")return {x:L.oji[0],y:L.oji[1]-20};if(L.mode==="launch"&&rider)return rider.position;return car.chassis.position;};
  M.flag=()=>!L.mode||L.mode==="switch";
  M.driveOff=()=>L.mode==="guard"||noCar();
  // ---------- 描画 ----------
  M.draw=()=>{if(!L.mode)return;
    for(const b of btns){const h=b.down?5:14;
      ctx.fillStyle="#555";rr(b.x-b.w/2-6,b.y-8,b.w+12,8,3);ctx.fill();
      ctx.fillStyle=b.down?"#3ac060":"#ff3b3b";ctx.beginPath();ctx.ellipse(b.x,b.y-8,b.w/2-4,h,0,Math.PI,0);ctx.fill();ctx.strokeStyle="#0006";ctx.lineWidth=2;ctx.stroke();
      if(!b.down&&state==="draw"){const bob=Math.sin(time*5)*5;ctx.fillStyle="#ff3b3b";ctx.font="bold 20px sans-serif";ctx.textAlign="center";
        ctx.strokeStyle="#fff";ctx.lineWidth=5;ctx.strokeText("おして ▼",b.x,b.y-34+bob);ctx.fillText("おして ▼",b.x,b.y-34+bob);ctx.textAlign="left";}}
    if(gate){const p=gate.position,h=L.gate[2]-L.gate[1];ctx.save();ctx.translate(p.x,p.y);ctx.beginPath();ctx.rect(-15,-h/2,30,h);ctx.clip();
      for(let y=-h/2-30;y<h/2;y+=30){ctx.fillStyle=(Math.round(y/30)%2)?"#222":"#ffd23f";ctx.beginPath();ctx.moveTo(-15,y);ctx.lineTo(15,y+15);ctx.lineTo(15,y+45);ctx.lineTo(-15,y+30);ctx.fill();}
      ctx.restore();ctx.strokeStyle="#222";ctx.lineWidth=3;ctx.strokeRect(p.x-15,p.y-h/2,30,h);
      ctx.fillStyle=opened?"#3ac060":"#ff3b3b";ctx.beginPath();ctx.arc(p.x,p.y+h/2-20,7,0,7);ctx.fill();}
    if(bridge){if(bridge.body){const p=bridge.body.position,len=bridge.x1-bridge.x0;ctx.fillStyle="#8a6a4a";ctx.fillRect(p.x-len/2,p.y-10,len,20);
        ctx.strokeStyle="#4a3420";ctx.lineWidth=3;ctx.strokeRect(p.x-len/2,p.y-10,len,20);ctx.fillStyle="#ccc";for(let x=p.x-len/2+14;x<p.x+len/2;x+=40){ctx.beginPath();ctx.arc(x,p.y,3,0,7);ctx.fill();}}
      else{ctx.save();ctx.setLineDash([10,8]);ctx.strokeStyle="#ffffffaa";ctx.lineWidth=3;ctx.strokeRect(bridge.x0,bridge.y,bridge.x1-bridge.x0,20);ctx.restore();}}
    if(L.cannon){const [x,y,vx,vy]=L.cannon,a=Math.atan2(vy,vx);ctx.save();ctx.translate(x,y);ctx.rotate(a);
      ctx.fillStyle="#2a2a30";rr(-40,-16,64,32,8);ctx.fill();ctx.fillStyle="#44444c";ctx.fillRect(18,-19,10,38);
      if(flashT>0){ctx.fillStyle="#ffd040";ctx.beginPath();ctx.arc(40,0,22,0,7);ctx.fill();}ctx.restore();
      ctx.fillStyle="#5a3a1a";ctx.beginPath();ctx.arc(x,y+12,16,0,7);ctx.fill();}
    if(L.mode==="guard"&&(state==="draw"||state==="go")){const left=Math.max(0,L.guard-(state==="go"?goT:0));
      ctx.font="bold 40px sans-serif";ctx.textAlign="center";ctx.lineWidth=8;ctx.strokeStyle="#fff";ctx.fillStyle=left<1.5?"#ff3b3b":"#222";
      const s=`あと ${left.toFixed(1)} びょう まもれ！`;ctx.strokeText(s,W/2,60);ctx.fillText(s,W/2,60);ctx.textAlign="left";}
    if(L.mode==="wake"){const [x,y]=L.oji;
      ctx.fillStyle="#fff";rr(x+36,y-26,34,16,6);ctx.fill();
      ctx.fillStyle="#6a8ad0";rr(x-62,y-28,104,28,8);ctx.fill();ctx.strokeStyle="#223";ctx.lineWidth=2.5;ctx.stroke();
      ctx.fillStyle="#fff";for(let k=0;k<6;k++){ctx.beginPath();ctx.arc(x-52+k*17,y-14,3,0,7);ctx.fill();}
      if(woke){const j=Math.min(1,woke*6)*26;ojiHead(x+50,y-30-j,1,0);talk(x+50,y-110,"はっ！！");}
      else{ojiHead(x+52,y-26,.95,-.4,true);ctx.fillStyle="#223";ctx.font="bold 22px sans-serif";
        for(let k=0;k<3;k++){const t=(time*.6+k*.33)%1;ctx.globalAlpha=1-t;ctx.fillText("Z",x+64+k*8+t*24,y-56-t*50);}ctx.globalAlpha=1;
        if(state==="draw")talk(x+(x<W-300?200:-200),y-110,"ぐぅ…（起こして）");}}
    if(L.mode==="launch"&&saw){const pl=saw.plank;
      ctx.fillStyle="#6a5a4a";ctx.beginPath();ctx.moveTo(saw.px,saw.py);ctx.lineTo(saw.px-26,saw.py+46);ctx.lineTo(saw.px+26,saw.py+46);ctx.fill();
      ctx.save();ctx.translate(pl.position.x,pl.position.y);ctx.rotate(pl.angle);ctx.fillStyle="#c8904a";ctx.fillRect(-saw.len/2,-7,saw.len,14);ctx.strokeStyle="#5a3a1a";ctx.lineWidth=3;ctx.strokeRect(-saw.len/2,-7,saw.len,14);ctx.restore();
      const [x0,x1,y]=L.bed;ctx.fillStyle="#6a8ad0";rr(x0+6,y-16,x1-x0-12,20,6);ctx.fill();ctx.fillStyle="#fff";rr(x1-44,y-26,34,14,6);ctx.fill();
      ctx.fillStyle="#8a6a4a";ctx.fillRect(x0-7,y-44,14,50);ctx.fillRect(x1-7,y-44,14,50);ctx.fillRect(x0,y,x1-x0,12);
      if(state==="draw"){ctx.fillStyle="#ff3b3b";ctx.font="bold 20px sans-serif";ctx.textAlign="center";ctx.fillText("ここに着地",(x0+x1)/2,y-58);ctx.textAlign="left";}
      if(rider){const p=rider.position;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(rider.angle);
        ctx.fillStyle="#fff";rr(-16,-16,32,24,6);ctx.fill();ctx.strokeStyle="#bbb";ctx.lineWidth=1.5;ctx.stroke();ctx.fillStyle="#e0d4b0";ctx.fillRect(-16,4,32,12);
        const r=rider.parts[2]?rider.parts[2].position:null;ctx.restore();
        if(r)ojiHead(r.x,r.y,1,rider.angle);
        const s=state==="win"?"ナイス着地！":state==="fail"?"うそやろ〜":state==="go"?(rider.velocity.y<-2?"ぎゃあああ":"え？"):"…なにするの？";
        talk(p.x,p.y-90,s);}}
  };
  function talk(x,y,s){ctx.font="bold 22px sans-serif";const w=ctx.measureText(s).width+24;x=Math.max(w/2+6,Math.min(W-w/2-6,x));
    ctx.fillStyle="#fffffff0";ctx.strokeStyle="#333";ctx.lineWidth=2.5;rr(x-w/2,y-20,w,36,14);ctx.fill();ctx.stroke();
    ctx.fillStyle="#222";ctx.textAlign="center";ctx.fillText(s,x,y+6);ctx.textAlign="left";}
  M.talk=talk;
  return M;
})();
