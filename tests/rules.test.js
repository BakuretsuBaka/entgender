'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const E = require('../rules.js');

const opts = E.buildOptions(E.DEFAULT_SETTINGS);
const run = function (s, o) { return E.entgender(s, o || opts); };

const CASES = [
  // Genderzeichen, Plural
  ['Student*innen', 'Studenten'],
  // Adjektive und substantivierte Adjektive mit Genderzeichen
  ['Liebe*r Leser,', 'Lieber Leser,'],
  ['Liebe*r Leser*in,', 'Lieber Leser,'],
  ['Liebe/r Nutzer/in', 'Lieber Nutzer'],
  ['Liebe:r Leser:in', 'Lieber Leser'],
  ['LiebeR Kollege', 'Lieber Kollege'],
  ['mit liebe*n Grüßen', 'mit lieben Grüßen'],
  ['Liebe*m Freund', 'Liebem Freund'],
  ['ein Angestellte*r', 'ein Angestellter'],
  ['der Angestellte*r', 'der Angestellte'],
  ['mit dem Angestellte*m', 'mit dem Angestellten'],
  ['Wir suchen Rolle/n und Seite/n', 'Wir suchen Rollen und Seiten'],
  ['Experte*r gesucht', 'Experte*r gesucht'],
  // Ergänzungsstrich
  ['Sprachexpertinnen und -experten', 'Sprachexperten'],
  ['Mit Sprachexpertinnen und -experten', 'Mit Sprachexperten'],
  ['Lehrerinnen und -lehrer', 'Lehrer'],
  ['Ärztinnen und -ärzte', 'Ärzte'],
  ['mit den Ärztinnen und -ärzten', 'mit den Ärzten'],
  ['Schülerinnen oder -schüler', 'Schüler'],
  ['die Lehrerin oder -lehrer', 'der Lehrer'],
  ['Die Studentinnen und -studenten sind da.', 'Die Studenten sind da.'],
  // unsichtbare Silbentrennung (Soft Hyphen) und Zero-Width-Zeichen mitten im Wort
  ['Ver\u00ADtei\u00ADdi\u00ADge\u00ADr*in\u00ADnen', 'Verteidiger'],
  ['Lehrer*in\u00ADnen', 'Lehrer'],
  ['Stu\u00ADdent*in\u00ADnen', 'Studenten'],
  ['Student\u200B*innen', 'Studenten'],
  ['Die Stu\u00ADdie\u00ADren\u00ADden', 'Die Studenten'],
  ['Student:innen', 'Studenten'],
  ['Student_innen', 'Studenten'],
  ['Student/innen', 'Studenten'],
  ['Student/-innen', 'Studenten'],
  ['Student·innen', 'Studenten'],
  ['StudentInnen', 'Studenten'],
  ['Student(inn)en', 'Studenten'],
  ['Lehrer*innen', 'Lehrer'],
  ['Lehrer(inn)en', 'Lehrer'],
  ['Ärzt*innen', 'Ärzte'],
  ['Fachärzt*innen', 'Fachärzte'],
  ['Anwält*innen', 'Anwälte'],
  ['Kolleg*innen', 'Kollegen'],
  ['Nachbar*innen', 'Nachbarn'],
  ['Biolog*innen', 'Biologen'],
  ['Kund*innen', 'Kunden'],
  ['Freund*innen', 'Freunde'],
  ['Expert*innen', 'Experten'],
  ['Jurist*innen', 'Juristen'],
  ['Besucher:innen', 'Besucher'],
  ['Chef*innen', 'Chefs'],
  ['Gäst*innen', 'Gäste'],
  // Singular
  ['Lehrer*in', 'Lehrer'],
  ['Lehrer/in', 'Lehrer'],
  ['Lehrer(in)', 'Lehrer'],
  ['Mitarbeiter:in', 'Mitarbeiter'],
  ['AutorIn', 'Autor'],
  ['Ärzt*in', 'Arzt'],
  ['Fachärzt*in', 'Facharzt'],
  ['Kolleg*in', 'Kollege'],
  ['Biolog*in', 'Biologe'],
  ['Kund*in', 'Kunde'],
  // Artikel davor
  ['die Lehrer*in', 'der Lehrer'],
  ['eine Ärzt*in', 'ein Arzt'],
  ['die Lehrer*innen', 'die Lehrer'],
  // Komposita
  ['SchülerInnenvertretung', 'Schülervertretung'],
  ['Schüler*innenvertretung', 'Schülervertretung'],
  // Determinierer
  ['jede*r', 'jeder'],
  ['Jede*r', 'Jeder'],
  ['jede*n', 'jeden'],
  ['jede/r', 'jeder'],
  ['jedeR', 'jeder'],
  ['eine*n Ärzt*in', 'einen Arzt'],
  ['ein*e Ärzt*in', 'ein Arzt'],
  ['keine*r', 'keiner'],
  ['jede*r Student*in', 'jeder Student'],
  // Artikel/Pronomen mit Schrägstrich
  ['der/die Lehrer*in', 'der Lehrer'],
  ['die/der Lehrer', 'der Lehrer'],
  ['Er/Sie', 'Er'],
  ['sie/er', 'er'],
  ['seine/ihre Aufgaben', 'seine Aufgaben'],
  ['ihm/ihr', 'ihm'],
  // Dativ-Kurzformen
  ['einem/r Tutor/in', 'einem Tutor'],
  ['Mit einem/r Tutor/in sprechen', 'Mit einem Tutor sprechen'],
  ['einer/m Tutor*in', 'einem Tutor'],
  ['einem*r Ärzt*in', 'einem Arzt'],
  ['jedem/r Student*in', 'jedem Studenten'],
  ['mit diesem:r Lehrer:in', 'mit diesem Lehrer'],
  ['einemR Autor', 'einem Autor'],
  ['des/der Lehrer*in', 'des Lehrers'],
  ['den/die Student*in', 'den Studenten'],
  // Fall bei Einzahlformen
  ['einem/r Patient*in', 'einem Patienten'],
  ['einer/m Kolleg*in', 'einem Kollegen'],
  ['mit unserem/r Kolleg/in', 'mit unserem Kollegen'],
  ['des Kolleg*in', 'des Kollegen'],
  ['des/der Ärzt*in', 'des Arztes'],
  ['Die Meinung des/der Expert*in', 'Die Meinung des Experten'],
  ['für Kolleg*in', 'für Kollegen'],
  ['mit Kolleg*in', 'mit Kollegen'],
  ['von Student*in', 'von Studenten'],
  ['ohne Tutor*in', 'ohne Tutor'],
  ['wegen Lehrer*in', 'wegen Lehrers'],
  ['mit der Kolleg*in', 'mit dem Kollegen'],
  ['von der Student*in', 'von dem Studenten'],
  ['wegen der Lehrer*in', 'wegen des Lehrers'],
  ['für die Kolleg*in', 'für den Kollegen'],
  ['für eine Kolleg*in', 'für einen Kollegen'],
  ['mit einer Tutor*in', 'mit einem Tutor'],
  ['mit erfahrenem Nachbar*in', 'mit erfahrenem Nachbarn'],
  ['dem Mensch*in', 'dem Menschen'],
  ['Kolleg*in', 'Kollege'],
  ['Patient*in', 'Patient'],
  ['Der Nachbar*in', 'Der Nachbar'],
  // Weitere Gender-Zeichen
  ['Student•innen', 'Studenten'],
  ['Student⋅innen', 'Studenten'],
  ['Student∙innen', 'Studenten'],
  ['Student‧innen', 'Studenten'],
  ['Student⋆innen', 'Studenten'],
  ['Student＊innen', 'Studenten'],
  ['Student：innen', 'Studenten'],
  ['Lehrer⋆in', 'Lehrer'],
  ['jede⋆r', 'jeder'],
  // Artikelpaare mit Stern oder Doppelpunkt
  ['der*die Nutzer*in', 'der Nutzer'],
  ['der:die Lehrer', 'der Lehrer'],
  ['die*der Lehrer', 'der Lehrer'],
  ['sie*er', 'er'],
  ['Er:Sie', 'Er'],
  ['seine*ihre Aufgaben', 'seine Aufgaben'],
  ['dem*der Lehrer', 'dem Lehrer'],
  ['ihm*ihr', 'ihm'],
  // Dativ Plural bei Genderformen
  ['mit Lehrer:innen', 'mit Lehrern'],
  ['von Ärzt*innen', 'von Ärzten'],
  ['mit den Lehrer*innen', 'mit den Lehrern'],
  ['mit den neuen Lehrer*innen', 'mit den neuen Lehrern'],
  ['bei Student(inn)en', 'bei Studenten'],
  ['mit allen Kolleg*innen', 'mit allen Kollegen'],
  ['von Nachbar*innen', 'von Nachbarn'],
  ['mit Chef*innen', 'mit Chefs'],
  ['Die Lehrer*innen', 'Die Lehrer'],
  ['Wir danken den Besucher:innen', 'Wir danken den Besuchern'],
  // Abkürzungen
  ['Entwickler (m/w/d) gesucht', 'Entwickler gesucht'],
  ['Entwickler m/w/d gesucht', 'Entwickler gesucht'],
  ['Pflegekraft (w/m/d)', 'Pflegekraft'],
  ['Koch [m/w/d*]', 'Koch'],
  ['Koch (m/w/d/x)', 'Koch'],
  ['Koch (m / w / d)', 'Koch'],
  ['Wir suchen (all genders) Leute', 'Wir suchen Leute'],
  ['Lehrer (gn)', 'Lehrer'],
  ['Ingenieur (m/w/divers)', 'Ingenieur'],
  ['Stellenangebot Pfleger:in (m/w/d)', 'Stellenangebot Pfleger'],
  // Doppelformen
  ['Patientinnen und Patienten', 'Patienten'],
  ['Die Patientinnen und Patienten warten.', 'Die Patienten warten.'],
  ['Ärztinnen und Ärzte', 'Ärzte'],
  ['Schülerinnen und Schüler', 'Schüler'],
  ['Lehrer und Lehrerinnen', 'Lehrer'],
  ['Bürgerinnen und Bürger', 'Bürger'],
  ['Kolleginnen und Kollegen', 'Kollegen'],
  ['Studentinnen und Studenten', 'Studenten'],
  ['Politikerinnen und Politiker', 'Politiker'],
  ['Patientin oder Patient', 'Patient'],
  ['die Ärztin oder der Arzt', 'der Arzt'],
  ['Die Ärztin oder der Arzt', 'Der Arzt'],
  ['Der Arzt oder die Ärztin', 'Der Arzt'],
  ['Student*innen und Studenten', 'Studenten'],
  ['Studenten und StudentInnen', 'Studenten'],
  ['mit Freunden und Freundinnen', 'mit Freunden'],
  // Überlappung mit abgelehntem Treffer
  ['jede*r Ärzt:in und alle Patientinnen und Patienten sind da', 'jeder Arzt und alle Patienten sind da'],
  ['Ärztinnen und Ärzte und Patientinnen und Patienten', 'Ärzte und Patienten'],
  ['Der Lehrer und die Schülerinnen und Schüler', 'Der Lehrer und die Schüler'],
  ['Die Lehrer/innen, der/die Schüler_in und die BürgerInnen kommen.', 'Die Lehrer, der Schüler und die Bürger kommen.'],
  // Substantivierte Partizipien
  ['Studierende', 'Studenten'],
  ['Die Studierenden sind da.', 'Die Studenten sind da.'],
  ['Es kommen Zuschauende.', 'Es kommen Zuschauer.'],
  ['Wir danken den Zuschauenden.', 'Wir danken den Zuschauern.'],
  ['Die Meinung der Studierenden zählt.', 'Die Meinung der Studenten zählt.'],
  ['Die Rechte der Lehrenden', 'Die Rechte der Lehrer'],
  ['mit Teilnehmenden', 'mit Teilnehmern'],
  ['viele Mitarbeitende', 'viele Mitarbeiter'],
  ['Die Zahl Studierender steigt.', 'Die Zahl Studenten steigt.'],
  ['alle Radfahrende', 'alle Radfahrer'],
  ['Hochschullehrende', 'Hochschullehrer'],
  ['Liebe Zuschauende, schön dass ihr da seid.', 'Liebe Zuschauer, schön dass ihr da seid.'],
  ['die jungen Studierenden', 'die jungen Studenten'],
  ['mit jungen Studierenden', 'mit jungen Studenten'],
  ['mit jungen Zuschauenden', 'mit jungen Zuschauern'],
  ['Studierende und Lehrende', 'Studenten und Lehrer'],
  // Satzumgebung
  ['Liebe Leser*innen, schön dass ihr da seid.', 'Liebe Leser, schön dass ihr da seid.'],
  ['Alle Teilnehmer*innen und Referent*innen kommen.', 'Alle Teilnehmer und Referenten kommen.']
];

for (const [input, expected] of CASES) {
  test('ersetzt: ' + input, () => {
    assert.equal(run(input), expected);
  });
}

const UNCHANGED = [
  'Kran\u00ADken\u00ADschwes\u00ADter',
  'Studentin',
  'Lehrerinnen',
  'Medizin und Medizinern',
  'Termin und Termine',
  'Magazin und Magazine',
  'LinkedIn',
  'Sign_in',
  'Ergebnis: in diesem Fall',
  'https://example.com/in',
  'Home/Index',
  'Wie geht es dir? Gut: und dir?',
  'Innenstadt und Außenbereich',
  'Binnenmarkt',
  // Partizipien als Adjektiv oder in Einzahl bleiben stehen
  'die studierende Tochter',
  'ein zuschauendes Kind',
  'die lehrende Tätigkeit',
  'die Studierende',
  'eine Studierende',
  'Der Studierende',
  'ein Studierender',
  'dem Studierenden',
  'des Studierenden',
  'Sie ist Studierende.',
  'Studierende Frauen in der Wissenschaft',
  'leitende Angestellte',
  'Das Ende der Legende',
  'die Anwesenden',
  'die Zugehörenden',
  'und/oder',
  'Rate (m/d)',
  'Wert (w/d)',
  'Geschwindigkeit in m/s',
  '2 m/w/d Wert',
  'Tag m/d',
  'mit Lehrern',
  'Studenten',
  'Der Arzt und die Pflegerin',
  ''
];

for (const input of UNCHANGED) {
  test('bleibt unverändert: ' + (input || '(leer)'), () => {
    assert.equal(run(input), input);
  });
}

test('alle Ergebnisse sind idempotent', () => {
  for (const [input] of CASES) {
    const once = run(input);
    assert.equal(run(once), once, input);
  }
});

test('Regeln lassen sich einzeln abschalten', () => {
  const o = E.buildOptions({ rules: { gap: false } });
  assert.equal(run('Student*innen', o), 'Student*innen');
  assert.equal(run('jede*r', o), 'jeder');
  const o2 = E.buildOptions({ rules: { doubles: false } });
  assert.equal(run('Patientinnen und Patienten', o2), 'Patientinnen und Patienten');
});

test('eigene Ersetzungen laufen vor den Regeln', () => {
  const o = E.buildOptions({ customReplacements: '# Kommentar\nStudierende = Studenten\nFoo→Bar' });
  assert.equal(run('Die Studierende lernen. Foo', o), 'Die Studenten lernen. Bar');
  assert.equal(run('Alle Studierende', o), 'Alle Studenten');
});

test('Ausnahmen werden nicht angefasst', () => {
  const o = E.buildOptions({ ignoreWords: 'Student*innen' });
  assert.equal(run('Student*innen und Lehrer*innen', o), 'Student*innen und Lehrer');
});

const onIndef = E.buildOptions({ rules: { indefinite: true } });
const INDEF = [
  ['wenn mensch das will', 'wenn man das will'],
  ['Wenn frau das will, dann geht es.', 'Wenn man das will, dann geht es.'],
  ['man/frau kann das', 'man kann das'],
  ['Man/frau kann das', 'Man kann das'],
  ['frau/man weiß', 'man weiß'],
  ['mensch/frau muss', 'man muss'],
  ['mensch*frau', 'man'],
  ['Mensch', 'Mensch'],
  ['Die Frau kommt.', 'Die Frau kommt.'],
  ['der Mensch und die Frau', 'der Mensch und die Frau'],
  ['Mensch/Frau', 'Mensch/Frau'],
  ['Frauenhaus und Menschenrechte', 'Frauenhaus und Menschenrechte']
];
for (const [input, expected] of INDEF) {
  test('mensch/frau an: ' + input, () => { assert.equal(run(input, onIndef), expected); });
}

test('mensch/frau ist standardmäßig aus', () => {
  assert.equal(run('wenn mensch das will'), 'wenn mensch das will');
  assert.equal(run('man/frau kann'), 'man/frau kann');
  assert.equal(E.DEFAULT_SETTINGS.rules.indefinite, false);
});

const onTerms = E.buildOptions({ rules: { oldTerms: true } });
const onHarsh = E.buildOptions({ rules: { oldTermsHarsh: true } });
const TERMS = [
  ['Die geflüchteten Menschen kamen an.', 'Die Flüchtlinge kamen an.'],
  ['Wir helfen Geflüchteten.', 'Wir helfen Flüchtlingen.'],
  ['Mit geflüchteten Menschen sprechen.', 'Mit Flüchtlingen sprechen.'],
  ['Viele Geflüchtete suchen Arbeit.', 'Viele Flüchtlinge suchen Arbeit.'],
  ['Die Geflüchteten sind da.', 'Die Flüchtlinge sind da.'],
  ['Der Wert der Geflüchteten', 'Der Wert der Flüchtlinge'],
  ['Hilfe für Asylsuchende und Schutzsuchende.', 'Hilfe für Asylanten und Asylanten.'],
  ['Die Asylsuchenden warten.', 'Die Asylanten warten.'],
  ['Menschen mit Behinderung brauchen Hilfe.', 'Behinderte brauchen Hilfe.'],
  ['Die Menschen mit Behinderung', 'Die Behinderten'],
  ['Für Menschen mit Behinderungen', 'Für Behinderte'],
  ['mit Menschen mit Behinderung', 'mit Behinderten'],
  ['Rechte von Menschen mit intellektueller Beeinträchtigung', 'Rechte von geistig Behinderten'],
  ['Menschen mit Autismus und autistische Menschen', 'Autisten und Autisten'],
  ['Menschen mit psychischer Erkrankung', 'Psychisch Kranke'],
  ['Hilfe für Menschen mit psychischer Erkrankung', 'Hilfe für psychisch Kranke'],
  ['Hilfe für obdachlose Menschen und Menschen ohne Wohnung', 'Hilfe für Obdachlose und Obdachlose'],
  ['Die obdachlosen Menschen', 'Die Obdachlosen'],
  ['mit obdachlosen Menschen', 'mit Obdachlosen'],
  ['Menschen ohne gesicherten Aufenthaltsstatus', 'Illegale Migranten'],
  ['Hilfe für Menschen ohne gesicherten Aufenthaltsstatus', 'Hilfe für illegale Migranten'],
  ['Rechte von trans Personen', 'Rechte von Transsexuellen'],
  ['trans Menschen', 'Transsexuelle'],
  ['versklavte Menschen', 'Sklaven'],
  ['Betroffene sexualisierter Gewalt berichten', 'Vergewaltigungsopfer berichten'],
  ['Die Überlebenden sexualisierter Gewalt', 'Die Vergewaltigungsopfer'],
  ['den Betroffenen sexualisierter Gewalt', 'den Vergewaltigungsopfern'],
  ['Hilfe für von Rassismus betroffene Menschen', 'Hilfe für Opfer von Rassismus'],
  ['mit den von Rassismus betroffenen Menschen', 'mit den Opfern von Rassismus'],
  ['Für BIPoC', 'Für nichtweiße Menschen'],
  ['Wir sprechen mit PoC.', 'Wir sprechen mit Farbigen.'],
  ['Für People of Color', 'Für Farbige'],
  ['Die BPoC kommen', 'Die Schwarzen kommen'],
  ['Die Rechte von BPoC', 'Die Rechte von Schwarzen'],
  ['PoC und BIPoC und BI_PoC', 'Farbige und nichtweiße Menschen und nichtweiße Menschen'],
  ['Ableismus und ableistische Strukturen', 'Behindertenfeindlichkeit und behindertenfeindliche Strukturen'],
  ['Menschen mit Einwanderungsgeschichte', 'Menschen mit Migrationshintergrund'],
  ['Die Einwanderungsgeschichte der Familie', 'Der Migrationshintergrund der Familie'],
  ['Mit einer Einwanderungsgeschichte', 'Mit einem Migrationshintergrund'],
  ['Eine Einwanderungsgeschichte', 'Ein Migrationshintergrund'],
  ['geschlechtsangleichende Maßnahmen', 'Geschlechtsumwandlungen'],
  ['Seine geschlechtsangleichende Maßnahme', 'Seine Geschlechtsumwandlung'],
  ['Ihre Transition und ihre trans Identität', 'Ihre Geschlechtsumwandlung und ihre trans Identität'],
  ['Auch Schwarze Frauen und die Schwarzen kamen.', 'Auch schwarze Frauen und die Schwarzen kamen.'],
  ['Schwarze Menschen leben hier.', 'Schwarze Menschen leben hier.'],
  ['Es kamen viele Schwarze Menschen.', 'Es kamen viele schwarze Menschen.'],
  ['Wo sind *weiße* Menschen?', 'Wo sind weiße Menschen?']
];
for (const [input, expected] of TERMS) {
  test('ältere Begriffe: ' + input, () => { assert.equal(run(input, onTerms), expected); });
}

const TERMS_UNCHANGED = [
  'Geflüchtete Familien kommen.',
  'Eine Geflüchtete sagte nichts.',
  'Dem Geflüchteten wurde geholfen.',
  'die Betroffene sexualisierter Gewalt',
  'Schwarzer Tee und Schwarzes Brett, Schwarze Witwe',
  'Energietransition',
  'Der PoC Exploit',
  'Ein Proof of Concept (PoC) für die Schwachstelle',
  'Meine geflüchtete Freundin',
  'Menschen',
  'Das Schwarze Meer',
  'der Mensch'
];
for (const input of TERMS_UNCHANGED) {
  test('ältere Begriffe: bleibt unverändert: ' + input, () => { assert.equal(run(input, onTerms), input); });
}

const HARSH = [
  ['Das N-Wort ist verboten', 'Das Wort Neger ist verboten'],
  ['Sie sagte N-Wort', 'Sie sagte Neger'],
  ['das Z-Wort', 'das Wort Zigeuner'],
  ['Die Geschichte des N-Wortes', 'Die Geschichte des Wortes Neger'],
  ['Wegen des Z-Wortes', 'Wegen des Wortes Zigeuner'],
  ['mit dem N-Wort', 'mit dem Wort Neger'],
  ['Die Nutzung eines N-Wortes ist falsch', 'Die Nutzung eines Wortes Neger ist falsch'],
  ['Ein Schokokuss und Schokoküsse und mit Schokoküssen', 'Ein Negerkuss und Negerküsse und mit Negerküssen'],
  ['Paprikasauce und Sauce ungarischer Art', 'Zigeunersauce und Zigeunersauce'],
  ['Paprikasoße', 'Zigeunersoße'],
  ['Paprikaschnitzel', 'Zigeunerschnitzel'],
  ['Sinti und Roma', 'Zigeuner'],
  ['Hilfe für Sinti und Roma', 'Hilfe für Zigeuner'],
  ['mit Sinti und Roma', 'mit Zigeunern']
];
for (const [input, expected] of HARSH) {
  test('abwertende Begriffe (eigener Schalter): ' + input, () => { assert.equal(run(input, onHarsh), expected); });
}

test('ältere Begriffe sind standardmäßig aus und die Schalter sind unabhängig', () => {
  for (const [input] of TERMS.concat(HARSH)) assert.equal(run(input), input);
  assert.equal(E.DEFAULT_SETTINGS.rules.oldTerms, false);
  assert.equal(E.DEFAULT_SETTINGS.rules.oldTermsHarsh, false);
  assert.equal(run('Das N-Wort und Menschen mit Behinderung', onTerms), 'Das N-Wort und Behinderte');
  assert.equal(run('Das N-Wort und Menschen mit Behinderung', onHarsh), 'Das Wort Neger und Menschen mit Behinderung');
});

test('Kursiv weiß: Großschreibung nur bei Hauptwort', () => {
  assert.equal(E.whiteItalic('weißen', 'die ', ' sind da'), 'Weißen');
  assert.equal(E.whiteItalic('weiße', 'Es gibt ', ' Menschen'), 'weiße');
  assert.equal(E.whiteItalic('weiß', 'Ich ', ' es'), 'weiß');
  assert.equal(E.whiteItalic('rot', 'die ', ' Menschen'), null);
});

test('Abkürzungen-Regel lässt sich abschalten', () => {
  const o = E.buildOptions({ rules: { abbreviations: false } });
  assert.equal(run('Entwickler (m/w/d)', o), 'Entwickler (m/w/d)');
});

test('Partizipien-Regel lässt sich abschalten', () => {
  const o = E.buildOptions({ rules: { participles: false } });
  assert.equal(run('Studierende', o), 'Studierende');
});

test('Seitenliste erkennt Unterdomains', () => {
  assert.equal(E.siteDisabled(['example.com'], 'www.example.com'), true);
  assert.equal(E.siteDisabled(['example.com'], 'example.com'), true);
  assert.equal(E.siteDisabled(['example.com'], 'notexample.com'), false);
});

test('Einstellungen werden mit Standardwerten aufgefüllt', () => {
  const s = E.mergeSettings({ rules: { gap: false } });
  assert.equal(s.enabled, true);
  assert.equal(s.rules.gap, false);
  assert.equal(s.rules.doubles, true);
});

// --- Anglizismen (nur mit opts.german) ---
const onAng = E.buildOptions(Object.assign({}, E.DEFAULT_SETTINGS, { rules: Object.assign({}, E.DEFAULT_SETTINGS.rules, { anglicisms: true }) }));
onAng.german = true;
const ANG = [
  ['Diversity ist wichtig.', 'Vielfalt ist wichtig.'],
  ['Die Diversity im Team', 'Die Vielfalt im Team'],
  ['Das Empowerment der Frauen', 'Die Ermächtigung der Frauen'],
  ['Mit dem Empowerment', 'Mit der Ermächtigung'],
  ['Die Awareness wächst.', 'Das Bewusstsein wächst.'],
  ['Wir brauchen mehr Awareness.', 'Wir brauchen mehr Bewusstsein.'],
  ['mit der Awareness', 'mit dem Bewusstsein'],
  ['wegen der Awareness', 'wegen des Bewusstseins'],
  ['Eine neue Awareness', 'Eine neue Awareness'],
  ['Das Ragebait nervt.', 'Der Wutköder nervt.'],
  ['Ich hasse das Ragebait', 'Ich hasse das Ragebait'],
  ['Viele Ragebaits', 'Viele Wutköder'],
  ['Sie wollen ragebaiten', 'Sie wollen wutködern'],
  ['Ragebaiten ist doof', 'Wutködern ist doof'],
  ['ein Safe Space', 'ein Schutzraum'],
  ['Mit Safe Spaces', 'Mit Schutzräumen'],
  ['die Safe Spaces', 'die Schutzräume'],
  ['des Safe Spaces', 'des Schutzraums'],
  ['die Homepage', 'die Startseite'],
  ['zwei Homepages', 'zwei Startseiten'],
  ['der Content', 'der Inhalt'],
  ['des Contents', 'des Inhalts'],
  ['viele Contents', 'viele Inhalte'],
  ['Content Marketing', 'Content Marketing'],
  ['Content-Marketing', 'Content-Marketing'],
  ['Webcontent', 'Webcontent'],
  ['Ein Content Creator', 'Ein Inhalteproduzent'],
  ['Viele Content Creators', 'Viele Inhalteproduzenten'],
  ['dem Content Creator', 'dem Inhalteproduzenten'],
  ['den Creators', 'den Gestaltern'],
  ['Creator Studio', 'Creator Studio'],
  ['YouTube Shorts', 'YouTube Kurzvideos'],
  ['ein YouTube Short', 'ein YouTube Kurzvideo'],
  ['Shorts im Sommer', 'Shorts im Sommer'],
  ['meine Wishlist', 'meine Wunschliste'],
  ['Wish List', 'Wunschliste'],
  ['die Wishlists', 'die Wunschlisten']
];
ANG.push(
  ['Das Feedback war gut.', 'Die Rückmeldung war gut.'],
  ['Vielen Dank für das Feedback!', 'Vielen Dank für die Rückmeldung!'],
  ['Wir freuen uns über Feedback.', 'Wir freuen uns über Rückmeldung.'],
  ['Wir freuen uns über konstruktives Feedback.', 'Wir freuen uns über konstruktives Feedback.'],
  ['Ein neues Update erscheint.', 'Ein neues Update erscheint.'],
  ['Das Update ist da.', 'Die Aktualisierung ist da.'],
  ['Im Update steckt viel.', 'In der Aktualisierung steckt viel.'],
  ['Zum Update', 'Zur Aktualisierung'],
  ['Die Updates sind da', 'Die Aktualisierungen sind da'],
  ['Wir updaten morgen. Updaten dauert.', 'Wir aktualisieren morgen. Aktualisieren dauert.'],
  ['Der Download startet.', 'Das Herunterladen startet.'],
  ['Beim Download', 'Beim Herunterladen'],
  ['Die Downloads', 'Die Downloads'],
  ['Upload und Download', 'Hochladen und Herunterladen'],
  ['Wir uploaden und downloaden', 'Wir hochladen und herunterladen'],
  ['Bis zur Deadline', 'Bis zur Frist'],
  ['Das Meeting beginnt.', 'Die Besprechung beginnt.'],
  ['Ins Meeting', 'In die Besprechung'],
  ['Ein Video Call, ein Conference Call', 'Ein Videoanruf, eine Telefonkonferenz'],
  ['Das Kickoff', 'Der Auftakt'],
  ['Im Workshop', 'Im Arbeitstreffen'],
  ['Unser Newsletter, die Newsletter', 'Unser Rundbrief, die Rundbriefe'],
  ['Beim Login', 'Bei der Anmeldung'],
  ['Login-Daten', 'Login-Daten'],
  ['Der Reset', 'Das Zurücksetzen'],
  ['Im Account. Account Manager', 'Im Konto. Account Manager'],
  ['Der Support hilft. Support Center', 'Der Kundendienst hilft. Support Center'],
  ['Bei der Hotline', 'Bei dem Telefondienst'],
  ['Der Newsfeed, die Timeline', 'Der Nachrichtenstrom, die Zeitleiste'],
  ['Die Follower, ein Follower, mit Followern, Follower gewinnen', 'Die Abonnenten, ein Abonnent, mit Abonnenten, Abonnenten gewinnen'],
  ['Die Influencer, des Influencers', 'Die Meinungsmacher, des Meinungsmachers'],
  ['Im Shitstorm', 'In der Empörungswelle'],
  ['Mit Fake News', 'Mit Falschmeldungen'],
  ['Hate Speech, Cyberbullying', 'Hassrede, Cybermobbing'],
  ['Triggerwarnung, Trigger-Warnung, Content Warning, Triggerwarnungen', 'Inhaltswarnung, Inhaltswarnung, Inhaltswarnung, Inhaltswarnungen'],
  ['Im Mindset', 'In der Einstellung'],
  ['Der Screenshot. Die Screenshots. Im Screenshot', 'Das Bildschirmfoto. Die Bildschirmfotos. Im Bildschirmfoto'],
  ['Ihre E-Mail, Ihre E-Mail-Adresse, die E-Mails', 'Ihre E-Post, Ihre E-Mail-Adresse, die E-Mails'],
  ['in der Cloud, Cloud-Speicher', 'in der Datenwolke, Cloud-Speicher'],
  ['Das Selfie, die Selfies', 'Das Eigenfoto, die Eigenfotos'],
  ['Der Hashtag, die Hashtags, des Hashtags', 'Das Schlagwort, die Schlagworte, des Schlagworts'],
  ['Der Livestream, im Livestream, ein Stream, die Streams, Streaming', 'Die Direktübertragung, in der Direktübertragung, eine Übertragung, die Übertragungen, Streaming'],
  ['Die Gamer, ein Gamer', 'Die Spieler, ein Spieler'],
  ['Im Homeoffice, Home Office', 'In der Heimarbeit, Heimarbeit'],
  ['Remote Work, das Recruiting, im Onboarding', 'Fernarbeit, die Personalgewinnung, in der Einarbeitung'],
  ['Die Teamleads', 'Die Teamleiter'],
  ['Die Performance, Performance Marketing', 'Die Leistung, Performance Marketing'],
  ['Der Skill, die Skills', 'Die Fähigkeit, die Fähigkeiten'],
  ['Das Know-how, Know-how-Transfer', 'Das Wissen-wie, Know-how-Transfer'],
  ['Beim Brainstorming', 'Bei der Ideensammlung'],
  ['Ein Benchmark, die Roadmap, Roadmaps', 'Ein Vergleichswert, der Fahrplan, Fahrpläne'],
  ['Der Sale, im Sale', 'Der Ausverkauf, im Ausverkauf'],
  ['Der Voucher, der Coupon, Coupon Code, die Coupons', 'Der Gutschein, der Gutschein, Coupon Code, die Gutscheine'],
  ['Zum Checkout, der Checkout', 'Zur Kasse, die Kasse'],
  ['Dein Cart, im Shopping Cart, Go-Cart', 'Dein Warenkorb, im Warenkorb, Go-Cart'],
  ['Die Delivery, Delivery Hero', 'Die Lieferung, Delivery Hero'],
  ['Der Refund, die Refunds', 'Die Rückerstattung, die Rückerstattungen'],
  ['Wir networken, mit Netzwerken', 'Wir vernetzen, mit Netzwerken'],
  ['Ein Brave Space', 'Ein Mutraum'],
  ['Im Empowerment', 'In der Ermächtigung'],
  ['Zur Awareness', 'Zum Bewusstsein'],
  ['Ins Homeoffice', 'In die Heimarbeit']
);
for (const [input, want] of ANG) {
  test('Anglizismen: ' + input, () => { assert.equal(run(input, onAng), want); });
}
test('Anglizismen: Standard aus', () => { assert.equal(run('Diversity und Content'), 'Diversity und Content'); });
test('Anglizismen: nicht auf nicht-deutschen Seiten', () => {
  const o = E.buildOptions(onAng.rules ? { rules: onAng.rules } : E.DEFAULT_SETTINGS);
  assert.equal(o.german, false);
  assert.equal(run('Diversity und Content', o), 'Diversity und Content');
});

// --- Zähler je Regelgruppe und Unterschiede ---
test('Statistik: Zähler je Regelgruppe', () => {
  const st = {};
  const out = E.entgender('Liebe Student*innen und Studenten, wir suchen Pfleger:innen (m/w/d). Diversity!', onAng, st);
  assert.equal(out, 'Liebe Studenten, wir suchen Pfleger. Vielfalt!');
  assert.equal(st.abbreviations, 1);
  assert.equal(st.doubles, 1);
  assert.equal(st.gap, 1);
  assert.equal(st.anglicisms, 1);
});
test('Statistik: nichts geändert, nichts gezählt', () => {
  const st = {};
  E.entgender('Ganz normaler Satz ohne Besonderheiten.', onAng, st);
  assert.deepEqual(st, {});
});
test('Statistik: eigene Ersetzungen', () => {
  const o = E.buildOptions({ customReplacements: 'foo = bar' });
  const st = {};
  assert.equal(E.entgender('ein foo und noch ein foo', o, st), 'ein bar und noch ein bar');
  assert.equal(st.custom, 2);
});
test('diffRanges: ein Wort', () => {
  const h = E.diffRanges('Die Student*innen kommen', 'Die Studenten kommen');
  assert.equal(h.length, 1);
  assert.deepEqual(h[0].a, [4, 17]);
  assert.deepEqual(h[0].b, [4, 13]);
});
test('diffRanges: gelöschtes Wort markiert Nachbarwort', () => {
  const h = E.diffRanges('Wir suchen Pfleger (m/w/d) heute', 'Wir suchen Pfleger heute');
  assert.equal(h.length, 1);
  assert.ok(h[0].a[1] > h[0].a[0] && h[0].b[1] > h[0].b[0]);
});
test('diffRanges: gleiche Texte', () => { assert.deepEqual(E.diffRanges('abc def', 'abc def'), []); });
test('Einstellungen: erweiterte Ansicht standardmäßig aus', () => {
  const s = E.mergeSettings();
  assert.equal(s.extendedView, false);
  assert.equal(s.highlight, false);
  assert.equal(s.rules.anglicisms, false);
});

test('Zitate in Anführungszeichen: standardmäßig verändert, optional nicht', () => {
  const q = E.buildOptions({ skipQuotes: true });
  assert.equal(run('Er sagte „Liebe Kolleg*innen“ und die Lehrer*innen kamen.'), 'Er sagte „Liebe Kollegen“ und die Lehrer kamen.');
  assert.equal(run('Er sagte „Liebe Kolleg*innen“ und die Lehrer*innen kamen.', q), 'Er sagte „Liebe Kolleg*innen“ und die Lehrer kamen.');
  assert.equal(run('Sie rief "Schüler*innen" laut: Student*innen!', q), 'Sie rief "Schüler*innen" laut: Studenten!');
  assert.equal(run('»Ärzt:innen« und Pfleger:innen', q), '»Ärzt:innen« und Pfleger');
  assert.equal(E.mergeSettings().skipQuotes, false);
});

test('Phettberg-Gendern', () => {
  assert.equal(run('Liebe Lesys,'), 'Liebe Leser,');
  assert.equal(run('Wir danken den Lesys'), 'Wir danken den Lesern');
  assert.equal(run('Das Lehry kommt.'), 'Der Lehrer kommt.');
  assert.equal(run('Ich sehe dem Lehry zu'), 'Ich sehe dem Lehrer zu');
  assert.equal(run('des Lehrys Buch'), 'des Lehrers Buch');
  assert.equal(run('Dem Kundy'), 'Dem Kunden');
  assert.equal(run('Babys und Partys'), 'Babys und Partys');
  const s = {};
  assert.equal(run('Die Lesys', E.buildOptions({})), 'Die Leser');
  E.entgender('Die Lesys', opts, s);
  assert.deepEqual(s, { phettberg: 1 });
  const off = E.buildOptions({ rules: { phettberg: false } });
  assert.equal(run('Die Lesys', off), 'Die Lesys');
  const nogap = E.buildOptions({ rules: { gap: false } });
  assert.equal(run('Die Lesys', nogap), 'Die Leser');
  assert.equal(E.mergeSettings().rules.phettberg, true);
});

test('Phettberg-Gendern: Wortliste der Quelle', () => {
  const C = [
    ['Menschy', 'Mensch'], ['Persony', 'Person'], ['Das Nothelfy', 'Der Nothelfer'], ['Nothelfys', 'Nothelfer'],
    ['Das Hilfskrafty', 'Die Hilfskraft'], ['Demonstrantys', 'Demonstranten'], ['Das Lehrly', 'Der Lehrling'],
    ['Die Ärztys', 'Die Ärzte'], ['Mit den Ärztys', 'Mit den Ärzten'], ['Das Kellny', 'Der Kellner'], ['Die Kellnys', 'Die Kellner'],
    ['Die Rauchys', 'Die Raucher'], ['Das Rauchy', 'Der Raucher'], ['Das Kritiky', 'Der Kritiker'], ['Die Kritikys', 'Die Kritiker'],
    ['Das Arzty', 'Der Arzt'], ['Die Extrovertiertys', 'Die Extrovertierten'], ['Deutschys', 'Deutsche'], ['Von den Deutschys', 'Von den Deutschen'],
    ['Österreichys', 'Österreicher'], ['Gotty', 'Gott'], ['Bürgermeisty', 'Bürgermeister'], ['Bürgymeisty', 'Bürgermeister'],
    ['Liebes Lesy,', 'Lieber Leser,'], ['Maler.innen', 'Maler'], ['Maler’innen', 'Maler']
  ];
  C.forEach(function (c) { assert.equal(run(c[0]), c[1], c[0]); });
});

test('Artikelpaar ohne Hauptwort danach und kursives Weißsein', () => {
  assert.equal(run('der*die neue Kollege'), 'der neue Kollege');
  assert.equal(run('Wer ist der*die?'), 'Wer ist der?');
  assert.equal(run('Der/die Beste'), 'Der Beste');
  assert.equal(E.whiteItalic('Weißsein', 'das ', ' ist'), 'Weißsein');
  assert.equal(E.whiteItalic('weißseins', '', ''), 'weißseins');
});

// Erweiterte Anglizismenliste
for (const [input, want] of [["Der Airbag löste aus", "Das Prallkissen löste aus"], ["Die Airline fliegt", "Die Luftfahrtgesellschaft fliegt"], ["Der Alien landet", "Der Außerirdische landet"], ["Ein Alien landet", "Ein Außerirdischer landet"], ["Mit den Aliens", "Mit den Außerirdischen"], ["Aliens sind da", "Außerirdische sind da"], ["des Aliens", "des Außerirdischen"], ["Er ist ausgepowert", "Er ist ausgelaugt"], ["ein cooler Typ", "ein lässiger Typ"], ["Das ist fair", "Das ist gerecht"], ["Eine faire Chance", "Eine gerechte Gelegenheit"], ["Die Fairness", "Die Gerechtigkeit"], ["Das Baby schläft", "Der Säugling schläft"], ["mit den Babys", "mit den Säuglingen"], ["Die Barkeeperin", "Die Barfrau"], ["Die Champions League", "Die Champions League"], ["dem Callboy", "dem Lustknaben"], ["Wir chillen", "Wir faulenzen"], ["nicht dissen", "nicht verhöhnen"], ["mit den Computern", "mit den Rechnern"], ["Das Webdesign", "Das Webdesign"], ["durch E-Learning", "durch elektronische Bildung"], ["Das E-Learning", "Die elektronische Bildung"], ["den Fans", "den Bewunderern"], ["High-Heels", "Stöckelschuhe"], ["im Internet", "im Netz"], ["Die Ladies", "Die Damen"], ["Die Limited Edition", "Die begrenzte Auflage"], ["Der Insider", "Der Eingeweihte"], ["Der Insiderhandel", "Das Vorwissengeschäft"], ["Die Partys", "Die Feiern"], ["Das Make-up", "Die Schminke"], ["Er ist Teenager", "Er ist Jugendlicher"], ["den Teenagern", "den Jugendlichen"], ["Content Marketing", "Content Marketing"], ["Das Marketing", "Die Vermarktung"], ["Die T-Shirts", "Die T-Hemden"], ["Das Anti-Aging", "Der Altershemmer"], ["Die Lyrics", "Die Liedtexte"], ["Der Whistleblower", "Der Aufdecker"]]) {
  test('Anglizismen (erweitert): ' + input, () => { assert.equal(run(input, onAng), want); });
}

test('Leerzeichen um das Genderzeichen', () => {
  assert.equal(run('Physiotherapeut *in'), 'Physiotherapeut');
  assert.equal(run('Wir suchen Physiotherapeut *innen'), 'Wir suchen Physiotherapeuten');
  assert.equal(run('Physiotherapeut* in'), 'Physiotherapeut');
  assert.equal(run('Physiotherapeut * in'), 'Physiotherapeut');
  assert.equal(run('Physiotherapeut /in'), 'Physiotherapeut');
  assert.equal(run('Beispiel: in der Tat'), 'Beispiel: in der Tat');
  assert.equal(run('Er und/ in'), 'Er und/ in');
  assert.equal(run('Das 2 * in der Mitte'), 'Das 2 * in der Mitte');
});

test('Abkürzungen mit Trennstrich oder senkrechtem Strich, Schrägstrich mit großem I', () => {
  assert.equal(run('Tischler - m|w|d'), 'Tischler');
  assert.equal(run('Tischler m|w|d'), 'Tischler');
  assert.equal(run('Tischler – m/w/d gesucht'), 'Tischler gesucht');
  assert.equal(run('Tischler | m/w/d | Vollzeit'), 'Tischler | Vollzeit');
  assert.equal(run('Menü | Start | Hilfe'), 'Menü | Start | Hilfe');
  assert.equal(run('Das ist a|b|c'), 'Das ist a|b|c');
  assert.equal(run('Tischler/In'), 'Tischler');
  assert.equal(run('Wir suchen Tischler/Innen'), 'Wir suchen Tischler');
});

test('Berufe auf -mann/-frau', () => {
  assert.equal(run('Kaufmann:frau'), 'Kaufmann');
  assert.equal(run('Ein Kaufmann/-frau gesucht'), 'Ein Kaufmann gesucht');
  assert.equal(run('Kauffrau/mann'), 'Kaufmann');
  assert.equal(run('Kaufmänner:frauen'), 'Kaufmänner');
  assert.equal(run('Mann/Frau'), 'Mann/Frau');
});
