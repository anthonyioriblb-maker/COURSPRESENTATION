/* ===================================================================
   STYLO — annotations à main levée sur les présentations (COURSPRESENTATION)
   -------------------------------------------------------------------
   Fichier PARTAGÉ. Pour l'activer sur une présentation, ajouter en fin
   de <body>, après le script du chapitre :
       <script src="../../stylo.js"></script>

   - Bouton ✏️ flottant (à gauche) : ouvre la barre d'outils et active le stylo.
   - Couleurs, 3 épaisseurs, gomme, « tout effacer » (diapo courante).
   - Souris, stylet et doigt (TBI / écran tactile).
   - Les annotations sont gardées par diapo tant que la page est ouverte.
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
    document.body.appendChild(bar);

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

    // ---------- dessin ----------
    function tracer(t) {
        var p = t.pts;
        if (!p.length) return;
        ctx.save();
        ctx.globalCompositeOperation = t.gomme ? 'destination-out' : 'source-over';
        ctx.strokeStyle = t.couleur;
        ctx.fillStyle = t.couleur;
        ctx.lineWidth = t.epaisseur;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        if (p.length === 1) {
            ctx.beginPath();
            ctx.arc(p[0][0], p[0][1], t.epaisseur / 2, 0, 2 * Math.PI);
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.moveTo(p[0][0], p[0][1]);
            for (var i = 1; i < p.length - 1; i++) {
                var mx = (p[i][0] + p[i + 1][0]) / 2, my = (p[i][1] + p[i + 1][1]) / 2;
                ctx.quadraticCurveTo(p[i][0], p[i][1], mx, my);
            }
            ctx.lineTo(p[p.length - 1][0], p[p.length - 1][1]);
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
    }
    function point(e) {
        var r = canvas.getBoundingClientRect();
        return [e.clientX - r.left, e.clientY - r.top];
    }

    canvas.addEventListener('pointerdown', function (e) {
        if (!actif || (e.pointerType === 'mouse' && e.button !== 0)) return;
        e.preventDefault();
        verifierDiapo();
        canvas.setPointerCapture(e.pointerId);
        var gomme = (outil === 'gomme') || e.button === 5;   // bouton gomme d'un stylet
        trait = { couleur: couleur, epaisseur: gomme ? GOMME : epaisseur, gomme: gomme, pts: [point(e)] };
        redessiner();
    });
    canvas.addEventListener('pointermove', function (e) {
        if (!trait) return;
        e.preventDefault();
        trait.pts.push(point(e));
        redessiner();
    });
    function finTrait() {
        if (!trait) return;
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
    new MutationObserver(function () { verifierDiapo(); dimensionner(); })
        .observe(content, { subtree: true, attributes: true, attributeFilter: ['class'] });
    window.addEventListener('resize', dimensionner);
    if (window.ResizeObserver) new ResizeObserver(dimensionner).observe(content);

    verifierDiapo();
    majBarre();
})();
