const B="https://generativelanguage.googleapis.com/v1beta/";
let model=process.env.GEMINI_MODEL||"gemini-3.8-flash";
async function call(m,prompt,key){
  const r=await fetch(`${B}models/${m}:generateContent`,{method:"POST",headers:{"Content-Type":"application/json","x-goog-api-key":key},
    body:JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{temperature:.6,maxOutputTokens:2000}})});
  const j=await r.json();
  if(!r.ok){const e=new Error(j.error&&j.error.message||"HTTP "+r.status);e.status=r.status;throw e}
  return j;
}
// If Google retires the model, pick the newest Flash model this key can use
async function pick(key){
  const r=await fetch(B+"models?pageSize=200",{headers:{"x-goog-api-key":key}}),j=await r.json();
  if(!r.ok)throw new Error(j.error&&j.error.message||"cannot list models");
  const ver=n=>{const m=/gemini-(\d+(?:\.\d+)?)/.exec(n);return m?parseFloat(m[1]):0};
  const c=(j.models||[]).filter(m=>(m.supportedGenerationMethods||[]).includes("generateContent")&&/flash/.test(m.name)&&!/lite|image|tts|live|audio|embedding|vision|robotics|computer/.test(m.name))
    .map(m=>m.name.replace(/^models\//,"")).sort((a,b)=>ver(b)-ver(a));
  if(!c.length)throw new Error("no Flash model available for this key");
  return c[0];
}
module.exports=async(req,res)=>{
  try{
    if(req.method!=="POST")return res.status(405).json({error:"POST only"});
    const key=process.env.GEMINI_API_KEY;if(!key)throw new Error("GEMINI_API_KEY is not set in your Vercel Environment Variables");
    const prompt=String((req.body&&req.body.prompt)||"").slice(0,8000);if(!prompt)return res.status(400).json({error:"empty prompt"});
    let j;
    try{j=await call(model,prompt,key)}
    catch(e){
      if(e.status===404||e.status===400||/no longer available|not found|not supported|deprecated/i.test(e.message)){model=await pick(key);j=await call(model,prompt,key)}
      else throw e;
    }
    const text=((j.candidates&&j.candidates[0]&&j.candidates[0].content&&j.candidates[0].content.parts)||[]).map(x=>x.text||"").join("");
    res.status(200).json({text:text||"Gemini returned an empty response.",model});
  }catch(e){res.status(500).json({error:e.message})}
};
