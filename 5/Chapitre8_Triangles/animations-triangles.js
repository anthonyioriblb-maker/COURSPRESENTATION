// ============================================================
//  Animations SVG interactives – Chapitre 8 Les triangles
//  Constructions à la règle, au compas et au rapporteur
// ============================================================

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

/* ════════════════════════════════════════════════════════════
   UTILITAIRES COMMUNS : Règle animée
   ════════════════════════════════════════════════════════════ */
function buildRuler(gId, x0, yBottom, nCm, pxPerCm) {
    const g = document.getElementById(gId);
    if (!g) return;
    const NS = 'http://www.w3.org/2000/svg';
    const h = 36, yTop = yBottom - h, totalW = nCm * pxPerCm + 22, xStart = x0 - 7;
    const rect = document.createElementNS(NS, 'rect');
    rect.setAttribute('x', xStart); rect.setAttribute('y', yTop);
    rect.setAttribute('width', totalW); rect.setAttribute('height', h);
    rect.setAttribute('rx', '3'); rect.setAttribute('fill', 'rgba(215,235,255,0.93)');
    rect.setAttribute('stroke', '#4488bb'); rect.setAttribute('stroke-width', '1.8');
    g.appendChild(rect);
    const edge = document.createElementNS(NS, 'line');
    edge.setAttribute('x1', xStart); edge.setAttribute('y1', yBottom);
    edge.setAttribute('x2', (xStart + totalW).toString()); edge.setAttribute('y2', yBottom);
    edge.setAttribute('stroke', '#2266aa'); edge.setAttribute('stroke-width', '2.5');
    g.appendChild(edge);
    const shine = document.createElementNS(NS, 'line');
    shine.setAttribute('x1', (xStart + 4).toString()); shine.setAttribute('y1', (yTop + 4).toString());
    shine.setAttribute('x2', (xStart + totalW - 4).toString()); shine.setAttribute('y2', (yTop + 4).toString());
    shine.setAttribute('stroke', 'rgba(255,255,255,0.65)'); shine.setAttribute('stroke-width', '3');
    shine.setAttribute('stroke-linecap', 'round'); g.appendChild(shine);
    const totalMm = nCm * 10;
    for (let mm = 0; mm <= totalMm; mm++) {
        const x = x0 + mm * pxPerCm / 10;
        let tH, sw, col;
        if (mm % 10 === 0)     { tH = 20; sw = 1.6; col = '#223'; }
        else if (mm % 5 === 0) { tH = 13; sw = 1.2; col = '#446'; }
        else                   { tH = 6;  sw = 0.8; col = '#779'; }
        const ln = document.createElementNS(NS, 'line');
        ln.setAttribute('x1', x.toFixed(1)); ln.setAttribute('y1', (yBottom - tH).toString());
        ln.setAttribute('x2', x.toFixed(1)); ln.setAttribute('y2', yBottom.toString());
        ln.setAttribute('stroke', col); ln.setAttribute('stroke-width', sw.toString());
        g.appendChild(ln);
        if (mm % 10 === 0 && mm > 0) {
            const tx = document.createElementNS(NS, 'text');
            tx.setAttribute('x', x.toFixed(1)); tx.setAttribute('y', (yTop + 15).toString());
            tx.setAttribute('text-anchor', 'middle'); tx.setAttribute('font-size', '12');
            tx.setAttribute('font-weight', 'bold'); tx.setAttribute('fill', '#223');
            tx.textContent = String(mm / 10); g.appendChild(tx);
        }
    }
}

async function slideRuler(gId, dyFrom, dyTo, dur) {
    const g = document.getElementById(gId);
    if (!g) return;
    g.style.opacity = '1';
    const N = 26;
    for (let i = 0; i <= N; i++) {
        const dy = dyFrom + (dyTo - dyFrom) * i / N;
        g.setAttribute('transform', `translate(0,${dy.toFixed(1)})`);
        await sleep(dur / N);
    }
    if (dyTo < 0) g.style.opacity = '0';
}

/* ════════════════════════════════════════════════════════════
   UTILITAIRES COMPAS
   ════════════════════════════════════════════════════════════ */
function setCompass(ids, pt, pencilEnd) {
    const { hinge, pb, pt: ptEl, nb, bd, tp, pp } = ids;
    const hx = (pt.x + pencilEnd.x) / 2, hy = (pt.y + pencilEnd.y) / 2;
    function el(id) { return document.getElementById(id); }
    el(hinge).setAttribute('cx', hx); el(hinge).setAttribute('cy', hy);
    el(pb).setAttribute('x1', hx); el(pb).setAttribute('y1', hy);
    el(pb).setAttribute('x2', pt.x); el(pb).setAttribute('y2', pt.y);
    el(ptEl).setAttribute('cx', pt.x); el(ptEl).setAttribute('cy', pt.y);
    el(nb).setAttribute('x1', hx); el(nb).setAttribute('y1', hy);
    el(nb).setAttribute('x2', pencilEnd.x); el(nb).setAttribute('y2', pencilEnd.y);
    const ang = Math.atan2(pencilEnd.y - hy, pencilEnd.x - hx);
    el(bd).setAttribute('transform', `translate(${pencilEnd.x},${pencilEnd.y - 11}) rotate(${ang * 180 / Math.PI + 90})`);
    el(tp).setAttribute('transform', `translate(${pencilEnd.x - 4},${pencilEnd.y}) rotate(${ang * 180 / Math.PI + 90} 4 0)`);
    el(pp).setAttribute('cx', pencilEnd.x); el(pp).setAttribute('cy', pencilEnd.y);
}

async function animOpenCompass(ids, center, target, dur) {
    const s = 30;
    for (let i = 0; i <= s; i++) {
        const t = i / s;
        setCompass(ids, center, { x: center.x + (target.x - center.x) * t, y: center.y + (target.y - center.y) * t });
        await sleep(dur / s);
    }
}

async function animMoveCompass(ids, fp, fe, tp, te, dur) {
    const s = 38;
    for (let i = 0; i <= s; i++) {
        const t = i / s;
        setCompass(ids,
            { x: fp.x + (tp.x - fp.x) * t, y: fp.y + (tp.y - fp.y) * t },
            { x: fe.x + (te.x - fe.x) * t, y: fe.y + (te.y - fe.y) * t }
        );
        await sleep(dur / s);
    }
}

function drawArcPath(id, cx, cy, r, a0, a1, steps) {
    let d = '';
    for (let i = 0; i <= steps; i++) {
        const a = a0 + (a1 - a0) * i / steps;
        d += (i === 0 ? 'M ' : 'L ') + (cx + r * Math.cos(a)).toFixed(1) + ' ' + (cy + r * Math.sin(a)).toFixed(1) + ' ';
    }
    const el = document.getElementById(id);
    if (el) { el.setAttribute('d', d); el.style.opacity = '1'; }
}

async function animArc(pathId, cx, cy, r, a0, a1, dur) {
    const el = document.getElementById(pathId);
    if (!el) return;
    el.style.opacity = '1';
    const N = 48;
    let d = '';
    for (let i = 0; i <= N; i++) {
        const a = a0 + (a1 - a0) * i / N;
        d += (i === 0 ? 'M ' : 'L ') + (cx + r * Math.cos(a)).toFixed(1) + ' ' + (cy + r * Math.sin(a)).toFixed(1) + ' ';
        el.setAttribute('d', d);
        if (i < N) await sleep(dur / N);
    }
}

/* ════════════════════════════════════════════════════════════
   CONSTRUCTION 1 : 3 côtés
   A=(75,285) B=(405,285) C=(257,93)
   AB=330px=6cm @ 55px/cm, BC≈247px=4.5cm, AC≈275px=5cm
   ════════════════════════════════════════════════════════════ */
(function () {
    const A = { x: 75, y: 285 }, B = { x: 405, y: 285 }, C = { x: 257, y: 93 };
    const cIds = { hinge:'cHinge', pb:'cPointBranch', pt:'cPointTip', nb:'cPencilBranch', bd:'cPencilBody', tp:'cPencilTip', pp:'cPencilPoint' };
    let stepTri = 0, animating = false;
    const steps = [
        'Cliquez sur « Étape suivante » pour voir la construction.',
        'Étape 1 – On trace le segment [AB] de longueur 6 cm à la règle.',
        'Étape 2 – Compas ouvert à BC = 4,5 cm, pointe en B → arc de cercle.',
        'Étape 3 – Compas ouvert à AC = 5 cm, pointe en A → arc de cercle.',
        'Étape 4 – C est à l\'intersection des deux arcs. On trace [BC] et [AC].'
    ];

    buildRuler('rul1', 75, 285, 6, 55);

    window.nextStepTri = async function () {
        if (animating) return;
        animating = true;
        const btn = document.getElementById('btnNextTri');
        if (btn) btn.disabled = true;
        const compass = document.getElementById('compassTri');
        const txt = document.getElementById('stepTextTri');

        if (stepTri === 0) {
            if (txt) txt.textContent = steps[1];
            await slideRuler('rul1', -200, 0, 500);
            await sleep(200);
            document.getElementById('groupAB_tri').style.opacity = '1';
            const seg = document.getElementById('segAB_tri');
            const N = 38;
            for (let i = 0; i <= N; i++) {
                seg.setAttribute('x2', (A.x + (B.x - A.x) * i / N).toFixed(1));
                await sleep(680 / N);
            }
            await sleep(300);
            await slideRuler('rul1', 0, -200, 400);
            stepTri = 1;
        } else if (stepTri === 1) {
            if (txt) txt.textContent = steps[2];
            compass.style.opacity = '1';
            setCompass(cIds, B, B);
            await sleep(400);
            await animOpenCompass(cIds, B, C, 1300);
            await sleep(300);
            const aC = Math.atan2(C.y - B.y, C.x - B.x);
            drawArcPath('arcB_tri', B.x, B.y, 247, aC - 0.5, aC + 0.5, 60);
            document.getElementById('labelBC').style.opacity = '1';
            await sleep(700);
            stepTri = 2;
        } else if (stepTri === 2) {
            if (txt) txt.textContent = steps[3];
            const pencilBC = { x: B.x + 247 * Math.cos(Math.atan2(C.y - B.y, C.x - B.x)), y: B.y + 247 * Math.sin(Math.atan2(C.y - B.y, C.x - B.x)) };
            const pencilAC = { x: A.x + 275 * Math.cos(Math.atan2(C.y - A.y, C.x - A.x)), y: A.y + 275 * Math.sin(Math.atan2(C.y - A.y, C.x - A.x)) };
            await animMoveCompass(cIds, B, pencilBC, A, A, 900);
            await sleep(300);
            await animOpenCompass(cIds, A, pencilAC, 1200);
            await sleep(300);
            const aCA = Math.atan2(C.y - A.y, C.x - A.x);
            drawArcPath('arcA_tri', A.x, A.y, 275, aCA - 0.5, aCA + 0.5, 60);
            document.getElementById('labelAC').style.opacity = '1';
            await sleep(700);
            stepTri = 3;
        } else if (stepTri === 3) {
            if (txt) txt.textContent = steps[4];
            compass.style.opacity = '0';
            await sleep(300);
            document.getElementById('pointC_tri').style.opacity = '1';
            await sleep(500);
            document.getElementById('sideBC').style.opacity = '1';
            document.getElementById('sideAC').style.opacity = '1';
            if (btn) { btn.textContent = '— Fin —'; btn.style.backgroundColor = '#888'; }
            stepTri = 4;
        }
        animating = false;
        if (stepTri < 4 && btn) btn.disabled = false;
    };

    window.resetTri = function () {
        stepTri = 0; animating = false;
        const txt = document.getElementById('stepTextTri');
        if (txt) txt.textContent = steps[0];
        const compass = document.getElementById('compassTri');
        if (compass) compass.style.opacity = '0';
        document.getElementById('groupAB_tri').style.opacity = '0';
        document.getElementById('segAB_tri').setAttribute('x2', A.x.toString());
        const rul = document.getElementById('rul1');
        if (rul) { rul.setAttribute('transform', 'translate(0,-200)'); rul.style.opacity = '0'; }
        ['arcB_tri', 'arcA_tri'].forEach(id => {
            const el = document.getElementById(id);
            if (el) { el.setAttribute('d', ''); el.style.opacity = '0'; }
        });
        ['pointC_tri', 'sideBC', 'sideAC', 'labelBC', 'labelAC'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.opacity = '0';
        });
        const btn = document.getElementById('btnNextTri');
        if (btn) { btn.disabled = false; btn.textContent = 'Étape suivante ▶'; btn.style.backgroundColor = '#3498db'; }
    };
})();

/* ════════════════════════════════════════════════════════════
   CONSTRUCTION 2 : angle + 2 côtés adjacents
   A=(90,270) B=(340,270) C≈(215,115) — BAC=50°, AB=5cm, AC=4cm
   ════════════════════════════════════════════════════════════ */
(function () {
    const A = { x: 90, y: 270 }, B = { x: 340, y: 270 };
    const R_RAP = 76;
    const TARGET_DEG = 50;
    const cIds = { hinge:'c2h', pb:'c2pb', pt:'c2pt', nb:'c2nb', bd:'c2bd', tp:'c2tp', pp:'c2pp' };
    let step = 0, anim = false;

    const texts = [
        'Cliquez sur « Étape suivante » pour voir la construction.',
        'Étape 1 – On trace le segment [AB] de longueur 5 cm à la règle.',
        'Étape 2 – Rapporteur en A (0° vers B) : on repère 50°.',
        'Étape 3 – On trace la demi-droite [AC) dans la direction 50°.',
        'Étape 4 – Compas ouvert à 4 cm, pointe en A → arc sur [AC).',
        'Étape 5 – C est sur [AC) à 4 cm de A. On trace [BC].'
    ];

    function show(id) { const el = document.getElementById(id); if (el) el.style.opacity = '1'; }
    function hide(id) { const el = document.getElementById(id); if (el) el.style.opacity = '0'; }

    /* Rapporteur */
    function buildRap(gId, R, target, showLabels) {
        const g = document.getElementById(gId);
        if (!g) return;
        const NS = 'http://www.w3.org/2000/svg';
        const bg = document.createElementNS(NS, 'path');
        bg.setAttribute('d', `M ${R} 0 A ${R} ${R} 0 0 0 ${-R} 0 Z`);
        bg.setAttribute('fill', 'rgba(255,252,200,0.92)');
        bg.setAttribute('stroke', '#999'); bg.setAttribute('stroke-width', '1.5');
        g.appendChild(bg);
        for (let d = 0; d <= 180; d += 10) {
            const r = d * Math.PI / 180, maj = d % 30 === 0, inner = R - (maj ? 14 : 7);
            const mk = document.createElementNS(NS, 'line');
            mk.setAttribute('x1', (R * Math.cos(r)).toFixed(1)); mk.setAttribute('y1', (-R * Math.sin(r)).toFixed(1));
            mk.setAttribute('x2', (inner * Math.cos(r)).toFixed(1)); mk.setAttribute('y2', (-inner * Math.sin(r)).toFixed(1));
            mk.setAttribute('stroke', d === target ? '#c0392b' : '#666');
            mk.setAttribute('stroke-width', d === target ? '2.5' : (maj ? '2' : '1'));
            g.appendChild(mk);
            if (maj && showLabels) {
                const tx = document.createElementNS(NS, 'text');
                tx.setAttribute('x', ((R + 11) * Math.cos(r)).toFixed(1));
                tx.setAttribute('y', (-(R + 11) * Math.sin(r) + 4).toFixed(1));
                tx.setAttribute('text-anchor', 'middle'); tx.setAttribute('font-size', '10');
                tx.setAttribute('fill', '#555'); tx.textContent = String(d);
                g.appendChild(tx);
            }
        }
        const bl = document.createElementNS(NS, 'line');
        bl.setAttribute('x1', (-R - 4).toString()); bl.setAttribute('y1', '0');
        bl.setAttribute('x2', (R + 4).toString()); bl.setAttribute('y2', '0');
        bl.setAttribute('stroke', '#888'); bl.setAttribute('stroke-width', '1.5');
        g.appendChild(bl);
        const dot = document.createElementNS(NS, 'circle');
        dot.setAttribute('cx', '0'); dot.setAttribute('cy', '0');
        dot.setAttribute('r', '3'); dot.setAttribute('fill', '#333');
        g.appendChild(dot);
        const ind = document.createElementNS(NS, 'line');
        ind.setAttribute('id', gId + '_ind'); ind.setAttribute('x1', '0'); ind.setAttribute('y1', '0');
        ind.setAttribute('x2', (R * 0.88).toFixed(1)); ind.setAttribute('y2', '0');
        ind.setAttribute('stroke', '#e74c3c'); ind.setAttribute('stroke-width', '2.5');
        ind.setAttribute('opacity', '0'); g.appendChild(ind);
    }

    async function sweep(gId, R, targetDeg, dur) {
        const ind = document.getElementById(gId + '_ind');
        if (!ind) return;
        ind.setAttribute('opacity', '1');
        const N = 42;
        for (let i = 0; i <= N; i++) {
            const r = (targetDeg * i / N) * Math.PI / 180;
            ind.setAttribute('x2', (R * 0.88 * Math.cos(r)).toFixed(1));
            ind.setAttribute('y2', (-R * 0.88 * Math.sin(r)).toFixed(1));
            await sleep(dur / N);
        }
    }

    function setComp2(dry, pen) { setCompass(cIds, dry, pen); }

    async function drawArc2(pathId, cx, cy, r, degStart, degEnd, dur) {
        const a0 = -degStart * Math.PI / 180, a1 = -degEnd * Math.PI / 180;
        const el = document.getElementById(pathId);
        if (!el) return;
        el.style.opacity = '1';
        const N = 48;
        let d = '';
        for (let i = 0; i <= N; i++) {
            const a = a0 + (a1 - a0) * i / N;
            d += (i === 0 ? 'M ' : 'L ') + (cx + r * Math.cos(a)).toFixed(1) + ' ' + (cy + r * Math.sin(a)).toFixed(1) + ' ';
            el.setAttribute('d', d);
            if (i < N) await sleep(dur / N);
        }
    }

    buildRuler('rul2', 90, 270, 5, 50);
    buildRap('rap2', R_RAP, TARGET_DEG, true);

    window.next2 = async function () {
        if (anim || step >= 5) return;
        const btn = document.getElementById('btn2');
        if (btn) btn.disabled = true;
        anim = true; step++;
        const txt = document.getElementById('st2');
        if (txt) txt.textContent = texts[step];

        if (step === 1) {
            await slideRuler('rul2', -150, 0, 460);
            await sleep(200);
            show('labsAB2');
            const seg = document.getElementById('segAB2');
            if (seg) {
                seg.style.opacity = '1';
                const N = 38;
                for (let i = 0; i <= N; i++) { seg.setAttribute('x2', (90 + (340 - 90) * i / N).toFixed(1)); await sleep(680 / N); }
            }
            await sleep(300);
            await slideRuler('rul2', 0, -150, 360);
        } else if (step === 2) {
            show('rap2');
            await sleep(500);
            await sweep('rap2', R_RAP, TARGET_DEG, 1100);
            await sleep(600);
            show('amk2'); show('atx2');
            await sleep(700);
            hide('rap2');
        } else if (step === 3) {
            show('ray2');
        } else if (step === 4) {
            const degS = 38, degE = 62;
            const aS = -degS * Math.PI / 180;
            const penStart = { x: A.x + 200 * Math.cos(aS), y: A.y + 200 * Math.sin(aS) };
            setComp2(A, penStart);
            show('cmp2');
            await sleep(400);
            await drawArc2('arcAC2', A.x, A.y, 200, degS, degE, 1400);
            show('labAC2');
            await sleep(700);
            hide('cmp2');
        } else if (step === 5) {
            show('ptC2');
            await sleep(400);
            hide('ray2');
            show('sdAC2'); show('sdBC2');
            if (btn) { btn.textContent = '— Fin —'; btn.style.backgroundColor = '#888'; }
        }

        anim = false;
        if (step < 5 && btn) btn.disabled = false;
    };

    window.reset2 = function () {
        step = 0; anim = false;
        const txt = document.getElementById('st2');
        if (txt) txt.textContent = texts[0];
        ['segAB2', 'labsAB2', 'rap2', 'amk2', 'atx2', 'ray2', 'cmp2', 'arcAC2', 'labAC2', 'ptC2', 'sdBC2', 'sdAC2'].forEach(hide);
        const seg = document.getElementById('segAB2');
        if (seg) seg.setAttribute('x2', '90');
        const rul = document.getElementById('rul2');
        if (rul) { rul.setAttribute('transform', 'translate(0,-150)'); rul.style.opacity = '0'; }
        const arc = document.getElementById('arcAC2');
        if (arc) arc.setAttribute('d', '');
        const ind = document.getElementById('rap2_ind');
        if (ind) { ind.setAttribute('x2', (R_RAP * 0.88).toFixed(1)); ind.setAttribute('y2', '0'); }
        const btn = document.getElementById('btn2');
        if (btn) { btn.disabled = false; btn.textContent = 'Étape suivante ▶'; btn.style.backgroundColor = '#3498db'; }
    };
})();

/* ════════════════════════════════════════════════════════════
   CONSTRUCTION 3 : 2 angles + côté compris
   B=(90,270) C=(340,270) A≈(262,123) — ABC=40°, BCA=65°, BC=5cm
   ════════════════════════════════════════════════════════════ */
(function () {
    const R_RAP = 76;
    let step = 0, anim = false;
    const texts = [
        'Cliquez sur « Étape suivante » pour voir la construction.',
        'Étape 1 – On trace le segment [BC] de longueur 5 cm à la règle.',
        'Étape 2 – Rapporteur en B (0° vers C) : on repère 40°.',
        'Étape 3 – On trace la demi-droite [BA) depuis B.',
        'Étape 4 – Rapporteur en C (0° vers B) : on repère 65°.',
        'Étape 5 – On trace la demi-droite [CA) depuis C.',
        'Étape 6 – A est l\'intersection des deux demi-droites. On trace [AB] et [AC].'
    ];

    function show(id) { const el = document.getElementById(id); if (el) el.style.opacity = '1'; }
    function hide(id) { const el = document.getElementById(id); if (el) el.style.opacity = '0'; }

    function buildRap3(gId, R, target, showLabels) {
        const g = document.getElementById(gId);
        if (!g) return;
        const NS = 'http://www.w3.org/2000/svg';
        const bg = document.createElementNS(NS, 'path');
        bg.setAttribute('d', `M ${R} 0 A ${R} ${R} 0 0 0 ${-R} 0 Z`);
        bg.setAttribute('fill', 'rgba(255,252,200,0.92)');
        bg.setAttribute('stroke', '#999'); bg.setAttribute('stroke-width', '1.5');
        g.appendChild(bg);
        for (let d = 0; d <= 180; d += 10) {
            const r = d * Math.PI / 180, maj = d % 30 === 0, inner = R - (maj ? 14 : 7);
            const mk = document.createElementNS(NS, 'line');
            mk.setAttribute('x1', (R * Math.cos(r)).toFixed(1)); mk.setAttribute('y1', (-R * Math.sin(r)).toFixed(1));
            mk.setAttribute('x2', (inner * Math.cos(r)).toFixed(1)); mk.setAttribute('y2', (-inner * Math.sin(r)).toFixed(1));
            mk.setAttribute('stroke', d === target ? '#c0392b' : '#666');
            mk.setAttribute('stroke-width', d === target ? '2.5' : (maj ? '2' : '1'));
            g.appendChild(mk);
            if (maj && showLabels) {
                const tx = document.createElementNS(NS, 'text');
                tx.setAttribute('x', ((R + 11) * Math.cos(r)).toFixed(1));
                tx.setAttribute('y', (-(R + 11) * Math.sin(r) + 4).toFixed(1));
                tx.setAttribute('text-anchor', 'middle'); tx.setAttribute('font-size', '10');
                tx.setAttribute('fill', '#555'); tx.textContent = String(d);
                g.appendChild(tx);
            }
        }
        const bl = document.createElementNS(NS, 'line');
        bl.setAttribute('x1', (-R - 4).toString()); bl.setAttribute('y1', '0');
        bl.setAttribute('x2', (R + 4).toString()); bl.setAttribute('y2', '0');
        bl.setAttribute('stroke', '#888'); bl.setAttribute('stroke-width', '1.5');
        g.appendChild(bl);
        const dot = document.createElementNS(NS, 'circle');
        dot.setAttribute('cx', '0'); dot.setAttribute('cy', '0');
        dot.setAttribute('r', '3'); dot.setAttribute('fill', '#333');
        g.appendChild(dot);
        const ind = document.createElementNS(NS, 'line');
        ind.setAttribute('id', gId + '_ind'); ind.setAttribute('x1', '0'); ind.setAttribute('y1', '0');
        ind.setAttribute('x2', (R * 0.88).toFixed(1)); ind.setAttribute('y2', '0');
        ind.setAttribute('stroke', '#e74c3c'); ind.setAttribute('stroke-width', '2.5');
        ind.setAttribute('opacity', '0'); g.appendChild(ind);
    }

    async function sweep3(gId, R, targetDeg, dur) {
        const ind = document.getElementById(gId + '_ind');
        if (!ind) return;
        ind.setAttribute('opacity', '1');
        const N = 42;
        for (let i = 0; i <= N; i++) {
            const r = (targetDeg * i / N) * Math.PI / 180;
            ind.setAttribute('x2', (R * 0.88 * Math.cos(r)).toFixed(1));
            ind.setAttribute('y2', (-R * 0.88 * Math.sin(r)).toFixed(1));
            await sleep(dur / N);
        }
    }

    buildRuler('rul3', 90, 270, 5, 50);
    buildRap3('rapB3', R_RAP, 40, true);
    buildRap3('rapC3', R_RAP, 65, true);

    window.next3 = async function () {
        if (anim || step >= 6) return;
        const btn = document.getElementById('btn3');
        if (btn) btn.disabled = true;
        anim = true; step++;
        const txt = document.getElementById('st3');
        if (txt) txt.textContent = texts[step];

        if (step === 1) {
            await slideRuler('rul3', -150, 0, 460);
            await sleep(200);
            show('labsBC3');
            const seg = document.getElementById('segBC3');
            if (seg) {
                seg.style.opacity = '1';
                const N = 38;
                for (let i = 0; i <= N; i++) { seg.setAttribute('x2', (90 + (340 - 90) * i / N).toFixed(1)); await sleep(680 / N); }
            }
            await sleep(300);
            await slideRuler('rul3', 0, -150, 360);
        } else if (step === 2) {
            show('rapB3');
            await sleep(500);
            await sweep3('rapB3', R_RAP, 40, 1000);
            await sleep(600);
            show('amkB3'); show('atxB3');
            await sleep(700);
            hide('rapB3');
        } else if (step === 3) {
            show('rayBA3');
        } else if (step === 4) {
            show('rapC3');
            await sleep(500);
            await sweep3('rapC3', R_RAP, 65, 1000);
            await sleep(600);
            show('amkC3'); show('atxC3');
            await sleep(700);
            hide('rapC3');
        } else if (step === 5) {
            show('rayCA3');
        } else if (step === 6) {
            show('ptA3');
            await sleep(400);
            hide('rayBA3'); hide('rayCA3');
            show('sdAB3'); show('sdAC3');
            if (btn) { btn.textContent = '— Fin —'; btn.style.backgroundColor = '#888'; }
        }

        anim = false;
        if (step < 6 && btn) btn.disabled = false;
    };

    window.reset3 = function () {
        step = 0; anim = false;
        const txt = document.getElementById('st3');
        if (txt) txt.textContent = texts[0];
        ['segBC3', 'labsBC3', 'rapB3', 'amkB3', 'atxB3', 'rayBA3',
         'rapC3', 'amkC3', 'atxC3', 'rayCA3', 'ptA3', 'sdAB3', 'sdAC3'].forEach(hide);
        const seg = document.getElementById('segBC3');
        if (seg) seg.setAttribute('x2', '90');
        const rul = document.getElementById('rul3');
        if (rul) { rul.setAttribute('transform', 'translate(0,-150)'); rul.style.opacity = '0'; }
        ['rapB3_ind', 'rapC3_ind'].forEach(id => {
            const ind = document.getElementById(id);
            if (ind) { ind.setAttribute('x2', (R_RAP * 0.88).toFixed(1)); ind.setAttribute('y2', '0'); }
        });
        const btn = document.getElementById('btn3');
        if (btn) { btn.disabled = false; btn.textContent = 'Étape suivante ▶'; btn.style.backgroundColor = '#3498db'; }
    };
})();

/* ════════════════════════════════════════════════════════════
   MÉDIATRICE – MÉTHODE ÉQUERRE
   A=(70,210) B=(370,210) I=(220,210) — AB=6cm @ 50px/cm
   ════════════════════════════════════════════════════════════ */
(function () {
    const A = { x: 70, y: 210 }, B = { x: 370, y: 210 }, I = { x: 220, y: 210 };
    let step = 0, anim = false;
    const texts = [
        'Cliquez sur « Étape suivante » pour voir la construction.',
        'Étape 1 – On trace le segment [AB] de longueur 6 cm à la règle.',
        'Étape 2 – On mesure [AB] et on reporte AB÷2 = 3 cm depuis A → milieu I.',
        'Étape 3 – On place l\'équerre en I (angle droit sur I, un côté le long de [AB]).',
        'Étape 4 – On trace la médiatrice. On retire l\'équerre.'
    ];

    function show(id) { const el = document.getElementById(id); if (el) el.style.opacity = '1'; }
    function hide(id) { const el = document.getElementById(id); if (el) el.style.opacity = '0'; }

    /* Règle de mesure (pour trouver I) */
    buildRuler('rulME', 70, 210, 6, 50);
    buildRuler('rulME2', 70, 210, 3, 50);

    /* Équerre SVG */
    function buildEquerre(gId, legH, legV) {
        const g = document.getElementById(gId);
        if (!g) return;
        const NS = 'http://www.w3.org/2000/svg';
        const body = document.createElementNS(NS, 'polygon');
        body.setAttribute('points', `0,0 ${legH},0 0,${-legV}`);
        body.setAttribute('fill', 'rgba(180,220,255,0.85)');
        body.setAttribute('stroke', '#2266aa'); body.setAttribute('stroke-width', '1.8');
        g.appendChild(body);
        const sq = document.createElementNS(NS, 'polyline');
        sq.setAttribute('points', '12,0 12,-12 0,-12');
        sq.setAttribute('fill', 'none'); sq.setAttribute('stroke', '#2266aa');
        sq.setAttribute('stroke-width', '1.5'); g.appendChild(sq);
    }

    buildEquerre('eqme', 90, 75);

    async function slideEquerre(gId, xFrom, xTo, dur) {
        const g = document.getElementById(gId);
        if (!g) return;
        g.style.opacity = '1';
        const N = 28;
        for (let i = 0; i <= N; i++) {
            const x = xFrom + (xTo - xFrom) * i / N;
            g.setAttribute('transform', `translate(${x.toFixed(1)},210)`);
            await sleep(dur / N);
        }
    }

    window.nextME = async function () {
        if (anim || step >= 4) return;
        const btn = document.getElementById('btnME');
        if (btn) btn.disabled = true;
        anim = true; step++;
        const txt = document.getElementById('stME');
        if (txt) txt.textContent = texts[step];

        if (step === 1) {
            /* Règle glisse → trace [AB] */
            await slideRuler('rulME', -150, 0, 460);
            await sleep(200);
            show('grpABme');
            const seg = document.getElementById('segABme');
            if (seg) {
                const N = 38;
                for (let i = 0; i <= N; i++) { seg.setAttribute('x2', (A.x + (B.x - A.x) * i / N).toFixed(1)); await sleep(680 / N); }
            }
            await sleep(300);
            await slideRuler('rulME', 0, -150, 360);
        } else if (step === 2) {
            /* Règle de mesure pour trouver I */
            await slideRuler('rulME2', -150, 0, 460);
            await sleep(600);
            show('milme');
            await sleep(500);
            await slideRuler('rulME2', 0, -150, 360);
        } else if (step === 3) {
            /* Équerre glisse depuis A jusqu'à I */
            const g = document.getElementById('eqme');
            if (g) {
                g.setAttribute('transform', `translate(${A.x},210)`);
                g.style.opacity = '1';
                await slideEquerre('eqme', A.x, I.x, 700);
            }
        } else if (step === 4) {
            /* Médiatrice + angle droit, on retire l'équerre */
            show('medme'); show('adme');
            await sleep(400);
            hide('eqme');
            if (btn) { btn.textContent = '— Fin —'; btn.style.backgroundColor = '#888'; }
        }

        anim = false;
        if (step < 4 && btn) btn.disabled = false;
    };

    window.resetME = function () {
        step = 0; anim = false;
        const txt = document.getElementById('stME');
        if (txt) txt.textContent = texts[0];
        ['grpABme', 'milme', 'eqme', 'medme', 'adme'].forEach(hide);
        const seg = document.getElementById('segABme');
        if (seg) seg.setAttribute('x2', A.x.toString());
        ['rulME', 'rulME2'].forEach(id => {
            const rul = document.getElementById(id);
            if (rul) { rul.setAttribute('transform', 'translate(0,-150)'); rul.style.opacity = '0'; }
        });
        const btn = document.getElementById('btnME');
        if (btn) { btn.disabled = false; btn.textContent = 'Étape suivante ▶'; btn.style.backgroundColor = '#3498db'; }
    };
})();

/* ════════════════════════════════════════════════════════════
   MÉDIATRICE – MÉTHODE COMPAS
   A=(70,210) B=(385,210) — AB=315px ≈ 6.3cm (rayon arcs ≈ 200px)
   Intersections arcs ≈ (228,153) et (228,267)
   ════════════════════════════════════════════════════════════ */
(function () {
    const A = { x: 70, y: 210 }, B = { x: 385, y: 210 };
    const cIds = { hinge:'mcH', pb:'mcPb', pt:'mcPt', nb:'mcNb', bd:'mcBd', tp:'mcTp', pp:'mcPp' };
    let step = 0, anim = false;
    const texts = [
        'Cliquez sur « Étape suivante » pour voir la construction.',
        'Étape 1 – On trace le segment [AB] à la règle.',
        'Étape 2 – Compas ouvert à plus de AB÷2, pointe en A → arc de part et d\'autre.',
        'Étape 3 – Même écartement, pointe en B → second arc.',
        'Étape 4 – La médiatrice passe par les deux intersections des arcs.'
    ];

    function show(id) { const el = document.getElementById(id); if (el) el.style.opacity = '1'; }
    function hide(id) { const el = document.getElementById(id); if (el) el.style.opacity = '0'; }

    buildRuler('rulMC', 70, 210, 7, 45);

    window.nextMC = async function () {
        if (anim || step >= 4) return;
        const btn = document.getElementById('btnMC');
        if (btn) btn.disabled = true;
        anim = true; step++;
        const txt = document.getElementById('stMC');
        if (txt) txt.textContent = texts[step];

        if (step === 1) {
            await slideRuler('rulMC', -150, 0, 460);
            await sleep(200);
            show('grpABmc');
            const seg = document.getElementById('segABmc');
            if (seg) {
                const N = 38;
                for (let i = 0; i <= N; i++) { seg.setAttribute('x2', (A.x + (B.x - A.x) * i / N).toFixed(1)); await sleep(680 / N); }
            }
            await sleep(300);
            await slideRuler('rulMC', 0, -150, 360);
        } else if (step === 2) {
            /* Compas depuis A, rayon 200px, arcs de 50° à 130° en haut et en bas */
            setCompass(cIds, A, A);
            show('cmpMC');
            await sleep(300);
            const pencilStart = { x: A.x + 200 * Math.cos(-50 * Math.PI / 180), y: A.y + 200 * Math.sin(-50 * Math.PI / 180) };
            await animOpenCompass(cIds, A, pencilStart, 900);
            await sleep(200);
            /* Arc du haut (de -130° à -50°) */
            await animArc('arcAmc', A.x, A.y, 200, -130 * Math.PI / 180, -50 * Math.PI / 180, 900);
            /* Arc du bas (de 50° à 130°) */
            await animArc('arcAmc', A.x, A.y, 200, 50 * Math.PI / 180, 130 * Math.PI / 180, 900);
            /* Combiner les deux arcs dans un seul path */
            const a0t = -130 * Math.PI / 180, a1t = -50 * Math.PI / 180;
            const a0b = 50 * Math.PI / 180, a1b = 130 * Math.PI / 180;
            let d = '';
            for (let i = 0; i <= 40; i++) { const a = a0t + (a1t - a0t) * i / 40; d += (i === 0 ? 'M ' : 'L ') + (A.x + 200 * Math.cos(a)).toFixed(1) + ' ' + (A.y + 200 * Math.sin(a)).toFixed(1) + ' '; }
            d += ' ';
            for (let i = 0; i <= 40; i++) { const a = a0b + (a1b - a0b) * i / 40; d += (i === 0 ? 'M ' : 'L ') + (A.x + 200 * Math.cos(a)).toFixed(1) + ' ' + (A.y + 200 * Math.sin(a)).toFixed(1) + ' '; }
            const arcA = document.getElementById('arcAmc');
            if (arcA) arcA.setAttribute('d', d);
            await sleep(400);
            hide('cmpMC');
        } else if (step === 3) {
            /* Compas depuis B, même rayon */
            const pencilStart = { x: B.x + 200 * Math.cos(-130 * Math.PI / 180), y: B.y + 200 * Math.sin(-130 * Math.PI / 180) };
            setCompass(cIds, B, B);
            show('cmpMC');
            await sleep(200);
            await animOpenCompass(cIds, B, pencilStart, 700);
            await sleep(200);
            const a0t = -130 * Math.PI / 180, a1t = -50 * Math.PI / 180;
            const a0b = 50 * Math.PI / 180, a1b = 130 * Math.PI / 180;
            let d = '';
            for (let i = 0; i <= 40; i++) { const a = a0t + (a1t - a0t) * i / 40; d += (i === 0 ? 'M ' : 'L ') + (B.x + 200 * Math.cos(a)).toFixed(1) + ' ' + (B.y + 200 * Math.sin(a)).toFixed(1) + ' '; }
            d += ' ';
            for (let i = 0; i <= 40; i++) { const a = a0b + (a1b - a0b) * i / 40; d += (i === 0 ? 'M ' : 'L ') + (B.x + 200 * Math.cos(a)).toFixed(1) + ' ' + (B.y + 200 * Math.sin(a)).toFixed(1) + ' '; }
            const arcB = document.getElementById('arcBmc');
            if (arcB) { arcB.setAttribute('d', d); arcB.style.opacity = '1'; }
            show('ptsmc');
            await sleep(600);
            hide('cmpMC');
        } else if (step === 4) {
            show('medmc'); show('milmc');
            if (btn) { btn.textContent = '— Fin —'; btn.style.backgroundColor = '#888'; }
        }

        anim = false;
        if (step < 4 && btn) btn.disabled = false;
    };

    window.resetMC = function () {
        step = 0; anim = false;
        const txt = document.getElementById('stMC');
        if (txt) txt.textContent = texts[0];
        ['grpABmc', 'cmpMC', 'ptsmc', 'medmc', 'milmc'].forEach(hide);
        const seg = document.getElementById('segABmc');
        if (seg) seg.setAttribute('x2', A.x.toString());
        ['arcAmc', 'arcBmc'].forEach(id => { const el = document.getElementById(id); if (el) { el.setAttribute('d', ''); el.style.opacity = '0'; } });
        const rul = document.getElementById('rulMC');
        if (rul) { rul.setAttribute('transform', 'translate(0,-150)'); rul.style.opacity = '0'; }
        const btn = document.getElementById('btnMC');
        if (btn) { btn.disabled = false; btn.textContent = 'Étape suivante ▶'; btn.style.backgroundColor = '#3498db'; }
    };
})();

/* ════════════════════════════════════════════════════════════
   CERCLE CIRCONSCRIT
   Triangle A=(225,35) B=(65,245) C=(355,210)
   Milieu AB ≈ (145,140), milieu BC ≈ (210,228)
   Centre O ≈ (210,177)
   ════════════════════════════════════════════════════════════ */
(function () {
    const A = { x: 225, y: 35 }, B = { x: 65, y: 245 }, C = { x: 355, y: 210 };
    const O = { x: 210, y: 177 }; /* centre circonscrit approximatif */
    const cIds = { hinge:'ccH', pb:'ccPb', pt:'ccPt', nb:'ccNb', bd:'ccBd', tp:'ccTp', pp:'ccPp' };
    let step = 0, anim = false;
    const texts = [
        'Cliquez sur « Étape suivante » pour voir la construction.',
        'Étape 1 – Construction de la médiatrice de [AB] (en rouge).',
        'Étape 2 – Construction de la médiatrice de [BC] (en bleu).',
        'Étape 3 – O est l\'intersection : centre du cercle circonscrit.',
        'Étape 4 – On trace le cercle de centre O et de rayon OA = OB = OC.'
    ];

    function show(id) { const el = document.getElementById(id); if (el) el.style.opacity = '1'; }
    function hide(id) { const el = document.getElementById(id); if (el) el.style.opacity = '0'; }

    /* Rayon du cercle circonscrit */
    const R_circ = Math.sqrt((O.x - A.x) ** 2 + (O.y - A.y) ** 2);

    window.nextCC = async function () {
        if (anim || step >= 4) return;
        const btn = document.getElementById('btnCC');
        if (btn) btn.disabled = true;
        anim = true; step++;
        const txt = document.getElementById('stCC');
        if (txt) txt.textContent = texts[step];

        if (step === 1) {
            /* Médiatrice AB : arcs depuis A et B, rayon ≈ 155px */
            const rAB = 155;
            /* Arc depuis A */
            const a0A = -2.2, a1A = -0.9;
            await animArc('arcA1cc', A.x, A.y, rAB, a0A, a1A, 700);
            /* Arc depuis B */
            const a0B = -2.2, a1B = -0.9;
            await animArc('arcB1cc', B.x, B.y, rAB, a0B, a1B, 700);
            show('medABcc'); show('sqABcc');
        } else if (step === 2) {
            /* Médiatrice BC : arcs, rayon ≈ 150px */
            const rBC = 150;
            const a0B2 = -0.3, a1B2 = 1.2;
            await animArc('arcB2cc', B.x, B.y, rBC, a0B2, a1B2, 700);
            const a0C2 = Math.PI - 1.2, a1C2 = Math.PI + 0.3;
            await animArc('arcC2cc', C.x, C.y, rBC, a0C2, a1C2, 700);
            show('medBCcc'); show('sqBCcc');
        } else if (step === 3) {
            show('ptOcc');
        } else if (step === 4) {
            /* Compas depuis O, rayon OA → trace cercle */
            const pencilStart = { x: O.x + R_circ, y: O.y };
            setCompass(cIds, O, pencilStart);
            show('cmpCC');
            await sleep(400);
            /* Tracer le cercle progressivement */
            const el = document.getElementById('circCC');
            if (el) {
                el.style.opacity = '1';
                const N = 60;
                let d = '';
                for (let i = 0; i <= N; i++) {
                    const a = -Math.PI / 2 + (2 * Math.PI * i / N);
                    const pencilPos = { x: O.x + R_circ * Math.cos(a), y: O.y + R_circ * Math.sin(a) };
                    setCompass(cIds, O, pencilPos);
                    d += (i === 0 ? 'M ' : 'L ') + pencilPos.x.toFixed(1) + ' ' + pencilPos.y.toFixed(1) + ' ';
                    el.setAttribute('d', d + 'Z');
                    if (i < N) await sleep(1200 / N);
                }
            }
            await sleep(400);
            hide('cmpCC');
            if (btn) { btn.textContent = '— Fin —'; btn.style.backgroundColor = '#888'; }
        }

        anim = false;
        if (step < 4 && btn) btn.disabled = false;
    };

    window.resetCC = function () {
        step = 0; anim = false;
        const txt = document.getElementById('stCC');
        if (txt) txt.textContent = texts[0];
        ['arcA1cc', 'arcB1cc', 'medABcc', 'sqABcc',
         'arcB2cc', 'arcC2cc', 'medBCcc', 'sqBCcc',
         'ptOcc', 'circCC', 'cmpCC'].forEach(hide);
        ['arcA1cc', 'arcB1cc', 'arcB2cc', 'arcC2cc', 'circCC'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.setAttribute('d', '');
        });
        const btn = document.getElementById('btnCC');
        if (btn) { btn.disabled = false; btn.textContent = 'Étape suivante ▶'; btn.style.backgroundColor = '#3498db'; }
    };
})();
