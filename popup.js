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

  function render(info) {
    $('enabled').checked = settings.enabled;
    if (!info) {
      $('site').disabled = true;
      $('site').checked = false;
      $('siteLabel').textContent = 'Auf dieser Seite nicht verfügbar';
      $('count').textContent = '';
      return;
    }
    host = info.host;
    $('site').disabled = !host;
    $('site').checked = !E.siteDisabled(settings.disabledSites, host);
    $('siteLabel').textContent = host ? 'Auf ' + host + ' aktiv' : 'Auf dieser Seite aktiv';
    $('count').textContent = settings.enabled && $('site').checked
      ? (info.count === 1 ? '1 Stelle auf dieser Seite angepasst' : info.count + ' Stellen auf dieser Seite angepasst')
      : 'Auf dieser Seite deaktiviert';
  }

  function getTotal(tab, fallback) {
    return new Promise(function (resolve) {
      if (!tab || tab.id == null) return resolve(fallback);
      chrome.runtime.sendMessage({ type: 'entgender:get', tabId: tab.id }, function (n) {
        void chrome.runtime.lastError;
        resolve(typeof n === 'number' ? n : fallback);
      });
    });
  }

  async function refresh() {
    const tab = await activeTab();
    const info = await getInfo(tab);
    if (info) info.count = await getTotal(tab, info.count);
    render(info);
  }

  $('enabled').addEventListener('change', function () {
    settings.enabled = $('enabled').checked;
    save();
    setTimeout(refresh, 400);
  });

  $('site').addEventListener('change', function () {
    const bare = host.replace(/^www\./, '');
    settings.disabledSites = settings.disabledSites.filter(function (d) {
      return !(host === d || host.endsWith('.' + d));
    });
    if (!$('site').checked) settings.disabledSites.push(bare);
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
