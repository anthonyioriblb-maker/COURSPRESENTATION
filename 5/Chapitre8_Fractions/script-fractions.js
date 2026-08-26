// Variables globales
let currentSlideIndex = 0;
let currentStepIndex = 0;
let slides = null;
let totalSlides = 0;

// Titres des slides du Chapitre 9
const slideTitles = [
    "Chapitre 9 : Fractions",                                          // Slide 1
    "I. Rappels — 1) Observation",                                     // Slide 2
    "I. 2) Propriété fondamentale",                                    // Slide 3
    "II. Nombres premiers — 1) Nombres premiers",                      // Slide 4
    "II. 2) Décomposition en produit de facteurs premiers",            // Slide 5
    "III. Simplifier une fraction — 1) Définition",                    // Slide 6
    "III. 2) Méthode : décomposition en facteurs premiers",            // Slide 7
    "IV. Addition et soustraction (même dénominateur)",                // Slide 8
    "V. Addition et soustraction (dénominateurs différents)"           // Slide 9
];

// Construit la liste à plat des étapes
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

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    slides = document.querySelectorAll('.slide');
    totalSlides = slides.length;

    const totalSlidesElement = document.getElementById('totalSlides');
    if (totalSlidesElement) {
        totalSlidesElement.textContent = totalSlides;
    }

    initDecomp();
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

    // Réinitialiser les animations de décomposition quand on est au step 0
    if (currentStepIndex === 0) {
        resetDecompOnSlide(currentSlide);
    }

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
// ANIMATION : Décomposition en facteurs premiers
// ====================================================

function initDecomp() {
    document.querySelectorAll('.decomp-btn').forEach(function(btn) {
        var targetId = btn.getAttribute('data-target');
        var decomp = document.getElementById(targetId);
        if (!decomp) return;
        var rows = decomp.querySelectorAll('.decomp-row');
        // Afficher la première ligne dès le départ
        if (rows.length > 0) rows[0].classList.add('visible');
        btn.setAttribute('data-current', '1');

        btn.addEventListener('click', function() {
            var current = parseInt(btn.getAttribute('data-current') || '1');
            var tId = btn.getAttribute('data-target');
            var dec = document.getElementById(tId);
            var rws = dec.querySelectorAll('.decomp-row');
            var resultId = tId.replace('d-', 'r-');
            var result = document.getElementById(resultId);

            // Afficher le diviseur de la ligne courante
            rws[current - 1].querySelector('.decomp-d').classList.add('visible');

            if (current < rws.length) {
                // Afficher la ligne suivante
                rws[current].classList.add('visible');
                btn.setAttribute('data-current', String(current + 1));
            } else {
                // Terminé
                btn.disabled = true;
                btn.textContent = '✓ Terminé';
                if (result) result.classList.add('visible');
            }
        });
    });
}

function resetDecompOnSlide(slide) {
    // Masquer toutes les lignes et résultats
    slide.querySelectorAll('.decomp-row').forEach(function(row) {
        row.classList.remove('visible');
    });
    slide.querySelectorAll('.decomp-d').forEach(function(d) {
        d.classList.remove('visible');
    });
    slide.querySelectorAll('.decomp-result').forEach(function(r) {
        r.classList.remove('visible');
    });
    // Réinitialiser les boutons
    slide.querySelectorAll('.decomp-btn').forEach(function(btn) {
        btn.disabled = false;
        btn.textContent = '▶ Suivant';
        btn.setAttribute('data-current', '1');
    });
    // Réafficher la première ligne de chaque table
    slide.querySelectorAll('.decomp').forEach(function(dec) {
        var rows = dec.querySelectorAll('.decomp-row');
        if (rows.length > 0) rows[0].classList.add('visible');
    });
}
