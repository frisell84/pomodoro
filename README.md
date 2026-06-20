# FOCUS — Deep Work Terminal
## Retro Pomodoro PWA

En 80-tals CRT-inspirerad fokus-timer med sessionsloggning.

---

## Funktioner
- ⏱ Timer med 25 / 50 / 90 min presets
- 📂 Kategorier: Studie, Kod, Skriva, Läsa, Övrigt
- 📊 Veckostatistik med dagligt stapeldiagram
- 💾 Lokal datalagring (IndexedDB/localStorage)
- 🔔 Desktop-notiser när session är klar
- 📱 Installerbar som app på Mac, Windows, iOS, Android
- ✈️ Fungerar offline

---

## Deploy på 5 minuter

### Alternativ 1: Vercel (rekommenderat)
```bash
npm i -g vercel
cd pomodoro-pwa
vercel
```
Följ prompten. Klart. Du får en URL direkt.

### Alternativ 2: Netlify
Dra och släpp hela mappen på https://app.netlify.com/drop

### Alternativ 3: GitHub Pages
```bash
git init
git add .
git commit -m "initial"
gh repo create focus-pwa --public --push --source=.
# Aktivera Pages i repo-inställningarna → main branch
```

---

## Installera som Mac-app
1. Öppna din URL i Chrome eller Edge
2. Klicka på install-ikonen i adressfältet (⊕)
   — eller klicka på bannern som dyker upp
3. Välj "Installera"
4. Appen läggs till i Applications och Dock

---

## Lokal utveckling
```bash
# Kräver ingen build-process — ren HTML/CSS/JS
# Kör med valfri lokal server, t.ex:
npx serve .
# eller
python3 -m http.server 8080
```

---

## Framtida idéer
- [ ] Streak-system (konsekvent djupfokus belönas)
- [ ] Export till CSV/Markdown
- [ ] Veckomål att sätta och tracka
- [ ] Supabase-sync för multi-device
- [ ] Menubar-widget via Tauri (om du vill gå native)

---

*"Gå djupt. Inte fort."*
