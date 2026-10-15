'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const E = require('../rules.js');

const opts = E.buildOptions(E.DEFAULT_SETTINGS);
const run = function (s, o) { return E.entgender(s, o || opts); };

const CASES = [
  // Genderzeichen, Plural
  ['Student*innen', 'Studenten'],
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
  ['Wir sprechen mit PoC.', 'Wir sprechen mit schwarzen Menschen.'],
  ['PoC und BIPoC und BI_PoC', 'Schwarze Menschen und nichtweiße Menschen und nichtweiße Menschen'],
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
