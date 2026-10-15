/*!
 * Entgender: Regeln zum Entfernen von Gendersprache (Deutsch)
 * Lizenz: MIT
 *
 * Wird sowohl im Content-Script, im Popup, auf der Optionsseite
 * als auch in den Node-Tests verwendet.
 */
(function (root) {
  'use strict';

  const P = String.raw;

  // ---------------------------------------------------------------------
  // Einstellungen
  // ---------------------------------------------------------------------

  const DEFAULT_SETTINGS = {
    enabled: true,
    onlyGerman: false,
    disabledSites: [],
    rules: { gap: true, doubles: true, determiners: true, articles: true, participles: true, abbreviations: true, indefinite: false, oldTerms: false, oldTermsHarsh: false },
    customReplacements: '',
    ignoreWords: ''
  };

  function mergeSettings(s) {
    s = s || {};
    return {
      enabled: s.enabled !== false,
      onlyGerman: !!s.onlyGerman,
      disabledSites: Array.isArray(s.disabledSites) ? s.disabledSites.filter(Boolean) : [],
      rules: Object.assign({}, DEFAULT_SETTINGS.rules, s.rules || {}),
      customReplacements: typeof s.customReplacements === 'string' ? s.customReplacements : '',
      ignoreWords: typeof s.ignoreWords === 'string' ? s.ignoreWords : ''
    };
  }

  function siteMatches(list, host) {
    host = String(host || '').toLowerCase();
    return (list || []).some(function (d) {
      d = String(d).trim().toLowerCase();
      return d && (host === d || host.endsWith('.' + d));
    });
  }

  function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function parseCustom(text) {
    const out = [];
    String(text || '').split(/\r?\n/).forEach(function (line) {
      line = line.trim();
      if (!line || line[0] === '#') return;
      const m = line.match(/^(.+?)\s*(?:=|→|->)\s*(.*)$/);
      if (!m) return;
      const from = m[1].trim();
      const to = m[2].trim();
      if (!from) return;
      out.push({
        re: new RegExp(P`(?<![\p{L}])` + escapeRegExp(from) + P`(?![\p{L}])`, 'gu'),
        to: to
      });
    });
    return out;
  }

  function parseList(text) {
    return String(text || '').split(/[\r\n,]+/).map(function (x) { return x.trim(); }).filter(Boolean);
  }

  function buildOptions(settings) {
    const s = mergeSettings(settings);
    return {
      rules: s.rules,
      custom: parseCustom(s.customReplacements),
      ignore: parseList(s.ignoreWords)
    };
  }

  // ---------------------------------------------------------------------
  // Wortformen
  // ---------------------------------------------------------------------

  const IGNORE_STEMS = new Set([
    'Log', 'Sign', 'Check', 'Plug', 'Built', 'Linked', 'Opt', 'Drop', 'Zoom',
    'Außen', 'Aussen', 'Pop', 'Walk', 'Tap'
  ]);

  const SING_BACK = [
    [/Ärzt$/, 'Arzt'], [/ärzt$/, 'arzt'],
    [/Anwält$/, 'Anwalt'], [/anwält$/, 'anwalt'],
    [/Gäst$/, 'Gast'], [/gäst$/, 'gast']
  ];
  const SING_E = /(?:log|gog|kolleg|expert|kund|zeug)$/i;

  function singularMasc(stem) {
    for (let i = 0; i < SING_BACK.length; i++) {
      if (SING_BACK[i][0].test(stem)) return stem.replace(SING_BACK[i][0], SING_BACK[i][1]);
    }
    if (/beamt$/i.test(stem)) return stem + 'er';
    if (SING_E.test(stem)) return stem + 'e';
    return stem;
  }

  function pluralMasc(stem) {
    const l = stem.toLowerCase();
    if (/beamt$/.test(l)) return stem + 'e';
    if (/(?:nachbar|bauer)$/.test(l)) return stem + 'n';
    if (/(?:ärzt|anwält|gäst|freund|feind|lehrling|jünger)$/.test(l)) return stem + 'e';
    if (/(?:fan|chef|star|boss)$/.test(l)) return stem + 's';
    if (/(?:er|el|en)$/.test(l)) return stem;
    if (/e$/.test(l)) return stem + 'n';
    return stem + 'en';
  }

  function norm(s) {
    return s.toLowerCase().replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ß/g, 'ss');
  }

  function related(masc, stem) {
    const a = norm(masc);
    const s = norm(stem);
    return s.length >= 3 && a.startsWith(s) && a.length - s.length <= 2;
  }

  function cap(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  const ART_FIX = { die: 'der', Die: 'Der', eine: 'ein', Eine: 'Ein' };
  function fixArt(a) {
    return Object.prototype.hasOwnProperty.call(ART_FIX, a) ? ART_FIX[a] : a;
  }

  function ignored(m, opts) {
    for (let i = 0; i < opts.ignore.length; i++) {
      if (m.indexOf(opts.ignore[i]) !== -1) return true;
    }
    return false;
  }

  // ---------------------------------------------------------------------
  // Muster
  // ---------------------------------------------------------------------

  // Alle Zeichen, die als Gender-Zeichen verwendet werden (Stern, Doppelpunkt, Unterstrich,
  // Mittelpunkte) samt typografischer Varianten.
  const MARK = P`*∗＊﹡⋆:：꞉_＿·•‧∙⋅`;
  const SEP = P`(?:[${MARK}]|\/-?|\()`;
  const FEM = P`(?:${SEP}?(innen|in)|(Innen|In))\)?`;
  const ART = P`(?:[Dd]er|[Dd]ie|[Dd]as|[Dd]en|[Dd]em|[Dd]es|[Ee]ine[mnrs]?|[Ee]in|[Aa]lle|[Aa]llen)`;
  const CONN = P`(?:und|oder|sowie|bzw\.|beziehungsweise|bzw)`;
  const DET = P`(?:[Jj]ed|[Ee]in|[Kk]ein|[Mm]ein|[Dd]ein|[Ss]ein|[Ii]hr|[Uu]nser|[Ee]ur|[Dd]ies|[Jj]en|[Ww]elch|[Mm]anch)`;
  const DET_SING = P`(?:[Ee]in|[Kk]ein|[Mm]ein|[Dd]ein|[Ss]ein|[Ii]hr|[Uu]nser|[Ee]ur)`;

  const reFemFirst = new RegExp(
    P`(?<![\p{L}])(?:(${ART})\s+)?(\p{Lu}\p{L}{2,}?)${FEM}\s+${CONN}\s+(?:(${ART})\s+)?(\p{Lu}\p{L}*)`, 'gu');
  const reMascFirst = new RegExp(
    P`(?<![\p{L}])(?:(${ART})\s+)?(\p{Lu}\p{L}{2,})\s+${CONN}\s+(?:(${ART})\s+)?(\p{Lu}\p{L}{2,}?)${FEM}(?![\p{L}])`, 'gu');

  // Ergänzungsstrich: "Sprachexpertinnen und -experten", "Lehrerin oder -lehrer"
  const reDash = new RegExp(
    P`(?<![\p{L}])(?:(${ART})\s+)?(\p{Lu}\p{L}{2,}?)(innen|in)\s+${CONN}\s+[\-\u2010\u2011\u2013]([\p{L}]{3,})(?![\p{L}])`, 'gu');

  const reCompoundSep = new RegExp(P`(?<=\p{Ll})(?:[${MARK}]|\/-?)innen(?=\p{Ll})`, 'gu');
  const reCompoundBI = new RegExp(P`(?<=\p{Ll})Innen(?=\p{Ll})`, 'gu');
  const reParen = new RegExp(P`(?<![\p{L}])(\p{Lu}\p{L}*)\(inn\)en(?![\p{L}])`, 'gu');
  const reGap = new RegExp(
    P`(?<![\p{L}])(?:([Dd]ie|[Ee]ine|[Dd]er|[Ee]iner)(\s+))?(\p{Lu}\p{L}*?)(?:(?:[${MARK}]|\/-?|\()(innen|in)\)?|(?<=\p{Ll})(Innen|In))(?![\p{L}])`, 'gu');

  const reDetEnd = new RegExp(P`(?<![\p{L}])(${DET})e[${MARK}\/]([rnms])(?![\p{L}])`, 'gu');
  const reDetBI = new RegExp(P`(?<![\p{L}])(${DET})e([RNMS])(?![\p{L}])`, 'gu');
  // Dativ: einem/r, einer/m, jedem*r, diesem:r, einemR ... werden zu -em
  const reDetCase = new RegExp(P`(?<![\p{L}])(${DET})(?:em|er)[${MARK}\/]([rm])(?![\p{L}])`, 'gu');
  const reDetCaseBI = new RegExp(P`(?<![\p{L}])(${DET})(?:em|er)([RM])(?![\p{L}])`, 'gu');
  const reDetSing = new RegExp(P`(?<![\p{L}])(${DET_SING})(?:[${MARK}\/]e|E)(?![\p{L}])`, 'gu');

  const QUICK = new RegExp(
    P`[${MARK}\/(]|(?<![\p{L}])(?:mensch|frau)(?![\p{L}])|\p{Ll}(?:Innen|In|E|R|N|M|S)(?!\p{L})|\p{Ll}Innen(?=\p{Ll})|in(?:nen)?\s+(?:und|oder|sowie|bzw|beziehungsweise)|(?:und|oder|sowie|bzw\.?|beziehungsweise)\s+(?:\p{L}+\s+)?\p{Lu}\p{L}*in(?:nen)?(?!\p{L})|\p{Lu}\p{L}*ende[nrsm]?(?![\p{L}])`,
    'u');

  const QUICK_TERMS = new RegExp(
    P`[Gg]eflüchtet|Asylsuchend|Schutzsuchend|Behinderung|Beeinträchtigung|Erkrankung|Störung|[Aa]utis|bdachlos|ohnungslos|ohne\s+(?:Wohnung|Obdach|gesicherten|sicheren|legalen|festen)|[Tt]rans[ \-]|versklavt|sexualisierter|Rassismus|bleis|angleichende|Transition|Schwarz|PoC|POC|Colou?r|(?:Ein|Zu)wanderungsgeschichte|N[\-\u2010\u2011]Wort|Z[\-\u2010\u2011]Wort|Schokok|Paprika|ungarischer|Sinti|Roma|[*_]weiß`, 'u');

  function quickCheck(text) {
    return text.length >= 4 && QUICK.test(text);
  }

  // ---------------------------------------------------------------------
  // Regelgruppen
  // ---------------------------------------------------------------------

  function determiners(t) {
    return t
      .replace(reDetCase, function (m, d) { return d + 'em'; })
      .replace(reDetCaseBI, function (m, d) { return d + 'em'; })
      .replace(reDetEnd, function (m, d, e) { return d + 'e' + e; })
      .replace(reDetBI, function (m, d, e) { return d + 'e' + e.toLowerCase(); })
      .replace(reDetSing, function (m, d) { return d; });
  }

  // Trennzeichen zwischen Artikel- und Pronomenpaaren: Schrägstrich oder Gender-Zeichen
  const PS = P`[\/${MARK}]`;
  const reArt = [
    [P`(?<![\p{L}])([Dd])(?:er${PS}[Dd]ie|ie${PS}[Dd]er)(?=\s+\p{Lu})`, '$1er'],
    [P`(?<![\p{L}])([Ee])in(?:${PS}[Ee]ine|e${PS}[Ee]in)(?=\s+\p{Lu})`, '$1in'],
    [P`(?<![\p{L}])([Dd])(?:em${PS}[Dd]er|er${PS}[Dd]em)(?=\s+\p{Lu})`, '$1em'],
    [P`(?<![\p{L}])([Dd])(?:es${PS}[Dd]er|er${PS}[Dd]es)(?=\s+\p{Lu})`, '$1es'],
    [P`(?<![\p{L}])([Dd])(?:en${PS}[Dd]ie|ie${PS}[Dd]en)(?=\s+\p{Lu})`, '$1en'],
    [P`(?<![\p{L}])([Ee])inem${PS}[Ee]iner(?=\s+\p{Lu})|(?<![\p{L}])([Ee])iner${PS}[Ee]inem(?=\s+\p{Lu})`,
      function (m, x, y) { return (x || y) + 'inem'; }],
    [P`(?<![\p{L}])([Ee])r${PS}[Ss]ie(?![\p{L}])`, '$1r'],
    [P`(?<![\p{L}])([Ss])ie${PS}[Ee]r(?![\p{L}])`, function (m, x) { return x === 'S' ? 'Er' : 'er'; }],
    [P`(?<![\p{L}])([Ii])hm${PS}[Ii]hr(?![\p{L}])`, '$1hm'],
    [P`(?<![\p{L}])([Ii])hn${PS}[Ss]ie(?![\p{L}])`, '$1hn'],
    [P`(?<![\p{L}])([Ss]ein)(e[mnrs]?)?${PS}[Ii]hr(?:e[mnrs]?)?(?![\p{L}])`, '$1$2']
  ].map(function (e) { return [new RegExp(e[0], 'gu'), e[1]]; });

  function articles(t) {
    for (let i = 0; i < reArt.length; i++) t = t.replace(reArt[i][0], reArt[i][1]);
    return t;
  }

  // ---------------------------------------------------------------------
  // Abkürzungen wie (m/w/d) in Stellenanzeigen
  // ---------------------------------------------------------------------

  const SL = P`\s*[\/|\\]\s*\*?`;
  // Erlaubte Angaben: zwei (m/w, w/m, m/f, f/m), drei oder vier Teile aus m, w, f, d, x, i, divers.
  // Zwei Teile wie m/d oder w/d bleiben stehen (Einheiten wie m/d = Meter pro Tag).
  const ABB_TWO = P`(?:[mw]${SL}[wm]|m${SL}f|f${SL}m)`;
  const ABB_MULTI = P`(?:(?:[mwf]|d)${SL}(?:[mwfdxi]|divers|diverse)(?:${SL}(?:[mwfdxi]|divers|diverse)){1,2})`;
  const ABB_WORDS = P`(?:gn|all genders|alle geschlechter|alle gender)`;
  const reAbbrBr = new RegExp(
    P`[ \t]*[(\[]\s*(?:${ABB_TWO}\*?|${ABB_MULTI}\*?|${ABB_WORDS})\s*[)\]]`, 'giu');
  // Ohne Klammern nur Dreiergruppen direkt hinter einem Wort: "Entwickler m/w/d"
  const reAbbrBare = new RegExp(
    P`(?<=[\p{L})])[ \t]+${ABB_MULTI}\*?(?![\p{L}\d\/])`, 'giu');

  function abbreviations(t, opts) {
    t = t.replace(reAbbrBr, function (m) { return ignored(m, opts) ? m : ''; });
    t = t.replace(reAbbrBare, function (m) { return ignored(m, opts) ? m : ''; });
    return t;
  }

  // ---------------------------------------------------------------------
  // Unbestimmtes Pronomen: "mensch" und "frau" werden zu "man" (standardmäßig aus)
  // ---------------------------------------------------------------------

  const reManPair = new RegExp(
    P`(?<![\p{L}])([Mm]an|[Mm]ensch|[Ff]rau)(?:[\/${MARK}](?:[Mm]an|[Mm]ensch|[Ff]rau))+(?![\p{L}])`, 'gu');
  // Einzeln nur kleingeschrieben: großgeschrieben sind es Hauptwörter (Mensch, Frau).
  const reManSingle = new RegExp(P`(?<![\p{L}])(?:mensch|frau)(?![\p{L}])`, 'gu');

  function indefinite(t, opts) {
    t = t.replace(reManPair, function (m, first) {
      if (ignored(m, opts)) return m;
      const hasMan = /(?:^|[^\p{L}])[Mm]an(?![\p{L}])/u.test(m);
      if (/^\p{Lu}/u.test(first) && !hasMan) return m;
      return /^\p{Lu}/u.test(first) ? 'Man' : 'man';
    });
    return t.replace(reManSingle, function (m) { return ignored(m, opts) ? m : 'man'; });
  }

  // Wie String.replace, aber ein abgelehnter Treffer (Rückgabe null) verbraucht
  // nur sein erstes Zeichen. So wird ein echtes Paar, das mit dem abgelehnten
  // Treffer überlappt, trotzdem gefunden.
  function scan(re, t, fn) {
    re.lastIndex = 0;
    let out = '';
    let pos = 0;
    let m;
    while ((m = re.exec(t)) !== null) {
      const r = fn.apply(null, m);
      if (r === null) { re.lastIndex = m.index + 1; continue; }
      out += t.slice(pos, m.index) + r;
      pos = m.index + m[0].length;
      re.lastIndex = pos;
    }
    return out + t.slice(pos);
  }

  function doubles(t, opts) {
    t = scan(reFemFirst, t, function (m, aArt, stem, inn, binn, bArt, B) {
      if (ignored(m, opts)) return null;
      if (!related(B, stem) || /in(?:nen)?$/i.test(B)) return null;
      const sing = (inn || binn).toLowerCase() === 'in';
      let art = bArt || aArt || '';
      if (aArt && !bArt && sing) art = fixArt(aArt);
      let res = art ? art + ' ' + B : B;
      if (aArt && bArt && /^\p{Lu}/u.test(aArt)) res = cap(res);
      return res;
    });
    t = scan(reDash, t, function (m, aArt, stem, inn, B) {
      if (ignored(m, opts)) return null;
      for (let k = 0; k < stem.length; k++) {
        if (!related(B, stem.slice(k))) continue;
        let res = stem.slice(0, k) + (k ? B : cap(B));
        const art = aArt && inn.toLowerCase() === 'in' ? fixArt(aArt) : aArt;
        if (art) res = art + ' ' + res;
        return res;
      }
      return null;
    });
    t = scan(reMascFirst, t, function (m, aArt, A, bArt, stem) {
      if (ignored(m, opts)) return null;
      if (!related(A, stem) || /in(?:nen)?$/i.test(A)) return null;
      return aArt ? aArt + ' ' + A : A;
    });
    return t;
  }

  // ---------------------------------------------------------------------
  // Fall bei Einzahlformen (einem Tutor, des Studenten, für Kollegen)
  // ---------------------------------------------------------------------

  const CASE_DET = {};
  [
    ['D', 'einem dem jedem diesem jenem welchem manchem keinem meinem deinem seinem ihrem unserem eurem'],
    ['A', 'einen den jeden diesen jenen welchen manchen keinen meinen deinen seinen ihren unseren euren'],
    ['G', 'eines des dieses jenes welches manches keines meines deines seines ihres unseres eures']
  ].forEach(function (e) {
    e[1].split(' ').forEach(function (w) { CASE_DET[w] = e[0]; });
  });
  const NOM_DET = new Set(['ein', 'der', 'kein', 'jeder', 'dieser', 'jener', 'welcher', 'mancher',
    'mein', 'dein', 'sein', 'ihr', 'unser', 'euer', 'jede', 'diese', 'jene', 'welche', 'manche',
    'keine', 'meine', 'deine', 'seine', 'ihre', 'unsere', 'eure', 'eine', 'die']);
  const ACC_PREP = new Set(['für', 'durch', 'gegen', 'ohne', 'um', 'bis', 'wider']);

  const WEAK_RE = new RegExp(
    '(?:e|ent|ant|ist|graf|graph|soph|krat|nom|narch|triarch|' +
    'kandidat|soldat|delegat|advokat|diplomat|pirat|primat|' +
    'mensch|held|fürst|prinz|architekt|kamerad|nachbar|bauer|herr)$');

  function lastWord(before) {
    const cut = before.split(reClauseCut).pop();
    const w = cut.trim().split(/\s+/).filter(Boolean);
    return w.length ? w[w.length - 1].toLowerCase() : '';
  }

  // Fall des folgenden Nomens aus Artikel oder Präposition davor.
  // 'D' Dativ, 'A' Akkusativ, 'G' Genitiv, null: Nominativ oder unklar.
  function singCase(before) {
    const cut = before.split(reClauseCut).pop();
    const words = cut.trim().split(/\s+/).filter(Boolean).slice(-3).reverse();
    let hops = 0;
    for (let i = 0; i < words.length; i++) {
      const l = words[i].toLowerCase();
      if (Object.prototype.hasOwnProperty.call(CASE_DET, l)) return CASE_DET[l];
      if (NOM_DET.has(l)) return null;
      if (DAT_PREP.has(l)) return 'D';
      if (GEN_PREP.has(l)) return 'G';
      if (ACC_PREP.has(l)) return 'A';
      const adjLike = /^\p{Ll}{3,}(?:e|en|er|es|em)$/u.test(words[i]);
      if (!adjLike || ++hops > 1) break;
    }
    return null;
  }

  // Dativ Plural: nur bei klarem Auslöser (den, allen, mit, von ...), ein Adjektiv dazwischen ist erlaubt.
  function pluralDative(before) {
    const cut = before.split(reClauseCut).pop();
    const words = cut.trim().split(/\s+/).filter(Boolean).slice(-2).reverse();
    if (!words.length) return false;
    const w0 = words[0].toLowerCase();
    if (DAT_DET.has(w0) || DAT_PREP.has(w0)) return true;
    if (words.length > 1 && /^\p{Ll}{3,}en$/u.test(words[0])) {
      const w1 = words[1].toLowerCase();
      return DAT_DET.has(w1) || DAT_PREP.has(w1);
    }
    return false;
  }

  function dativePlural(word) {
    return /[ns]$/i.test(word) ? word : word + 'n';
  }

  function inflect(word, cs) {
    if (!cs) return word;
    const l = word.toLowerCase();
    if (WEAK_RE.test(l)) {
      return /(?:e|nachbar|bauer|herr)$/.test(l) ? word + 'n' : word + 'en';
    }
    if (cs !== 'G') return word;
    return word + (/(?:[sßxz]|sch|arzt|gast|anwalt|freund|feind)$/.test(l) ? 'es' : 's');
  }

  function matchCase(orig, s) {
    return /^\p{Lu}/u.test(orig) ? cap(s) : s;
  }

  function gap(t, opts) {
    t = t.replace(reCompoundSep, '').replace(reCompoundBI, '');
    t = t.replace(reParen, function (m, stem, offset, str) {
      if (ignored(m, opts) || IGNORE_STEMS.has(stem) || stem.length < 3) return m;
      const w = pluralMasc(stem);
      return pluralDative(str.slice(0, offset)) ? dativePlural(w) : w;
    });
    t = t.replace(reGap, function (m, art, sp, stem, g1, g2, offset, str) {
      if (ignored(m, opts) || IGNORE_STEMS.has(stem) || stem.length < 3) return m;
      const plural = (g1 || g2).toLowerCase() === 'innen';
      if (plural) {
        let w = pluralMasc(stem);
        if (!art && pluralDative(str.slice(0, offset))) w = dativePlural(w);
        return (art ? art + sp : '') + w;
      }
      const before = str.slice(0, offset);
      let word = singularMasc(stem);
      let cs = null;
      let outArt = '';
      if (art) {
        const a = art.toLowerCase();
        const prev = lastWord(before);
        if (a === 'die' || a === 'eine') {
          if (ACC_PREP.has(prev)) { cs = 'A'; outArt = matchCase(art, a === 'die' ? 'den' : 'einen'); }
          else outArt = fixArt(art);
        } else if (DAT_PREP.has(prev)) {
          cs = 'D'; outArt = matchCase(art, a === 'der' ? 'dem' : 'einem');
        } else if (GEN_PREP.has(prev)) {
          cs = 'G'; outArt = matchCase(art, a === 'der' ? 'des' : 'eines');
        } else outArt = art;
        return outArt + sp + inflect(word, cs);
      }
      return inflect(word, singCase(before));
    });
    return t;
  }

  // ---------------------------------------------------------------------
  // Substantivierte Partizipien (Studierende, Zuschauende, ...)
  // ---------------------------------------------------------------------
  //
  // Ersetzt werden nur großgeschriebene Formen, die als Personenbezeichnung im
  // Plural erkennbar sind. Kleingeschriebene Adjektive ("die studierende
  // Tochter"), weibliche Einzahl ("die Studierende", "eine Studierende"),
  // männliche Einzahl ("ein Studierender") und Titel wie "Studierende Frauen"
  // bleiben unverändert. Nur Wörter aus der Liste werden angefasst.

  // [Wortstamm, Berufs-/Personenbezeichnung, Art]
  // Art 'n': n-Deklination (Plural auf -en), Art 'er': -er-Nomen (Dativ Plural auf -n)
  const PART_ROOTS = [
    ['studier', 'student', 'n'], ['demonstrier', 'demonstrant', 'n'],
    ['teilnehm', 'teilnehmer', 'er'], ['zuschau', 'zuschauer', 'er'],
    ['mitarbeit', 'mitarbeiter', 'er'], ['lehr', 'lehrer', 'er'],
    ['forsch', 'forscher', 'er'], ['les', 'leser', 'er'], ['nutz', 'nutzer', 'er'],
    ['besuch', 'besucher', 'er'], ['wähl', 'wähler', 'er'], ['fahr', 'fahrer', 'er'],
    ['verkauf', 'verkäufer', 'er'], ['kauf', 'käufer', 'er'], ['spiel', 'spieler', 'er'],
    ['hör', 'hörer', 'er'], ['zuhör', 'zuhörer', 'er'], ['pfleg', 'pfleger', 'er'],
    ['sprech', 'sprecher', 'er'], ['schreib', 'schreiber', 'er'], ['leit', 'leiter', 'er'],
    ['berat', 'berater', 'er'], ['prüf', 'prüfer', 'er'], ['bewerb', 'bewerber', 'er'],
    ['anbiet', 'anbieter', 'er'], ['verbrauch', 'verbraucher', 'er'],
    ['verwalt', 'verwalter', 'er'], ['vermiet', 'vermieter', 'er'], ['miet', 'mieter', 'er'],
    ['bewohn', 'bewohner', 'er'], ['entwickl', 'entwickler', 'er'],
    ['programmier', 'programmierer', 'er'], ['gründ', 'gründer', 'er'],
    ['ausbild', 'ausbilder', 'er'], ['bearbeit', 'bearbeiter', 'er'],
    ['wander', 'wanderer', 'er'], ['lern', 'lerner', 'er']
  ];
  // Wörter, die zufällig auf einen Wortstamm enden, aber etwas anderes bedeuten.
  const PART_IGNORE_BASES = new Set(['zugehör', 'angehör', 'gehör', 'dazugehör', 'mitgehör']);

  // Wörter vor dem Partizip, die über Zahl und Fall entscheiden.
  const PL_ONLY = new Set(['alle', 'viele', 'einige', 'mehrere', 'zahlreiche', 'wenige', 'beide',
    'sämtliche', 'manche', 'andere', 'weitere', 'solche', 'etliche', 'diverse', 'verschiedene']);
  const SG_OR_PL = new Set(['die', 'diese', 'jene', 'welche', 'meine', 'deine', 'seine', 'ihre',
    'unsere', 'eure', 'keine']);
  const DAT_DET = new Set(['den', 'allen', 'vielen', 'einigen', 'mehreren', 'zahlreichen',
    'wenigen', 'beiden', 'manchen', 'anderen', 'weiteren', 'solchen', 'diesen', 'jenen', 'meinen',
    'deinen', 'seinen', 'ihren', 'unseren', 'euren', 'keinen', 'etlichen', 'diversen',
    'verschiedenen']);
  const GEN_DET = new Set(['der', 'aller', 'vieler', 'einiger', 'mehrerer', 'zahlreicher',
    'weniger', 'beider', 'mancher', 'anderer', 'weiterer', 'solcher', 'dieser', 'jener', 'meiner',
    'deiner', 'seiner', 'ihrer', 'unserer', 'eurer', 'keiner', 'etlicher', 'diverser',
    'verschiedener']);
  const SING_DET = new Set(['ein', 'eine', 'einem', 'einer', 'eines', 'einen', 'kein', 'jede',
    'jeder', 'jedem', 'jeden', 'jedes', 'dem', 'des', 'dieses', 'diesem', 'jenes', 'jenem', 'mein',
    'dein', 'sein', 'ihr', 'unser', 'euer', 'meinem', 'deinem', 'seinem', 'ihrem', 'unserem',
    'eurem']);
  const DAT_PREP = new Set(['mit', 'von', 'bei', 'aus', 'nach', 'zu', 'seit', 'gegenüber', 'samt',
    'nebst']);
  const GEN_PREP = new Set(['wegen', 'trotz', 'während', 'statt', 'anstatt', 'aufgrund',
    'innerhalb', 'außerhalb', 'angesichts']);
  const COPULA = new Set(['ist', 'war', 'bin', 'bist', 'wird', 'wurde', 'bleibt', 'blieb']);

  const rePart = new RegExp(P`(?<![\p{L}])(\p{Lu}\p{L}*?)(ende[nrsm]?)(?![\p{L}])`, 'gu');
  const reCapNext = new RegExp(P`^\s+\p{Lu}`, 'u');
  const reClauseCut = /[.!?:;,()"“„\n–—]/;

  function partCase(before, suffix) {
    const cut = before.split(reClauseCut).pop();
    const words = cut.trim().split(/\s+/).filter(Boolean).slice(-3).reverse();
    let hops = 0;
    for (let i = 0; i < words.length; i++) {
      const w = words[i].toLowerCase();
      if (COPULA.has(w)) return null;
      if (SING_DET.has(w)) return null;
      if (PL_ONLY.has(w)) return suffix === 'ender' ? 'G' : 'N';
      if (SG_OR_PL.has(w)) return suffix === 'enden' ? 'N' : null;
      if (DAT_DET.has(w)) return suffix === 'enden' ? 'D' : null;
      if (GEN_DET.has(w)) return suffix === 'enden' ? 'G' : null;
      if (DAT_PREP.has(w)) return suffix === 'enden' ? 'D' : null;
      if (GEN_PREP.has(w)) return (suffix === 'enden' || suffix === 'ender') ? 'G' : null;
      // Zwischenwörter: nur kleingeschriebene, adjektivartige Wörter überspringen.
      const adjLike = /^\p{Ll}{3,}(?:e|en|er|es|em)$/u.test(words[i]);
      if (!adjLike || ++hops > 2) break;
    }
    if (suffix === 'ende') return 'N';
    if (suffix === 'enden') return 'D';
    if (suffix === 'ender') return 'G';
    return null;
  }

  function participles(t, opts) {
    return t.replace(rePart, function (m, base, suffix, offset, str) {
      if (ignored(m, opts)) return m;
      const lower = base.toLowerCase();
      if (PART_IGNORE_BASES.has(lower)) return m;
      let best = null;
      for (let i = 0; i < PART_ROOTS.length; i++) {
        if (lower.endsWith(PART_ROOTS[i][0]) &&
            (!best || PART_ROOTS[i][0].length > best[0].length)) best = PART_ROOTS[i];
      }
      if (!best) return m;
      if (reCapNext.test(str.slice(offset + m.length))) return m;
      const cls = partCase(str.slice(0, offset), suffix);
      if (!cls) return m;
      const prefix = base.slice(0, base.length - best[0].length);
      let agent = best[2] === 'n' ? best[1] + 'en' : best[1];
      if (best[2] === 'er' && cls === 'D') agent += 'n';
      return prefix + (prefix ? agent : cap(agent));
    });
  }

  // ---------------------------------------------------------------------
  // Ältere Begriffe wiederherstellen (standardmäßig aus)
  // ---------------------------------------------------------------------
  //
  // oldTerms:       Flüchtlinge, Behinderte, Obdachlose, Migrationshintergrund usw.
  // oldTermsHarsh:  Begriffe, die heute als abwertend gelten (Neger, Zigeuner ...),
  //                 getrennt schaltbar.
  // Der Fall (Nominativ, Dativ ...) wird wie bei den Partizipien aus Artikel oder
  // Präposition davor erschlossen. Bei Einzahl oder unklarem Fall bleibt der Text stehen.

  const T_SG = new Set(['ein', 'eine', 'einem', 'einer', 'eines', 'einen', 'kein', 'keinem', 'keiner',
    'keines', 'jede', 'jeder', 'jedem', 'jeden', 'jedes', 'dem', 'des', 'dieses', 'diesem', 'jenes',
    'jenem', 'mein', 'dein', 'sein', 'ihr', 'unser', 'euer', 'meinem', 'deinem', 'seinem', 'ihrem',
    'unserem', 'eurem']);
  const T_WEAK = new Set(['die', 'diese', 'jene', 'welche', 'alle', 'beide', 'meine', 'deine', 'seine',
    'ihre', 'unsere', 'eure', 'keine', 'sämtliche']);
  const T_WEAKDAT = new Set(['den', 'allen', 'diesen', 'jenen', 'beiden', 'meinen', 'deinen', 'seinen',
    'ihren', 'unseren', 'euren', 'keinen']);
  const T_WEAKGEN = new Set(['der', 'aller', 'dieser', 'jener', 'beider', 'meiner', 'deiner', 'seiner',
    'ihrer', 'unserer', 'eurer', 'keiner']);
  const T_STRONG = new Set(['viele', 'einige', 'mehrere', 'wenige', 'zahlreiche', 'etliche', 'andere',
    'weitere', 'manche', 'diverse', 'verschiedene', 'solche']);
  const T_DAT = new Set(['vielen', 'einigen', 'mehreren', 'wenigen', 'zahlreichen', 'etlichen', 'anderen',
    'weiteren', 'manchen', 'diversen', 'verschiedenen', 'solchen']);
  const T_GEN = new Set(['vieler', 'einiger', 'mehrerer', 'weniger', 'zahlreicher', 'etlicher',
    'anderer', 'weiterer', 'mancher', 'diverser', 'verschiedener', 'solcher']);

  function termCtx(before) {
    const cut = before.split(reClauseCut).pop();
    const words = cut.trim().split(/\s+/).filter(Boolean).slice(-3).reverse();
    let hops = 0;
    for (let i = 0; i < words.length; i++) {
      const l = words[i].toLowerCase();
      if (T_SG.has(l)) return 'sg';
      if (T_WEAK.has(l)) return 'weak';
      if (T_WEAKDAT.has(l)) return 'weakdat';
      if (T_WEAKGEN.has(l)) return 'weakgen';
      if (T_STRONG.has(l)) return 'strong';
      if (T_DAT.has(l) || DAT_PREP.has(l)) return 'dat';
      if (T_GEN.has(l) || GEN_PREP.has(l)) return 'gen';
      const adjLike = /^\p{Ll}{3,}(?:e|en|er|es|em)$/u.test(words[i]);
      if (!adjLike || ++hops > 2) break;
    }
    return 'bare';
  }

  function isDative(kind) { return kind === 'dat' || kind === 'weakdat'; }

  // Adjektivendung beim Hauptwort-Adjektiv (Behinderte, die Behinderten, mit Behinderten, wegen Behinderter)
  function adjEnding(kind) {
    if (kind === 'gen') return 'er';
    if (kind === 'strong' || kind === 'bare') return 'e';
    return 'en';
  }

  function startsSentence(str, offset) {
    const head = str.slice(0, offset).replace(/[„“"»›‚'’(\[]+\s*$/u, '');
    return /^\s*$/.test(head) || /[.!?…]\s*$/.test(head) || /\n\s*$/.test(head);
  }

  function lowerStart(s, str, offset) {
    return startsSentence(str, offset) ? cap(s) : s;
  }

  function nounDative(word) { return /[ns]$/i.test(word) ? word : word + 'n'; }

  // Ruft fn(groups, offset, str) für jeden Treffer auf (Rückgabe null: Treffer unverändert lassen).
  function termReplace(t, re, opts, fn) {
    return t.replace(re, function () {
      const a = arguments;
      const m = a[0];
      if (ignored(m, opts)) return m;
      const r = fn(Array.prototype.slice.call(a, 0, a.length - 2), a[a.length - 2], a[a.length - 1]);
      return r === null || r === undefined ? m : r;
    });
  }

  const NO = P`(?<![\p{L}\-])`;
  const END = P`(?![\p{L}])`;
  const reCapAfter = new RegExp(P`^\s+\p{Lu}`, 'u');

  // Hauptwort-Quellen aus Adjektiv: Geflüchtete, Asylsuchende ... (nur Mehrzahl)
  function nominalPlural(g, offset, str, matchLen) {
    const suffix = { e: 'e', en: 'n', er: 'r' }[g[1]];
    if (matchLen >= 0 && reCapAfter.test(str.slice(offset + matchLen))) return null; // "Geflüchtete Familien": Adjektiv
    const kind = termCtx(str.slice(0, offset));
    if (kind === 'sg') return null;
    if (suffix === 'e' && kind === 'weak') return null;     // "die Geflüchtete": Einzahl, weiblich
    if (suffix === 'r' && kind !== 'gen') return null;      // "Geflüchteter": Einzahl, männlich
    if (suffix === 'e' && (kind === 'dat' || kind === 'weakdat' || kind === 'weakgen')) return null;
    return { kind: kind, dative: isDative(kind) || (suffix === 'n' && kind === 'bare') };
  }

  // Quelle "... Menschen": nur Mehrzahl
  function phrasePlural(str, offset) {
    const kind = termCtx(str.slice(0, offset));
    return kind === 'sg' ? null : kind;
  }

  const OLD_TERMS = [];

  function addPhrase(source, build) {
    OLD_TERMS.push([new RegExp(source, 'gu'), build]);
  }

  // Substantiviertes Adjektiv als Ziel: stem + Endung (Behindert -> Behinderte)
  function adjTarget(stem) {
    return function (g, offset, str) {
      const kind = phrasePlural(str, offset);
      if (!kind) return null;
      const word = stem + adjEnding(kind);
      return /^\p{Ll}/u.test(word) ? lowerStart(word, str, offset) : word;
    };
  }

  function nounTarget(sing, dat) {
    return function (g, offset, str) {
      const kind = phrasePlural(str, offset);
      if (!kind) return null;
      return isDative(kind) ? dat : sing;
    };
  }

  function adjNounTarget(adj, noun) {
    return function (g, offset, str) {
      const kind = phrasePlural(str, offset);
      if (!kind) return null;
      return lowerStart(adj + adjEnding(kind) + ' ' + noun, str, offset);
    };
  }

  // Hauptwort aus Adjektiv-Mehrzahl
  function nominalTarget(sing, dat, noCapCheck) {
    return function (g, offset, str) {
      const r = nominalPlural(g, offset, str, noCapCheck ? -1 : g[0].length);
      if (!r) return null;
      return r.dative ? dat : sing;
    };
  }

  // --- einfache Ersetzungen ohne Beugung ---
  const SIMPLE_TERMS = [
    [P`${NO}[Aa]bleismus${END}`, 'Behindertenfeindlichkeit'],
    [P`${NO}([Aa])bleistisch(\p{Ll}*)${END}`, function (g) {
      return (g[1] === 'A' ? 'B' : 'b') + 'ehindertenfeindlich' + g[2];
    }],
    [P`(?<![\p{L}\-])[Gg]eschlechtsangleichende[n]?\s+Maßnahme(n)?${END}`, function (g) {
      return 'Geschlechtsumwandlung' + (g[1] ? 'en' : '');
    }]
  ].map(function (e) { return [new RegExp(e[0], 'gu'), e[1]]; });

  // --- Nominalphrasen ---
  addPhrase(P`${NO}[Gg]eflüchtet(?:e|en)\s+Menschen${END}`, nounTarget('Flüchtlinge', 'Flüchtlingen'));
  addPhrase(P`${NO}Geflüchtet(e|en|er)${END}`, nominalTarget('Flüchtlinge', 'Flüchtlingen'));
  addPhrase(P`${NO}(?:Asyl|Schutz)suchend(e|en|er)${END}`, nominalTarget('Asylanten', 'Asylanten'));
  addPhrase(P`${NO}[Mm]enschen\s+mit\s+(?:einer\s+)?Behinderung(?:en)?${END}`, adjTarget('Behindert'));
  addPhrase(P`${NO}[Mm]enschen\s+mit\s+(?:einer\s+)?intellektuelle[rn]\s+Beeinträchtigung(?:en)?${END}`,
    function (g, offset, str) {
      const kind = phrasePlural(str, offset);
      if (!kind) return null;
      return lowerStart('geistig Behindert' + adjEnding(kind), str, offset);
    });
  addPhrase(P`${NO}(?:[Aa]utistische[n]?\s+Menschen|[Mm]enschen\s+mit\s+Autismus)${END}`,
    nounTarget('Autisten', 'Autisten'));
  addPhrase(P`${NO}[Mm]enschen\s+mit\s+(?:einer\s+)?psychische[rn]\s+(?:Erkrankung|Störung)(?:en)?${END}`,
    function (g, offset, str) {
      const kind = phrasePlural(str, offset);
      if (!kind) return null;
      return lowerStart('psychisch Krank' + adjEnding(kind), str, offset);
    });
  addPhrase(P`${NO}(?:[Oo]bdachlose[n]?\s+Menschen|[Ww]ohnungslose[n]?\s+Menschen|[Mm]enschen\s+ohne\s+(?:festen\s+)?(?:Wohnung|Obdach|Wohnsitz))${END}`,
    adjTarget('Obdachlos'));
  addPhrase(P`${NO}[Mm]enschen\s+ohne\s+(?:gesicherten|sicheren|legalen)\s+Aufenthalts(?:status|titel)${END}`,
    adjNounTarget('illegal', 'Migranten'));
  addPhrase(P`${NO}[Tt]rans[ \-](?:Menschen|Personen)${END}`, adjTarget('Transsexuell'));
  addPhrase(P`${NO}[Vv]ersklavte[n]?\s+Menschen${END}`, nounTarget('Sklaven', 'Sklaven'));
  addPhrase(P`${NO}(?:[Bb]etroffen|[Üü]berlebend)(e|en|er)\s+(?:von\s+)?sexualisierter\s+Gewalt${END}`,
    nominalTarget('Vergewaltigungsopfer', 'Vergewaltigungsopfern', true));
  addPhrase(P`${NO}[Vv]on\s+Rassismus\s+betroffene[n]?\s+Menschen${END}`,
    nounTarget('Opfer von Rassismus', 'Opfern von Rassismus'));
  addPhrase(P`${NO}(?:BI[_*:+ \-]?(?:PoCs?|POCs?)|PoCs?|People\s+of\s+Colou?r|Person\s+of\s+Colou?r)(?![\p{L}\-])`,
    function (g, offset, str) {
      // "PoC" kann auch "Proof of Concept" heißen
      if (/(?:[Pp]roof[ \-]of[ \-][Cc]oncept|Konzeptnachweis|[Ee]xploit|Schwachstelle|Sicherheitslücke|CVE-)/.test(str)) return null;
      const kind = phrasePlural(str, offset);
      if (!kind) return null;
      const adj = /^BI/.test(g[0]) ? 'nichtweiß' : 'schwarz';
      return lowerStart(adj + adjEnding(kind) + ' Menschen', str, offset);
    });

  // Einwanderungsgeschichte -> Migrationshintergrund (weiblich wird männlich, Artikel passt sich an)
  const FEM_BASE = { die: 'd', eine: 'ein', keine: 'kein', meine: 'mein', deine: 'dein', seine: 'sein',
    ihre: 'ihr', unsere: 'unser', eure: 'euer' };
  const FEM_BASE_ER = { der: 'd', einer: 'ein', keiner: 'kein', meiner: 'mein', deiner: 'dein',
    seiner: 'sein', ihrer: 'ihr', unserer: 'unser', eurer: 'euer' };
  function mascForm(base, c) {
    if (base === 'd') return { nom: 'der', acc: 'den', dat: 'dem', gen: 'des' }[c];
    const e = base === 'euer' && c !== 'nom' ? 'eur' : base;
    return e + { nom: '', acc: 'en', dat: 'em', gen: 'es' }[c];
  }
  const FEM_ART = '[Dd]ie|[Ee]ine|[Kk]eine|[Mm]eine|[Dd]eine|[Ss]eine|[Ii]hre|[Uu]nsere|[Ee]ure|' +
    '[Dd]er|[Ee]iner|[Kk]einer|[Mm]einer|[Dd]einer|[Ss]einer|[Ii]hrer|[Uu]nserer|[Ee]urer';
  addPhrase(P`${NO}(?:(${FEM_ART})\s+)?(?:Einwanderungs|Zuwanderungs)geschichte${END}`, function (g, offset, str) {
    const art = g[1];
    const prev = lastWord(str.slice(0, offset));
    let out = 'Migrationshintergrund';
    if (!art) {
      // Adjektiv direkt davor ("ihre schwierige Einwanderungsgeschichte"): Artikel nicht anpassbar
      if (/^\p{Ll}{3,}(?:e|en|er|es|em)$/u.test(prev) && !DAT_PREP.has(prev) && !GEN_PREP.has(prev) &&
          !ACC_PREP.has(prev)) return null;
      return out;
    }
    const a = art.toLowerCase();
    let c = null;
    let base = null;
    if (FEM_BASE[a]) { base = FEM_BASE[a]; c = ACC_PREP.has(prev) ? 'acc' : 'nom'; }
    else { base = FEM_BASE_ER[a]; c = DAT_PREP.has(prev) ? 'dat' : 'gen'; }
    let w = mascForm(base, c);
    if (/^\p{Lu}/u.test(art)) w = cap(w);
    if (c === 'gen') out = 'Migrationshintergrunds';
    return w + ' ' + out;
  });
  addPhrase(P`${NO}Transition${END}`, function (g, offset, str) {
    if (!/(?:[Tt]rans(?:[ \-]|\*|gender|sexuell)|[Gg]eschlecht|Hormon|Geschlechtsidentität)/u.test(str)) return null;
    return 'Geschlechtsumwandlung';
  });

  // Schwarz als Adjektiv großgeschrieben vor Personenbezeichnungen: klein, außer am Satzanfang
  const PERSON_NOUNS = P`(?:Menschen?|Frauen?|Männer[n]?|Mann|Personen?|Kinder[n]?|Jugendliche[nr]?|Mädchen|Jungen?|Deutsche[nr]?|Amerikaner(?:innen)?|Bevölkerung|Community|Gemeinschaft|Kolleg(?:en|e)|Studenten|Schüler[n]?|Aktivisten|Künstler[n]?|Autoren|Lehrer[n]?|Eltern|Familien?|Briten|Bürger[n]?|Migranten|Frauen|Aktivistinnen|Stimmen|Perspektiven?)`;
  const reSchwarz = new RegExp(P`${NO}Schwarz(e|en|er|es|em)(\s+${PERSON_NOUNS})${END}`, 'gu');

  // *weiß* in Textform: Sternchen oder Unterstriche um das Wort entfernen
  const reWeissMark = new RegExp(P`(?<![\p{L}])[*_](weiß(?:e|en|er|es|em)?)[*_](?![\p{L}])`, 'gu');

  function oldTerms(t, opts) {
    for (let i = 0; i < SIMPLE_TERMS.length; i++) {
      t = termReplace(t, SIMPLE_TERMS[i][0], opts, function (g) {
        const f = SIMPLE_TERMS[i][1];
        return typeof f === 'function' ? f(g) : f;
      });
    }
    for (let i = 0; i < OLD_TERMS.length; i++) {
      t = termReplace(t, OLD_TERMS[i][0], opts, OLD_TERMS[i][1]);
    }
    t = termReplace(t, reSchwarz, opts, function (g, offset, str) {
      if (startsSentence(str, offset)) return null;
      return 'schwarz' + g[1] + g[2];
    });
    t = t.replace(reWeissMark, '$1');
    return t;
  }

  // --- Begriffe, die heute als abwertend gelten (eigener Schalter) ---
  const HARSH = [];
  function addHarsh(source, build) { HARSH.push([new RegExp(source, 'gu'), build]); }

  // "das N-Wort" zu "das Wort Neger", "des N-Wortes" zu "des Wortes Neger"; ohne Artikel nur "Neger"
  const DET_WORT = '(?:[Dd]as|[Dd]es|[Dd]em|[Dd]ieses|[Dd]iesem|[Ee]in|[Ee]ines|[Ee]inem|[Kk]ein|[Kk]eines|[Kk]einem|[Jj]enes)';
  function wortHarsh(letter, name) {
    addHarsh(P`(?<![\p{L}])(${DET_WORT}\s+)?${letter}[\-‐‑]Wort(es|s)?${END}`, function (g) {
      return g[1] ? g[1] + 'Wort' + (g[2] || '') + ' ' + name : name;
    });
  }
  wortHarsh('N', 'Neger');
  wortHarsh('Z', 'Zigeuner');
  addHarsh(P`${NO}Schokok(uss|üsse|üssen)${END}`, function (g) {
    return 'Negerk' + g[1];
  });
  addHarsh(P`${NO}(?:Paprika(sauce|soße)|(?:Sauce|Soße) ungarischer Art)${END}`, function (g) {
    const soße = /oße/.test(g[0]);
    return 'Zigeuner' + (soße ? 'soße' : 'sauce');
  });
  addHarsh(P`${NO}(?:Paprikaschnitzel|Schnitzel ungarischer Art)${END}`, function () {
    return 'Zigeunerschnitzel';
  });
  addHarsh(P`${NO}(?:Sinti\s+und\s+Roma|Roma\s+und\s+Sinti)${END}`, function (g, offset, str) {
    const kind = termCtx(str.slice(0, offset));
    if (kind === 'sg') return null;
    return isDative(kind) ? 'Zigeunern' : 'Zigeuner';
  });

  function oldTermsHarsh(t, opts) {
    for (let i = 0; i < HARSH.length; i++) {
      t = termReplace(t, HARSH[i][0], opts, HARSH[i][1]);
    }
    return t;
  }

  // "weiß" in Kursiv: Text des Elements prüfen. Gibt die neue Schreibweise zurück
  // (null: nicht zuständig). Großgeschrieben wird, wenn das Wort als Hauptwort steht
  // ("die weißen sind da", ohne folgendes Hauptwort) oder am Satzanfang.
  function whiteItalic(word, before, after) {
    const w = String(word).trim();
    if (!/^weiß(?:e|en|er|es|em)?$/i.test(w)) return null;
    before = String(before);
    const nextWord = (String(after).match(/^\s*(\p{L}[\p{L}\-]*)/u) || [])[1];
    if (nextWord && /^\p{Lu}/u.test(nextWord)) {
      return /[.!?…]\s*$/.test(before) ? cap(w) : w; // Adjektiv vor Hauptwort
    }
    const kind = termCtx(before);
    const plural = /^weiß(?:e|en|er)$/.test(w);
    if (plural && (kind === 'weak' || kind === 'weakdat' || kind === 'weakgen' || kind === 'strong') &&
        (!nextWord || /^\p{Ll}/u.test(nextWord))) return cap(w);
    return /[.!?…]\s*$/.test(before) ? cap(w) : w;
  }

  // ---------------------------------------------------------------------
  // Einstiegspunkt
  // ---------------------------------------------------------------------

  // Unsichtbare Trennzeichen (Soft Hyphen, Zero-Width-Zeichen), die Seiten in Wörter einbauen
  const INVISIBLE = /[\u00AD\u200B\u200C\u200D\u2060]/;
  const INVISIBLE_ALL = /[\u00AD\u200B\u200C\u200D\u2060]/g;

  function entgender(text, opts) {
    if (INVISIBLE.test(text)) {
      // Erst ohne Trennzeichen prüfen: Wurde nichts geändert, bleibt der Originaltext erhalten.
      const plain = text.replace(INVISIBLE_ALL, '');
      const out = entgenderCore(plain, opts);
      return out === plain ? text : out;
    }
    return entgenderCore(text, opts);
  }

  function entgenderCore(text, opts) {
    let t = text;
    for (let i = 0; i < opts.custom.length; i++) {
      opts.custom[i].re.lastIndex = 0;
      t = t.replace(opts.custom[i].re, function () { return opts.custom[i].to; });
    }
    if (t.length < 4) return t;
    const r = opts.rules;
    const gq = QUICK.test(t);
    const tq = (r.oldTerms || r.oldTermsHarsh) && QUICK_TERMS.test(t);
    if (!gq && !tq) return t;
    if (gq) {
      if (r.determiners) t = determiners(t);
      if (r.articles) t = articles(t);
      if (r.abbreviations) t = abbreviations(t, opts);
      if (r.indefinite) t = indefinite(t, opts);
      if (r.doubles) t = doubles(t, opts);
      if (r.gap) t = gap(t, opts);
      if (r.participles) t = participles(t, opts);
    }
    if (tq) {
      if (r.oldTerms) t = oldTerms(t, opts);
      if (r.oldTermsHarsh) t = oldTermsHarsh(t, opts);
    }
    return t;
  }

  const api = {
    DEFAULT_SETTINGS: DEFAULT_SETTINGS,
    mergeSettings: mergeSettings,
    buildOptions: buildOptions,
    siteDisabled: siteMatches,
    entgender: entgender,
    quickCheck: quickCheck,
    whiteItalic: whiteItalic,
    pluralMasc: pluralMasc,
    singularMasc: singularMasc
  };

  root.Entgender = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
