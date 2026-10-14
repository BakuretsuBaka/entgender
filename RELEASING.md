# Release-Ablauf

## Einmalig
1. **GitHub**: Repository anlegen und pushen. Unter Settings > Secrets and variables > Actions > Variables die Variable `GECKO_ID` setzen (z. B. `entgender@deine-domain.tld`). Diese ID ist bei AMO dauerhaft und muss eindeutig sein.
2. **Chrome Web Store**: Entwicklerkonto auf <https://chrome.google.com/webstore/devconsole> anlegen (einmalige Registrierungsgebühr, Kontakt-E-Mail ist später nicht änderbar).
3. **Firefox Add-ons**: Konto auf <https://addons.mozilla.org/developers/> anlegen (kostenlos).

## Pro Version
1. Version in `manifest.json` und `package.json` erhöhen, `npm test`.
2. Commit, dann Tag setzen und pushen: `git tag v1.0.1 && git push --tags`. Der Workflow `release.yml` baut beide Pakete, prüft das Firefox-Paket mit `web-ext lint` und hängt die ZIPs an das GitHub-Release.
3. **Chrome**: `entgender-chrome-<version>.zip` im Dashboard hochladen, Store-Angaben aus `store/LISTING.md` eintragen, zur Prüfung einreichen.
4. **Firefox**: `entgender-firefox-<version>.zip` bei AMO hochladen (Listed), Beschreibung und Prüferhinweise aus `store/LISTING.md` eintragen.
5. Edge nimmt dasselbe ZIP wie Chrome (<https://partner.microsoft.com/dashboard/microsoftedge>), optional.

Lokal bauen: `python3 tools/build.py --gecko-id entgender@deine-domain.tld`, Ergebnis in `dist/`.
