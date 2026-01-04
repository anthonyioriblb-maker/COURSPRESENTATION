// Initialisation - attendre que le DOM soit chargé
let currentSlideIndex = 0;
let currentStepIndex = 0;
let slides;
let totalSlides;

const slideTitles = [
    "Chapitre 7 : Géométrie dans l'espace",         // Slide 1
    "I. Pyramide",                                   // Slide 2
    "1) Définitions",                                // Slide 3
    "Exemples de pyramides",                         // Slide 4
    "Pyramide régulière",                            // Slide 5
    "Exemples pyramides régulières",                 // Slide 6
    "Remarque hauteur",                              // Slide 7
    "2) Patron d'une pyramide",                      // Slide 8
    "Patron - Remarque",                             // Slide 9
    "Patron - Exemple",                              // Slide 10
    "II. Cône de révolution",                        // Slide 11
    "1) Définitions",                                // Slide 12
    "2) Patron d'un cône",                           // Slide 13
    "III. Volumes",                                  // Slide 14
    "Propriété volume",                              // Slide 15
    "Exemple 1 : Volume d'un cône",                  // Slide 16
    "Exemple 2 : Volume d'une pyramide",             // Slide 17
    "À retenir",                                     // Slide 18
    "Méthode"                                        // Slide 19
];

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
    slides = document.querySelectorAll('.slide');
    totalSlides = slides.length;
    document.getElementById('totalSlides').textContent = totalSlides;
    updateSlide();
});

function initSlideMenu() {
    const slideList = document.getElementById('slideList');
    slideList.innerHTML = '';
    slideTitles.forEach((title, index) => {
        const slideItem = document.createElement('div');
        slideItem.className = 'slide-item';
        if (index === currentSlideIndex) slideItem.classList.add('current');
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
    document.getElementById('slideMenu').classList.add('active');
}

function closeMenu() {
    document.getElementById('slideMenu').classList.remove('active');
}

function openHelp() {
    document.getElementById('helpOverlay').classList.add('active');
}

function closeHelp() {
    document.getElementById('helpOverlay').classList.remove('active');
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
    const contentDiv = document.querySelector('.content');

    slides.forEach((slide, index) => {
        slide.classList.remove('active');
        if (index === currentSlideIndex) slide.classList.add('active');
    });

    const steps = slides[currentSlideIndex].querySelectorAll('.step');
    const totalSteps = steps.length;

    steps.forEach((step, index) => {
        if (index < currentStepIndex) {
            step.classList.add('visible');
        } else {
            step.classList.remove('visible');
        }
    });

    document.getElementById('currentSlide').textContent = currentSlideIndex + 1;
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

    if (currentStepIndex === 0) {
        setTimeout(() => {
            contentDiv.scrollTo({ top: 0, behavior: 'smooth' });
        }, 50);
    } else if (currentStepIndex > 0) {
        setTimeout(() => {
            const visibleSteps = slides[currentSlideIndex].querySelectorAll('.step.visible');
            if (visibleSteps.length > 0) {
                const lastVisibleStep = visibleSteps[visibleSteps.length - 1];
                lastVisibleStep.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
            }
        }, 650);
    }
}

function changeSlide(direction) {
    const currentSlide = slides[currentSlideIndex];
    const steps = currentSlide.querySelectorAll('.step');
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
            const prevSteps = slides[currentSlideIndex].querySelectorAll('.step');
            currentStepIndex = prevSteps.length;
            updateSlide();
        }
    }
}

// Gestion des événements clavier
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
    if (e.key === 'ArrowUp' || e.key === ' ') {
        e.preventDefault();
        changeSlide(1);
    } else if (e.key === 'ArrowDown') {
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

// Fermer les overlays en cliquant à l'extérieur
document.addEventListener('click', (e) => {
    const slideMenu = document.getElementById('slideMenu');
    if (slideMenu && e.target.id === 'slideMenu') {
        closeMenu();
    }

    const helpOverlay = document.getElementById('helpOverlay');
    if (helpOverlay && e.target.id === 'helpOverlay') {
        closeHelp();
    }
});
