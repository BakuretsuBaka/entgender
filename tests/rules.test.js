'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const E = require('../rules.js');

const opts = E.buildOptions(E.DEFAULT_SETTINGS);
const run = function (s, o) { return E.entgender(s, o || opts); };

const CASES = [
  // Genderzeichen, Plural
  ['Student*innen', 'Studenten'],
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
  ['jedem/r Student*in', 'jedem Student'],
  ['mit diesem:r Lehrer:in', 'mit diesem Lehrer'],
  ['einemR Autor', 'einem Autor'],
  ['des/der Lehrer*in', 'des Lehrer'],
  ['den/die Student*in', 'den Student'],
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
