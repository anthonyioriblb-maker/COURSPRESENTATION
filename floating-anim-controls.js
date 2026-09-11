/* ===================================================================
   BOUTON VOLANT — contrôle flottant des animations (COURSPRESENTATION)
   -------------------------------------------------------------------
   Fichier PARTAGÉ, chargé par toutes les présentations qui contiennent
   au moins une iframe d'animation. Ne jamais dupliquer cette logique
   dans un script de chapitre : ajouter uniquement, en fin de <body>,
   après le script du chapitre :
       <script src="../../floating-anim-controls.js"></script>

   Rôle : quand une animation (iframe pointant vers un fichier
   animations/*.html) est visible à l'écran, affiche une petite barre
   flottante (Précédent / Suivant / Reprendre) qui pilote cette
   animation à distance, pour qu'on puisse avancer/reculer sans avoir
   à faire défiler jusqu'aux boutons propres de l'animation (ou aux
   boutons de la présentation, hors champ quand l'animation remplit
   l'écran).

   Protocole postMessage (contrat entre présentation et animation) :
     Présentation → animation : { type: 'symAnimCmd',  cmd: 'next'|'prev'|'reset'|'sync' }
     Animation   → présentation : { type: 'symAnimState', nextText, nextDisabled, prevDisabled }
   (Nom historique "symAnimState/symAnimCmd" conservé pour rester
   compatible avec les animations déjà pontées avant la généralisation
   de sept. 2026 — Chapitre2_Symetrie_Centrale, animation-coordonnees.)
   =================================================================== */
(function () {
    'use strict';

    var bar, btnPrev, btnNext, btnReset;
    var activeFrame = null;
    var pollTimer = null;

    function buildBar() {
        bar = document.createElement('div');
        bar.id = 'floatAnimCtrl';
        bar.innerHTML =
            '<button id="floatAnimPrev" type="button" disabled>◀ Préc.</button>' +
            '<button id="floatAnimNext" type="button">Suiv. ▶</button>' +
            '<button id="floatAnimReset" type="button">🔄 Reprendre</button>';
        document.body.appendChild(bar);

        btnPrev = document.getElementById('floatAnimPrev');
        btnNext = document.getElementById('floatAnimNext');
        btnReset = document.getElementById('floatAnimReset');

        btnPrev.addEventListener('click', function () { sendCmd('prev'); });
        btnNext.addEventListener('click', function () { sendCmd('next'); });
        btnReset.addEventListener('click', function () { sendCmd('reset'); });
    }

    function sendCmd(cmd) {
        if (activeFrame && activeFrame.contentWindow) {
            activeFrame.contentWindow.postMessage({ type: 'symAnimCmd', cmd: cmd }, '*');
        }
    }

    // Une iframe d'animation est "visible" si elle est dans la slide
    // active ET (elle n'est dans aucun .step, ou son .step ancêtre le
    // plus proche a déjà été révélé avec la classe "visible").
    function findVisibleFrame() {
        var frames = document.querySelectorAll('.slide.active iframe[src*="animations/"]');
        for (var i = 0; i < frames.length; i++) {
            var f = frames[i];
            var stepAncestor = f.closest ? f.closest('.step') : null;
            if (!stepAncestor || stepAncestor.classList.contains('visible')) {
                return f;
            }
        }
        return null;
    }

    function refresh() {
        var frame = findVisibleFrame();
        if (frame !== activeFrame) {
            activeFrame = frame;
            if (activeFrame) {
                bar.style.display = 'flex';
                btnPrev.disabled = true;
                btnNext.disabled = false;
                btnNext.textContent = 'Suiv. ▶';
                sendCmd('sync');
            } else {
                bar.style.display = 'none';
            }
        }
    }

    window.addEventListener('message', function (e) {
        if (!e.data || e.data.type !== 'symAnimState') return;
        if (!activeFrame || e.source !== activeFrame.contentWindow) return;
        var txt = e.data.nextText || '';
        btnNext.textContent = /termin[ée]/i.test(txt) ? '✓ Fini' : 'Suiv. ▶';
        btnNext.disabled = !!e.data.nextDisabled;
        btnPrev.disabled = !!e.data.prevDisabled;
    });

    function init() {
        buildBar();
        refresh();
        pollTimer = setInterval(refresh, 300);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
