# 🔗 LinkDrop

<img src="./icons/icon-192.png" width="80" alt="LinkDrop icon" />

**Your personal link inbox.** Save any link from any app using your phone's native Share button — no account, no cloud, no nonsense.

<br/>

> 🔒 **No sign-in required** &nbsp;·&nbsp; 📱 **All data stays on your device** &nbsp;·&nbsp; 📤 **Export & import anytime** &nbsp;·&nbsp; ✈️ **Works offline**

<br/>

---

## ✨ Features

| Feature | Description |
|---|---|
| **Web Share Target** | Appears in Android's native share sheet — just like WhatsApp or Notes |
| **Instant Save** | URL auto-filled from share; just add a title, pick a category, tap Save |
| **7 Categories** | Education · CS & AI · Games · Extracurricular · News · Entertainment · Other |
| **Real-time Search** | Search across title, URL, and notes instantly |
| **Category Filter** | Tap a pill to filter by category |
| **Stats Bar** | See total links, links saved today, and breakdown by category |
| **Open / Copy / Delete** | Full link management via card dropdown |
| **Export / Import** | Backup and restore your collection as JSON — no account needed |
| **Offline First** | Works with no internet after first visit |
| **Installable PWA** | Add to Home Screen on Android and iOS — no App Store needed |

---

## 📂 Project Structure

```
link drop/
├── index.html        # Full SPA — all 4 pages (Home, Add, Share-Target, Settings)
├── app.js            # All app logic: routing, storage, CRUD, search, filter
├── styles.css        # Design system: green theme, glassmorphism, animations
├── manifest.json     # PWA manifest with Web Share Target config
├── sw.js             # Service worker: offline caching, SPA routing
├── vercel.json       # Vercel deployment config (rewrites + headers)
├── netlify.toml      # Netlify deployment config (redirects + headers)
├── robots.txt        # SEO crawl rules
├── .gitignore
└── icons/
    ├── icon-192.png
    └── icon-512.png
```

---

## 🚀 Deploy in 2 Minutes

### Option A — Vercel (Recommended)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import Git Repository** → select `NISHANTH-KONCHADA/linkdrop`
3. Hit **Deploy** — `vercel.json` handles all rewrites and caching automatically
4. Your app is live at `https://your-project.vercel.app` ✅

### Option B — Netlify

1. Go to [app.netlify.com](https://app.netlify.com) → **Add new site**
2. Connect your GitHub repo or drag-and-drop the project folder
3. `netlify.toml` handles all redirects automatically
4. Click **Deploy site** ✅

---

## 📱 Installing on Android (Full Share Sheet)

After deploying:

1. Open **Chrome** on Android → visit your deployed URL
2. Tap the **"Install App on Device"** button (Settings page) or the browser install banner
3. Tap **Install**
4. ✅ **LinkDrop now appears in your share sheet** — share any link from YouTube, Instagram, WhatsApp, Chrome, etc. directly to LinkDrop

---

## 🍎 Installing on iPhone / iOS

1. Open **Safari** → visit your deployed URL
2. Tap the Share button → **Add to Home Screen** → **Add**
3. ✅ App icon appears on your home screen

> **Note:** iOS Safari does not support Web Share Target as of iOS 17. Use the **Add** button inside the app to save links manually on iOS.

---

## 💾 Your Data, Your Device

LinkDrop is **fully private by design**:

- ✅ No account or sign-in ever required
- ✅ All links stored in your browser's `localStorage` — never sent anywhere
- ✅ **Export** your entire collection as a JSON file anytime (Settings → Export)
- ✅ **Import** a backup JSON to restore or move your links to another device
- ✅ No analytics, no tracking, no third-party services

---

## 🔗 How Web Share Target Works

The magic lives in `manifest.json`:

```json
"share_target": {
  "action": "/share-target",
  "method": "GET",
  "params": { "url": "url", "text": "text", "title": "title" }
}
```

When you share a link from **any app** on Android, the OS calls:
```
https://your-app.vercel.app/share-target?url=https://...&title=...
```

The app reads `?url=` from the query string, pre-fills the save form, and you just confirm. The service worker intercepts this route and serves `index.html` without a page reload.

---

## 🗂️ Data Model

```json
{
  "id": "abc123xyz",
  "url": "https://youtube.com/watch?v=...",
  "title": "Python Full Course - 12 Hours",
  "category": "education",
  "note": "Watch this before the exam",
  "savedAt": 1715000000000
}
```

**Categories:** `education` · `cs_ai` · `games` · `extracurricular` · `news` · `entertainment` · `other`

---

## 🛠️ Local Development

No build step needed — pure HTML/CSS/JS.

```bash
# Python
python -m http.server 3000

# Node.js
npx serve .

# Then open → http://localhost:3000
```

> ⚠️ Always serve via HTTP, not `file://` — Service Workers require an HTTP origin.

---

## 🏗️ Tech Stack

| Layer | Choice |
|---|---|
| Framework | Vanilla HTML / CSS / JS — zero build step |
| Styling | Custom CSS with glassmorphism design system |
| Fonts | Inter + Material Symbols (Google Fonts CDN) |
| Storage | `localStorage` — no backend, works offline |
| PWA | `manifest.json` + Service Worker |
| Share Target | Web Share Target API |
| Hosting | Vercel / Netlify (free tier) |

---

## 📋 Roadmap

- [ ] Dark mode toggle
- [ ] Link preview cards (Open Graph metadata)
- [ ] Cloud sync (Supabase / Firebase)
- [ ] Tags & custom collections
- [ ] Browser extension for desktop
- [ ] Bulk select & delete

---

## 📄 License

MIT — use it, fork it, ship it.
