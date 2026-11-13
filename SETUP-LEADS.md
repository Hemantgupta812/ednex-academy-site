# Lead capture → Google Sheet (free setup)

Site ka har form submit seedha Google Sheet mein ek row ban jayega. Koi server, koi paid hosting nahi.

## Step 1 — Sheet banayein
1. [sheets.google.com](https://sheets.google.com) → **Blank spreadsheet**
2. Naam rakhein: **Ednex Leads**

## Step 2 — Apps Script paste karein
1. Sheet mein **Extensions → Apps Script**
2. `google-sheet-endpoint.gs` (repo ke saath) ka poora code paste karein
3. **Save** (Ctrl/Cmd+S)

## Step 3 — Web App deploy karein
1. **Deploy → New deployment**
2. Gear icon → **Web app**
3. **Execute as:** Me
4. **Who has access:** Anyone  ← zaroori hai
5. **Deploy** → Authorize (Google permission screen aayega)
6. **Web app URL** copy karein — `https://script.google.com/macros/s/…/exec`

Test: woh URL browser mein kholein. `{"ok":true,"message":"Ednex lead endpoint is live…"}` dikhna chahiye.

## Step 4 — Site se jodein
`crm-agent.js` mein yeh line badlein:

```js
CRM_ENDPOINT: '',   // ← yahan apna /exec URL paste karein
```

Commit + push → GitHub Pages 1-2 minute mein update ho jayega.

## Step 5 — Test
Site par form bharein → Sheet mein row aani chahiye.
Panel (**Ctrl+Shift+L**) mein "Server: connected" dikhega.

## Sheet columns
`id, name, phone, email, course, source, campaign, enquiryDate, stage, owner, lastTouch, feeQuoted, lostReason, notes, capturedAt, pageUrl`

Yeh columns `Ednex-CRM-Tracker.xlsx` ke **Learners** sheet se match karte hain — Sheet se seedha copy-paste ho jata hai.

## Ek baat
Apps Script free hai par rate-limited hai (roughly 20,000 rows/day se zyada nahi). Ek institute ke liye kaafi se zyada.
