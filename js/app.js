(function(){
const $=SM.$,S=SM.state,P=SM.P,C=SM.CONFIG,fx=SM.fx;
try{Object.assign(S.set,JSON.parse(localStorage.getItem("sm_set")||"{}"))}catch(e){}
const save=()=>{try{localStorage.setItem("sm_set",JSON.stringify(S.set))}catch(e){}};
const theme=()=>document.documentElement.dataset.theme=S.set.theme;
const pollMs=()=>Math.max(+S.set.poll,Math.ceil(P.length*60000/C.creditsPerMin));
theme();

// ---- events ----
$("watch").addEventListener("click",e=>{const r=e.target.closest(".mk");if(r){S.sel=+r.dataset.i;SM.render()}});
$("pause").onclick=()=>{S.paused=!S.paused;$("pause").textContent=S.paused?"Resume":"Pause";SM.status(S.paused?"Paused":(S.mode==="live"?"Live":"Demo mode"),S.paused?"":(S.mode==="live"?"live":""))};
const dlg=$("settings");
$("openSet").onclick=()=>{$("setBal").value=S.set.bal;$("setRsk").value=S.set.rsk;$("setPoll").value=S.set.poll;$("setTheme").value=S.set.theme;dlg.showModal()};
dlg.addEventListener("close",()=>{S.set.bal=+$("setBal").value||0;S.set.rsk=+$("setRsk").value||0;S.set.poll=+$("setPoll").value;S.set.theme=$("setTheme").value;save();theme();if(P[S.sel].an)SM.render()});

// ---- Gemini note ----
let busy=false;
async function note(){
  const out=$("note");if(busy)return;
  const ready=P.filter(p=>p.an);if(!ready.length){out.className="note";out.textContent="Waiting for enough price data.";return}
  busy=true;$("gen").disabled=true;$("gen").textContent="Writing…";
  const snap=ready.map(p=>{const px=p.px[p.px.length-1],a=p.an;return`${p.s}: ${fx(p,px)}, ${((px-p.px[0])/p.px[0]*100).toFixed(2)}% over window, score ${a.score.toFixed(0)}, RSI ${a.rsi.toFixed(0)}, signal ${a.dir>0?"BUY":a.dir<0?"SELL":"WAIT"} (${a.conf}%)`}).join("\n");
  const g=P.find(SM.isGold);let gp="not enough data";
  if(g&&g.an){const pl=SM.planData(g);gp=`XAU/USD ${pl.dir>0?"BUY":"SELL"} (${pl.live?"active signal":"projected"}): entry ${fx(g,pl.entry)}, stop ${fx(g,pl.sl)}, TP1 ${fx(g,pl.tp1)}, TP2 ${fx(g,pl.tp2)}, TP3 ${fx(g,pl.tp3)}, stop distance $${pl.risk.toFixed(2)}, ${(Math.abs(pl.tp2-pl.entry)/pl.risk).toFixed(2)}R to TP2`}
  const tr=S.sigs.slice(0,8).map(s=>`${s.p.s} ${s.dir>0?"BUY":"SELL"} ${s.st} ${s.pnl.toFixed(1)} pips`).join("; ")||"none yet";
  const src=S.mode==="live"?"Prices are live quotes on a very short 1-minute horizon.":"Prices are a simulated demo feed, so do not claim real market causes.";
  const prompt=`You are a forex and gold desk analyst writing a short note for a dashboard. Use only the data below and do not invent news or events. ${src}\n\nData:\n${snap}\n\nGold plan: ${gp}\nRecent tracked signals: ${tr}\n\nWrite about 220 words of plain text in three short paragraphs: (1) market snapshot, (2) the gold trade plan: bias, entry, stop, targets and what to watch, plus any other pair worth watching, (3) risks and what would invalidate the view. End with one sentence saying this is not financial advice.`;
  try{const r=await SM.api.gemini(prompt);out.className="note ok";out.textContent=r.text+"\n\n["+r.model+" · "+new Date().toLocaleTimeString()+"]"}
  catch(e){out.className="note bad";out.textContent=e.code==="noapi"?"Gemini notes work once the site is deployed on Vercel with GEMINI_API_KEY set (see README).":"Gemini error: "+e.message}
  busy=false;$("gen").disabled=false;$("gen").textContent="Regenerate note";
}
$("gen").onclick=note;
let autoT=null;
$("auto").onchange=e=>{clearInterval(autoT);if(e.target.checked){note();autoT=setInterval(note,C.commentaryEveryMin*60000)}};

// ---- live polling ----
async function poll(){
  if(!S.paused&&!document.hidden){
    try{
      const q=await SM.api.quotes(P.map(p=>p.s));S.tick++;let ch=false;
      P.forEach(p=>{const v=q[p.s];if(!(v>0))return;if(v!==p.px[p.px.length-1])ch=true;p.px.push(v);if(p.px.length>300)p.px.shift()});
      S.stale=ch?0:S.stale+1;SM.engine();SM.render();
      SM.status("Live · "+new Date().toLocaleTimeString()+(S.stale>=3?" · prices unchanged (market may be closed)":""),"live");SM.banner("");
    }catch(e){SM.status("Feed error: "+e.message,"err")}
  }
  setTimeout(poll,pollMs());
}

// ---- start ----
(async function init(){
  try{
    const h=await SM.api.history(P.map(p=>p.s));
    P.forEach(p=>{const a=h[p.s];if(a&&a.length>=30)p.px=a.slice(-300)});
    S.mode="live";P.forEach(p=>p.b=p.px[0]);SM.engine();SM.render();
    SM.status("Live · history loaded","live");setTimeout(poll,pollMs());
  }catch(e){
    S.mode="sim";
    SM.banner(e.code==="noapi"?"Demo mode: prices are simulated. Deploy on Vercel and add your Twelve Data key to see live prices (steps are in the README).":"Live data is unavailable ("+e.message+"). Showing simulated demo prices.");
    P.forEach(p=>{for(let i=0;i<160;i++)SM.step(p);p.px=p.px.slice(-160);p.b=p.px[0]});
    SM.engine();SM.render();SM.status("Demo mode","");
    setInterval(()=>{if(S.paused)return;S.tick++;P.forEach(SM.step);SM.engine();SM.render()},1000);
  }
})();
})();
