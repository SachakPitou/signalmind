const {parseSymbols,td}=require("./_lib");
module.exports=async(req,res)=>{
  try{
    const syms=parseSymbols(req);if(!syms)return res.status(400).json({error:"bad symbols"});
    const interval=["1min","5min","15min"].includes(req.query.interval)?req.query.interval:"1min";
    const size=Math.min(300,Math.max(30,parseInt(req.query.outputsize)||120));
    const j=await td("time_series",{symbol:syms.join(","),interval,outputsize:size}),out={};
    syms.forEach(s=>{const o=syms.length===1?j:j[s];
      if(o&&Array.isArray(o.values))out[s]=o.values.slice().sort((a,b)=>a.datetime<b.datetime?-1:1).map(v=>parseFloat(v.close)).filter(v=>v>0)});
    if(!Object.keys(out).length)throw new Error("no price history returned");
    res.setHeader("Cache-Control","s-maxage=120, stale-while-revalidate=120");
    res.status(200).json(out);
  }catch(e){res.status(500).json({error:e.message})}
};
