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
| Substantivierte Partizipien | Studierende, Zuschauende, Teilnehmende, Mitarbeitende | Studenten, Zuschauer, Teilnehmer, Mitarbeiter |

Die Pluralformen werden mit einer Regel für die gängigen Endungen (-er, -en, -e, Umlaute wie Ärzte und Anwälte, Sonderfälle wie Nachbarn und Chefs) gebildet. Artikel direkt vor dem Wort werden angepasst (die Lehrer\*in wird zu der Lehrer). Eingeschobene Adjektive („die neue Lehrer\*in“) und Fälle werden nicht grammatisch nachgezogen.

Bei den Partizipien wird nur ersetzt, was als Personenbezeichnung im Plural erkennbar ist (großgeschrieben, ohne Artikel oder mit Artikel im Plural, Fall wird aus dem Umfeld erschlossen: „den Zuschauenden“ wird zu „den Zuschauern“). Adjektive („die studierende Tochter“, „ein zuschauendes Kind“, „leitende Angestellte“), die weibliche Einzahl („die Studierende“, „eine Studierende“), die männliche Einzahl („ein Studierender“) und Titel wie „Studierende Frauen“ bleiben stehen. Es werden nur Partizipien aus einer Liste angefasst (Studierende, Zuschauende, Teilnehmende, Mitarbeitende, Lehrende, Forschende, Lesende, Nutzende, Besuchende, Wählende, Fahrende, Verkaufende, Kaufende, Spielende, Hörende, Pflegende, Sprechende, Schreibende, Leitende, Beratende, Prüfende, Bewerbende, Anbietende, Verbrauchende, Verwaltende, Vermietende, Mietende, Bewohnende, Entwickelnde, Programmierende, Gründende, Ausbildende, Bearbeitende, Wandernde, Lernende, Demonstrierende, auch in Zusammensetzungen wie Radfahrende). Wörter wie „Anwesende“ oder „Reisende“ bleiben unberührt. Weitere Wörter lassen sich in den Einstellungen als eigene Ersetzung eintragen.

Nicht angefasst werden außerdem rein weibliche Formen (Studentin), Eingabefelder, editierbare Bereiche sowie code-, pre- und script-Inhalte. Wörter wie LinkedIn oder Sign_in stehen auf einer Ausnahmeliste.

## Installation

**Firefox:** über [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/entgender/) (sobald die Prüfung abgeschlossen ist, vorher ist die Seite noch nicht erreichbar). Voraussetzung ist Firefox 142 oder neuer (Desktop und Android).

**Chrome, Edge, Brave (aus dem GitHub-Release):** Es gibt keinen Eintrag im Chrome Web Store, die Erweiterung wird als entpackte Erweiterung geladen.

1. Auf der Seite [Releases](https://github.com/BakuretsuBaka/entgender/releases) die Datei `entgender-chrome-<version>.zip` herunterladen und entpacken.
2. `chrome://extensions` öffnen (Edge: `edge://extensions`) und oben rechts den **Entwicklermodus** einschalten.
3. **Entpackte Erweiterung laden** wählen und den entpackten Ordner auswählen. Der Ordner muss dauerhaft an seinem Platz bleiben, Chrome liest die Dateien von dort.
4. Für ein Update die neue ZIP-Datei über den alten Ordner entpacken und in `chrome://extensions` beim Eintrag auf „Neu laden“ klicken.

Hinweis: Unter Windows zeigt Chrome bei entpackten Erweiterungen beim Start unter Umständen den Hinweis „Erweiterungen im Entwicklermodus deaktivieren“ an. Das ist eine Eigenheit von Chrome und lässt sich nur mit einem Eintrag im Chrome Web Store vermeiden.

Danach die alten Gender-Entferner-Erweiterungen deaktivieren oder entfernen.

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
