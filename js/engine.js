SM.state={sel:0,paused:false,tick:0,sigs:[],mode:"sim",stale:0,set:{bal:1000,rsk:1,poll:60000,theme:"auto"}};
SM.P=SM.CONFIG.pairs.map(a=>({s:a[0],name:a[1],b:a[2],d:a[3],pip:a[4],c:a[5],q:a[6],px:[a[2]],drift:0,lastSig:-99,an:null}));
SM.isGold=p=>p.s==="XAU/USD";
SM.fx=(p,v)=>v.toFixed(p.d);
SM.pipUSD=(p,px)=>p.q==="B"?p.c*p.pip/px:p.c*p.pip;   // USD value of 1 pip for 1.00 lot
SM.step=function(p){   // demo-mode price simulator
  if(Math.random()<.04)p.drift=(Math.random()-.5)*p.b*1.2e-4;
  const n=(Math.random()+Math.random()+Math.random()-1.5)*p.b*1.5e-4;
  p.px.push(p.px[p.px.length-1]+p.drift+n);if(p.px.length>300)p.px.shift();
};
SM.engine=function(){
  const S=SM.state;
  SM.P.forEach(p=>{
    const px=p.px[p.px.length-1];
    S.sigs.filter(s=>s.p===p&&s.st==="open").forEach(s=>{
      const pnl=(px-s.entry)/p.pip*s.dir;s.pnl=pnl;
      if(s.dir*(px-s.tp)>=0){s.st="win";s.pnl=(s.tp-s.entry)/p.pip*s.dir}
      else if(s.dir*(px-s.sl)<=0){s.st="loss";s.pnl=(s.sl-s.entry)/p.pip*s.dir}
      else if(S.tick-s.t>150)s.st=pnl>=0?"win":"loss";
    });
    if(p.px.length<30){p.an=null;return}
    const a=p.an=SM.analyze(p);
    if(a.dir&&!S.sigs.some(s=>s.p===p&&s.st==="open")&&S.tick-p.lastSig>25){
      p.lastSig=S.tick;
      S.sigs.unshift({p,dir:a.dir,entry:px,sl:px-a.dir*a.sl,tp:px+a.dir*a.tp,t:S.tick,conf:a.conf,st:"open",pnl:0,time:new Date().toLocaleTimeString()});
      if(S.sigs.length>40)S.sigs.pop();
    }
  });
};
// Full plan: uses the open signal if there is one, otherwise a projection from the current bias
SM.planData=function(p){
  const a=p.an,px=p.px[p.px.length-1],os=SM.state.sigs.find(s=>s.p===p&&s.st==="open");
  const dir=os?os.dir:(a.score>=0?1:-1),entry=os?os.entry:px,sl=os?os.sl:px-dir*a.sl,risk=Math.abs(entry-sl);
  return{os,live:!!os,dir,entry,sl,risk,px,tp1:entry+dir*risk,tp2:os?os.tp:px+dir*a.tp,tp3:entry+dir*risk*2.75};
};
SM.sizing=function(p,pl){
  const {bal,rsk}=SM.state.set,pv=SM.pipUSD(p,pl.px),slPips=pl.risk/p.pip;
  const lot=slPips>0&&pv>0?Math.floor(Math.max(0,bal)*Math.max(0,rsk)/100/(slPips*pv)*100)/100:0;
  return{pv,slPips,lot,riskUSD:lot*slPips*pv,budget:bal*rsk/100};
};
