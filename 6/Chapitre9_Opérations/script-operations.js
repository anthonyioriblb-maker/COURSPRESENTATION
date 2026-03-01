let currentSlideIndex = 0;
let currentStepIndex = 0;
const slides = document.querySelectorAll('.slide');
const totalSlides = slides.length;

const slideTitles = [
    "Chapitre 9 : Les opérations",
    "Calculs posés – Addition",
    "Calculs posés – Soustraction",
    "Calculs posés – Multiplication",
    "Division euclidienne",
    "Vocabulaire & Critères de divisibilité",
    "Division décimale – Continuer",
    "Division décimale – Diviser un nombre décimal"
];

document.getElementById('totalSlides').textContent = totalSlides;

function getSteps(slide) {
    return Array.from(slide.querySelectorAll('.step')).filter(el =>
        !el.closest('.animation-container')
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

function openMenu() { initSlideMenu(); document.getElementById('slideMenu').classList.add('active'); }
function closeMenu() { document.getElementById('slideMenu').classList.remove('active'); }
function openHelp() { document.getElementById('helpOverlay').classList.add('active'); }
function closeHelp() { document.getElementById('helpOverlay').classList.remove('active'); }

function goToSlide(index) {
    currentSlideIndex = index;
    currentStepIndex = 0;
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
    if (document.getElementById('slideMenu').classList.contains('active')) { if (e.key === 'Escape') closeMenu(); return; }
    if (document.getElementById('helpOverlay').classList.contains('active')) { if (e.key === 'Escape') closeHelp(); return; }
    if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); changeSlide(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); changeSlide(-1); }
    else if (e.key === 'm' || e.key === 'M') openMenu();
    else if (e.key === 'r' || e.key === 'R') resetSlide();
    else if (e.key === 'h' || e.key === 'H' || e.key === '?') openHelp();
    else if (e.key === 'Escape') { closeMenu(); closeHelp(); }
});

document.getElementById('slideMenu').addEventListener('click', (e) => { if (e.target.id === 'slideMenu') closeMenu(); });
document.getElementById('helpOverlay').addEventListener('click', (e) => { if (e.target.id === 'helpOverlay') closeHelp(); });

// ===== ANIMATION ADDITION =====
let stepAddition = 0;
function nextStepAddition() {
    const stepInfo = document.getElementById('stepInfo1');
    switch(stepAddition) {
        case 0:
            ['a1_2','a1_3','a1_v','a1_4','a2_3','a2_v','a2_4','a2_5','a2_6','a3_1','a3_2','a3_3','a3_v','a3_4'].forEach(id => document.getElementById(id).classList.add('visible'));
            stepInfo.innerHTML = 'Les nombres sont alignés : virgules, unités, dizaines, centaines...';
            break;
        case 1:
            document.getElementById('ligne_add').classList.add('visible');
            stepInfo.innerHTML = 'Colonne de droite (millièmes) : 9 (je pose 9)';
            document.getElementById('res_7').classList.add('visible');
            break;
        case 2:
            stepInfo.innerHTML = 'Centièmes : 5 (je pose 5)';
            document.getElementById('res_6').classList.add('visible');
            break;
        case 3:
            stepInfo.innerHTML = 'Dixièmes : 4 + 8 + 7 = 19 (je pose 9 et je retiens 1)';
            document.getElementById('res_5').classList.add('visible');
            document.getElementById('res_4').classList.add('visible');
            document.getElementById('ret_1').classList.add('visible');
            break;
        case 4:
            stepInfo.innerHTML = 'Unités : 2 + 3 + 7 = 12, plus la retenue 1 = 13 (je pose 3 et je retiens 1)';
            document.getElementById('res_3').classList.add('visible');
            document.getElementById('ret_2').classList.add('visible');
            break;
        case 5:
            stepInfo.innerHTML = 'Dizaines : 1 + 6 = 7, plus la retenue 1 = 8 (je pose 8)';
            document.getElementById('res_2').classList.add('visible');
            break;
        case 6:
            stepInfo.innerHTML = 'Centaines : 5 (je pose 5)';
            document.getElementById('res_1').classList.add('visible');
            break;
        case 7:
            stepInfo.innerHTML = '<strong style="color: #2ecc71;">✓ Résultat : 12,4 + 3,859 + 567,7 = 583,959</strong>';
            document.getElementById('btnNext1').disabled = true;
            break;
    }
    stepAddition++;
}
function resetAddition() {
    stepAddition = 0;
    document.getElementById('btnNext1').disabled = false;
    document.getElementById('stepInfo1').innerHTML = 'Cliquez sur "Étape suivante" pour démarrer l\'animation';
    ['a1_2','a1_3','a1_v','a1_4','a2_3','a2_v','a2_4','a2_5','a2_6','a3_1','a3_2','a3_3','a3_v','a3_4','ligne_add','ret_1','ret_2','res_1','res_2','res_3','res_4','res_5','res_6','res_7'].forEach(id => document.getElementById(id).classList.remove('visible'));
}

// ===== ANIMATION SOUSTRACTION =====
let stepSoustraction = 0;
function nextStepSoustraction() {
    const stepInfo = document.getElementById('stepInfo2');
    switch(stepSoustraction) {
        case 0:
            ['s1_1','s1_v','s1_2','s1_3','s2_1','s2_v','s2_2','s2_3'].forEach(id => document.getElementById(id).classList.add('visible'));
            stepInfo.innerHTML = 'Les nombres sont alignés. On ajoute un 0 pour avoir le même nombre de décimales';
            break;
        case 1:
            document.getElementById('ligne_sous').classList.add('visible');
            stepInfo.innerHTML = 'Colonne de droite : 0 − 7 impossible ! J\'écris un petit 1 à côté du 0 (pour faire 10) et je marque +1 sur le 8';
            document.getElementById('petit1_2').style.opacity = '1';
            document.getElementById('plus1_2').style.opacity = '1';
            break;
        case 2:
            stepInfo.innerHTML = '10 − 7 = 3. Je pose 3';
            document.getElementById('sres_3').classList.add('visible');
            break;
        case 3:
            stepInfo.innerHTML = '5 − (8+1) impossible ! J\'écris un petit 1 à côté du 5 (pour faire 15) et je marque +1 sur le 2';
            document.getElementById('petit1_1').style.opacity = '1';
            document.getElementById('plus1_1').style.opacity = '1';
            break;
        case 4:
            stepInfo.innerHTML = '15 − 9 = 6. Je pose 6 et la virgule';
            document.getElementById('sres_2').classList.add('visible');
            document.getElementById('sres_v').classList.add('visible');
            break;
        case 5:
            stepInfo.innerHTML = '8 − (2+1) = 8 − 3 = 5. Je pose 5';
            document.getElementById('sres_1').classList.add('visible');
            break;
        case 6:
            stepInfo.innerHTML = '<strong style="color: #2ecc71;">✓ Résultat : 8,5 − 2,87 = 5,63</strong>';
            document.getElementById('btnNext2').disabled = true;
            break;
    }
    stepSoustraction++;
}
function resetSoustraction() {
    stepSoustraction = 0;
    document.getElementById('btnNext2').disabled = false;
    document.getElementById('stepInfo2').innerHTML = 'Cliquez sur "Étape suivante" pour démarrer l\'animation';
    ['s1_1','s1_v','s1_2','s1_3','s2_1','s2_v','s2_2','s2_3','ligne_sous','sres_1','sres_v','sres_2','sres_3'].forEach(id => document.getElementById(id).classList.remove('visible'));
    ['petit1_1','petit1_2','plus1_1','plus1_2'].forEach(id => document.getElementById(id).style.opacity = '0');
}

// ===== ANIMATION MULTIPLICATION =====
let stepMultiplication = 0;
function nextStepMultiplication() {
    const stepInfo = document.getElementById('stepInfo3');
    switch(stepMultiplication) {
        case 0:
            ['m1_3','m1_4','m1_5','m2_3','m2_4'].forEach(id => document.getElementById(id).classList.add('visible'));
            document.getElementById('m1_v').style.opacity = '1';
            document.getElementById('m2_v').style.opacity = '1';
            stepInfo.innerHTML = 'On pose la multiplication. 5,68 a 2 chiffres après la virgule, 3,4 en a 1';
            break;
        case 1:
            document.getElementById('ligne_mult1').classList.add('visible');
            stepInfo.innerHTML = 'On multiplie 568 par 4 : 8×4 = 32 (je pose 2, retenue 3)';
            document.getElementById('m3_5').classList.add('visible');
            document.getElementById('mret_1').style.opacity = '1';
            break;
        case 2:
            stepInfo.innerHTML = '6×4 = 24, +3 = 27 (je pose 7, retenue 2)';
            document.getElementById('m3_4').classList.add('visible');
            document.getElementById('mret_2').style.opacity = '1';
            break;
        case 3:
            stepInfo.innerHTML = '5×4 = 20, +2 = 22 (je pose 22)';
            document.getElementById('m3_3').classList.add('visible');
            document.getElementById('m3_2').classList.add('visible');
            break;
        case 4:
            stepInfo.innerHTML = 'On multiplie 568 par 3 (décalé d\'un rang, donc on ajoute un 0 à droite) : 8×3 = 24 (je pose 4, retenue 2)';
            document.getElementById('m4_5').classList.add('visible');
            document.getElementById('m4_4').classList.add('visible');
            document.getElementById('mret_3').style.opacity = '1';
            break;
        case 5:
            stepInfo.innerHTML = '6×3 = 18, +2 = 20 (je pose 0, retenue 2)';
            document.getElementById('m4_3').classList.add('visible');
            document.getElementById('mret_4').style.opacity = '1';
            break;
        case 6:
            stepInfo.innerHTML = '5×3 = 15, +2 = 17 (je pose 17)';
            document.getElementById('m4_2').classList.add('visible');
            document.getElementById('m4_1').classList.add('visible');
            break;
        case 7:
            document.getElementById('ligne_mult2').classList.add('visible');
            stepInfo.innerHTML = 'On additionne les deux lignes : 2';
            document.getElementById('mres_5').classList.add('visible');
            break;
        case 8:
            stepInfo.innerHTML = '7 + 4 = 11 (je pose 1, retenue 1)';
            document.getElementById('mres_4').classList.add('visible');
            break;
        case 9:
            stepInfo.innerHTML = '2 + 0 + 1 = 3 (je pose 3)';
            document.getElementById('mres_3').classList.add('visible');
            break;
        case 10:
            stepInfo.innerHTML = '2 + 7 = 9 (je pose 9)';
            document.getElementById('mres_2').classList.add('visible');
            break;
        case 11:
            stepInfo.innerHTML = '1 (je pose 1)';
            document.getElementById('mres_1').classList.add('visible');
            break;
        case 12:
            stepInfo.innerHTML = 'On place la virgule : 2 + 1 = 3 chiffres après la virgule';
            document.getElementById('mres_v').style.opacity = '1';
            document.getElementById('virgule_expl').style.opacity = '1';
            const cadre68 = document.getElementById('cadre_68');
            const m1_4 = document.getElementById('m1_4');
            const rect68 = m1_4.getBoundingClientRect();
            const container = document.getElementById('multiplicationOp').getBoundingClientRect();
            cadre68.style.left = (rect68.left - container.left - 12) + 'px';
            cadre68.style.top = (rect68.top - container.top + 9) + 'px';
            cadre68.style.width = '92px';
            cadre68.style.height = '32px';
            cadre68.style.opacity = '1';
            const cadre4 = document.getElementById('cadre_4');
            const m2_4 = document.getElementById('m2_4');
            const rect4 = m2_4.getBoundingClientRect();
            cadre4.style.left = (rect4.left - container.left - 12) + 'px';
            cadre4.style.top = (rect4.top - container.top + 9) + 'px';
            cadre4.style.width = '52px';
            cadre4.style.height = '32px';
            cadre4.style.opacity = '1';
            break;
        case 13:
            stepInfo.innerHTML = '<strong style="color: #2ecc71;">✓ Résultat : 5,68 × 3,4 = 19,312</strong>';
            document.getElementById('btnNext3').disabled = true;
            break;
    }
    stepMultiplication++;
}
function resetMultiplication() {
    stepMultiplication = 0;
    document.getElementById('btnNext3').disabled = false;
    document.getElementById('stepInfo3').innerHTML = 'Cliquez sur "Étape suivante" pour démarrer l\'animation';
    ['m1_3','m1_4','m1_5','m2_3','m2_4','m3_2','m3_3','m3_4','m3_5','m4_1','m4_2','m4_3','m4_4','m4_5','mres_1','mres_2','mres_3','mres_4','mres_5','ligne_mult1','ligne_mult2'].forEach(id => document.getElementById(id).classList.remove('visible'));
    ['m1_v','m2_v','mres_v','mret_1','mret_2','mret_3','mret_4','virgule_expl'].forEach(id => document.getElementById(id).style.opacity = '0');
    document.getElementById('cadre_68').style.opacity = '0';
    document.getElementById('cadre_4').style.opacity = '0';
}

// ===== ANIMATION DIVISION EUCLIDIENNE =====
let stepDivision = 0;
function nextStepDivision() {
    const stepInfo = document.getElementById('stepInfo4');
    switch(stepDivision) {
        case 0:
            stepInfo.innerHTML = 'La division est posée : 1347 ÷ 24. Dans 13, on ne peut pas mettre 24. Dans 134, combien de fois 24 ?';
            break;
        case 1:
            stepInfo.innerHTML = '<span style="color: #e74c3c;">5 fois</span> car 24 × 5 = 120. On écrit <span style="color: #e74c3c;">5</span> au quotient';
            document.getElementById('div_q1').classList.add('visible');
            break;
        case 2:
            stepInfo.innerHTML = 'On écrit <span style="color: #e74c3c;">120</span> sous 134 et on soustrait';
            document.getElementById('div_moins1').style.opacity = '1';
            ['div_120_1','div_120_2','div_120_3'].forEach(id => document.getElementById(id).classList.add('visible'));
            document.getElementById('trait_div1').style.opacity = '1';
            break;
        case 3:
            stepInfo.innerHTML = '134 − 120 = 14';
            ['div_147_1','div_147_2'].forEach(id => document.getElementById(id).classList.add('visible'));
            break;
        case 4:
            stepInfo.innerHTML = 'On "descend" le 7 du dividende. On obtient 147';
            document.getElementById('div_147_3').classList.add('visible');
            document.getElementById('fleche_7').style.opacity = '1';
            break;
        case 5:
            stepInfo.innerHTML = 'Dans 147, combien de fois 24 ? <span style="color: #2ecc71;">6 fois</span> car 24 × 6 = 144. On écrit <span style="color: #2ecc71;">6</span> au quotient';
            document.getElementById('div_q2').classList.add('visible');
            break;
        case 6:
            stepInfo.innerHTML = 'On écrit <span style="color: #2ecc71;">144</span> sous 147 et on soustrait';
            document.getElementById('div_moins2').style.opacity = '1';
            ['div_144_1','div_144_2','div_144_3'].forEach(id => document.getElementById(id).classList.add('visible'));
            document.getElementById('trait_div2').style.opacity = '1';
            break;
        case 7:
            stepInfo.innerHTML = '147 − 144 = 3. Le reste est 3 (inférieur à 24, la division est terminée)';
            document.getElementById('div_reste3').classList.add('visible');
            break;
        case 8:
            stepInfo.innerHTML = '<strong style="color: #2ecc71;">✓ Résultat : quotient = 56, reste = 3</strong>';
            document.querySelector('#egalite_div span').style.opacity = '1';
            document.getElementById('btnNext4').disabled = true;
            break;
    }
    stepDivision++;
}
function resetDivision() {
    stepDivision = 0;
    document.getElementById('btnNext4').disabled = false;
    document.getElementById('stepInfo4').innerHTML = 'Cliquez sur "Étape suivante" pour démarrer l\'animation';
    ['div_120_1','div_120_2','div_120_3','div_q1','div_q2','div_147_1','div_147_2','div_147_3','div_144_1','div_144_2','div_144_3','div_reste3'].forEach(id => document.getElementById(id).classList.remove('visible'));
    ['div_moins1','div_moins2','trait_div1','trait_div2','fleche_7'].forEach(id => document.getElementById(id).style.opacity = '0');
    document.querySelector('#egalite_div span').style.opacity = '0';
}

// ===== ANIMATION DIVISION DÉCIMALE — CONTINUER =====
let stepDecimale = 0;
function nextStepDecimale() {
    const stepInfo = document.getElementById('stepInfo5');
    switch(stepDecimale) {
        case 0:
            stepInfo.innerHTML = 'On a terminé la division euclidienne : quotient = 56, reste = 3. Pour continuer, on ajoute une virgule au quotient et on imagine une virgule après 1347 dans le dividende';
            document.getElementById('dec_virgule').style.opacity = '1';
            document.getElementById('dec_ph_virgule').style.opacity = '1';
            break;
        case 1:
            stepInfo.innerHTML = 'On peut ajouter des <span style="color: #f39c12; font-weight: bold;">0</span> invisibles après la virgule de 1347. On "descend" le premier → le reste 3 devient 30';
            document.getElementById('dec_ph0_1').style.opacity = '1';
            document.getElementById('dec_30').style.opacity = '1';
            break;
        case 2:
            stepInfo.innerHTML = 'Dans 30, combien de fois 24 ? <span style="color: #9b59b6;">1 fois</span> car 24 × 1 = 24. On écrit <span style="color: #9b59b6;">1</span> après la virgule';
            document.getElementById('dec_q1').classList.add('visible');
            break;
        case 3:
            stepInfo.innerHTML = 'On soustrait : 30 − <span style="color: #9b59b6;">24</span> = 6';
            document.getElementById('dec_moins1').style.opacity = '1';
            ['dec_24_1','dec_24_2'].forEach(id => document.getElementById(id).classList.add('visible'));
            document.getElementById('dec_trait1').style.opacity = '1';
            break;
        case 4:
            stepInfo.innerHTML = 'Reste 6 : on descend un deuxième <span style="color: #f39c12; font-weight: bold;">0</span> invisible → 60';
            document.getElementById('dec_ph0_2').style.opacity = '1';
            document.getElementById('dec_60_1').classList.add('visible');
            document.getElementById('dec_60_2').style.opacity = '1';
            break;
        case 5:
            stepInfo.innerHTML = 'Dans 60, combien de fois 24 ? <span style="color: #e67e22;">2 fois</span> car 24 × 2 = 48. On écrit <span style="color: #e67e22;">2</span>';
            document.getElementById('dec_q2').classList.add('visible');
            break;
        case 6:
            stepInfo.innerHTML = 'On soustrait : 60 − <span style="color: #e67e22;">48</span> = 12';
            document.getElementById('dec_moins2').style.opacity = '1';
            ['dec_48_1','dec_48_2'].forEach(id => document.getElementById(id).classList.add('visible'));
            document.getElementById('dec_trait2').style.opacity = '1';
            break;
        case 7:
            stepInfo.innerHTML = 'Reste 12 : on descend un troisième <span style="color: #f39c12; font-weight: bold;">0</span> invisible → 120';
            document.getElementById('dec_ph0_3').style.opacity = '1';
            document.getElementById('dec_120_1').classList.add('visible');
            document.getElementById('dec_120_2').classList.add('visible');
            document.getElementById('dec_120_3').style.opacity = '1';
            break;
        case 8:
            stepInfo.innerHTML = 'Dans 120, combien de fois 24 ? <span style="color: #16a085;">5 fois</span> car 24 × 5 = 120. On écrit <span style="color: #16a085;">5</span>';
            document.getElementById('dec_q3').classList.add('visible');
            break;
        case 9:
            stepInfo.innerHTML = 'On soustrait : 120 − <span style="color: #16a085;">120</span> = 0. La division est terminée !';
            document.getElementById('dec_moins3').style.opacity = '1';
            ['dec_120s_1','dec_120s_2','dec_120s_3'].forEach(id => document.getElementById(id).classList.add('visible'));
            document.getElementById('dec_trait3').style.opacity = '1';
            break;
        case 10:
            stepInfo.innerHTML = '<strong style="color: #2ecc71;">✓ Résultat : 1347 ÷ 24 = 56,125</strong>';
            document.getElementById('dec_reste0').classList.add('visible');
            document.querySelector('#egalite_dec span').style.opacity = '1';
            document.getElementById('btnNext5').disabled = true;
            break;
    }
    stepDecimale++;
}
function resetDecimale() {
    stepDecimale = 0;
    document.getElementById('btnNext5').disabled = false;
    document.getElementById('stepInfo5').innerHTML = 'Cliquez sur "Étape suivante" pour démarrer l\'animation';
    ['dec_30','dec_q1','dec_q2','dec_q3','dec_24_1','dec_24_2','dec_48_1','dec_48_2','dec_120_1','dec_120_2','dec_120_3','dec_120s_1','dec_120s_2','dec_120s_3','dec_reste0','dec_60_1'].forEach(id => document.getElementById(id).classList.remove('visible'));
    ['dec_ph_virgule','dec_ph0_1','dec_ph0_2','dec_ph0_3','dec_virgule','dec_moins1','dec_moins2','dec_moins3','dec_trait1','dec_trait2','dec_trait3','dec_60_2','dec_120_3'].forEach(id => document.getElementById(id).style.opacity = '0');
    document.querySelector('#egalite_dec span').style.opacity = '0';
}

// ===== ANIMATION DIVISION DÉCIMALE — DIVIDENDE DÉCIMAL =====
let stepDividendeDecimal = 0;
function nextStepDividendeDecimal() {
    const stepInfo = document.getElementById('stepInfo6');
    switch(stepDividendeDecimal) {
        case 0:
            stepInfo.innerHTML = 'La division est posée : 9,4 ÷ 4. Dans 9, combien de fois 4 ?';
            break;
        case 1:
            stepInfo.innerHTML = '<span style="color: #e74c3c;">2 fois</span> car 4 × 2 = 8. On écrit <span style="color: #e74c3c;">2</span> au quotient';
            document.getElementById('dd_q1').classList.add('visible');
            break;
        case 2:
            stepInfo.innerHTML = 'On soustrait : 9 − <span style="color: #e74c3c;">8</span> = 1';
            document.getElementById('dd_moins1').style.opacity = '1';
            document.getElementById('dd_8s1').classList.add('visible');
            document.getElementById('dd_trait1').style.opacity = '1';
            document.getElementById('dd_reste1').classList.add('visible');
            break;
        case 3:
            stepInfo.innerHTML = 'On descend le 4 (chiffre après la virgule) → <strong>14</strong>. On pose la virgule au quotient. Dans 14, combien de fois 4 ?';
            document.getElementById('dd_desc4').classList.add('visible');
            document.getElementById('dd_virgule').style.opacity = '1';
            break;
        case 4:
            stepInfo.innerHTML = '<span style="color: #2ecc71;">3 fois</span> car 4 × 3 = 12. On écrit <span style="color: #2ecc71;">3</span> au quotient';
            document.getElementById('dd_q2').classList.add('visible');
            break;
        case 5:
            stepInfo.innerHTML = 'On soustrait : 14 − <span style="color: #2ecc71;">12</span> = 2. Reste 2. Il n\'y a plus de chiffre à descendre… mais la division n\'est pas finie !';
            document.getElementById('dd_moins2').style.opacity = '1';
            document.getElementById('dd_12_1').classList.add('visible');
            document.getElementById('dd_12_2').classList.add('visible');
            document.getElementById('dd_trait2').style.opacity = '1';
            document.getElementById('dd_reste2').classList.add('visible');
            break;
        case 6:
            stepInfo.innerHTML = 'On peut toujours ajouter un <span style="color: #f39c12; font-weight: bold;">0</span> après la virgule d\'un nombre décimal sans en changer la valeur ! On "descend" ce <span style="color: #f39c12; font-weight: bold;">0</span> → <strong style="color: #f39c12;">20</strong>';
            document.getElementById('dd_zero_fantome').style.opacity = '1';
            document.getElementById('dd_zero_desc').classList.add('visible');
            break;
        case 7:
            stepInfo.innerHTML = 'Dans 20, combien de fois 4 ? <span style="color: #9b59b6;">5 fois</span> car 4 × 5 = 20. On écrit <span style="color: #9b59b6;">5</span> au quotient';
            document.getElementById('dd_q3').classList.add('visible');
            break;
        case 8:
            stepInfo.innerHTML = 'On soustrait : 20 − <span style="color: #9b59b6;">20</span> = 0. La division est terminée !';
            document.getElementById('dd_moins3').style.opacity = '1';
            document.getElementById('dd_20_1').classList.add('visible');
            document.getElementById('dd_20_2').classList.add('visible');
            document.getElementById('dd_trait3').style.opacity = '1';
            break;
        case 9:
            stepInfo.innerHTML = '<strong style="color: #2ecc71;">✓ Résultat : 9,4 ÷ 4 = 2,35</strong>';
            document.getElementById('dd_reste0').classList.add('visible');
            document.querySelector('#egalite_dd span').style.opacity = '1';
            document.getElementById('btnNext6').disabled = true;
            break;
    }
    stepDividendeDecimal++;
}
function resetDividendeDecimal() {
    stepDividendeDecimal = 0;
    document.getElementById('btnNext6').disabled = false;
    document.getElementById('stepInfo6').innerHTML = 'Cliquez sur "Étape suivante" pour démarrer l\'animation';
    ['dd_8s1','dd_q1','dd_q2','dd_q3','dd_reste1','dd_desc4','dd_12_1','dd_12_2','dd_reste2','dd_zero_desc','dd_20_1','dd_20_2','dd_reste0'].forEach(id => document.getElementById(id).classList.remove('visible'));
    ['dd_moins1','dd_moins2','dd_moins3','dd_trait1','dd_trait2','dd_trait3','dd_virgule','dd_zero_fantome'].forEach(id => document.getElementById(id).style.opacity = '0');
    document.querySelector('#egalite_dd span').style.opacity = '0';
}

updateSlide();
