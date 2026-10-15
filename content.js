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

  // Datensatz je Textknoten/Attribut: o Original, out Ergebnis, on ob out geschrieben wurde
  // (sonst nur erkannt, siehe Modus 'detect'), st Zähler je Regelgruppe
  const textOrig = new Map(); // Textknoten -> Datensatz
  const attrOrig = new Map(); // Element -> Map(attribut -> Datensatz)
  const counted = new WeakSet(); // Knoten, die schon in die Gesamtzahl eingegangen sind
  const rangesOf = new Map(); // Textknoten -> Ranges der Markierung
  let delta = 0; // neue Ersetzungen seit der letzten Meldung (Gesamtzähler)
  let mode = 'off'; // 'on' ersetzt, 'detect' erkennt nur (Erweiterung aus, aber Markieren an), 'off'
  let hlOn = false;
  const hl = { sheet: false, on: null, off: null, ok: null };
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

  function germanDoc() {
    const l = (document.documentElement && document.documentElement.lang) || '';
    return /^de(?:-|_|$)/i.test(l);
  }

  function sum(st) {
    let n = 0;
    for (const k in st) n += st[k];
    return n;
  }

  function addCount(key, n) {
    if (mode !== 'on' || !n || counted.has(key)) return;
    counted.add(key);
    delta += n;
  }

  // --- Markieren (CSS Custom Highlight API, ändert das DOM nicht) ---
  function hlSupported() {
    if (hl.ok === null) {
      try { hl.ok = typeof Highlight === 'function' && !!CSS && !!CSS.highlights; } catch (e) { hl.ok = false; }
    }
    return hl.ok;
  }

  function hlSheet() {
    if (hl.sheet) return;
    hl.sheet = true;
    const css = '::highlight(entgender-on){background-color:rgba(47,160,90,.38)}' +
      '::highlight(entgender-off){background-color:rgba(220,60,60,.38)}';
    try {
      const sh = new CSSStyleSheet();
      sh.replaceSync(css);
      document.adoptedStyleSheets = Array.prototype.concat.call(Array.from(document.adoptedStyleSheets), [sh]);
    } catch (e) {
      try {
        const st = document.createElement('style');
        st.textContent = css;
        (document.head || document.documentElement).appendChild(st);
      } catch (e2) { /* ohne Markierung weiterarbeiten */ }
    }
  }

  function hlObject() {
    const key = mode === 'on' ? 'on' : 'off';
    if (!hl[key]) {
      hl[key] = new Highlight();
      CSS.highlights.set('entgender-' + key, hl[key]);
    }
    return hl[key];
  }

  function dropRanges(node) {
    const rs = rangesOf.get(node);
    if (!rs) return;
    const h = hl[mode === 'on' ? 'on' : 'off'];
    rs.forEach(function (r) { if (h) h.delete(r); });
    rangesOf.delete(node);
  }

  function markRanges(node, rec) {
    if (!hlOn || !hlSupported()) return;
    try {
      hlSheet();
      const h = hlObject();
      const hunks = E.diffRanges(rec.o, rec.out);
      const rs = [];
      hunks.forEach(function (x) {
        const span = rec.on ? x.b : x.a;
        const r = document.createRange();
        r.setStart(node, span[0]);
        r.setEnd(node, Math.min(span[1], node.nodeValue.length));
        h.add(r);
        rs.push(r);
      });
      rangesOf.set(node, rs);
    } catch (e) { /* Markierung ist optional */ }
  }

  function clearHighlights() {
    rangesOf.clear();
    try {
      if (hl.on) hl.on.clear();
      if (hl.off) hl.off.clear();
    } catch (e) { /* ignorieren */ }
  }

  // Option "ältere Begriffe": kursiv gesetztes "weiß" (<i>, <em>) wieder normal setzen
  function processItalic(node) {
    if (mode !== 'on' || !opts.rules.oldTerms) return;
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
      const rec = { o: orig, out: next, on: true, st: { oldTerms: 1 } };
      textOrig.set(node, rec);
      node.nodeValue = next;
      markRanges(node, rec);
    }
    addCount(el, 1);
  }

  function processText(node) {
    processTextCore(node);
    processItalic(node);
  }

  function processTextCore(node) {
    if (insideSkipped(node)) return;
    const t = node.nodeValue;
    const rec = textOrig.get(node);
    if (rec && (rec.on ? rec.out : rec.o) === t) return;
    if (!t || t.length < 4) {
      if (rec) { textOrig.delete(node); dropRanges(node); }
      return;
    }
    const st = {};
    const out = E.entgender(t, opts, st);
    if (rec) dropRanges(node);
    if (out !== t) {
      const next = { o: t, out: out, on: mode === 'on', st: st };
      textOrig.set(node, next);
      if (next.on) {
        node.nodeValue = out;
        addCount(node, sum(st));
      }
      markRanges(node, next);
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
      if (rec && (rec.on ? rec.out : rec.o) === v) continue;
      const st = {};
      const out = E.entgender(v, opts, st);
      if (out !== v) {
        let m = m0;
        if (!m) { m = new Map(); attrOrig.set(el, m); }
        const on = mode === 'on';
        m.set(a, { o: v, out: out, on: on, st: st });
        if (on) {
          el.setAttribute(a, out);
          addCount(el, sum(st));
        }
      } else if (rec) {
        m0.delete(a);
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
    textOrig.forEach(function (_, n) { if (!n.isConnected) { textOrig.delete(n); rangesOf.delete(n); } });
    attrOrig.forEach(function (_, el) { if (!el.isConnected) attrOrig.delete(el); });
    styleOrig.forEach(function (_, el) { if (!el.isConnected) styleOrig.delete(el); });
  }

  // Ersetzungen auf dieser Seite, gesamt und je Regelgruppe
  function currentStats() {
    prune();
    const by = {};
    let n = 0;
    const add = function (st) {
      for (const k in st) { by[k] = (by[k] || 0) + st[k]; n += st[k]; }
    };
    textOrig.forEach(function (rec) { add(rec.st); });
    attrOrig.forEach(function (m) { m.forEach(function (rec) { add(rec.st); }); });
    if (mode === 'on') {
      styleOrig.forEach(function (_, el) {
        if (!textOrig.has(el.firstChild)) { by.oldTerms = (by.oldTerms || 0) + 1; n++; }
      });
    }
    return { n: n, by: by };
  }

  // Meldet Anzahl und Aufteilung an den Service-Worker (Badge, Popup, Gesamtzähler).
  let reportTimer = 0;
  function report(immediate, init) {
    clearTimeout(reportTimer);
    const send = function () {
      if (typeof chrome === 'undefined' || !chrome.runtime) return; // Userscript: kein Zähler
      try {
        const cs = currentStats();
        chrome.runtime.sendMessage(
          { type: 'entgender:count', count: cs.n, by: cs.by, mode: mode, init: !!init, add: delta },
          function () { void chrome.runtime.lastError; });
        delta = 0;
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
    if (syncLang() && opts.rules.anglicisms) processTree(document.documentElement);
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
      if (rec.on && n.nodeValue === rec.out) n.nodeValue = rec.o;
    });
    textOrig.clear();
    attrOrig.forEach(function (m, el) {
      m.forEach(function (rec, a) {
        if (rec.on && el.getAttribute(a) === rec.out) el.setAttribute(a, rec.o);
      });
    });
    attrOrig.clear();
    styleOrig.forEach(function (v, el) {
      if (v[0]) el.style.setProperty('font-style', v[0], v[1]);
      else el.style.removeProperty('font-style');
    });
    styleOrig.clear();
    clearHighlights();
  }

  function start() {
    if (active) return;
    active = true;
    const run = function () {
      if (!active) return;
      syncLang();
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

  // Anglizismen gelten nur auf Seiten mit deutscher Sprachangabe, unabhängig von "Nur auf deutschen Seiten"
  function syncLang() {
    const g = germanDoc();
    if (opts && opts.german !== g) { opts.german = g; return true; }
    return false;
  }

  function apply(raw) {
    const s = E.mergeSettings(raw);
    opts = E.buildOptions(s);
    opts.german = germanDoc();
    const lang = (document.documentElement && document.documentElement.lang) || '';
    const langOk = !s.onlyGerman || !lang || /^de(?:-|_|$)/i.test(lang);
    const siteOff = E.siteDisabled(s.disabledSites, location.hostname);
    const on = s.enabled && langOk && !siteOff;
    hlOn = !!(s.extendedView && s.highlight);
    stop();
    // Ist die Erweiterung aus und das Markieren an, wird nur erkannt (rot), nicht ersetzt.
    mode = on ? 'on' : (hlOn && langOk ? 'detect' : 'off');
    if (mode !== 'off') start();
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
        const cs = currentStats();
        sendResponse({ host: location.hostname, count: cs.n, by: cs.by, mode: mode, active: active, hl: hlSupported() });
      }
    });
  } catch (e) {
    // Erweiterungskontext ungültig (z. B. nach einem Update): nichts tun.
  }
})();
