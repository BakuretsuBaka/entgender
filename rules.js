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
    rules: { gap: true, doubles: true, determiners: true, articles: true, participles: true, abbreviations: true, indefinite: false },
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
  // Einstiegspunkt
  // ---------------------------------------------------------------------

  function entgender(text, opts) {
    let t = text;
    for (let i = 0; i < opts.custom.length; i++) {
      opts.custom[i].re.lastIndex = 0;
      t = t.replace(opts.custom[i].re, function () { return opts.custom[i].to; });
    }
    if (!quickCheck(t)) return t;
    const r = opts.rules;
    if (r.determiners) t = determiners(t);
    if (r.articles) t = articles(t);
    if (r.abbreviations) t = abbreviations(t, opts);
    if (r.indefinite) t = indefinite(t, opts);
    if (r.doubles) t = doubles(t, opts);
    if (r.gap) t = gap(t, opts);
    if (r.participles) t = participles(t, opts);
    return t;
  }

  const api = {
    DEFAULT_SETTINGS: DEFAULT_SETTINGS,
    mergeSettings: mergeSettings,
    buildOptions: buildOptions,
    siteDisabled: siteMatches,
    entgender: entgender,
    quickCheck: quickCheck,
    pluralMasc: pluralMasc,
    singularMasc: singularMasc
  };

  root.Entgender = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
