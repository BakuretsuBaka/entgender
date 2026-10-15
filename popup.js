(function () {
  'use strict';

  const E = globalThis.Entgender;
  const $ = function (id) { return document.getElementById(id); };
  let settings = E.mergeSettings();
  let host = '';

  function load() {
    return new Promise(function (resolve) {
      chrome.storage.sync.get('settings', function (res) {
        settings = E.mergeSettings(res && res.settings);
        resolve();
      });
    });
  }

  function save() {
    chrome.storage.sync.set({ settings: settings });
  }

  function activeTab() {
    return new Promise(function (resolve) {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        resolve(tabs && tabs[0]);
      });
    });
  }

  function getInfo(tab) {
    return new Promise(function (resolve) {
      if (!tab || tab.id == null) return resolve(null);
      chrome.tabs.sendMessage(tab.id, { type: 'entgender:info' }, { frameId: 0 }, function (res) {
        void chrome.runtime.lastError;
        resolve(res || null);
      });
    });
  }

  const TYPES = [
    ['gap', 'Genderzeichen und Binnen-I'],
    ['doubles', 'Doppelformen'],
    ['determiners', 'Artikel mit Genderzeichen'],
    ['articles', 'Artikel- und Pronomenpaare'],
    ['participles', 'Partizipien'],
    ['abbreviations', 'Abkürzungen (m/w/d)'],
    ['phettberg', 'Phettberg-Formen (-y, -ys)'],
    ['indefinite', '"mensch" und "frau" als "man"'],
    ['oldTerms', 'Ältere Begriffe'],
    ['oldTermsHarsh', 'Abwertende Begriffe'],
    ['anglicisms', 'Anglizismen'],
    ['custom', 'Eigene Ersetzungen']
  ];

  function num(n) { return Number(n).toLocaleString('de-DE'); }

  function renderExtended(info) {
    const ext = $('ext');
    ext.hidden = !settings.extendedView;
    if (!settings.extendedView) return;
    $('hl').checked = settings.highlight;
    $('hlNote').textContent = info && info.hl === false
      ? 'Dieser Browser kann Wörter nicht markieren.'
      : 'Grün: ersetzt. Rot: würde ersetzt, wenn die Erweiterung an wäre.';
    const list = $('types');
    list.textContent = '';
    const by = (info && info.by) || {};
    let any = false;
    TYPES.forEach(function (t) {
      if (!by[t[0]]) return;
      any = true;
      const li = document.createElement('li');
      const name = document.createElement('span');
      name.textContent = t[1];
      const n = document.createElement('span');
      n.textContent = num(by[t[0]]);
      li.appendChild(name);
      li.appendChild(n);
      list.appendChild(li);
    });
    if (!any) {
      const li = document.createElement('li');
      li.className = 'muted';
      li.textContent = info ? 'Noch nichts angepasst' : '–';
      list.appendChild(li);
    }
    chrome.storage.local.get('total', function (r) {
      $('total').textContent = num((r && r.total) || 0);
    });
  }

  function render(info) {
    if (!info) {
      // Browserseiten, Stores und vor der Installation geöffnete Seiten: dort läuft kein Skript
      $('site').hidden = true;
      $('siteLabel').textContent = 'Diese Seite wird nicht unterstützt';
      $('count').textContent = 'Das gilt für Browserseiten, Stores und Seiten, die schon vor der Installation offen waren (dann neu laden).';
      renderExtended(null);
      return;
    }
    host = info.host;
    $('site').hidden = false;
    $('site').disabled = !host;
    $('site').checked = !E.siteDisabled(settings.disabledSites, host);
    $('siteLabel').textContent = host ? 'Auf ' + host + ' aktiv' : 'Auf dieser Seite aktiv';
    const on = $('site').checked;
    if (on) {
      $('count').textContent = info.count === 1 ? '1 Stelle auf dieser Seite angepasst' : info.count + ' Stellen auf dieser Seite angepasst';
    } else if (info.mode === 'detect') {
      $('count').textContent = info.count === 1 ? 'Aus. 1 Stelle würde ersetzt.' : 'Aus. ' + info.count + ' Stellen würden ersetzt.';
    } else {
      $('count').textContent = 'Auf dieser Seite ausgeschaltet';
    }
    renderExtended(info);
  }

  function getSummary(tab, fallback) {
    return new Promise(function (resolve) {
      if (!tab || tab.id == null) return resolve(fallback);
      chrome.runtime.sendMessage({ type: 'entgender:get', tabId: tab.id }, function (r) {
        void chrome.runtime.lastError;
        resolve(r && typeof r === 'object' ? r : fallback);
      });
    });
  }

  async function refresh() {
    const tab = await activeTab();
    const info = await getInfo(tab);
    if (info) {
      const sm = await getSummary(tab, null);
      if (sm) { info.count = sm.count; info.by = sm.by; info.mode = sm.mode; }
    }
    render(info);
  }

  $('site').addEventListener('change', function () {
    const bare = host.replace(/^www\./, '');
    settings.disabledSites = settings.disabledSites.filter(function (d) {
      return !(host === d || host.endsWith('.' + d));
    });
    if (!$('site').checked) settings.disabledSites.push(bare);
    save();
    setTimeout(refresh, 400);
  });

  $('hl').addEventListener('change', function () {
    settings.highlight = $('hl').checked;
    save();
    setTimeout(refresh, 400);
  });

  $('opts').addEventListener('click', function (e) {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
    window.close();
  });

  load().then(refresh);
})();
