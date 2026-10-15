// Entgender: Service-Worker. Sammelt die Zähler aller Frames eines Tabs, zeigt die Summe
// als Badge am Symbol der Erweiterung an (wie bei einem Adblocker) und führt den Gesamtzähler.
'use strict';

const KEY = 'counts';
let queue = Promise.resolve();

async function load() {
  const r = await chrome.storage.session.get(KEY);
  return r[KEY] || {};
}

function save(o) {
  return chrome.storage.session.set({ [KEY]: o });
}

// Pro Frame: { n: Ersetzungen, by: Aufteilung nach Regelgruppe, m: Modus }
function frames(o, tabId) {
  return Object.values(o[tabId] || {}).filter(function (f) { return f && typeof f === 'object'; });
}

// Badge: nur tatsächlich ersetzte Stellen
function total(o, tabId) {
  return frames(o, tabId).reduce(function (a, f) { return a + (f.m === 'on' ? f.n : 0); }, 0);
}

function summary(o, tabId) {
  const fr = frames(o, tabId);
  const by = {};
  let n = 0;
  fr.forEach(function (f) {
    n += f.n;
    for (const k in f.by) by[k] = (by[k] || 0) + f.by[k];
  });
  const mode = fr.some(function (f) { return f.m === 'on'; }) ? 'on'
    : fr.some(function (f) { return f.m === 'detect'; }) ? 'detect' : 'off';
  return { count: n, by: by, mode: mode };
}

function format(n) {
  if (n <= 0) return '';
  if (n >= 10000) return Math.round(n / 1000) + 'k';
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return String(n);
}

async function setBadge(tabId, n) {
  try {
    await chrome.action.setBadgeBackgroundColor({ tabId: tabId, color: '#2f7d4f' });
    if (chrome.action.setBadgeTextColor) {
      await chrome.action.setBadgeTextColor({ tabId: tabId, color: '#ffffff' });
    }
    await chrome.action.setBadgeText({ tabId: tabId, text: format(n) });
  } catch (e) {
    // Tab wurde inzwischen geschlossen.
  }
}

// Symbol: normal, oder rot ohne Balken, wenn die Erweiterung auf dieser Seite ausgeschaltet ist
async function setIcon(tabId, paused) {
  const pre = paused ? 'icons/icon-off' : 'icons/icon';
  try {
    await chrome.action.setIcon({
      tabId: tabId,
      path: { 16: pre + '16.png', 48: pre + '48.png', 128: pre + '128.png' },
    });
  } catch (e) {
    // Tab wurde inzwischen geschlossen.
  }
}

function enqueue(fn) {
  queue = queue.then(fn).catch(function () {});
  return queue;
}

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (!msg) return;

  if (msg.type === 'entgender:count' && sender.tab) {
    const tabId = sender.tab.id;
    enqueue(async function () {
      const o = await load();
      if (msg.init && sender.frameId === 0) o[tabId] = {};
      o[tabId] = o[tabId] || {};
      o[tabId][sender.frameId] = { n: msg.count || 0, by: msg.by || {}, m: msg.mode || 'off' };
      await save(o);
      await setBadge(tabId, total(o, tabId));
      if (sender.frameId === 0) await setIcon(tabId, !!msg.paused);
      // Gesamtzähler seit der Installation
      if (msg.add > 0) {
        const r = await chrome.storage.local.get('total');
        await chrome.storage.local.set({ total: (r.total || 0) + msg.add });
      }
    });
    return;
  }

  if (msg.type === 'entgender:get') {
    enqueue(async function () {
      const o = await load();
      sendResponse(summary(o, msg.tabId));
    });
    return true;
  }
});

chrome.tabs.onRemoved.addListener(function (tabId) {
  enqueue(async function () {
    const o = await load();
    delete o[tabId];
    await save(o);
  });
});
