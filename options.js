(function () {
  'use strict';

  const E = globalThis.Entgender;
  const $ = function (id) { return document.getElementById(id); };
  const SAMPLE =
    'Liebe Student*innen und Studenten, jede*r Ärzt:in und alle Patientinnen und Patienten ' +
    'sind eingeladen. Die Lehrer/innen, der/die Schüler_in und die BürgerInnen kommen auch. ' +
    'Auch alle Studierenden und Zuschauende sind willkommen.';
  let settings = E.mergeSettings();
  let saveTimer = 0;

  function fromForm() {
    return {
      enabled: settings.enabled,
      onlyGerman: $('onlyGerman').checked,
      disabledSites: $('sites').value.split(/[\r\n,]+/).map(function (x) {
        return x.trim().toLowerCase();
      }).filter(Boolean),
      rules: {
        gap: $('r-gap').checked,
        doubles: $('r-doubles').checked,
        determiners: $('r-determiners').checked,
        articles: $('r-articles').checked,
        participles: $('r-participles').checked
      },
      customReplacements: $('custom').value,
      ignoreWords: $('ignore').value
    };
  }

  function toForm(s) {
    $('onlyGerman').checked = s.onlyGerman;
    $('sites').value = s.disabledSites.join('\n');
    $('r-gap').checked = s.rules.gap;
    $('r-doubles').checked = s.rules.doubles;
    $('r-determiners').checked = s.rules.determiners;
    $('r-articles').checked = s.rules.articles;
    $('r-participles').checked = s.rules.participles;
    $('custom').value = s.customReplacements;
    $('ignore').value = s.ignoreWords;
  }

  function preview() {
    $('out').value = E.entgender($('in').value, E.buildOptions(fromForm()));
  }

  function save() {
    settings = E.mergeSettings(fromForm());
    chrome.storage.sync.set({ settings: settings }, function () {
      $('status').textContent = 'Gespeichert';
      setTimeout(function () { $('status').textContent = ''; }, 1500);
    });
  }

  function changed() {
    preview();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(save, 400);
  }

  ['onlyGerman', 'sites', 'r-gap', 'r-doubles', 'r-determiners', 'r-articles', 'r-participles', 'custom', 'ignore']
    .forEach(function (id) {
      $(id).addEventListener('input', changed);
      $(id).addEventListener('change', changed);
    });
  $('in').addEventListener('input', preview);

  $('reset').addEventListener('click', function () {
    const keep = settings.enabled;
    settings = E.mergeSettings({ enabled: keep });
    toForm(settings);
    preview();
    chrome.storage.sync.set({ settings: settings });
    $('status').textContent = 'Zurückgesetzt';
  });

  chrome.storage.sync.get('settings', function (res) {
    settings = E.mergeSettings(res && res.settings);
    toForm(settings);
    $('in').value = SAMPLE;
    preview();
  });
})();
