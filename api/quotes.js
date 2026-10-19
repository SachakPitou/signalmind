const {parseSymbols,td}=require("./_lib");
module.exports=async(req,res)=>{
  try{
    const syms=parseSymbols(req);if(!syms)return res.status(400).json({error:"bad symbols"});
    const j=await td("price",{symbol:syms.join(",")}),out={};
    syms.forEach(s=>{const o=syms.length===1?j:j[s],v=o&&parseFloat(o.price);if(v>0)out[s]=v});
    res.setHeader("Cache-Control","s-maxage=30, stale-while-revalidate=30");   // shared cache protects your credits
    res.status(200).json(out);
  }catch(e){res.status(500).json({error:e.message})}
};
