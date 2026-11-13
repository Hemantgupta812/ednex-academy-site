# Ednex Academy — hemant_ednex.com

Career-focused learning institute ka landing site, plus CRM AI Agent layer.

## Structure
- `index.html` — poora landing page (hero, programs, career paths, projects, workshops, FAQ, enquiry form)
- `crm-agent.js` — CRM layer: har lead form submit par lead capture, stage tracking, CSV export
- `style.min.css`, `script.min.js`, `lead-service.min.js` — site ke original assets
- `assets/`, `new_cards/` — logos, images, project cards

## CRM Agent
Har form submit par lead capture hoti hai (name, phone, email, course, source, date) aur
`localStorage` ke `ednex_crm_leads` mein jama hoti hai.

- **Ctrl+Shift+L** — CRM panel kholein (stage-wise count + Export CSV)
- CSV ko `Ednex-CRM-Tracker.xlsx` ke *Learners* sheet mein paste karein
- Server par bhejne ke liye `crm-agent.js` ke `CONFIG.CRM_ENDPOINT` mein apna URL daalein

## Deploy
Poora folder kisi bhi static host par upload karein (Hostinger, Netlify, Vercel, GitHub Pages).

## Demo notice
Ye ek demo copy hai — content, logos aur brand Ednex Academy ke hain. Public dikhane se pehle
branding aur content confirm kar lein.
