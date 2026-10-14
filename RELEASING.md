# Release-Ablauf

## Einmalig
1. **GitHub**: Repository anlegen und pushen. Die Firefox-ID `entgender@bakuretsubaka.github.io` steht als Standard in `tools/build.py` und ist bei AMO dauerhaft. Ändere sie nie.
2. **Chrome Web Store (optional, derzeit nicht genutzt)**: Entwicklerkonto auf <https://chrome.google.com/webstore/devconsole> anlegen (einmalige Registrierungsgebühr, Kontakt-E-Mail ist später nicht änderbar). Ohne Eintrag installieren Chrome-Nutzer die Erweiterung aus dem GitHub-Release (siehe README).
3. **Firefox Add-ons**: Konto auf <https://addons.mozilla.org/developers/> anlegen (kostenlos).

## Pro Version
1. Version in `manifest.json` und `package.json` erhöhen, `npm test`.
2. Commit und push. Dann auf GitHub unter Releases > **Draft a new release** ein neues Tag (z. B. `v1.0.2`) anlegen und veröffentlichen. Der Workflow `release.yml` baut die Pakete, prüft das Firefox-Paket mit `web-ext lint` und hängt die ZIPs und das Userscript (`entgender-<version>.user.js`, für Nyxt, qutebrowser, Pale Moon) an das Release.
3. **Chrome**: Das ZIP aus dem GitHub-Release ist die Chrome-Version. Für den Web Store (falls gewünscht) im Dashboard hochladen und Angaben aus `store/LISTING.md` eintragen.
4. **Firefox**: `entgender-firefox-<version>.zip` bei AMO hochladen (Listed), Beschreibung und Prüferhinweise aus `store/LISTING.md` eintragen.
5. Edge nimmt dasselbe ZIP wie Chrome (<https://partner.microsoft.com/dashboard/microsoftedge>), optional.

Lokal bauen: `python3 tools/build.py --gecko-id entgender@deine-domain.tld`, Ergebnis in `dist/`.
