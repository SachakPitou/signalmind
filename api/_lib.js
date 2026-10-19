// Shared helpers for the serverless functions. Files starting with "_" are not public endpoints.
const SYM=/^[A-Z]{3}\/[A-Z]{3}$/;
function parseSymbols(req){
  const s=String(req.query.symbols||"").split(",").filter(Boolean);
  return s.length&&s.length<=12&&s.every(x=>SYM.test(x))?s:null;
}
async function td(path,params){
  const key=process.env.TWELVE_API_KEY;
  if(!key)throw new Error("TWELVE_API_KEY is not set in your Vercel Environment Variables");
  const u=new URL("https://api.twelvedata.com/"+path);
  for(const k in params)u.searchParams.set(k,params[k]);
  u.searchParams.set("apikey",key);
  const r=await fetch(u),j=await r.json();
  if(j.status==="error")throw new Error(j.message||"Twelve Data error");
  return j;
}
module.exports={parseSymbols,td};
