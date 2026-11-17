# FOCUS — Deep Work Terminal

A small retro CRT-style timer for focused work.

Presets: 25, 50 or 90 minutes. Categories: Studie, Kod, Skriva, Läsa, Övrigt. It keeps a weekly bar chart, can send a desktop notification when a session ends, and works offline as a Progressive Web App. Sessions are stored in the browser (`localStorage` key `focus_sessions`). Nothing is sent to a server.

## How to run

There is no build step.

```sh
python3 -m http.server 8080
```

Or:

```sh
npx serve .
```

Then open http://localhost:8080

## Built with

HTML, CSS and JavaScript. A service worker (`sw.js`) and `manifest.json` make it installable. Fonts: Share Tech Mono and VT323, loaded from Google Fonts.

## Status

Usable as it is. One commit, June 2026.

If you host it somewhere that is not at the domain root, update the paths in `sw.js` and `manifest.json` first. They currently assume `/`.

## Licence

MIT. See `LICENSE`.

## Author

Mikael Frisell
