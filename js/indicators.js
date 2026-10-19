SM.clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
SM.ema=(a,n)=>{const k=2/(n+1);let e=a[0];return a.map(v=>e=v*k+e*(1-k))};
SM.analyze=function(p){
  const {clamp,ema}=SM,a=p.px,L=a.length-1,e9=ema(a,9),e21=ema(a,21),e12=ema(a,12),e26=ema(a,26);
  const m=e12.map((v,i)=>v-e26[i]),sg=ema(m,9),hist=m[L]-sg[L];
  let atr=0,g=0,l=0;
  for(let i=L-13;i<=L;i++){const d=a[i]-a[i-1];atr+=Math.abs(d);d>0?g+=d:l-=d}
  atr/=14;atr=Math.max(atr,p.pip*.2);const rsi=l===0?100:100-100/(1+g/l);
  const w=a.slice(-20),mu=w.reduce((x,y)=>x+y)/20,sd=Math.sqrt(w.reduce((x,y)=>x+(y-mu)**2,0)/20)||1e-9,z=(a[L]-mu)/sd;
  const trend=clamp((e9[L]-e21[L])/(atr*3),-1,1)*35,mac=clamp(hist/(atr*1.2),-1,1)*25;
  const rs=rsi>70?-10:rsi<30?10:(rsi-50)/50*20,bb=-clamp(z/2,-1,1)*10;
  const score=trend+mac+rs+bb,dir=score>=40?1:score<=-40?-1:0;
  return{score,dir,conf:Math.min(95,Math.round(Math.abs(score)*1.05)),atr,rsi,hist,z,trend,mac,rs,bb,e9:e9[L],e21:e21[L],sl:atr*8,tp:atr*14,E9:e9,E21:e21};
};
