# Store-Texte

Gemeinsam für Chrome Web Store, Firefox Add-ons (AMO) und Edge Add-ons.

## Name
Entgender

## Kurzbeschreibung (Chrome: max. 132 Zeichen, AMO: max. 250)
Entfernt Gendersprache (Genderstern, Doppelpunkt, Binnen-I, Doppelformen) auf Webseiten. Open Source, ohne Datensammlung.

## Ausführliche Beschreibung
Entgender entfernt Gendersprache auf deutschsprachigen Webseiten und zeigt dir stattdessen die gewohnte Schreibweise.

Was ersetzt wird:
• Genderstern, Doppelpunkt, Unterstrich, Schrägstrich, Mittelpunkt und Klammern: Student*innen, Student:innen, Lehrer/in, Kolleg(inn)en
• Binnen-I: StudentInnen, AutorIn
• Doppelformen: Patientinnen und Patienten, die Ärztin oder der Arzt
• Artikel und Pronomen: jede*r, ein*e, der/die, er/sie, seine/ihre
• Substantivierte Partizipien: Studierende, Zuschauende, Teilnehmende werden zu Studenten, Zuschauer, Teilnehmer (nur als Personenbezeichnung, nicht bei Adjektiven)
• Abkürzungen in Stellenanzeigen: (m/w/d), (all genders), (gn) werden entfernt
• Zusammensetzungen: SchülerInnenvertretung wird zu Schülervertretung
• Optional (aus): „mensch“ als „man“, ältere Begriffe statt neuer Sprachregelungen, Anglizismen auf deutschen Seiten (Homepage zu Startseite, Content zu Inhalt)

Bedienung:
• Zähler am Symbol zeigt, wie viele Stellen auf der Seite angepasst wurden
• Erweiterte Ansicht (optional): Ersetzungen seit der Installation, Aufteilung nach Regelgruppe, geänderte Wörter farbig markieren
• Popup: global oder pro Seite ein- und ausschalten, die Originaltexte kommen sofort zurück
• Einstellungen: Regelgruppen einzeln wählen, Testfeld mit Live-Ergebnis, eigene Ersetzungen, Ausnahmen, ausgeschlossene Seiten
• Funktioniert auch bei nachgeladenen Inhalten
• Eingabefelder und Code-Blöcke bleiben unverändert

Datenschutz: Alles läuft lokal im Browser. Es werden keine Daten gesammelt oder übertragen. Der Quellcode ist frei (MIT-Lizenz).

## Kategorie
Chrome: Produktivität (oder Barrierefreiheit). AMO: Sonstiges oder Suche und Navigation, falls Sprache/Lesen nicht passt.

## Chrome Web Store: Angaben im Entwicklerdashboard

**Einziger Zweck (single purpose):** Gendersprache in Webseitentexten durch die klassische deutsche Schreibweise ersetzen.

**Begründung `storage`:** Speichert die Einstellungen des Nutzers (Regeln, eigene Ersetzungen, Ausnahmen, ausgeschlossene Domains).

**Begründung Host-Zugriff (Content-Script auf allen Seiten):** Die Erweiterung muss den Text der Seiten lesen und ändern, die der Nutzer besucht, um Genderformen zu finden und zu ersetzen. Es gibt keine feste Liste von Seiten, auf denen Gendersprache vorkommt. Die Texte verlassen den Browser nicht.

**Datennutzung:** keine Datenkategorie ankreuzen. Zertifizieren, dass keine Daten verkauft, nicht für fremde Zwecke genutzt und nicht zur Kreditwürdigkeit verwendet werden. Link zur Datenschutzerklärung: die PRIVACY.md im GitHub-Repository.

**Remote Code:** Nein, der gesamte Code liegt im Paket.

## AMO: Hinweise für die Prüfer
Der Quellcode im Paket ist unverändert und nicht minifiziert oder gebündelt, es gibt keinen Build-Schritt außer dem Zippen (`python3 tools/build.py`). Die Datenschutzangabe `data_collection_permissions: none` stimmt, es werden keine Daten übertragen. Die Host-Berechtigung (`<all_urls>`) wird für das Content-Script benötigt, das Seitentexte lokal ersetzt. Tests: `npm test`.

## Screenshots (noch zu erstellen)
Chrome: 1280×800 oder 640×400, mindestens 1, besser 3–5. Vorschlag: (1) Vorher/Nachher auf einer Seite mit Genderstern, (2) Zähler am Symbol und Popup, (3) Einstellungen mit Testfeld. Zusätzlich für Chrome: Kachel 440×280 (optional, aber sinnvoll).
