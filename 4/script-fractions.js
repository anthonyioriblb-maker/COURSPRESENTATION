// Variables globales
let currentSlideIndex = 0;
let currentStepIndex = 0;
let slides = null;
let totalSlides = 0;

// Titres correspondant aux 17 slides du HTML
const slideTitles = [
    "Chapitre 5 : Écriture fractionnaire partie 2",     // Slide 1
    "I. Notion d'inverse",                              // Slide 2
    "Définition et exemple",                            // Slide 3
    "Propriété inverse d'une fraction",                 // Slide 4
    "Remarques",                                        // Slide 5
    "II. Divisions",                                    // Slide 6
    "Propriété diviser = multiplier par inverse",       // Slide 7
    "Propriété diviser deux fractions",                 // Slide 8
    "Exemples 1 et 2",                                  // Slide 9
    "Exemples 3 et 4",                                  // Slide 10
    "III. Produit en croix",                            // Slide 11
    "Propriété produit en croix",                       // Slide 12
    "Schéma du produit en croix",                       // Slide 13
    "Exemple 1",                                        // Slide 14
    "Exemple 2 - Question",                             // Slide 15
    "Exemple 2 - Méthode 1",                            // Slide 16
    "Exemple 2 - Méthode 2"                             // Slide 17
];

// Initialisation - attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM chargé');
    slides = document.querySelectorAll('.slide');
    totalSlides = slides.length;

    const totalSlidesElement = document.getElementById('totalSlides');
    if (totalSlidesElement) {
        totalSlidesElement.textContent = totalSlides;
    }

    updateSlide();
    console.log('Initialisation terminée');
});

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
    console.log('Ouverture du menu');
    initSlideMenu();
    const menu = document.getElementById('slideMenu');
    if (menu) {
        menu.classList.add('active');
    }
}

function closeMenu() {
    console.log('Fermeture du menu');
    const menu = document.getElementById('slideMenu');
    if (menu) {
        menu.classList.remove('active');
    }
}

function openHelp() {
    console.log('Ouverture de l\'aide');
    const help = document.getElementById('helpOverlay');
    if (help) {
        help.classList.add('active');
    }
}

function closeHelp() {
    console.log('Fermeture de l\'aide');
    const help = document.getElementById('helpOverlay');
    if (help) {
        help.classList.remove('active');
    }
}

function goToSlide(index) {
    console.log('Navigation vers la slide', index);
    currentSlideIndex = index;
    currentStepIndex = 0;
    updateSlide();
    closeMenu();
}

function resetSlide() {
    console.log('Réinitialisation de la slide');
    currentStepIndex = 0;
    updateSlide();
}

function updateSlide() {
    if (!slides || slides.length === 0) {
        console.error('Slides non initialisées');
        return;
    }

    const contentDiv = document.querySelector('.content');

    // Afficher uniquement la slide active
    slides.forEach((slide, index) => {
        slide.classList.remove('active');
        if (index === currentSlideIndex) {
            slide.classList.add('active');
        }
    });

    // Gérer les étapes de la slide actuelle
    const currentSlide = slides[currentSlideIndex];
    const steps = currentSlide.querySelectorAll('.step');
    const totalSteps = steps.length;

    steps.forEach((step, index) => {
        if (index < currentStepIndex) {
            step.classList.add('visible');
        } else {
            step.classList.remove('visible');
        }
    });

    // Mettre à jour l'indicateur de slide
    const currentSlideElement = document.getElementById('currentSlide');
    if (currentSlideElement) {
        currentSlideElement.textContent = currentSlideIndex + 1;
    }

    // Désactiver le bouton précédent si on est au début
    const prevBtn = document.getElementById('prevBtn');
    if (prevBtn) {
        prevBtn.disabled = currentSlideIndex === 0 && currentStepIndex === 0;
    }

    // Mettre à jour l'indicateur d'étape
    const stepIndicator = document.getElementById('stepIndicator');
    if (stepIndicator) {
        if (totalSteps > 0 && currentStepIndex < totalSteps) {
            stepIndicator.textContent = `Étape ${currentStepIndex}/${totalSteps}`;
            stepIndicator.classList.remove('hidden');
        } else {
            stepIndicator.classList.add('hidden');
        }
    }

    // Gérer le scroll
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
    if (!slides || slides.length === 0) {
        console.error('Slides non initialisées');
        return;
    }

    const currentSlide = slides[currentSlideIndex];
    const steps = currentSlide.querySelectorAll('.step');
    const totalSteps = steps.length;

    if (direction === 1) {
        // Avancer
        if (currentStepIndex < totalSteps) {
            currentStepIndex++;
            updateSlide();
        } else if (currentSlideIndex < totalSlides - 1) {
            currentSlideIndex++;
            currentStepIndex = 0;
            updateSlide();
        }
    } else {
        // Reculer
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

    // Si un menu est ouvert, gérer uniquement la fermeture
    if (slideMenu && slideMenu.classList.contains('active')) {
        if (e.key === 'Escape') {
            closeMenu();
        }
        return;
    }

    if (helpOverlay && helpOverlay.classList.contains('active')) {
        if (e.key === 'Escape' || e.key === 'h' || e.key === 'H' || e.key === '?') {
            closeHelp();
        }
        return;
    }

    // Navigation normale
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
