// Talks to our own /api functions (see the api/ folder). API keys never reach the browser.
SM.api={
  async call(url,opt){
    let r;try{r=await fetch(url,opt)}catch(e){const x=new Error("cannot reach the server");x.code="noapi";throw x}
    let j;try{j=JSON.parse(await r.text())}catch(e){const x=new Error("API not found");x.code="noapi";throw x}
    if(!r.ok||j.error)throw new Error(j.error||("HTTP "+r.status));
    return j;
  },
  quotes:s=>SM.api.call("/api/quotes?symbols="+encodeURIComponent(s.join(","))),
  history:s=>SM.api.call("/api/history?symbols="+encodeURIComponent(s.join(","))+"&interval="+SM.CONFIG.seedInterval+"&outputsize="+SM.CONFIG.seedBars),
  gemini:prompt=>SM.api.call("/api/gemini",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt})})
};
