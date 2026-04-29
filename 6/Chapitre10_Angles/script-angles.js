// ============================================================
//  NAVIGATION DES SLIDES
// ============================================================
let currentSlideIndex = 0;
let currentStepIndex  = 0;
const slides     = document.querySelectorAll('.slide');
const totalSlides = slides.length;

const slideTitles = [
    "Chapitre 10 : Les angles",
    "I. Vocabulaire – Définition",
    "I. Vocabulaire – Exemple triangle",
    "II. Mesure d'un angle",
    "II. Nature des angles",
    "III. Tracer un angle de mesure donnée",
    "IV. Angles supplémentaires & Adjacents",
    "VI. Angles opposés & Bissectrice (définition)",
    "VII. Tracer la bissectrice au rapporteur"
];

document.getElementById('totalSlides').textContent = totalSlides;

function getSteps(slide) {
    return Array.from(slide.querySelectorAll('.step')).filter(el =>
        !el.closest('.anim-controls-row') && !el.closest('.anim-btn')
    );
}

function initSlideMenu() {
    const slideList = document.getElementById('slideList');
    slideList.innerHTML = '';
    slideTitles.forEach((title, index) => {
        const slideItem = document.createElement('div');
        slideItem.className = 'slide-item';
        if (index === currentSlideIndex) slideItem.classList.add('current');
        slideItem.innerHTML = `<div class="slide-number">Slide ${index + 1}</div><div class="slide-title">${title}</div>`;
        slideItem.onclick = () => goToSlide(index);
        slideList.appendChild(slideItem);
    });
}

function openMenu()  { initSlideMenu(); document.getElementById('slideMenu').classList.add('active'); }
function closeMenu() { document.getElementById('slideMenu').classList.remove('active'); }
function openHelp()  { document.getElementById('helpOverlay').classList.add('active'); }
function closeHelp() { document.getElementById('helpOverlay').classList.remove('active'); }

function goToSlide(index) {
    currentSlideIndex = index;
    currentStepIndex  = 0;
    updateSlide();
    closeMenu();
}

function resetSlide() {
    currentStepIndex = 0;
    updateSlide();
}

function updateSlide() {
    slides.forEach((slide, index) => {
        slide.classList.remove('active');
        if (index === currentSlideIndex) slide.classList.add('active');
    });

    const steps = getSteps(slides[currentSlideIndex]);
    steps.forEach((step, index) => {
        if (index < currentStepIndex) step.classList.add('visible');
        else step.classList.remove('visible');
    });

    document.getElementById('currentSlide').textContent = currentSlideIndex + 1;
    document.getElementById('prevBtn').disabled = currentSlideIndex === 0 && currentStepIndex === 0;

    const stepIndicator = document.getElementById('stepIndicator');
    if (steps.length > 0) {
        stepIndicator.textContent = `Étape ${currentStepIndex}/${steps.length}`;
        stepIndicator.classList.remove('hidden');
    } else {
        stepIndicator.classList.add('hidden');
    }

    const contentDiv = document.querySelector('.content');
    if (currentStepIndex === 0 && contentDiv) {
        setTimeout(() => { contentDiv.scrollTo({ top: 0, behavior: 'smooth' }); }, 50);
    } else if (currentStepIndex > 0) {
        setTimeout(() => {
            const visibleSteps = slides[currentSlideIndex].querySelectorAll('.step.visible');
            if (visibleSteps.length > 0) {
                visibleSteps[visibleSteps.length - 1].scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
            }
        }, 650);
    }
}

function changeSlide(direction) {
    const steps = getSteps(slides[currentSlideIndex]);
    if (direction === 1) {
        if (currentStepIndex < steps.length) {
            currentStepIndex++;
            updateSlide();
        } else if (currentSlideIndex < totalSlides - 1) {
            currentSlideIndex++;
            currentStepIndex = 0;
            updateSlide();
        }
    } else {
        if (currentStepIndex > 0) {
            currentStepIndex--;
            updateSlide();
        } else if (currentSlideIndex > 0) {
            currentSlideIndex--;
            currentStepIndex = getSteps(slides[currentSlideIndex]).length;
            updateSlide();
        }
    }
}

document.addEventListener('keydown', (e) => {
    if (document.getElementById('slideMenu').classList.contains('active'))   { if (e.key === 'Escape') closeMenu(); return; }
    if (document.getElementById('helpOverlay').classList.contains('active')) { if (e.key === 'Escape') closeHelp(); return; }
    if (e.key === 'ArrowUp' || e.key === ' ')  { e.preventDefault(); changeSlide(1); }
    else if (e.key === 'ArrowDown')            { e.preventDefault(); changeSlide(-1); }
    else if (e.key === 'm' || e.key === 'M')   openMenu();
    else if (e.key === 'r' || e.key === 'R')   resetSlide();
    else if (e.key === 'h' || e.key === 'H' || e.key === '?') openHelp();
    else if (e.key === 'Escape')               { closeMenu(); closeHelp(); }
});

document.getElementById('slideMenu').addEventListener('click',   e => { if (e.target.id === 'slideMenu')   closeMenu(); });
document.getElementById('helpOverlay').addEventListener('click', e => { if (e.target.id === 'helpOverlay') closeHelp(); });

// ============================================================
//  UTILITAIRES SVG
// ============================================================
function fade(id, v) {
    const el = document.getElementById(id);
    if (el) el.style.opacity = v;
}
function setOpacity(id, v) {
    const el = document.getElementById(id);
    if (el) el.setAttribute('opacity', v);
}

// ============================================================
//  CONSTRUCTION DU RAPPORTEUR (ticks + labels)
// ============================================================
function buildProto(cx, cy, r, highlightDeg, ticksId, labelsId, labels2Id) {
    const NS  = 'http://www.w3.org/2000/svg';
    const gT  = document.getElementById(ticksId);
    const gL  = document.getElementById(labelsId);
    const gL2 = document.getElementById(labels2Id);
    if (!gT) return;

    for (let deg = 0; deg <= 180; deg++) {
        const rad = deg * Math.PI / 180;
        const xo  = cx + r * Math.cos(rad);
        const yo  = cy - r * Math.sin(rad);
        let len   = 3;
        if (deg % 5  === 0) len = 5;
        if (deg % 10 === 0) len = 9;
        const xi  = cx + (r - len) * Math.cos(rad);
        const yi  = cy - (r - len) * Math.sin(rad);
        const line = document.createElementNS(NS, 'line');
        line.setAttribute('x1', xo.toFixed(1)); line.setAttribute('y1', yo.toFixed(1));
        line.setAttribute('x2', xi.toFixed(1)); line.setAttribute('y2', yi.toFixed(1));
        line.setAttribute('stroke', '#1a6070');
        line.setAttribute('stroke-width', deg % 10 === 0 ? '1.4' : deg % 5 === 0 ? '0.9' : '0.5');
        gT.appendChild(line);
    }

    // Labels extérieurs bleus (0→180)
    for (let deg = 10; deg <= 170; deg += 10) {
        if (deg === 90) continue;
        const rad = deg * Math.PI / 180;
        const lx  = cx + (r - 17) * Math.cos(rad);
        const ly  = cy - (r - 17) * Math.sin(rad);
        const txt = document.createElementNS(NS, 'text');
        txt.setAttribute('x', lx.toFixed(1));
        txt.setAttribute('y', (ly + 3.5).toFixed(1));
        txt.setAttribute('font-size', r >= 110 ? '9' : '8');
        txt.setAttribute('fill', deg === highlightDeg ? '#e74c3c' : '#1a4a8a');
        txt.setAttribute('font-weight', deg === highlightDeg ? 'bold' : 'normal');
        txt.setAttribute('text-anchor', 'middle');
        txt.textContent = deg;
        gL.appendChild(txt);
    }

    // Labels intérieurs rouges (180→0)
    for (let deg = 10; deg <= 170; deg += 10) {
        if (deg === 90) continue;
        const rad = deg * Math.PI / 180;
        const lx  = cx + (r - 27) * Math.cos(rad);
        const ly  = cy - (r - 27) * Math.sin(rad);
        const txt = document.createElementNS(NS, 'text');
        txt.setAttribute('x', lx.toFixed(1));
        txt.setAttribute('y', (ly + 3).toFixed(1));
        txt.setAttribute('font-size', r >= 110 ? '8' : '7');
        txt.setAttribute('fill', (180 - deg) === highlightDeg ? '#e74c3c' : '#b03020');
        txt.setAttribute('font-weight', (180 - deg) === highlightDeg ? 'bold' : 'normal');
        txt.setAttribute('text-anchor', 'middle');
        txt.textContent = 180 - deg;
        gL2.appendChild(txt);
    }
}

function buildRapporteur() {
    buildProto(200, 280, 120, 30,  'ticks',    'labels',    'labels2');
    buildProto(100, 260, 100, 72,  'ticksTrac','labelsTrac','labels2Trac');
    buildProto(130, 270,  90, 80,  'ticksBR',  'labelsBR',  'labels2BR');
}

// ============================================================
//  ANIMATION 0 : Vocabulaire
// ============================================================
let stepVoc = 0;
const vocSteps = [
    () => { fade('vocTxt0', 1); },
    () => { fade('vocTxt0', 0); fade('vocTxt1', 1); setOpacity('vocLblSommet', 1); },
    () => { fade('vocTxt2', 1); setOpacity('vocLblOA', 1); setOpacity('vocLblOB', 1); setOpacity('vocArc', 1); },
    () => { fade('vocTxt3', 1); setOpacity('vocNotation', 1); },
];

function nextStepVoc() {
    if (stepVoc < vocSteps.length) { vocSteps[stepVoc](); stepVoc++; }
}
function resetVoc() {
    stepVoc = 0;
    ['vocTxt0','vocTxt1','vocTxt2','vocTxt3'].forEach(id => fade(id, 0));
    ['vocLblSommet','vocLblOA','vocLblOB','vocArc','vocNotation'].forEach(id => setOpacity(id, 0));
}

// ============================================================
//  ANIMATION 1 : Triangle exemple – angles nommés
// ============================================================
let stepTriEx = 0;
const triExTexts = [
    "Cliquez sur « Étape suivante » pour faire apparaître les angles.",
    "L'angle <span class='angle' style='color:#e74c3c;'>BAC</span> a son sommet en <strong>A</strong>. Ses côtés sont [AB) et [AC).",
    "L'angle <span class='angle' style='color:#2980b9;'>ABC</span> a son sommet en <strong>B</strong>. Ses côtés sont [BA) et [BC).",
    "L'angle <span class='angle' style='color:#27ae60;'>BCA</span> a son sommet en <strong>C</strong>. Ses côtés sont [CB) et [CA)."
];

function nextStepTriEx() {
    stepTriEx++;
    if (stepTriEx > 3) stepTriEx = 3;
    document.getElementById('exTxtAngle').innerHTML = triExTexts[stepTriEx];
    if (stepTriEx >= 1) setOpacity('exAngleA', 1);
    if (stepTriEx >= 2) setOpacity('exAngleB', 1);
    if (stepTriEx >= 3) { setOpacity('exAngleC', 1); fade('exRecap', 1); }
}
function resetTriEx() {
    stepTriEx = 0;
    document.getElementById('exTxtAngle').innerHTML = triExTexts[0];
    ['exAngleA','exAngleB','exAngleC'].forEach(id => setOpacity(id, 0));
    fade('exRecap', 0);
}

// ============================================================
//  ANIMATION 2 : Mesurer un angle
// ============================================================
const mesTexts = [
    "Cliquez sur « Étape suivante » pour voir comment mesurer l'angle <span class='angle'>AOB</span>.",
    "Étape 1 : On place le <strong>centre du rapporteur</strong> exactement sur le sommet <strong>O</strong> de l'angle.",
    "Étape 2 : On aligne la <strong>ligne de base</strong> sur le côté [OA). On lit sur l'échelle qui commence à <strong>0°</strong> du côté de [OA).",
    "Étape 3 : On lit la mesure : le côté [OB) passe par la graduation <strong>30°</strong>. Donc <span class='angle'>AOB</span> = <strong>30°</strong>.",
    "<span class='angle'>AOB</span> = <strong>30°</strong> — c'est un angle <strong style='color:#e74c3c;'>aigu</strong> (entre 0° et 90°)."
];
let stepMes = 0;

function nextStepMes() {
    stepMes++;
    if (stepMes > 4) stepMes = 4;
    document.getElementById('stepMes').innerHTML = mesTexts[stepMes];
    const rap = document.getElementById('rapporteur');
    if (stepMes === 1) {
        rap.classList.remove('rap-hidden', 'aligne');
        void rap.offsetWidth;
        rap.classList.add('arrive');
    }
    if (stepMes === 2) {
        rap.classList.remove('arrive');
        void rap.offsetWidth;
        rap.classList.add('aligne');
        setOpacity('zeroline', 1);
    }
    if (stepMes >= 3) { setOpacity('mark30', 1); setOpacity('dot30', 1); setOpacity('arcMes', 1); setOpacity('label30', 1); }
    if (stepMes >= 4)   setOpacity('result', 1);
}
function resetMes() {
    stepMes = 0;
    document.getElementById('stepMes').innerHTML = mesTexts[0];
    const rap = document.getElementById('rapporteur');
    rap.classList.remove('arrive', 'aligne');
    void rap.offsetWidth;
    rap.classList.add('rap-hidden');
    ['zeroline','mark30','dot30','arcMes','label30','result'].forEach(id => setOpacity(id, 0));
}

// ============================================================
//  ANIMATION 3 : Tracer un angle
// ============================================================
const tracTexts = [
    "Cliquez sur « Étape suivante » pour voir comment tracer l'angle <span class='angle'>BAC</span> = 72°.",
    "Étape 1 : On trace la demi-droite [AB) et on place le point <strong>A</strong> (sommet).",
    "Étape 2 : On place le centre du rapporteur en <strong>A</strong>, on aligne le <strong>0°</strong> sur [AB) et on repère <strong>72°</strong> par un trait.",
    "Étape 3 : On enlève le rapporteur. Le trait de repère indique la direction du côté [AC).",
    "Étape 4 : On trace la demi-droite [AC) et on place le point <strong>C</strong> dessus. L'angle <span class='angle'>BAC</span> = <strong>72°</strong> est construit !"
];
let stepTrac = 0;

function nextStepTrac() {
    stepTrac++;
    if (stepTrac > 4) stepTrac = 4;
    document.getElementById('stepTrac').innerHTML = tracTexts[stepTrac];
    const rapT = document.getElementById('rapTrac');
    if (stepTrac >= 1) { setOpacity('tA1',1); setOpacity('tA2',1); setOpacity('tAl',1); setOpacity('rayAB',1); }
    if (stepTrac === 2) {
        rapT.classList.remove('rap-hidden','trac-cache');
        void rapT.offsetWidth;
        rapT.classList.add('trac-arrive');
        const sw = document.getElementById('sweepLine72');
        const mk = document.getElementById('mark72');
        sw.classList.remove('sweep-active'); mk.classList.remove('mark-show');
        void sw.offsetWidth;
        sw.classList.add('sweep-active');
        setTimeout(() => {
            const pt = document.getElementById('pencilTrac');
            pt.style.opacity = '1';
            pt.classList.remove('ptrac-draw','ptrac-hide');
            void pt.offsetWidth;
            pt.classList.add('ptrac-draw');
            setTimeout(() => { mk.classList.remove('mark-show'); void mk.offsetWidth; mk.classList.add('mark-show'); }, 650);
            setTimeout(() => { pt.classList.remove('ptrac-draw'); void pt.offsetWidth; pt.classList.add('ptrac-hide'); }, 900);
        }, 4100);
    }
    if (stepTrac === 3) {
        rapT.classList.remove('trac-arrive');
        void rapT.offsetWidth;
        rapT.classList.add('trac-cache');
        const sw = document.getElementById('sweepLine72');
        const mk = document.getElementById('mark72');
        sw.classList.remove('sweep-active'); mk.classList.remove('mark-show');
        setOpacity('trait72', 1); setOpacity('rulerTrac', 1);
    }
    if (stepTrac >= 4) {
        setOpacity('trait72', 0); setOpacity('rayAC', 1);
        setTimeout(() => setOpacity('rulerTrac', 0), 800);
    }
}
function resetTrac() {
    stepTrac = 0;
    document.getElementById('stepTrac').innerHTML = tracTexts[0];
    const rapT = document.getElementById('rapTrac');
    rapT.classList.remove('trac-arrive','trac-cache');
    void rapT.offsetWidth;
    rapT.classList.add('rap-hidden');
    const sw = document.getElementById('sweepLine72');
    const mk = document.getElementById('mark72');
    sw.classList.remove('sweep-active'); mk.classList.remove('mark-show');
    const pt = document.getElementById('pencilTrac');
    pt.classList.remove('ptrac-draw','ptrac-hide');
    pt.style.opacity = '0';
    setOpacity('rulerTrac', 0);
    ['tA1','tA2','tAl','rayAB','trait72','rayAC'].forEach(id => setOpacity(id, 0));
}

// ============================================================
//  ANIMATION 4 : Bissectrice au rapporteur
// ============================================================
const bisRapTexts = [
    "Cliquez sur « Étape suivante » pour voir comment tracer la bissectrice de l'angle <span class='angle'>AOB</span> = 80° au rapporteur.",
    "Étape 1 : On trace l'angle <span class='angle'>AOB</span> = 80° avec ses deux côtés [OA) et [OB).",
    "Étape 2 : On place le rapporteur en O sur [OA) et on mesure 80°. On divise par 2 : 80° ÷ 2 = <strong>40°</strong>. On repère 40° sur le rapporteur.",
    "Étape 3 : On enlève le rapporteur et on trace la demi-droite [OD) à 40° de [OA). C'est la <strong>bissectrice</strong> !",
    "Résultat : <span class='angle'>AOD</span> = <span class='angle'>DOB</span> = 40°. La bissectrice partage l'angle en deux angles <strong>adjacents de même mesure</strong>."
];
let stepBisRap = 0;

function nextStepBisRap() {
    stepBisRap++;
    if (stepBisRap > 4) stepBisRap = 4;
    document.getElementById('stepBisRap').innerHTML = bisRapTexts[stepBisRap];

    if (stepBisRap >= 1) {
        setOpacity('brOA',1); setOpacity('brOB',1); setOpacity('brO',1); setOpacity('brArcAOB',1);
    }
    if (stepBisRap === 2) {
        const rap = document.getElementById('brRapporteur');
        rap.classList.remove('br-hidden','br-cache');
        void rap.offsetWidth;
        rap.classList.add('br-arrive');
        setTimeout(() => {
            const p = document.getElementById('brPencil');
            p.style.opacity = '1';
            p.classList.add('pencil-draw');
        }, 2300);
        setTimeout(() => {
            const d = document.getElementById('brDot40');
            d.style.opacity = '1';
            d.classList.add('dot-pop');
            setOpacity('brLine40', 1); setOpacity('brLabel40', 1);
            setTimeout(() => {
                const p = document.getElementById('brPencil');
                p.classList.remove('pencil-draw');
                void p.offsetWidth;
                p.classList.add('pencil-hide');
            }, 500);
        }, 3000);
        setTimeout(() => setOpacity('brResult', 1), 3600);
    }
    if (stepBisRap === 3) {
        const rap = document.getElementById('brRapporteur');
        rap.classList.remove('br-arrive');
        void rap.offsetWidth;
        rap.classList.add('br-cache');
        setOpacity('brPencil', 0); setOpacity('brDot40', 0);
        setOpacity('brResult', 0); setOpacity('brArcAOB', 0);
        setOpacity('brOD', 1);
    }
    if (stepBisRap >= 4) setOpacity('brArcsEqual', 1);
}
function resetBisRap() {
    stepBisRap = 0;
    document.getElementById('stepBisRap').innerHTML = bisRapTexts[0];
    const rap = document.getElementById('brRapporteur');
    rap.classList.remove('br-arrive','br-cache');
    void rap.offsetWidth;
    rap.classList.add('br-hidden');
    const p = document.getElementById('brPencil');
    p.classList.remove('pencil-draw','pencil-hide');
    p.style.opacity = '0';
    const d = document.getElementById('brDot40');
    d.classList.remove('dot-pop');
    d.style.opacity = '0';
    ['brOA','brOB','brO','brArcAOB','brOD','brArcsEqual'].forEach(id => setOpacity(id, 0));
    ['brLine40','brLabel40','brResult'].forEach(id => setOpacity(id, 0));
}

// ============================================================
//  INITIALISATION
// ============================================================
window.onload = function() {
    buildRapporteur();
    updateSlide();
};
