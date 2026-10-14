# Entgender

Browser-Erweiterung (Chrome und alle Chromium-Browser, Manifest V3), die Gendersprache auf Webseiten entfernt. Sie ersetzt die drei Erweiterungen „Binnen-I be gone“, „Gendersprache korrigieren“ und „No Gender“. Lizenz: MIT.

## Was sie entfernt

| Form | Vorher | Nachher |
| --- | --- | --- |
| Genderstern, Doppelpunkt, Unterstrich, Schrägstrich, Mittelpunkt | Student\*innen, Student:innen, Student_innen, Student/innen, Student·innen | Studenten |
| Klammern | Student(inn)en, Lehrer(in) | Studenten, Lehrer |
| Binnen-I | StudentInnen, AutorIn | Studenten, Autor |
| Singular | Ärzt\*in, Kolleg\*in, Fachärzt:in | Arzt, Kollege, Facharzt |
| Komposita | SchülerInnenvertretung, Schüler\*innenvertretung | Schülervertretung |
| Doppelformen | Patientinnen und Patienten, die Ärztin oder der Arzt | Patienten, der Arzt |
| Artikel mit Zeichen | jede\*r, jedeR, ein\*e, eine\*n | jeder, jeder, ein, einen |
| Schrägstrich-Paare | der/die Lehrer, er/sie, seine/ihre | der Lehrer, er, seine |

Die Pluralformen werden mit einer Regel für die gängigen Endungen (-er, -en, -e, Umlaute wie Ärzte und Anwälte, Sonderfälle wie Nachbarn und Chefs) gebildet. Artikel direkt vor dem Wort werden angepasst (die Lehrer\*in wird zu der Lehrer). Eingeschobene Adjektive („die neue Lehrer\*in“) und Fälle werden nicht grammatisch nachgezogen.

Nicht angefasst werden rein weibliche Formen (Studentin), neutrale Formen (Studierende), Eingabefelder, editierbare Bereiche sowie code-, pre- und script-Inhalte. Wörter wie LinkedIn oder Sign_in stehen auf einer Ausnahmeliste.

## Installation (Chrome, Edge, Brave)

1. ZIP entpacken.
2. `chrome://extensions` öffnen und oben rechts den **Entwicklermodus** einschalten.
3. **Entpackte Erweiterung laden** und den entpackten Ordner `entgender` wählen.
4. Die drei alten Erweiterungen deaktivieren oder entfernen.

## Firefox

Für Firefox gibt es ein eigenes Paket (`entgender-firefox-<version>.zip` aus den GitHub-Releases oder `python3 tools/build.py`). Zum Ausprobieren: `about:debugging` > Dieser Firefox > Temporäres Add-on laden und dort die `manifest.json` aus `dist/firefox` wählen. Voraussetzung ist Firefox 142 oder neuer.

## Bedienung

- **Zähler am Symbol**: Wie bei einem Adblocker zeigt ein grünes Badge am Erweiterungssymbol, wie viele Stellen auf der aktuellen Seite angepasst wurden (inklusive eingebetteter Frames, ab 1000 als „1,2k“). Ohne Änderungen bleibt das Badge leer.
- **Popup** (Symbol in der Leiste): Erweiterung global ein oder aus, für die aktuelle Seite ein oder aus, Zähler der angepassten Stellen. Beim Ausschalten werden die Originaltexte sofort wiederhergestellt.
- **Einstellungen**: Regelgruppen einzeln schalten, Testfeld mit Live-Ergebnis, eigene Ersetzungen (`alt = neu`), Ausnahmen, deaktivierte Seiten, optional nur Seiten mit deutscher Sprachangabe.
- Die Einstellungen werden über `chrome.storage.sync` mit dem Browserkonto synchronisiert.

## Entwicklung

```
npm test            # Regeltests mit dem eingebauten Node-Testrunner
python3 tools/make_icons.py   # Icons neu erzeugen (Pillow)
```

- `rules.js`: sämtliche Textregeln, ohne Browserabhängigkeit (wird auch von den Tests geladen).
- `content.js`: DOM-Durchlauf, MutationObserver für nachgeladene Inhalte, Wiederherstellung, offene Shadow-DOMs.
- `background.js`: Service-Worker, summiert die Zähler pro Tab und setzt das Badge.
- `popup.*`, `options.*`, `ui.css`: Oberfläche.

Veröffentlichung: siehe [RELEASING.md](RELEASING.md), Store-Texte in [store/LISTING.md](store/LISTING.md), [Datenschutzerklärung](PRIVACY.md).

Die Erweiterung benötigt nur die Berechtigung `storage` und sendet keinerlei Daten irgendwohin. Fehlerfälle gerne als Testfall in `tests/rules.test.js` ergänzen.
