/* ===================================================================
   STYLO — annotations à main levée sur les présentations (COURSPRESENTATION)
   -------------------------------------------------------------------
   Fichier PARTAGÉ. Pour l'activer sur une présentation, ajouter en fin
   de <body>, après le script du chapitre :
       <script src="../../stylo.js"></script>

   - Barre d'outils placée dans la barre du bas, à la place de l'indicateur
     « Étape / Slide » (masqué). À défaut, bouton ✏️ flottant à gauche.
   - ✏️ active le stylo (✖ pour quitter) ; choisir une couleur l'active aussi.
   - Couleurs, 3 épaisseurs, gomme, « tout effacer » (diapo courante).
   - Souris, stylet et doigt (TBI / écran tactile).
   - Les annotations sont gardées par diapo tant que la page est ouverte.
   - Chaque trait est accroché à l'élément sur lequel il commence (étape,
     encadré, titre…) : si le texte se décale (nouvelle étape affichée,
     redimensionnement), le trait suit. Un trait posé sur une étape est
     masqué quand on revient avant cette étape.
   - Stylo actif : il capte les clics sur la diapo (boutons des animations
     inclus). Les boutons du bas et le clavier (flèches, espace) restent actifs.
   - Raccourcis : P = stylo, G = gomme, Échap = quitter le stylo.
   =================================================================== */
(function () {
    'use strict';

    var COULEURS = ['#222222', '#e74c3c', '#2980b9', '#27ae60', '#f39c12'];
    var EPAISSEURS = [3, 6, 11];
    var GOMME = 34;

    var content = document.querySelector('.content');
    if (!content) return;
    if (getComputedStyle(content).position === 'static') content.style.position = 'relative';

    var canvas = document.createElement('canvas');
    canvas.id = 'styloCanvas';
    content.appendChild(canvas);
    var ctx = canvas.getContext('2d');

    var actif = false, outil = 'stylo', couleur = COULEURS[1], epaisseur = EPAISSEURS[0];
    var dessins = {};          // index de diapo -> liste de traits
    var trait = null;          // trait en cours
    var diapoCourante = -1;

    // ---------- styles ----------
    var css = document.createElement('style');
    css.textContent =
        '#styloCanvas{position:absolute;left:0;top:0;pointer-events:none;z-index:50;}' +
        '#styloCanvas.on{pointer-events:auto;touch-action:none;cursor:crosshair;}' +
        '#styloCanvas.on.gomme{cursor:cell;}' +
        '#styloBar{position:fixed;left:14px;top:50%;transform:translateY(-50%);z-index:2000;display:flex;flex-direction:column;align-items:center;gap:8px;' +
        'background:rgba(44,62,80,0.92);padding:8px;border-radius:14px;box-shadow:0 4px 14px rgba(0,0,0,0.3);}' +
        '#styloBar button{all:unset;box-sizing:border-box;width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;' +
        'cursor:pointer;font-size:20px;color:#fff;background:rgba(255,255,255,0.08);}' +
        '#styloBar button:hover{background:rgba(255,255,255,0.22);}' +
        '#styloBar button.sel{outline:3px solid #fff;outline-offset:-3px;}' +
        '#styloBar .pastille{width:22px;height:22px;border-radius:50%;border:2px solid #fff;}' +
        '#styloBar .trait{background:#fff;border-radius:4px;width:24px;}' +
        '#styloBar .outils{display:none;flex-direction:column;align-items:center;gap:8px;}' +
        '#styloBar.ouvert .outils{display:flex;}' +
        '#styloBar hr{width:30px;border:none;border-top:1px solid rgba(255,255,255,0.3);margin:0;}' +
        // version intégrée à la barre du bas
        '#styloBar.integre{position:static;transform:none;flex-direction:row;flex-wrap:nowrap;gap:4px;padding:0;background:none;box-shadow:none;border-radius:0;}' +
        '#styloBar.integre .outils{display:flex;flex-direction:row;gap:4px;}' +
        '#styloBar.integre button{width:34px;height:34px;font-size:17px;border-radius:8px;}' +
        '#styloBar.integre .pastille{width:18px;height:18px;}' +
        '#styloBar.integre .trait{width:20px;}' +
        '#styloBar.integre hr{width:0;height:24px;border-top:none;border-left:1px solid rgba(255,255,255,0.3);margin:0 2px;}' +
        '@media print{#styloBar,#styloCanvas{display:none !important;}}';
    document.head.appendChild(css);

    // ---------- barre d'outils ----------
    var bar = document.createElement('div');
    bar.id = 'styloBar';
    var html = '<button id="styloToggle" title="Stylo (P)">✏️</button><div class="outils">';
    COULEURS.forEach(function (c, i) {
        html += '<button class="couleur" data-i="' + i + '" title="Couleur"><span class="pastille" style="background:' + c + '"></span></button>';
    });
    html += '<hr>';
    EPAISSEURS.forEach(function (e, i) {
        html += '<button class="epaisseur" data-i="' + i + '" title="Épaisseur"><span class="trait" style="height:' + Math.max(2, e - 1) + 'px"></span></button>';
    });
    html += '<hr><button id="styloGomme" title="Gomme (G)">🧽</button>' +
            '<button id="styloEffacer" title="Tout effacer sur cette diapo">🗑️</button></div>';
    bar.innerHTML = html;
    var progress = document.querySelector('.controls .progress');
    if (progress) {
        progress.style.display = 'none';           // « Étape x/y – Slide x/y » remplacé par les outils
        bar.classList.add('integre');
        progress.parentNode.insertBefore(bar, progress.nextSibling);
    } else {
        document.body.appendChild(bar);
    }

    var btnToggle = document.getElementById('styloToggle');
    var btnGomme = document.getElementById('styloGomme');

    function majBarre() {
        bar.classList.toggle('ouvert', actif);
        btnToggle.classList.toggle('sel', actif);
        btnToggle.textContent = actif ? '✖' : '✏️';
        btnToggle.title = actif ? 'Quitter le stylo (Échap)' : 'Stylo (P)';
        canvas.classList.toggle('on', actif);
        canvas.classList.toggle('gomme', outil === 'gomme');
        btnGomme.classList.toggle('sel', outil === 'gomme');
        bar.querySelectorAll('.couleur').forEach(function (b) {
            b.classList.toggle('sel', outil === 'stylo' && COULEURS[b.dataset.i] === couleur);
        });
        bar.querySelectorAll('.epaisseur').forEach(function (b) {
            b.classList.toggle('sel', EPAISSEURS[b.dataset.i] === epaisseur);
        });
    }
    function setActif(v) { actif = v; if (v) dimensionner(); majBarre(); }

    btnToggle.addEventListener('click', function () { setActif(!actif); });
    bar.querySelectorAll('.couleur').forEach(function (b) {
        b.addEventListener('click', function () { couleur = COULEURS[b.dataset.i]; outil = 'stylo'; setActif(true); });
    });
    bar.querySelectorAll('.epaisseur').forEach(function (b) {
        b.addEventListener('click', function () { epaisseur = EPAISSEURS[b.dataset.i]; if (outil === 'gomme') outil = 'stylo'; setActif(true); });
    });
    btnGomme.addEventListener('click', function () { outil = (outil === 'gomme') ? 'stylo' : 'gomme'; setActif(true); });
    document.getElementById('styloEffacer').addEventListener('click', function () {
        dessins[diapoCourante] = [];
        redessiner();
    });

    // ---------- diapo courante & taille du canevas ----------
    function indexDiapo() {
        var s = content.querySelectorAll('.slide');
        for (var i = 0; i < s.length; i++) if (s[i].classList.contains('active')) return i;
        return 0;
    }
    function dimensionner() {
        var dpr = window.devicePixelRatio || 1;
        var w = content.clientWidth;
        var slide = content.querySelectorAll('.slide')[diapoCourante];
        var bas = slide ? slide.offsetTop + slide.offsetHeight + 30 : 0;
        var h = Math.max(content.clientHeight, bas);
        if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
            canvas.width = Math.round(w * dpr);
            canvas.height = Math.round(h * dpr);
            canvas.style.width = w + 'px';
            canvas.style.height = h + 'px';
            redessiner();
        }
    }
    function verifierDiapo() {
        var i = indexDiapo();
        if (i !== diapoCourante) {
            trait = null;
            diapoCourante = i;
            dimensionner();
            redessiner();
        }
    }

    // ---------- ancrage des traits sur le texte ----------
    function versHTML(el) {
        while (el && !(el instanceof HTMLElement)) el = el.parentElement;
        return el;
    }
    function ancreSous(x, y) {            // x, y : coordonnées écran
        canvas.style.pointerEvents = 'none';
        var el = document.elementFromPoint(x, y);
        canvas.style.pointerEvents = '';
        el = versHTML(el);
        // on ignore les étapes pas encore affichées (elles occupent la place mais sont invisibles)
        var st = el && el.closest('.step');
        while (st && !st.classList.contains('visible')) {
            el = st.parentElement;
            st = el && el.closest('.step');
        }
        if (!el || el === content || !content.contains(el) || el.classList.contains('slide')) return null;
        return el;                        // l'élément le plus précis sous le trait (mot, fraction, encadré…)
    }
    function pos(el) {                    // position dans .content, sans les transformations CSS
        var x = 0, y = 0;
        while (el && el !== content) { x += el.offsetLeft; y += el.offsetTop; el = el.offsetParent; }
        return [x, y];
    }
    function visible(t) {
        var a = t.ancre;
        if (!a) return true;
        if (!a.isConnected || a.offsetParent === null) return false;
        var st = a.closest('.step');
        return !st || st.classList.contains('visible');
    }
    function decalage(t) {
        if (!t.ancre) return [0, 0];
        var p = pos(t.ancre);
        return [p[0] - t.ax, p[1] - t.ay];
    }

    // ---------- dessin ----------
    function tracer(t) {
        if (!visible(t)) return;
        var d = decalage(t), dx = d[0], dy = d[1];
        var p = t.pts;
        if (!p.length) return;
        ctx.save();
        ctx.strokeStyle = t.couleur;
        ctx.fillStyle = t.couleur;
        ctx.lineWidth = t.epaisseur;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        if (p.length === 1) {
            ctx.beginPath();
            ctx.arc(p[0][0] + dx, p[0][1] + dy, t.epaisseur / 2, 0, 2 * Math.PI);
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.moveTo(p[0][0] + dx, p[0][1] + dy);
            for (var i = 1; i < p.length - 1; i++) {
                var mx = (p[i][0] + p[i + 1][0]) / 2, my = (p[i][1] + p[i + 1][1]) / 2;
                ctx.quadraticCurveTo(p[i][0] + dx, p[i][1] + dy, mx + dx, my + dy);
            }
            ctx.lineTo(p[p.length - 1][0] + dx, p[p.length - 1][1] + dy);
            ctx.stroke();
        }
        ctx.restore();
    }
    function redessiner() {
        var dpr = window.devicePixelRatio || 1;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        (dessins[diapoCourante] || []).forEach(tracer);
        if (trait) tracer(trait);
        if (gommeCurseur) {
            ctx.save();
            ctx.strokeStyle = 'rgba(0,0,0,0.45)';
            ctx.setLineDash([4, 3]);
            ctx.beginPath();
            ctx.arc(gommeCurseur[0], gommeCurseur[1], GOMME / 2, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.restore();
        }
    }
    function point(e) {
        var r = canvas.getBoundingClientRect();
        return [e.clientX - r.left, e.clientY - r.top];
    }
    // points rapprochés (≤ 3 px) pour que la gomme coupe proprement
    function densifier(pts) {
        var out = [pts[0]];
        for (var i = 1; i < pts.length; i++) {
            var a = out[out.length - 1], b = pts[i];
            var d = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.floor(d / 3);
            for (var k = 1; k <= n; k++) out.push([a[0] + (b[0] - a[0]) * k / (n + 1), a[1] + (b[1] - a[1]) * k / (n + 1)]);
            out.push(b);
        }
        return out;
    }

    // ---------- gomme : coupe les traits là où elle passe ----------
    var gommeCurseur = null, gommeDernier = null;
    function gommer(c) {
        var liste = dessins[diapoCourante];
        if (!liste) return;
        var res = [];
        liste.forEach(function (t) {
            if (!visible(t)) { res.push(t); return; }
            var d = decalage(t), r = GOMME / 2 + t.epaisseur / 2;
            var morceau = [], touche = false;
            t.pts.forEach(function (p) {
                if (Math.hypot(p[0] + d[0] - c[0], p[1] + d[1] - c[1]) <= r) {
                    touche = true;
                    if (morceau.length) res.push(copie(t, morceau));
                    morceau = [];
                } else morceau.push(p);
            });
            if (!touche) { res.push(t); return; }
            if (morceau.length) res.push(copie(t, morceau));
        });
        dessins[diapoCourante] = res;
    }
    function copie(t, pts) {
        return { couleur: t.couleur, epaisseur: t.epaisseur, ancre: t.ancre, ax: t.ax, ay: t.ay, pts: pts };
    }
    function gommerVers(c) {              // interpole entre deux positions de la gomme
        if (gommeDernier) {
            var d = Math.hypot(c[0] - gommeDernier[0], c[1] - gommeDernier[1]);
            var n = Math.ceil(d / (GOMME / 3));
            for (var k = 1; k < n; k++) gommer([gommeDernier[0] + (c[0] - gommeDernier[0]) * k / n, gommeDernier[1] + (c[1] - gommeDernier[1]) * k / n]);
        }
        gommer(c);
        gommeDernier = c;
    }

    canvas.addEventListener('pointerdown', function (e) {
        if (!actif || (e.pointerType === 'mouse' && e.button !== 0)) return;
        e.preventDefault();
        verifierDiapo();
        canvas.setPointerCapture(e.pointerId);
        var p = point(e);
        if (outil === 'gomme' || e.button === 5) {      // 5 = bouton gomme d'un stylet
            gommeEnCours = true; gommeDernier = null; gommeCurseur = p;
            gommerVers(p);
        } else {
            var an = ancreSous(e.clientX, e.clientY), ap = an ? pos(an) : [0, 0];
            trait = { couleur: couleur, epaisseur: epaisseur, ancre: an, ax: ap[0], ay: ap[1], pts: [p] };
        }
        redessiner();
    });
    var gommeEnCours = false;
    canvas.addEventListener('pointermove', function (e) {
        var p = point(e);
        if (gommeEnCours) { e.preventDefault(); gommeCurseur = p; gommerVers(p); redessiner(); return; }
        if (actif && outil === 'gomme') { gommeCurseur = p; redessiner(); return; }
        if (!trait) return;
        e.preventDefault();
        trait.pts.push(p);
        redessiner();
    });
    canvas.addEventListener('pointerleave', function () { if (gommeCurseur && !gommeEnCours) { gommeCurseur = null; redessiner(); } });
    function finTrait() {
        if (gommeEnCours) { gommeEnCours = false; gommeDernier = null; redessiner(); return; }
        if (!trait) return;
        trait.pts = densifier(trait.pts);
        (dessins[diapoCourante] = dessins[diapoCourante] || []).push(trait);
        trait = null;
        redessiner();
    }
    canvas.addEventListener('pointerup', finTrait);
    canvas.addEventListener('pointercancel', finTrait);

    // ---------- clavier ----------
    document.addEventListener('keydown', function (e) {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        var t = e.target && e.target.tagName;
        if (t === 'INPUT' || t === 'TEXTAREA') return;
        if (e.key === 'p' || e.key === 'P') { if (outil === 'gomme') outil = 'stylo'; setActif(!(actif && outil === 'stylo')); }
        else if (e.key === 'g' || e.key === 'G') { outil = 'gomme'; setActif(true); }
        else if (e.key === 'Escape' && actif) { setActif(false); }
    });

    // ---------- suivi des changements de diapo / de taille ----------
    // Toute modification de la mise en page (étape affichée, redimensionnement,
    // iframe qui grandit…) → on recalcule la taille et on redessine (traits recalés).
    var rafPrevu = false;
    function actualiser() {
        if (rafPrevu) return;
        rafPrevu = true;
        requestAnimationFrame(function () {
            rafPrevu = false;
            verifierDiapo();
            dimensionner();
            redessiner();
        });
    }
    new MutationObserver(actualiser)
        .observe(content, { subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'style', 'height', 'width'] });
    window.addEventListener('resize', actualiser);
    if (window.ResizeObserver) {
        var ro = new ResizeObserver(actualiser);
        ro.observe(content);
        content.querySelectorAll('.slide').forEach(function (sl) { ro.observe(sl); });
    }

    verifierDiapo();
    majBarre();
})();
