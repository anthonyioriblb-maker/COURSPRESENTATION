#!/usr/bin/env python3
"""Génère une présentation d'exercices (un exercice par diapo, correction sur bouton, stylo)
à partir d'une feuille d'exercices MathsIORI et de sa correction.

Usage :
    python3 outils/generer_exercices.py <sujet.html> <correction.html> <sortie.html>

- La feuille et sa correction doivent avoir leurs exercices dans des <div class="exercice">,
  dans le même ordre, avec un titre <div class="exercice-titre">.
- Le fichier produit est autonome (images intégrées) et marche hors ligne ; il charge
  styles.css et stylo.js de COURSPRESENTATION par chemin relatif.
- À relancer chaque fois que la feuille ou sa correction change.
"""
import sys, os, re, base64, mimetypes, html
from bs4 import BeautifulSoup

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # COURSPRESENTATION


def lire(p):
    with open(p, encoding='utf-8') as f:
        return f.read()


def regles_css(css, mots):
    """Règles de premier niveau (hors @media) dont le sélecteur contient un des mots."""
    out, i, n = [], 0, len(css)
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
    n = len(css)
    while i < n:
        j = css.find('{', i)
        if j < 0:
            break
        sel = css[i:j].strip()
        depth, k = 1, j + 1
        while k < n and depth:
            if css[k] == '{': depth += 1
            elif css[k] == '}': depth -= 1
            k += 1
        bloc = css[j:k]
        if not sel.startswith('@') and any(m in sel for m in mots):
            out.append(sel + ' ' + bloc)
        i = k
    return '\n'.join(out)


def styles_page(soup):
    """<style> de la page, sans les règles d'impression ni @page."""
    css = '\n'.join(s.get_text() for s in soup.find_all('style'))
    css = re.sub(r'@page\s*\{[^}]*\}', '', css)
    # retire les blocs @media print { ... }
    while True:
        m = re.search(r'@media\s+print\s*\{', css)
        if not m:
            break
        depth, k = 1, m.end()
        while k < len(css) and depth:
            if css[k] == '{': depth += 1
            elif css[k] == '}': depth -= 1
            k += 1
        css = css[:m.start()] + css[k:]
    return css


def limiter_css(css):
    """Ne garde du CSS de la page que ce qui concerne le contenu des exercices :
    les règles de mise en page (body, html, .container, .page, h1, .home-button…) sont
    retirées, et chaque sélecteur est préfixé par .slide pour ne pas toucher à la présentation."""
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
    out, i, n = [], 0, len(css)
    while i < n:
        j = css.find('{', i)
        if j < 0:
            break
        sel = css[i:j].strip()
        depth, k = 1, j + 1
        while k < n and depth:
            if css[k] == '{': depth += 1
            elif css[k] == '}': depth -= 1
            k += 1
        bloc = css[j:k]
        i = k
        if sel.startswith('@'):
            if sel.startswith('@media') and 'print' not in sel:
                out.append(sel + ' {' + limiter_css(bloc[1:-1]) + '}')
            elif sel.startswith(('@font-face', '@keyframes')):
                out.append(sel + ' ' + bloc)
            continue
        garde = []
        for x in sel.split(','):
            x = x.strip()
            premier = re.split(r'[\s>+~:]', x, 1)[0]
            if premier in ('html', 'body', '*', ':root', '.container', '.page', 'h1', '.home-button',
                           '.subtitle', '.toolbar', '.lien-corrige', '.content', '.controls') or x.startswith(':root'):
                continue
            garde.append('.slide ' + x)
        if garde:
            out.append(', '.join(garde) + ' ' + bloc)
    return '\n'.join(out)


def integrer_images(bloc, dossier):
    for img in bloc.find_all('img'):
        src = img.get('src', '')
        if not src or src.startswith('data:') or re.match(r'https?:', src):
            continue
        chemin = os.path.normpath(os.path.join(dossier, src))
        if os.path.exists(chemin):
            mime = mimetypes.guess_type(chemin)[0] or 'image/png'
            with open(chemin, 'rb') as f:
                img['src'] = 'data:%s;base64,%s' % (mime, base64.b64encode(f.read()).decode())


RE_TITRE = re.compile(r'^\s*exercice\s*(\d+)', re.I)
A_RETIRER = ['.home-button', '.lien-corrige', 'script', 'button', '.no-print', '.toolbar']


def est_titre(el):
    if not getattr(el, 'name', None):
        return False
    if 'exercice-titre' in (el.get('class') or []):
        return True
    return el.name in ('h2', 'h3', 'h4') and bool(RE_TITRE.match(el.get_text(' ', strip=True)))


def contient_titre(el):
    return getattr(el, 'name', None) and (est_titre(el) or any(est_titre(d) for d in el.find_all(True)))


def exercices(chemin):
    """Découpe une feuille en exercices. Reconnaît :
    - <div class="exercice"> avec <div class="exercice-titre"> ou un <h2> « Exercice N » dedans ;
    - un bloc quelconque (div.bloc…) qui ne contient qu'un titre « Exercice N » ;
    - un titre « Exercice N » suivi de ses éléments frères, jusqu'au titre suivant.
    Ce qui précède le premier exercice (figure commune…) est renvoyé à part (préambule).
    Renvoie (soup, titre_page, préambule_html, [(numéro, titre, html), ...])."""
    soup = BeautifulSoup(lire(chemin), 'html.parser')
    sous_titre = soup.select_one('.subtitle')
    sous_titre = sous_titre.get_text(' ', strip=True) if sous_titre else ''
    for sel in A_RETIRER + ['.subtitle']:
        for el in soup.select(sel):
            el.decompose()
    integrer_images(soup, os.path.dirname(chemin))
    titres = [t for t in soup.find_all(True) if est_titre(t)]
    # un titre dans un titre (h2 dans .exercice-titre…) : garder l'extérieur
    titres = [t for t in titres if not any(est_titre(p) for p in t.parents)]
    def nb_titres(el):
        return sum(1 for d in el.find_all(True) if est_titre(d) and not any(est_titre(q) for q in d.parents))

    # 1er passage (arbre intact) : le bloc de chaque exercice
    blocs = []
    for t in titres:
        bloc, p = None, t.parent
        while p is not None and p.name not in ('body', '[document]') and nb_titres(p) == 1:
            bloc, p = p, p.parent
        blocs.append(bloc)
    # préambule : ce qui précède le premier exercice, à son niveau (figure commune…)
    preambule = ''
    if titres:
        ancre = blocs[0] or titres[0]
        avant = []
        for fr in ancre.previous_siblings:
            if getattr(fr, 'name', None) in ('h1', 'style', 'link', 'meta', 'title', 'header'):
                break
            if getattr(fr, 'name', None) and fr.get_text(strip=True) or getattr(fr, 'name', None) in ('svg', 'img', 'figure'):
                avant.insert(0, str(fr))
        preambule = ''.join(avant).strip()
    # 2e passage : contenu de chaque exercice
    res = []
    for t, bloc in zip(titres, blocs):
        num = RE_TITRE.match(t.get_text(' ', strip=True))
        num = int(num.group(1)) if num else len(res) + 1
        titre = t.get_text(' ', strip=True).rstrip(' :')
        if bloc is not None:
            morceaux = [str(c) for c in bloc.contents if c is not t]
        else:
            morceaux = []
            for fr in t.next_siblings:
                if contient_titre(fr):
                    break
                morceaux.append(str(fr))
        res.append((num, titre, ''.join(morceaux).strip()))
    titre_page = soup.h1.get_text(' ', strip=True) if soup.h1 else os.path.basename(chemin)
    if sous_titre:
        titre_page += ' – ' + sous_titre
    return soup, titre_page, preambule, res


def main():
    if len(sys.argv) != 4:
        print(__doc__); sys.exit(1)
    sujet, corr, sortie = map(os.path.abspath, sys.argv[1:])
    s_soup, titre, preambule, ex_s = exercices(sujet)
    c_soup, _, _, ex_c = exercices(corr)
    corr_par_num = {n: h for n, _, h in ex_c}
    if sorted(n for n, _, _ in ex_s) != sorted(n for n, _, _ in ex_c):
        print('Attention : exercices %s dans le sujet, %s dans la correction.' % ([n for n, _, _ in ex_s], [n for n, _, _ in ex_c]))

    mi_css = os.path.join(os.path.dirname(RACINE), 'MathsIORI', 'styles.css')
    css_maths = regles_css(lire(mi_css), ['.frac', '.fraction', '.numerateur', '.denominateur',
                                          '.sqrt', '.angle', '.couleur-speciale']) if os.path.exists(mi_css) else ''
    css_page = limiter_css(styles_page(s_soup)) + '\n' + limiter_css(styles_page(c_soup))

    # Version « coup de pouce » : <sujet>_Aide.html à côté du sujet (mêmes numéros d'exercices).
    # Bouton « 💡 Coup de pouce » (touche A) : remplace l'énoncé par l'énoncé guidé.
    f_aide = sujet[:-5] + '_Aide.html'
    aide_par_num = {}
    if os.path.exists(f_aide):
        a_soup, _, _, ex_a = exercices(f_aide)
        aide_par_num = {n: h for n, _, h in ex_a}
        css_page += '\n' + limiter_css(styles_page(a_soup))

    prof = os.path.relpath(RACINE, os.path.dirname(sortie)).replace(os.sep, '/')

    # Bouton « 📘 Propriétés » : si le dossier du chapitre contient proprietes.html (fragment HTML),
    # il s'affiche en grand au tableau (touche R). Fichier côté COURSPRESENTATION, invisible des élèves.
    f_prop = os.path.join(os.path.dirname(os.path.dirname(sortie)), 'proprietes.html')
    btn_prop = overlay_prop = ''
    if os.path.exists(f_prop):
        btn_prop = '\n      <button onclick="basculerProp()" title="Propriétés du chapitre (touche R)">📘 Propriétés</button>'
        overlay_prop = ('\n<div id="propChap" onclick="if(event.target===this)basculerProp()"><div class="boite">%s'
                        '<button class="fermer" onclick="basculerProp()">Fermer</button></div></div>' % lire(f_prop))

    diapos = []
    menu = []
    for i, (num, t, contenu) in enumerate(ex_s):
        corr_html = corr_par_num.get(num, '<p>Pas de correction pour cet exercice.</p>')
        if preambule:
            contenu = '<div class="preambule">%s</div>' % preambule + contenu
        aide_html = ('<div class="aide-box" hidden>%s</div>\n' % aide_par_num[num]) if num in aide_par_num else ''
        diapos.append(
            '<div class="slide" data-titre="%s">\n<h2>%s</h2>\n<div class="enonce">%s</div>\n%s'
            '<div class="zone-ecriture"></div>\n'
            '<div class="correction-box" hidden>\n<div class="correction-titre">Correction</div>\n%s\n</div>\n</div>'
            % (html.escape(t, quote=True), html.escape(t), contenu, aide_html, corr_html))
        menu.append('<button onclick="allerA(%d)">%s</button>' % (i + 1, html.escape(t)))

    page = '''<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>%(titre)s</title>
<link rel="stylesheet" href="%(prof)s/styles.css">
<style>
/* --- Règles mathématiques reprises de MathsIORI/styles.css --- */
%(css_maths)s
/* --- Styles propres à la feuille --- */
%(css_page)s
/* --- Présentation des exercices --- */
/* pas d'effet de soulèvement au survol : il faisait trembler le menu des exercices */
button:hover { transform: none !important; }
.container { width: 100%%; height: 100vh; border-radius: 0; }
.content { padding: 12px 30px 16px; }
.controls { padding: 4px 10px; gap: 10px; }
.controls-left, .controls-right { gap: 6px; }
.controls button { padding: 4px 12px; font-size: .85em; border-radius: 7px; }
.controls #styloBar.integre button { width: 26px; height: 26px; font-size: 14px; padding: 0; border-radius: 6px; }
.controls #styloBar.integre .pastille { width: 14px; height: 14px; }
.controls #styloBar.integre .trait { width: 16px; }
.controls #styloBar.integre hr { height: 18px; }
.slide { text-align: left; font-size: 1.05em; }
.slide.titre-feuille { text-align: center; }
.slide.titre-feuille h1 { font-size: 2.2em; margin: 30px 0 10px; }
.slide h2 { font-size: 1.25em; text-decoration: none; color: #c2185b; border-bottom: 3px solid #eba8cc; padding-bottom: 6px; margin: 0 0 14px; text-align: left; }
.enonce, .enonce *, .correction-box, .correction-box * { color: #111; }
.enonce .faux, .correction-box .faux { color: #c0392b; } .enonce .vrai, .correction-box .vrai { color: #1e8449; }
.correction-box .correction-titre { color: #2e7d32; }
.enonce { font-size: .82em; cursor: zoom-in; transition: font-size .2s; }
.enonce.grand { font-size: 1.3em; cursor: zoom-out; }
.enonce .fig svg { width: 300px; }
.enonce.grand .fig svg { width: 560px; }
.fig svg { width: 420px; max-width: 100%%; height: auto; }
.enonce img, .correction-box img { max-width: 100%%; }
.enonce { background: #ffe6f0; border-left: 6px solid #eba8cc; padding: 10px 16px; border-radius: 8px; }
.zone-ecriture { min-height: 300px; margin-top: 12px; border: 2px dashed #ddd; border-radius: 8px; position: relative; }
.zone-ecriture::before { content: 'Zone de correction'; position: absolute; top: 6px; right: 12px; color: #bbb; font-size: .8em; }
.correction-box { scroll-margin-top: 12px; font-size: 40px; background: #e8f5e9; border-left: 6px solid #43a047; padding: 14px 20px; border-radius: 8px; margin-top: 18px; }
.correction-box[hidden] { display: none; }
.correction-titre { font-weight: bold; color: #2e7d32; margin-bottom: 6px; }
.correction-box { overflow-x: auto; }
.correction-box table { font-size: .6em; }
.correction-box svg.croquis { width: 320px; height: auto; }
.correction-box svg, .correction-box img { max-width: 100%%; height: auto; }
.enonce p, .correction-box p { margin: 6px 0; }
#captMsg { position: fixed; left: 50%%; bottom: 60px; transform: translateX(-50%%); background: #2c3e50; color: #fff; padding: 8px 16px; border-radius: 8px; font-size: 15px; z-index: 4000; opacity: 0; transition: opacity .3s; pointer-events: none; }
#captMsg.vu { opacity: 1; }
#captRecadre { position: fixed; inset: 0; background: rgba(0,0,0,.8); z-index: 3500; display: none; flex-direction: column; align-items: center; justify-content: center; gap: 10px; }
#captRecadre.ouvert { display: flex; }
#captRecadre .barre { color: #fff; font-size: 16px; display: flex; gap: 10px; align-items: center; }
#captRecadre img { max-width: 94vw; max-height: 84vh; cursor: crosshair; user-select: none; -webkit-user-drag: none; background: #fff; }
#captRecadre .sel { position: fixed; border: 3px dashed #f1c40f; background: rgba(241,196,15,.15); pointer-events: none; display: none; }
.capture .enonce { background: #fff; border-left-color: #8e44ad; text-align: center; }
.capture-img { width: 60%%; max-width: 100%%; }
.capture .enonce.grand .capture-img { width: 100%%; }
.capt-suppr { float: right; font-size: .55em; padding: 4px 10px; background: #e74c3c; color: #fff; border: none; border-radius: 6px; cursor: pointer; }
.liste-ex { display: flex; flex-wrap: wrap; gap: 14px; justify-content: center; margin-top: 30px; }
.liste-ex button, #menuEx button { font-size: 1em; }
#btnCorr.ouvert { background: #43a047; }
#menuEx { position: fixed; inset: 0; background: rgba(0,0,0,.45); display: none; align-items: center; justify-content: center; z-index: 3000; }
#menuEx.ouvert { display: flex; }
.aide-box { background: #fff8e1; border-left: 6px solid #f9a825; padding: 10px 16px; border-radius: 8px; font-size: .95em; color: #111; }
.aide-box[hidden] { display: none; }
.aide-box .fig svg, .aide-box .duo > .fig svg { width: 300px; }
.aide-box .etape .num { display: inline-block !important; width: auto !important; }
.aide-box .mini .fig svg { width: 200px; }
.aide-box .exercice { border: none !important; padding: 0 !important; margin: 0 !important; }
#btnAide.ouvert, #btnCorr.ouvert { box-shadow: inset 0 0 0 2px #fff; }
#propChap { position: fixed; inset: 0; background: rgba(0,0,0,.45); display: none; align-items: center; justify-content: center; z-index: 3000; }
#propChap.ouvert { display: flex; }
#propChap .boite { background: #fff; border-radius: 14px; padding: 22px 30px; max-width: 92vw; max-height: 88vh; overflow: auto; font-size: 30px; line-height: 1.45; color: #111; border-left: 8px solid #2471a3; }
#propChap .boite h2 { margin: 0 0 12px; color: #2471a3; font-size: 1.1em; }
#propChap .boite p { margin: 8px 0; }
#propChap .fermer { display: block; margin: 14px auto 0; font-size: 18px; }
#menuEx .boite { background: #fff; border-radius: 14px; padding: 20px 26px; display: flex; flex-direction: column; gap: 10px; min-width: 320px; }
</style>
</head>
<body>
<div class="container">
  <div class="content">
    <div class="slide titre-feuille active">
      <h1>%(titre)s</h1>
      <div class="liste-ex">%(menu)s</div>
    </div>
%(diapos)s
  </div>
  <div class="controls">
    <div class="controls-left">
      <button class="btn-menu" onclick="ouvrirMenu()">☰ Exercices</button>
      <button id="btnCorr" onclick="basculerCorrection()">✅ Correction</button>
      <button onclick="agrandirZone()" title="Ajouter de la place pour écrire (touche +)">➕ Place</button>%(btn_prop)s%(btn_aide)s
      <button onclick="captCapturer()" title="Capturer un exercice d'un manuel en ligne (ou Cmd+V pour coller une capture d'écran)">📸 Capture</button>
    </div>
    <div class="progress"><span id="numEx"></span></div>
    <div class="controls-right">
      <button id="prevBtn" onclick="changer(-1)">◀ Précédent</button>
      <button onclick="changer(1)">Suivant ▶</button>
    </div>
  </div>
</div>
<div id="menuEx" onclick="if(event.target===this)fermerMenu()"><div class="boite">%(menu)s<button onclick="fermerMenu()">Fermer</button></div></div>%(overlay_prop)s
<script>
var slides = document.querySelectorAll('.slide'), cur = 0;
function afficher(n) {
  cur = Math.max(0, Math.min(slides.length - 1, n));
  slides.forEach(function (s, i) { s.classList.toggle('active', i === cur); });
  document.querySelector('.content').scrollTop = 0;
  majCorr(); majAide(); ajusterZone();
  var nbEx = document.querySelectorAll('.slide:not(.capture)').length - 1;
  document.getElementById('numEx').textContent = !cur ? '' : (slides[cur].dataset.capture ? slides[cur].dataset.titre : 'Exercice ' + cur + ' / ' + nbEx);
  document.getElementById('prevBtn').disabled = cur === 0;
}
// La zone d'écriture remplit la place qui reste sous l'énoncé
function ajusterZone() {
  var z = slides[cur].querySelector('.zone-ecriture'); if (!z) return;
  var c = document.querySelector('.content');
  var extra = parseInt(z.dataset.extra || '0', 10);
  z.style.height = Math.floor(Math.max(300, c.clientHeight - (z.getBoundingClientRect().top - c.getBoundingClientRect().top + c.scrollTop) - 40) + extra) + 'px';
}
// Bouton « ➕ Place » : allonge la zone blanche et descend dessus
function agrandirZone() {
  var z = slides[cur].querySelector('.zone-ecriture'); if (!z) return;
  var c = document.querySelector('.content'), pas = Math.round(c.clientHeight * 0.6);
  z.dataset.extra = parseInt(z.dataset.extra || '0', 10) + pas;
  ajusterZone();
  c.scrollBy({ top: pas, behavior: 'smooth' });
}
window.addEventListener('resize', ajusterZone);
function changer(d) { afficher(cur + d); }
function allerA(n) { fermerMenu(); afficher(n); }
function boiteAide() { return slides[cur].querySelector('.aide-box'); }
function majAide() {
  var btn = document.getElementById('btnAide'); if (!btn) return;
  var b = boiteAide();
  btn.disabled = !b;
  btn.classList.toggle('ouvert', !!b && !b.hidden);
  btn.textContent = (b && !b.hidden) ? '📄 Énoncé normal' : '💡 Coup de pouce';
}
function basculerAide() {
  var b = boiteAide(); if (!b) return;
  b.hidden = !b.hidden;
  slides[cur].querySelector('.enonce').style.display = b.hidden ? '' : 'none';
  majAide(); ajusterZone();
}
function boiteCorr() { return slides[cur].querySelector('.correction-box'); }
function majCorr() {
  var b = boiteCorr(), btn = document.getElementById('btnCorr');
  btn.disabled = !b;
  btn.classList.toggle('ouvert', !!b && !b.hidden);
  btn.textContent = (b && !b.hidden) ? '🙈 Masquer la correction' : '✅ Correction';
}
function basculerCorrection() {
  var b = boiteCorr(); if (!b) return;
  b.hidden = !b.hidden; majCorr();
  if (!b.hidden) b.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function basculerProp() { document.getElementById('propChap').classList.toggle('ouvert'); }
function ouvrirMenu() { document.getElementById('menuEx').classList.add('ouvert'); }
function fermerMenu() { document.getElementById('menuEx').classList.remove('ouvert'); }
document.querySelectorAll('.enonce').forEach(function (el) {
  el.title = 'Cliquer pour agrandir / réduire';
  el.addEventListener('click', function () { el.classList.toggle('grand'); setTimeout(ajusterZone, 250); });
});
document.addEventListener('keydown', function (e) {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ' || e.key === 'PageDown') { e.preventDefault(); changer(1); }
  else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); changer(-1); }
  else if (e.key === 'c' || e.key === 'C') basculerCorrection();
  else if (e.key === 'm' || e.key === 'M') ouvrirMenu();
  else if (e.key === '+' || e.key === '=') agrandirZone();
  else if ((e.key === 'a' || e.key === 'A') && document.getElementById('btnAide')) basculerAide();
  else if ((e.key === 'r' || e.key === 'R') && document.getElementById('propChap')) basculerProp();
  else if (e.key === 'Escape') { fermerMenu(); var pc = document.getElementById('propChap'); if (pc) pc.classList.remove('ouvert'); }
});
/* ===== Captures d'exercices (manuels en ligne) =====
   - Cmd+V (ou Ctrl+V) : colle une capture d'écran (Cmd+Ctrl+Maj+4 sur Mac) → nouvelle diapo.
   - Bouton « 📸 Capture » : choisir l'onglet/la fenêtre du manuel, puis recadrer l'exercice.
   - Les captures sont enregistrées sur cet ordinateur (IndexedDB) et retrouvées à la réouverture. */
var CAPT_CLE = 'captures:' + location.pathname, captures = [], captDB = null;
function captOuvrirDB(fn) {
  try {
    var r = indexedDB.open('presentations-captures', 1);
    r.onupgradeneeded = function () { r.result.createObjectStore('pages'); };
    r.onsuccess = function () { captDB = r.result; fn(); };
    r.onerror = function () { fn(); };
  } catch (e) { fn(); }
}
function captEnregistrer() {
  if (!captDB) return;
  try { captDB.transaction('pages', 'readwrite').objectStore('pages').put(captures, CAPT_CLE); } catch (e) {}
}
function captCharger(fn) {
  if (!captDB) return fn([]);
  try {
    var r = captDB.transaction('pages').objectStore('pages').get(CAPT_CLE);
    r.onsuccess = function () { fn(r.result || []); };
    r.onerror = function () { fn([]); };
  } catch (e) { fn([]); }
}
function captMessage(t) {
  var m = document.getElementById('captMsg');
  m.textContent = t; m.classList.add('vu');
  clearTimeout(m._t); m._t = setTimeout(function () { m.classList.remove('vu'); }, 4000);
}
function rafraichirSlides() { slides = document.querySelectorAll('.slide'); }
function captDiapo(c) {
  var s = document.createElement('div');
  s.className = 'slide capture';
  s.dataset.titre = c.titre; s.dataset.capture = c.id;
  s.innerHTML = '<h2>' + c.titre + ' <button class="capt-suppr" title="Supprimer cette capture">🗑 Supprimer</button></h2>' +
    '<div class="enonce"><img class="capture-img" alt="Capture"></div><div class="zone-ecriture"></div>';
  s.querySelector('img').src = c.src;
  var en = s.querySelector('.enonce');
  en.title = 'Cliquer pour agrandir / réduire';
  en.addEventListener('click', function () { en.classList.toggle('grand'); setTimeout(ajusterZone, 250); });
  s.querySelector('.capt-suppr').addEventListener('click', function (e) { e.stopPropagation(); captSupprimer(c.id); });
  document.querySelector('.content').appendChild(s);
  ['.liste-ex', '#menuEx .boite'].forEach(function (sel) {
    var zone = document.querySelector(sel); if (!zone) return;
    var b = document.createElement('button');
    b.className = 'btn-capture'; b.dataset.capture = c.id; b.textContent = '📸 ' + c.titre;
    b.addEventListener('click', function () { allerA(Array.prototype.indexOf.call(slides, s)); });
    var fermer = sel === '#menuEx .boite' ? zone.lastElementChild : null;
    zone.insertBefore(b, fermer);
  });
  rafraichirSlides();
  return s;
}
function captAjouter(src) {
  var n = 1;
  captures.forEach(function (c) { var k = parseInt(c.titre.replace(/\D/g, ''), 10); if (k >= n) n = k + 1; });
  var c = { id: String(Date.now()), titre: 'Capture ' + n, src: src };
  captures.push(c); captEnregistrer();
  var s = captDiapo(c);
  afficher(Array.prototype.indexOf.call(slides, s));
  captMessage('✔ ' + c.titre + ' ajoutée et enregistrée sur cet ordinateur');
}
function captSupprimer(id) {
  captures = captures.filter(function (c) { return c.id !== id; });
  captEnregistrer();
  document.querySelectorAll('[data-capture="' + id + '"]').forEach(function (el) { el.remove(); });
  rafraichirSlides();
  afficher(Math.min(cur, slides.length - 1));
}
// réduit les très grandes images (place mémoire), garde le PNG pour la netteté du texte
function captDepuisImage(img, rect) {
  var r = rect || { x: 0, y: 0, w: img.naturalWidth || img.width, h: img.naturalHeight || img.height };
  var k = Math.min(1, 2000 / r.w), cv = document.createElement('canvas');
  cv.width = Math.round(r.w * k); cv.height = Math.round(r.h * k);
  cv.getContext('2d').drawImage(img, r.x, r.y, r.w, r.h, 0, 0, cv.width, cv.height);
  return cv.toDataURL('image/png');
}
// coller une capture
document.addEventListener('paste', function (e) {
  var t = e.target && e.target.tagName;
  if (t === 'INPUT' || t === 'TEXTAREA') return;
  var items = (e.clipboardData || {}).items || [];
  for (var i = 0; i < items.length; i++) {
    if (items[i].type.indexOf('image') === 0) {
      e.preventDefault();
      var img = new Image(), url = URL.createObjectURL(items[i].getAsFile());
      img.onload = function () { captAjouter(captDepuisImage(img)); URL.revokeObjectURL(url); };
      img.src = url;
      return;
    }
  }
});
// bouton « 📸 Capture » : capture d'un onglet / d'une fenêtre puis recadrage
function captCapturer() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
    captMessage('Capture impossible ici : fais Cmd+Ctrl+Maj+4 puis Cmd+V dans la présentation');
    return;
  }
  navigator.mediaDevices.getDisplayMedia({ video: true, audio: false }).then(function (flux) {
    var v = document.createElement('video');
    v.srcObject = flux; v.muted = true;
    v.onloadedmetadata = function () {
      v.play().then(function () {
        setTimeout(function () {
          var cv = document.createElement('canvas');
          cv.width = v.videoWidth; cv.height = v.videoHeight;
          cv.getContext('2d').drawImage(v, 0, 0);
          flux.getTracks().forEach(function (tr) { tr.stop(); });
          captRecadrer(cv.toDataURL('image/png'));
        }, 350);
      });
    };
  }).catch(function () { captMessage('Capture annulée'); });
}
function captRecadrer(src) {
  var ov = document.getElementById('captRecadre'), img = ov.querySelector('img'), sel = ov.querySelector('.sel');
  var d = null, r = null;
  img.onload = function () { ov.classList.add('ouvert'); sel.style.display = 'none'; r = null; };
  img.src = src;
  function pt(e) { var b = img.getBoundingClientRect(); return [Math.max(0, Math.min(b.width, e.clientX - b.left)), Math.max(0, Math.min(b.height, e.clientY - b.top)), b]; }
  img.onpointerdown = function (e) { e.preventDefault(); d = pt(e); img.setPointerCapture(e.pointerId); };
  img.onpointermove = function (e) {
    if (!d) return;
    var p = pt(e), b = p[2];
    r = { x: Math.min(d[0], p[0]), y: Math.min(d[1], p[1]), w: Math.abs(p[0] - d[0]), h: Math.abs(p[1] - d[1]) };
    sel.style.display = 'block';
    sel.style.left = (b.left + r.x) + 'px'; sel.style.top = (b.top + r.y) + 'px';
    sel.style.width = r.w + 'px'; sel.style.height = r.h + 'px';
  };
  img.onpointerup = function () { d = null; };
  ov.querySelector('.ok').onclick = function () {
    var k = img.naturalWidth / img.getBoundingClientRect().width;
    var zone = (r && r.w > 10 && r.h > 10) ? { x: r.x * k, y: r.y * k, w: r.w * k, h: r.h * k } : null;
    ov.classList.remove('ouvert');
    captAjouter(captDepuisImage(img, zone));
  };
  ov.querySelector('.annuler').onclick = function () { ov.classList.remove('ouvert'); };
}
captOuvrirDB(function () {
  captCharger(function (liste) {
    captures = liste;
    captures.forEach(captDiapo);
  });
});
afficher(0);
</script>
<div id="captMsg"></div>
<div id="captRecadre"><div class="barre">Trace un rectangle autour de l'exercice (ou garde toute l'image)
  <button class="ok">✔ Ajouter</button><button class="annuler">✖ Annuler</button></div><img alt=""><div class="sel"></div></div>
<script src="%(prof)s/stylo.js"></script>
</body>
</html>
''' % {'titre': html.escape(titre), 'prof': prof, 'css_maths': css_maths, 'css_page': css_page,
       'menu': ''.join(menu), 'diapos': '\n'.join(diapos), 'btn_prop': btn_prop, 'overlay_prop': overlay_prop,
       'btn_aide': ('\n      <button id="btnAide" onclick="basculerAide()" title="Énoncé guidé (touche A)">💡 Coup de pouce</button>' if aide_par_num else '')}
    os.makedirs(os.path.dirname(sortie), exist_ok=True)
    with open(sortie, 'w', encoding='utf-8') as f:
        f.write(page)
    print('OK : %d exercices -> %s' % (len(ex_s), sortie))


if __name__ == '__main__':
    main()
