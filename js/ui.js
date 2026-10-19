(function(){
const $=id=>document.getElementById(id),S=SM.state,P=SM.P,fx=SM.fx,isGold=SM.isGold;
const money=v=>"$"+Math.abs(v).toFixed(2);
SM.$=$;
SM.status=(t,kind)=>{$("statusText").textContent=t;$("status").className="pill "+(kind||"")};
SM.banner=t=>{const b=$("banner");b.hidden=!t;if(t)b.textContent=t};

function spark(p){const d=p.px.slice(-40),mn=Math.min(...d),mx=Math.max(...d),r=mx-mn||1;
  return`<svg class="spark" viewBox="0 0 80 24"><polyline fill="none" stroke="currentColor" stroke-width="1.5" points="${d.map((v,i)=>(i/(d.length-1)*80).toFixed(1)+","+(22-(v-mn)/r*20).toFixed(1)).join(" ")}"/></svg>`}

function chart(p,pl){
  const a=p.an,N=100,W=720,H=250,d=p.px.slice(-N),e9=a.E9.slice(-N),e21=a.E21.slice(-N);
  let all=[...d,...e9,...e21];if(pl.live)all.push(pl.sl,pl.tp2);
  const mn=Math.min(...all),mx=Math.max(...all),r=mx-mn||1,X=i=>i/(N-1)*W,Y=v=>H-10-(v-mn)/r*(H-20);
  const path=arr=>arr.map((v,i)=>(i?"L":"M")+X(i).toFixed(1)+" "+Y(v).toFixed(1)).join("");
  let lines="";
  if(pl.live)[[pl.entry,"var(--ac)","Entry"],[pl.tp1,"var(--up)","TP1"],[pl.tp2,"var(--up)","TP2"],[pl.sl,"var(--dn)","SL"]].forEach(l=>{
    if(l[0]<mn||l[0]>mx)return;const y=Y(l[0]);
    lines+=`<line x1="0" x2="${W}" y1="${y}" y2="${y}" stroke="${l[1]}" stroke-dasharray="5 5" opacity=".85"/><text x="6" y="${y-4}" font-size="11" font-weight="600" fill="${l[1]}">${l[2]}</text>`});
  const last=d.length-1;
  return`<svg class="chart" viewBox="0 0 ${W} ${H}"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--ac)" stop-opacity=".22"/><stop offset="1" stop-color="var(--ac)" stop-opacity="0"/></linearGradient></defs>
  <path d="${path(d)} L${W} ${H} L0 ${H}Z" fill="url(#g)"/><path d="${path(d)}" fill="none" stroke="var(--tx)" stroke-width="2"/>
  <path d="${path(e9)}" fill="none" stroke="var(--ac)" stroke-width="1.3"/><path d="${path(e21)}" fill="none" stroke="var(--dn)" stroke-width="1.3" opacity=".7"/>${lines}
  <circle cx="${X(last)}" cy="${Y(d[last])}" r="4" fill="var(--gold)"/></svg>`;
}

function plan(p){
  const a=p.an,pl=SM.planData(p),z=SM.sizing(p,pl),buy=pl.dir>0,side=buy?"BUY":"SELL";
  const pips=v=>Math.abs(v-pl.entry)/p.pip,usd=v=>pips(v)*z.pv*z.lot;
  const lv=[["TP3","Runner · 2.75R",pl.tp3,"up"],["TP2","Main target · signal exit",pl.tp2,"up"],["TP1","Take partial · 1R",pl.tp1,"up"],["Entry",pl.live?"Signal entry":"Price now",pl.entry,"ac"],["Stop","Stop loss · idea is wrong",pl.sl,"dn"]];
  if(pl.live)lv.push(["Now","Current price",pl.px,"now"]);
  lv.sort((x,y)=>y[2]-x[2]);
  const rows=lv.map(l=>{const e=l[0]==="Entry"||l[0]==="Now",sl=l[0]==="Stop",R=pips(l[2])*p.pip/pl.risk;
    return`<div class="lv ${l[3]}"><div><b>${l[0]}</b><small>${l[1]}</small></div><span>${fx(p,l[2])}</span><span>${e?"–":pips(l[2]).toFixed(1)}</span><span>${e?"–":(sl?"-1.00R":"+"+R.toFixed(2)+"R")}</span><span class="pl ${sl?"dn":e?"":"up"}">${e?"–":(sl?"-":"+")+money(usd(l[2]))}</span></div>`}).join("");
  const floating=pl.live?`<div class="chip"><span class="k">Floating P/L</span><b class="${pl.os.pnl>=0?"up":"dn"}">${pl.os.pnl>=0?"+":"-"}${money(pl.os.pnl*z.pv*z.lot)}</b></div>`:"";
  return`<div class="card" style="margin-top:16px"><div class="panel-h"><div><span class="k">Trade plan</span><div style="font-size:17px;font-weight:700">${p.name} <span class="${buy?"up":"dn"}">${side}</span></div></div><span class="badge ${pl.live?side:"PROJ"}">${pl.live?"ACTIVE SIGNAL · "+pl.os.conf+"%":"PROJECTED"}</span></div>
  <div class="sum"><b>In plain English:</b> ${buy?"Buy":"Sell"} ${p.name} near <b>${fx(p,pl.entry)}</b>. If it goes against you, exit at <b>${fx(p,pl.sl)}</b>, a loss of about <b class="dn">${money(z.riskUSD)}</b> at ${z.lot.toFixed(2)} lot. First target <b>${fx(p,pl.tp1)}</b> (<span class="up">+${money(usd(pl.tp1))}</span>), main target <b>${fx(p,pl.tp2)}</b> (<span class="up">+${money(usd(pl.tp2))}</span>).${pl.live?"":" No signal is active yet, so this is a projection only."}</div>
  <div class="plan"><div class="lv h"><span>Level</span><span>Price</span><span>Pips</span><span>R:R</span><span>P/L @ ${z.lot.toFixed(2)} lot</span></div>${rows}</div>
  <div class="chips"><div class="chip"><span class="k">Lot size</span><b>${z.lot.toFixed(2)}</b></div><div class="chip"><span class="k">Risk at stop</span><b class="dn">${money(z.riskUSD)}</b></div><div class="chip"><span class="k">Stop distance</span><b>${z.slPips.toFixed(1)} pips${isGold(p)?" ($"+pl.risk.toFixed(2)+")":""}</b></div><div class="chip"><span class="k">Pip value / lot</span><b>${money(z.pv)}</b></div>${isGold(p)?`<div class="chip"><span class="k">$1 gold move</span><b>${money(p.c*(z.lot||1))} @ ${(z.lot||1)} lot</b></div>`:""}${floating}</div>
  <p class="mut" style="margin:12px 0 0;font-size:12.5px">Management: enter at market or wait for a pullback into ${fx(p,Math.min(a.e9,a.e21))} – ${fx(p,Math.max(a.e9,a.e21))}. At TP1 close about half and move the stop to entry. Trail the rest behind EMA 9 toward TP2/TP3. Drop the idea if the stop is hit or the score flips beyond ±40 the other way.</p></div>`;
}

function levels(p){
  const a=p.an,w=p.px.slice(-100),hi=Math.max(...w),lo=Math.min(...w),c=p.px[p.px.length-1],pv=(hi+lo+c)/3;
  const R=(k,v,c)=>`<div class="row"><span>${k}</span><b class="${c||""}">${v}</b></div>`;
  return`<div class="card"><div class="k">Key levels · last ${w.length} ticks</div>${R("Resistance 1",fx(p,2*pv-lo),"dn")}${R("Range high",fx(p,hi))}${R("Pivot",fx(p,pv))}${R("Range low",fx(p,lo))}${R("Support 1",fx(p,2*pv-hi),"up")}${R("EMA 9 / 21",fx(p,a.e9)+" / "+fx(p,a.e21))}${R("RSI (14)",a.rsi.toFixed(1))}${R("ATR (tick)",(a.atr/p.pip).toFixed(2)+" pips")}</div>`;
}
function say(p){
  const a=p.an,o=[];
  o.push(a.trend>8?"Short-term average is above the slow one: micro-trend is up.":a.trend<-8?"Short-term average is below the slow one: micro-trend is down.":"Averages are flat: no clear trend.");
  o.push(a.hist>0?"MACD momentum is positive (bullish).":"MACD momentum is negative (bearish).");
  o.push(a.rsi>70?`RSI ${a.rsi.toFixed(0)}: overbought, reversal risk is higher.`:a.rsi<30?`RSI ${a.rsi.toFixed(0)}: oversold, a bounce is more likely.`:`RSI ${a.rsi.toFixed(0)}: neutral.`);
  o.push(Math.abs(a.z)>1.5?`Price is stretched ${a.z.toFixed(1)}σ from its 20-tick average.`:"Price is close to its 20-tick average.");
  return o.map(t=>`<p style="margin:6px 0">${t}</p>`).join("")+`<p style="margin:8px 0 0"><b>${a.dir?`Verdict: ${a.dir>0?"bullish":"bearish"}, ${a.conf}% confidence.`:"Verdict: signals conflict, so the model waits."}</b></p>`;
}

SM.render=function(){
  const cl=S.sigs.filter(s=>s.st!=="open"),w=cl.filter(s=>s.st==="win").length,pips=S.sigs.reduce((x,s)=>x+s.pnl,0);
  $("stats").innerHTML=[["Open signals",S.sigs.filter(s=>s.st==="open").length],["Closed",cl.length],["Win rate",cl.length?Math.round(w/cl.length*100)+"%":"–"],["Net pips",`<span class="${pips>=0?"up":"dn"}">${pips>=0?"+":""}${pips.toFixed(1)}</span>`]].map(x=>`<div class="card stat"><div class="k">${x[0]}</div><div class="v">${x[1]}</div></div>`).join("");
  $("watch").innerHTML=P.map((p,i)=>{
    const px=p.px[p.px.length-1],ch=(px-p.px[0])/p.px[0]*100,a=p.an||{dir:0,conf:0},t=a.dir>0?"BUY":a.dir<0?"SELL":"WAIT";
    return`<div class="mk ${i===S.sel?"sel":""} ${isGold(p)?"gold":""}" data-i="${i}" style="color:${ch>=0?"var(--up)":"var(--dn)"}"><div><b>${p.s}</b><br><small class="mut">${p.name}</small></div><span class="badge ${t}">${t}${a.dir?" "+a.conf+"%":""}</span><span class="px">${fx(p,px)} <small>${ch>=0?"+":""}${ch.toFixed(2)}%</small></span>${spark(p)}</div>`}).join("");
  const p=P[S.sel];
  if(!p.an){$("detail").innerHTML=`<div class="card">Collecting prices for ${p.s}: ${p.px.length}/30</div>`}
  else{
    const a=p.an,pl=SM.planData(p),t=a.dir>0?"BUY":a.dir<0?"SELL":"WAIT",px=p.px[p.px.length-1],ch=(px-p.px[0])/p.px[0]*100,pc=50+a.score/2;
    $("detail").innerHTML=`<div class="card"><div class="hero"><div><div class="name">${p.name} · ${p.s}</div><div class="price">${fx(p,px)}</div><div class="${ch>=0?"up":"dn"}">${ch>=0?"▲":"▼"} ${Math.abs(ch).toFixed(2)}% over loaded window</div></div><div class="sig"><span class="badge ${t}">${t}</span><div class="mut" style="margin-top:6px">${a.dir?a.conf+"% confidence":"No clear signal"}</div></div></div>${chart(p,pl)}
    <div class="legend"><span><i style="background:var(--tx)"></i>Price</span><span><i style="background:var(--ac)"></i>EMA 9</span><span><i style="background:var(--dn)"></i>EMA 21</span>${pl.live?"<span>Dashed: entry, targets, stop</span>":""}</div></div>
    ${plan(p)}
    <div class="cols"><div class="card"><div class="k">AI score</div><div class="big ${a.score>=0?"up":"dn"}">${a.score>0?"+":""}${a.score.toFixed(0)}</div><div class="bar"><i style="left:${Math.min(50,pc)}%;width:${Math.abs(a.score)/2}%;background:${a.score>=0?"var(--up)":"var(--dn)"}"></i></div>
    ${[["Trend",a.trend],["MACD",a.mac],["RSI",a.rs],["Bollinger",a.bb]].map(x=>`<div class="row"><span>${x[0]}</span><b>${x[1].toFixed(0)}</b></div>`).join("")}</div>${levels(p)}<div class="card"><div class="k">AI analyst</div>${say(p)}</div></div>`;
  }
  $("hist").innerHTML="<tr><th>Time</th><th>Pair</th><th>Side</th><th>Entry</th><th>TP</th><th>SL</th><th>Conf.</th><th>Status</th><th>Pips</th></tr>"+(S.sigs.length?S.sigs.slice(0,15).map(s=>`<tr><td>${s.time}</td><td>${s.p.s}</td><td class="${s.dir>0?"up":"dn"}">${s.dir>0?"BUY":"SELL"}</td><td>${fx(s.p,s.entry)}</td><td>${fx(s.p,s.tp)}</td><td>${fx(s.p,s.sl)}</td><td>${s.conf}%</td><td class="${s.st==="win"?"up":s.st==="loss"?"dn":""}">${s.st.toUpperCase()}</td><td class="${s.pnl>=0?"up":"dn"}">${s.pnl.toFixed(1)}</td></tr>`).join(""):`<tr><td colspan="9" class="mut">Waiting for the first signal…</td></tr>`);
};
})();
