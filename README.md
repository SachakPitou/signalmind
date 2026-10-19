# SignalMind – Forex & Gold Signals

Educational dashboard: live prices (Twelve Data), rule-based BUY/SELL/WAIT signals, a detailed gold trade plan with lot-size calculator, and Gemini market notes. Not financial advice.

## Put it online (no coding needed)

**1. Get two free keys**
- Twelve Data: https://twelvedata.com/account/api-keys
- Gemini: https://aistudio.google.com/apikey

**2. Upload to GitHub**
1. Unzip this folder. Create a free account at github.com, click **New repository**, name it `signalmind`, click **Create**.
2. Click **uploading an existing file**, drag in **everything inside the unzipped `signalmind` folder** (keep the `css`, `js`, `api` folders), then **Commit changes**.

**3. Deploy on Vercel**
1. Go to vercel.com, sign in with GitHub, click **Add New → Project**, and import `signalmind`.
2. Open **Environment Variables** and add:
   - `TWELVE_API_KEY` = your Twelve Data key
   - `GEMINI_API_KEY` = your Gemini key
3. Click **Deploy**. Your site is live at the `.vercel.app` link.

Changed a key later? Update it in Vercel → Settings → Environment Variables, then **Redeploy**.

## Your keys stay private
The keys live only in Vercel. The website talks to the small functions in `api/`, so nobody can read your keys from the page. Never paste keys into `js/` files or GitHub.

## Customise
- Add or remove markets, change the refresh limits: `js/config.js` (each market costs 1 Twelve Data credit per refresh; the free plan has 8 per minute and 800 per day).
- Balance, risk % and refresh speed: **Settings** button on the site.
- Colours and layout: `css/style.css`.

## Troubleshooting
- **"Demo mode" banner** – the site is not on Vercel yet, or the Twelve Data key is missing. Check the environment variable name and redeploy.
- **"run out of API credits"** – lower the refresh speed in Settings or remove markets in `js/config.js`.
- **Gemini error** – check `GEMINI_API_KEY`. The site switches to the newest Flash model by itself if one is retired.

## Folder map
```
index.html        page layout
css/style.css     design
js/config.js      markets and limits (safe to edit)
js/indicators.js  indicator maths
js/engine.js      signals, trade plan, lot sizing
js/api.js         talks to /api
js/ui.js          drawing the screen
js/app.js         start-up, settings, refresh loop
api/*.js          private server functions (keys live here)
```
