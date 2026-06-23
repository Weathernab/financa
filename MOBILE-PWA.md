# Financa PWA brez stroškov

Ta različica je namenjena brezplačni namestitvi na iPhone kot PWA.

## Kaj se objavi

Objavijo se samo statične PWA datoteke in serverless proxy:

- `index.html`
- `app.js`
- `styles.css`
- `manifest.webmanifest`
- `service-worker.js`
- `icons/`
- `api/google-sheets.js`
- `vercel.json`

Datoteka `finance-current-data.json`, mapa `dist/` in namizne datoteke niso namenjene objavi.

## Brezplačna objava na Vercel

1. Zaženi `build-pwa.ps1`.
2. Ustvari zaseben GitHub repository `financa`.
3. V repository naloži vsebino mape `dist/Financa-PWA`.
4. Ustvari brezplačen Vercel račun.
5. V Vercelu izberi `Add New -> Project`.
6. Izberi repository `financa`.
7. Build nastavitve pusti prazne oziroma privzete.
8. Deploy.

## Google Sheets backend

Možnosti sta dve:

1. V aplikaciji v admin nastavitvah ročno vpišeš Apps Script URL.
2. V Vercelu nastaviš okoljsko spremenljivko `GOOGLE_APPS_SCRIPT_URL`.

Če uporabiš okoljsko spremenljivko, Apps Script URL ni viden v kodi aplikacije.

## Namestitev na iPhone

1. Na iPhonu odpri Vercel HTTPS naslov v Safariju.
2. Izberi `Deli`.
3. Izberi `Dodaj na začetni zaslon`.
4. Potrdi `Dodaj`.

Po tem se Financa odpira kot samostojna aplikacija. Vmesnik in podatki so shranjeni lokalno na napravi, Google Sheets pa se uporablja za sinhronizacijo.
