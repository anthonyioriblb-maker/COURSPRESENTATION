// Variables globales
let currentSlideIndex = 0;
let currentStepIndex = 0;
let slides = null;
let totalSlides = 0;

// Titres correspondant exactement aux 20 slides du HTML
const slideTitles = [
    "Trigonométrie dans un triangle rectangle",     // Slide 1
    "I. Trois formules",                            // Slide 2
    "1) Triangle rectangle et vocabulaire",         // Slide 3
    "2) Cosinus d'un angle aigu",                   // Slide 4
    "3) Sinus d'un angle aigu",                     // Slide 5
    "4) Tangente d'un angle aigu",                  // Slide 6
    "II. Utilisation de la calculatrice",           // Slide 7
    "1) Calculer la valeur d'un cosinus",           // Slide 8
    "2) Calculer un angle",                         // Slide 9
    "III. Calcul de longueur",                      // Slide 10
    "Exemple 1 - Calcul avec sinus",                // Slide 11
    "Exemple 2 - Calcul avec tangente",             // Slide 12
    "Exemple 3 - Calcul avec cosinus",              // Slide 13
    "IV. Calcul d'angles",                          // Slide 14
    "Exemple 1 - Angle avec sinus",                 // Slide 15
    "Exemple 2 - Angle avec tangente",              // Slide 16
    "V. Relations trigonométriques",                // Slide 17
    "Propriétés fondamentales",                     // Slide 18
    "Démonstration",                                // Slide 19
    "Exemple d'application"                         // Slide 20
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