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
| Artikel- und Pronomenpaare | der/die Lehrer, der*die Nutzer, er/sie, seine/ihre | der Lehrer, der Nutzer, er, seine |
| Abkürzungen | Pflegekraft (m/w/d), Koch m/w/d, (all genders), (gn) | Pflegekraft, Koch |
| Substantivierte Partizipien | Studierende, Zuschauende, Teilnehmende, Mitarbeitende | Studenten, Zuschauer, Teilnehmer, Mitarbeiter |

Optional und standardmäßig aus: **„mensch“ und „frau“ als „man“** („wenn mensch das will“ wird zu „wenn man das will“, „man/frau“ zu „man“). Es wird nur kleingeschrieben ersetzt, „Mensch“ und „Frau“ als Hauptwörter bleiben stehen. Einschalten unter Einstellungen.

Zwei weitere Optionen sind standardmäßig **aus** und lassen sich unter Einstellungen einschalten. Sie nehmen neuere Sprachregelungen zurück, für alle, denen die neuen Begriffe zu lang oder zu sperrig sind:

- **Ältere Begriffe wiederherstellen:** Geflüchtete und geflüchtete Menschen werden zu Flüchtlingen, Asylsuchende und Schutzsuchende zu Asylanten, Menschen mit Behinderung zu Behinderten, Menschen mit intellektueller Beeinträchtigung zu geistig Behinderten, autistische Menschen zu Autisten, Menschen mit psychischer Erkrankung zu psychisch Kranken, obdachlose Menschen zu Obdachlosen, Menschen ohne gesicherten Aufenthaltsstatus zu illegalen Migranten, trans Menschen zu Transsexuellen, versklavte Menschen zu Sklaven, Betroffene sexualisierter Gewalt zu Vergewaltigungsopfern, von Rassismus betroffene Menschen zu Opfern von Rassismus, Einwanderungsgeschichte zu Migrationshintergrund, geschlechtsangleichende Maßnahmen zu Geschlechtsumwandlung, Ableismus zu Behindertenfeindlichkeit, PoC zu schwarzen Menschen und BIPoC zu nichtweißen Menschen. „Schwarz“ wird vor Personenbezeichnungen klein geschrieben (außer am Satzanfang), „weiß“ in Kursivschrift wird normal gesetzt und bei Hauptwörtern („die Weißen“) großgeschrieben. Fall und Zahl werden aus dem Umfeld erschlossen („mit Geflüchteten“ wird zu „mit Flüchtlingen“); bei Einzahl oder unklarem Fall bleibt der Text stehen.
- **Dazu Begriffe, die heute als abwertend gelten** (eigener Schalter, unabhängig von der Option darüber): N-Wort zu Neger, Z-Wort zu Zigeuner, Schokokuss zu Negerkuss, Paprikasauce zu Zigeunersauce, Sinti und Roma zu Zigeuner.

Eine weitere Option, ebenfalls standardmäßig aus: **Anglizismen ersetzen.** Diversity wird zu Vielfalt, Empowerment zu Ermächtigung, Awareness zu Bewusstsein, Safe Space zu Schutzraum, Homepage zu Startseite, Content zu Inhalt, Creator zu Gestalter, Content Creator zu Inhalteproduzent, Wishlist zu Wunschliste, Ragebait zu Wutköder („ragebaiten“ zu „wutködern“) und YouTube Shorts zu YouTube Kurzvideos. Die Option wirkt immer nur auf Seiten, deren `lang`-Attribut auf Deutsch steht, auch wenn „Nur auf deutschen Seiten arbeiten“ ausgeschaltet ist. Artikel und Fall werden angepasst („das Empowerment“ wird zu „die Ermächtigung“, „des Contents“ zu „des Inhalts“). Zusammensetzungen wie „Content-Marketing“ oder „Webcontent“ bleiben unberührt. „Short“ wird nur nach einem Plattformnamen (YouTube, Instagram, TikTok, Facebook, Snapchat, Pinterest) ersetzt, damit Kleidung („Shorts“) nicht betroffen ist.

Unter Einstellungen gibt es außerdem eine **erweiterte Ansicht** für das Popup (standardmäßig aus): Sie zeigt, wie viele Ersetzungen es seit der Installation waren und welche Regelgruppen auf der aktuellen Seite gewirkt haben. Der Schalter „Wörter markieren“ hinterlegt geänderte Wörter grün; ist die Erweiterung ausgeschaltet, werden die Wörter rot markiert, die ersetzt würden. Die Markierung nutzt die CSS Custom Highlight API und ändert die Seite nicht.

Die Pluralformen werden mit einer Regel für die gängigen Endungen (-er, -en, -e, Umlaute wie Ärzte und Anwälte, Sonderfälle wie Nachbarn und Chefs) gebildet. Als Gender-Zeichen gelten `* : _ ·` und weitere wie `•`, `⋅`, `⋆`, `＊` oder der Doppelpunkt in Vollbreite. Im Dativ Plural bekommt das Wort ein -n, wenn ein klarer Auslöser davorsteht („mit Lehrer:innen“ wird zu „mit Lehrern“). Artikel direkt vor dem Wort werden angepasst (die Lehrer\*in wird zu der Lehrer). Bei Einzahlformen wird der Fall aus Artikel oder Präposition davor erschlossen und das Nomen passend gebeugt („einem/r Patient\*in“ wird zu „einem Patienten“, „für Kolleg\*in“ zu „für Kollegen“, „des/der Lehrer\*in“ zu „des Lehrers“); ohne erkennbaren Fall bleibt die Grundform. Eingeschobene Adjektive („die neue Lehrer\*in“) werden nicht angepasst.

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

**Nyxt, qutebrowser, Pale Moon:** Diese Browser laden keine Chrome- oder Firefox-Erweiterungen. Dafür gibt es im Release das Userscript `entgender-<version>.user.js` mit denselben Regeln (ohne Popup und ohne Zähler). Die Einstellungen stehen in einem Block am Anfang der Datei. Nach einer Änderung das Skript neu laden.

- **qutebrowser:** Datei nach `~/.local/share/qutebrowser/greasemonkey/` kopieren (Ordner anlegen, falls nötig) und `:greasemonkey-reload` ausführen. Die Skripte laufen auf allen Seiten und in Frames.
- **Nyxt:** Die Datei irgendwo ablegen, z. B. `~/.config/nyxt/entgender.user.js`, und in der `config.lisp` den `user-script-mode` mit dem Skript einschalten. Die Paket- und Klassennamen unterscheiden sich je nach Nyxt-Version, Grundmuster (siehe Abschnitt „User scripts“ im Nyxt-Handbuch):

  ```lisp
  (define-configuration web-buffer
    ((default-modes (pushnew 'nyxt/mode/user-script:user-script-mode %slot-default%))))
  (define-configuration nyxt/mode/user-script:user-script-mode
    ((nyxt/mode/user-script:user-scripts
      (list (make-instance 'nyxt/mode/user-script:user-script
                           :base-path #p"~/.config/nyxt/entgender.user.js")))))
  ```
  Nyxt braucht eine WebKitGTK-Version mit RegExp-Lookbehind (ab 2.40).
- **Pale Moon:** Das Greasemonkey-Add-on für Pale Moon installieren (von der Add-ons-Seite von Pale Moon) und die `.user.js`-Datei öffnen. Pale Moon ist **nicht getestet**: Das Skript braucht Lookbehind und `\p{L}` in regulären Ausdrücken. Fehlt dem Browser das, schreibt das Skript eine Meldung in die Konsole und tut nichts, die Seiten bleiben unverändert.

Das Userscript ist in den Tests nur mit jsdom geprüft, nicht in den drei Browsern selbst. Wenn etwas nicht läuft, bitte ein Issue mit Browser- und Versionsangabe anlegen.

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
- `tools/build.py`: baut die Pakete und das Userscript (`rules.js` + `content.js` mit eingebetteten Einstellungen).
- `background.js`: Service-Worker, summiert die Zähler pro Tab und setzt das Badge.
- `popup.*`, `options.*`, `ui.css`: Oberfläche.

Veröffentlichung: siehe [RELEASING.md](RELEASING.md), Store-Texte in [store/LISTING.md](store/LISTING.md), [Datenschutzerklärung](PRIVACY.md).

Die Erweiterung benötigt nur die Berechtigung `storage` und sendet keinerlei Daten irgendwohin. Fehlerfälle gerne als Testfall in `tests/rules.test.js` ergänzen.
