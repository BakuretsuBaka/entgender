/*!
 * Entgender: Content-Script
 * Ersetzt Gendersprache im DOM, merkt sich die Originaltexte (Umschalten
 * stellt alles wieder her) und beobachtet spätere Änderungen der Seite.
 */
(function () {
  'use strict';

  if (window.__entgenderLoaded) return;
  window.__entgenderLoaded = true;

  const E = globalThis.Entgender;
  if (!E) return;

  const SKIP = 'script,style,noscript,textarea,input,code,pre,template,kbd,samp,' +
    '[contenteditable]:not([contenteditable="false"])';
  const ATTRS = ['alt', 'title', 'placeholder', 'aria-label', 'content'];
  // <meta content> nur bei Beschreibung und Vorschautiteln, nicht bei viewport, robots usw.
  const META_NAMES = /^(?:description|og:(?:title|description|site_name|image:alt)|twitter:(?:title|description|image:alt)|title)$/i;
  const OBS = {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ATTRS
  };

  const textOrig = new Map(); // Textknoten -> [original, geschrieben]
  const attrOrig = new Map(); // Element -> Map(attribut -> [original, geschrieben])
  const pending = new Set();
  const pendingAttrs = new Set();
  const styleOrig = new Map(); // <i>/<em> um "weiß" -> [ursprünglicher font-style, Priorität]
  let watched = new WeakSet();
  let opts = null;
  let active = false;
  let timer = 0;
  let firstApply = true;

  function insideSkipped(node) {
    const el = node.nodeType === 1 ? node : node.parentElement;
    return !!el && !!el.closest(SKIP);
  }

  // Option "ältere Begriffe": kursiv gesetztes "weiß" (<i>, <em>) wieder normal setzen
  function processItalic(node) {
    if (!opts.rules.oldTerms) return;
    const el = node.parentElement;
    if (!el || (el.localName !== 'i' && el.localName !== 'em')) return;
    if (el.childNodes.length !== 1 || styleOrig.has(el)) return;
    const word = node.nodeValue.trim();
    const before = el.previousSibling ? el.previousSibling.textContent : '';
    const after = el.nextSibling ? el.nextSibling.textContent : '';
    const out = E.whiteItalic(word, before, after);
    if (out === null) return;
    styleOrig.set(el, [el.style.getPropertyValue('font-style'), el.style.getPropertyPriority('font-style')]);
    el.style.setProperty('font-style', 'normal', 'important');
    if (out !== word && !textOrig.has(node)) {
      const orig = node.nodeValue;
      const next = orig.replace(word, out);
      textOrig.set(node, [orig, next]);
      node.nodeValue = next;
    }
  }

  function processText(node) {
    processTextCore(node);
    processItalic(node);
  }

  function processTextCore(node) {
    if (insideSkipped(node)) return;
    const t = node.nodeValue;
    const rec = textOrig.get(node);
    if (rec && rec[1] === t) return;
    if (!t || t.length < 4) {
      if (rec) textOrig.delete(node);
      return;
    }
    const out = E.entgender(t, opts);
    if (out !== t) {
      textOrig.set(node, [t, out]);
      node.nodeValue = out;
    } else if (rec) {
      textOrig.delete(node);
    }
  }

  function processAttrs(el) {
    for (let i = 0; i < ATTRS.length; i++) {
      const a = ATTRS[i];
      if (a === 'content' && !(el.localName === 'meta' &&
          META_NAMES.test(el.getAttribute('name') || el.getAttribute('property') || ''))) continue;
      const v = el.getAttribute(a);
      if (!v || v.length < 4) continue;
      const m0 = attrOrig.get(el);
      const rec = m0 && m0.get(a);
      if (rec && rec[1] === v) continue;
      const out = E.entgender(v, opts);
      if (out !== v) {
        let m = m0;
        if (!m) { m = new Map(); attrOrig.set(el, m); }
        m.set(a, [v, out]);
        el.setAttribute(a, out);
      }
    }
  }

  function watchShadow(sr) {
    if (watched.has(sr)) return;
    watched.add(sr);
    observer.observe(sr, OBS);
    processTree(sr);
  }

  function processTree(root) {
    if (!root) return;
    if (root.nodeType === 3) { processText(root); return; }
    if (root.nodeType === 1) {
      if (root.closest(SKIP)) return;
      processAttrs(root);
      if (root.shadowRoot) watchShadow(root.shadowRoot);
    } else if (root.nodeType !== 9 && root.nodeType !== 11) {
      return;
    }
    const walker = document.createTreeWalker(root, 0x1 | 0x4, {
      acceptNode: function (n) {
        if (n.nodeType === 3) return NodeFilter.FILTER_ACCEPT;
        if (n.matches(SKIP)) return NodeFilter.FILTER_REJECT;
        processAttrs(n);
        if (n.shadowRoot) watchShadow(n.shadowRoot);
        return NodeFilter.FILTER_SKIP;
      }
    });
    let n;
    while ((n = walker.nextNode())) processText(n);
  }

  function prune() {
    textOrig.forEach(function (_, n) { if (!n.isConnected) textOrig.delete(n); });
    attrOrig.forEach(function (_, el) { if (!el.isConnected) attrOrig.delete(el); });
    styleOrig.forEach(function (_, el) { if (!el.isConnected) styleOrig.delete(el); });
  }

  function currentCount() {
    prune();
    let n = textOrig.size;
    attrOrig.forEach(function (m) { n += m.size; });
    styleOrig.forEach(function (_, el) { if (!textOrig.has(el.firstChild)) n++; });
    return n;
  }

  // Meldet die Anzahl der Änderungen an den Service-Worker (Badge am Symbol).
  let reportTimer = 0;
  function report(immediate, init) {
    clearTimeout(reportTimer);
    const send = function () {
      if (typeof chrome === 'undefined' || !chrome.runtime) return; // Userscript: kein Zähler
      try {
        chrome.runtime.sendMessage(
          { type: 'entgender:count', count: currentCount(), init: !!init },
          function () { void chrome.runtime.lastError; });
      } catch (e) { /* Kontext ungültig */ }
    };
    if (immediate) send();
    else reportTimer = setTimeout(send, 250);
  }

  function flush() {
    timer = 0;
    if (!active) return;
    const nodes = Array.from(pending);
    const els = Array.from(pendingAttrs);
    pending.clear();
    pendingAttrs.clear();
    nodes.forEach(function (n) { if (n.isConnected) processTree(n); });
    els.forEach(function (el) { if (el.isConnected && !el.closest(SKIP)) processAttrs(el); });
    if (textOrig.size > 3000) prune();
    report(false);
  }

  function schedule() {
    if (!timer) timer = setTimeout(flush, 60);
  }

  const observer = new MutationObserver(function (records) {
    for (let i = 0; i < records.length; i++) {
      const r = records[i];
      if (r.type === 'childList') {
        r.addedNodes.forEach(function (n) { pending.add(n); });
      } else if (r.type === 'characterData') {
        pending.add(r.target);
      } else if (r.type === 'attributes') {
        pendingAttrs.add(r.target);
      }
    }
    schedule();
  });

  function restore() {
    textOrig.forEach(function (rec, n) {
      if (n.nodeValue === rec[1]) n.nodeValue = rec[0];
    });
    textOrig.clear();
    attrOrig.forEach(function (m, el) {
      m.forEach(function (rec, a) {
        if (el.getAttribute(a) === rec[1]) el.setAttribute(a, rec[0]);
      });
    });
    attrOrig.clear();
    styleOrig.forEach(function (v, el) {
      if (v[0]) el.style.setProperty('font-style', v[0], v[1]);
      else el.style.removeProperty('font-style');
    });
    styleOrig.clear();
  }

  function start() {
    if (active) return;
    active = true;
    const run = function () {
      if (!active) return;
      observer.observe(document.documentElement, OBS);
      processTree(document.documentElement);
      report(false);
    };
    if (document.documentElement) run();
    else document.addEventListener('DOMContentLoaded', run, { once: true });
  }

  function stop() {
    observer.disconnect();
    clearTimeout(timer);
    timer = 0;
    pending.clear();
    pendingAttrs.clear();
    restore();
    watched = new WeakSet();
    active = false;
  }

  function apply(raw) {
    const s = E.mergeSettings(raw);
    opts = E.buildOptions(s);
    const lang = (document.documentElement && document.documentElement.lang) || '';
    const langOk = !s.onlyGerman || !lang || /^de(?:-|_|$)/i.test(lang);
    const on = s.enabled && langOk && !E.siteDisabled(s.disabledSites, location.hostname);
    stop();
    if (on) start();
    report(true, firstApply);
    if (firstApply) report(false);
    firstApply = false;
  }

  // Als Userscript (Nyxt, qutebrowser, Pale Moon) liegen die Einstellungen im Skript selbst.
  if (globalThis.__ENTGENDER_SETTINGS__ !== undefined) {
    apply(globalThis.__ENTGENDER_SETTINGS__);
    return;
  }

  try {
    chrome.storage.sync.get('settings', function (res) {
      apply(res && res.settings);
    });
    chrome.storage.onChanged.addListener(function (changes, area) {
      if (area === 'sync' && changes.settings) apply(changes.settings.newValue);
    });
    chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
      if (msg && msg.type === 'entgender:info') {
        sendResponse({ host: location.hostname, count: currentCount(), active: active });
      }
    });
  } catch (e) {
    // Erweiterungskontext ungültig (z. B. nach einem Update): nichts tun.
  }
})();
