// Variables globales
let currentSlideIndex = 0;
let currentStepIndex = 0;
let slides = null;
let totalSlides = 0;

// Titres des slides du Chapitre 13
const slideTitles = [
    "Chapitre 13 : Arithmétique",                       // Slide 1
    "I. Divisibilité — 1) Diviseurs et multiples",      // Slide 2
    "I. — 2) Critères de divisibilité",                 // Slide 3
    "II. Nombres premiers — 1) Définition",             // Slide 4
    "II. — 2) Le crible d'Ératosthène",                 // Slide 5
    "III. Décomposition en facteurs premiers",           // Slide 6
    "IV. PGCD — 1) Définition et calcul",               // Slide 7
    "IV. — 2) Application : fractions irréductibles",   // Slide 8
    "V. PPCM (Plus Petit Commun Multiple)",             // Slide 9
];

// Construit la liste à plat des étapes (steps + step-inline enfants)
function buildStepsArray(slide) {
    const steps = [];
    slide.querySelectorAll('.step').forEach(step => {
        steps.push(step);
        step.querySelectorAll('.step-inline').forEach(inline => {
            steps.push(inline);
        });
    });
    return steps;
}

// ====================================================
// INITIALISATION
// ====================================================

document.addEventListener('DOMContentLoaded', function() {
    slides = document.querySelectorAll('.slide');
    totalSlides = slides.length;

    const totalSlidesElement = document.getElementById('totalSlides');
    if (totalSlidesElement) {
        totalSlidesElement.textContent = totalSlides;
    }

    initDecomp();
    initSieve();
    updateSlide();
});

// ====================================================
// NAVIGATION
// ====================================================

function initSlideMenu() {
    const slideList = document.getElementById('slideList');
    if (!slideList) return;

    slideList.innerHTML = '';
    slideTitles.forEach((title, index) => {
        const slideItem = document.createElement('div');
        slideItem.className = 'slide-item';
        if (index === currentSlideIndex) {
            slideItem.classList.add('current');
        }
        slideItem.innerHTML = `
            <div class="slide-number">Slide ${index + 1}</div>
            <div class="slide-title">${title}</div>
        `;
        slideItem.onclick = () => goToSlide(index);
        slideList.appendChild(slideItem);
    });
}

function openMenu() {
    initSlideMenu();
    const menu = document.getElementById('slideMenu');
    if (menu) menu.classList.add('active');
}

function closeMenu() {
    const menu = document.getElementById('slideMenu');
    if (menu) menu.classList.remove('active');
}

function openHelp() {
    const help = document.getElementById('helpOverlay');
    if (help) help.classList.add('active');
}

function closeHelp() {
    const help = document.getElementById('helpOverlay');
    if (help) help.classList.remove('active');
}

function goToSlide(index) {
    currentSlideIndex = index;
    currentStepIndex = 0;
    updateSlide();
    closeMenu();
}

function resetSlide() {
    currentStepIndex = 0;
    // Si on est sur la slide du crible (index 4), réinitialiser l'animation
    if (currentSlideIndex === 4) {
        resetSieve();
    }
    updateSlide();
}

function updateSlide() {
    if (!slides || slides.length === 0) return;

    const contentDiv = document.querySelector('.content');

    slides.forEach((slide, index) => {
        slide.classList.remove('active');
        if (index === currentSlideIndex) slide.classList.add('active');
    });

    const currentSlide = slides[currentSlideIndex];
    const steps = buildStepsArray(currentSlide);
    const totalSteps = steps.length;

    steps.forEach((step, index) => {
        if (index < currentStepIndex) {
            step.classList.add('visible');
        } else {
            step.classList.remove('visible');
        }
    });

    const currentSlideElement = document.getElementById('currentSlide');
    if (currentSlideElement) {
        currentSlideElement.textContent = currentSlideIndex + 1;
    }

    const prevBtn = document.getElementById('prevBtn');
    if (prevBtn) {
        prevBtn.disabled = currentSlideIndex === 0 && currentStepIndex === 0;
    }

    const stepIndicator = document.getElementById('stepIndicator');
    if (stepIndicator) {
        if (totalSteps > 0 && currentStepIndex < totalSteps) {
            stepIndicator.textContent = `Étape ${currentStepIndex}/${totalSteps}`;
            stepIndicator.classList.remove('hidden');
        } else {
            stepIndicator.classList.add('hidden');
        }
    }

    if (currentStepIndex === 0 && contentDiv) {
        setTimeout(() => {
            contentDiv.scrollTo({ top: 0, behavior: 'smooth' });
        }, 50);
    } else if (currentStepIndex > 0) {
        setTimeout(() => {
            const visibleSteps = currentSlide.querySelectorAll('.step.visible');
            if (visibleSteps.length > 0) {
                const lastVisibleStep = visibleSteps[visibleSteps.length - 1];
                lastVisibleStep.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'nearest'
                });
            }
        }, 650);
    }
}

function changeSlide(direction) {
    if (!slides || slides.length === 0) return;

    const currentSlide = slides[currentSlideIndex];
    const steps = buildStepsArray(currentSlide);
    const totalSteps = steps.length;

    if (direction === 1) {
        if (currentStepIndex < totalSteps) {
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
            const prevSteps = buildStepsArray(slides[currentSlideIndex]);
            currentStepIndex = prevSteps.length;
            updateSlide();
        }
    }
}

document.addEventListener('keydown', (e) => {
    const slideMenu = document.getElementById('slideMenu');
    const helpOverlay = document.getElementById('helpOverlay');

    if (slideMenu && slideMenu.classList.contains('active')) {
        if (e.key === 'Escape') closeMenu();
        return;
    }

    if (helpOverlay && helpOverlay.classList.contains('active')) {
        if (e.key === 'Escape' || e.key === 'h' || e.key === 'H' || e.key === '?') closeHelp();
        return;
    }

    if (e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === ' ') {
        e.preventDefault();
        changeSlide(1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault();
        changeSlide(-1);
    } else if (e.key === 'm' || e.key === 'M') {
        openMenu();
    } else if (e.key === 'r' || e.key === 'R') {
        resetSlide();
    } else if (e.key === 'h' || e.key === 'H' || e.key === '?') {
        openHelp();
    }
});

document.addEventListener('click', (e) => {
    const slideMenu = document.getElementById('slideMenu');
    if (slideMenu && e.target.id === 'slideMenu') closeMenu();

    const helpOverlay = document.getElementById('helpOverlay');
    if (helpOverlay && e.target.id === 'helpOverlay') closeHelp();
});

// ====================================================
// ANIMATION : Décompositions en facteurs premiers
// ====================================================

function initDecomp() {
    document.querySelectorAll('.decomp-btn').forEach(function(btn) {
        var targetId = btn.getAttribute('data-target');
        var decomp   = document.getElementById(targetId);
        if (!decomp) return;
        var rows     = decomp.querySelectorAll('.decomp-row');
        var resultId = targetId.replace('d-', 'r-');
        var result   = document.getElementById(resultId);
        var current  = 1;

        // Afficher le premier nombre (sans diviseur)
        if (rows[0]) rows[0].classList.add('visible');

        btn.addEventListener('click', function() {
            if (current - 1 < rows.length) {
                var dEl = rows[current - 1].querySelector('.decomp-d');
                if (dEl) dEl.classList.add('visible');
            }
            if (current < rows.length) {
                rows[current].classList.add('visible');
                current++;
            }
            if (current >= rows.length) {
                btn.disabled = true;
                btn.textContent = '✓ Terminé';
                if (result) result.classList.add('visible');
            }
        });
    });
}

// ====================================================
// ANIMATION : Crible d'Ératosthène (Slide 5)
// ====================================================

const cribleSteps = [
    {
        prime: 2,
        multiples: [4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36,38,40,
                    42,44,46,48,50,52,54,56,58,60,62,64,66,68,70,72,74,76,
                    78,80,82,84,86,88,90,92,94,96,98,100],
        msg: "<strong>2 est premier</strong> — ses seuls diviseurs sont 1 et 2.<br>"
           + "On raye tous les multiples de 2 supérieurs à 2 : 4, 6, 8, … 100."
    },
    {
        prime: 3,
        multiples: [9,15,21,27,33,39,45,51,57,63,69,75,81,87,93,99],
        msg: "<strong>3 est premier</strong> — le premier nombre non rayé après 2.<br>"
           + "On raye ses multiples non encore rayés : 9, 15, 21, 27, 33 …"
    },
    {
        prime: 5,
        multiples: [25,35,55,65,85,95],
        msg: "<strong>5 est premier</strong> — le premier nombre non rayé après 3.<br>"
           + "On raye ses multiples non encore rayés : 25, 35, 55, 65, 85, 95."
    },
    {
        prime: 7,
        multiples: [49,77,91],
        msg: "<strong>7 est premier</strong> — le premier nombre non rayé après 5.<br>"
           + "On raye ses multiples non encore rayés : 49, 77, 91.<br>"
           + "Puisque 11 > √100, tous les nombres restants sont premiers !"
    }
];
const remainingPrimes = [11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97];
let sieveStep = 0;
let sieveAnimating = false;

function initSieve() {
    const grid = document.getElementById('cribleGrid');
    if (!grid) return;
    grid.innerHTML = '';
    for (let i = 2; i <= 100; i++) {
        const cell = document.createElement('div');
        cell.className = 'crible-cell';
        cell.id = 'nc' + i;
        cell.textContent = i;
        grid.appendChild(cell);
    }
    sieveStep = 0;
    sieveAnimating = false;
    const msg = document.getElementById('cribleMsg');
    if (msg) msg.innerHTML = "Cliquez sur <strong>Étape suivante</strong> pour commencer.";
    const btn = document.getElementById('cribleBtn');
    if (btn) { btn.disabled = false; btn.textContent = '▶ Étape suivante'; }
}

function nextSieveStep() {
    if (sieveAnimating || sieveStep >= cribleSteps.length) return;
    sieveAnimating = true;
    const btn = document.getElementById('cribleBtn');
    if (btn) btn.disabled = true;

    const step = cribleSteps[sieveStep];
    const primeCell = document.getElementById('nc' + step.prime);
    if (primeCell) primeCell.className = 'crible-cell prime';
    const msg = document.getElementById('cribleMsg');
    if (msg) msg.innerHTML = step.msg;

    let i = 0;
    function crossNext() {
        if (i < step.multiples.length) {
            const cell = document.getElementById('nc' + step.multiples[i]);
            if (cell && !cell.classList.contains('prime')) {
                cell.className = 'crible-cell composite';
            }
            i++;
            setTimeout(crossNext, 120);
        } else {
            sieveStep++;
            sieveAnimating = false;
            if (sieveStep < cribleSteps.length) {
                if (btn) btn.disabled = false;
            } else {
                remainingPrimes.forEach(function(p) {
                    const c = document.getElementById('nc' + p);
                    if (c) c.className = 'crible-cell prime';
                });
                if (msg) msg.innerHTML =
                    "✅ <strong>Terminé !</strong> Les 25 nombres premiers ≤ 100 sont surlignés en jaune.";
                if (btn) { btn.textContent = '✓ Terminé'; }
            }
        }
    }
    setTimeout(crossNext, 400);
}

function resetSieve() {
    sieveAnimating = false;
    initSieve();
}
