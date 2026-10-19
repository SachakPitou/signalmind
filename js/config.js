// ===== Safe settings you can edit (no secrets here – API keys live in Vercel) =====
window.SM={};
SM.CONFIG={
  seedInterval:"1min",   // candle size used to pre-load history
  seedBars:120,          // candles loaded per market at start
  creditsPerMin:8,       // your Twelve Data plan limit (free plan = 8)
  commentaryEveryMin:5,  // used when "auto-refresh" is ticked
  // [symbol, friendly name, demo start price, decimals, pip size, contract size per 1.00 lot, "U" = USD is quote currency / "B" = USD is base]
  // Every market costs 1 Twelve Data credit per refresh. Delete lines to save credits.
  pairs:[
    ["XAU/USD","Gold",4119.72,2,.1,100,"U"],
    ["EUR/USD","Euro / US Dollar",1.1208,5,1e-4,1e5,"U"],
    ["GBP/USD","British Pound / US Dollar",1.3269,5,1e-4,1e5,"U"],
    ["USD/JPY","US Dollar / Japanese Yen",158.23,3,.01,1e5,"B"],
    ["AUD/USD","Australian Dollar / US Dollar",0.6996,5,1e-4,1e5,"U"],
    ["USD/CAD","US Dollar / Canadian Dollar",1.4199,5,1e-4,1e5,"B"]
  ]
};
