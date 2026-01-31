// Variables globales
let currentSlideIndex = 0;
let currentStepIndex = 0;
let slides = null;
let totalSlides = 0;

// Titres correspondant aux 7 slides du HTML
const slideTitles = [
    "Chapitre 7 : Notion de fonction",                      // Slide 1
    "Introduction",                                          // Slide 2
    "I. Définitions-vocabulaire",                           // Slide 3
    "II. Détermination - 1) Par une formule",              // Slide 4
    "2) Calcul d'images et d'antécédents",                 // Slide 5
    "3) Par un graphique",                                  // Slide 6
    "4) Par un tableau de valeurs"                          // Slide 7
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

// ========================================
// ANIMATIONS DES FLÈCHES (GRAPHIQUE)
// ========================================

// IMMÉDIATEMENT cacher toutes les flèches au chargement
(function() {
    // Cacher flèche bleue
    const arrowBlueV = document.querySelector('.arrow-blue-v');
    const arrowBlueH = document.querySelector('.arrow-blue-h');
    const arrowheadBlueV = document.querySelector('.arrowhead-blue-v');
    const arrowheadBlueH = document.querySelector('.arrowhead-blue-h');
    const crossBlue = document.querySelector('.cross-blue');
    
    if (arrowBlueV) {
        arrowBlueV.style.strokeDasharray = '88';
        arrowBlueV.style.strokeDashoffset = '88';
    }
    if (arrowBlueH) {
        arrowBlueH.style.strokeDasharray = '260';
        arrowBlueH.style.strokeDashoffset = '260';
    }
    if (arrowheadBlueV) arrowheadBlueV.style.opacity = '0';
    if (arrowheadBlueH) arrowheadBlueH.style.opacity = '0';
    if (crossBlue) crossBlue.style.opacity = '0';
    
    // Cacher flèche verte
    const arrowGreenV = document.querySelector('.arrow-green-v');
    const arrowGreenH = document.querySelector('.arrow-green-h');
    const arrowheadGreenV = document.querySelector('.arrowhead-green-v');
    const arrowheadGreenH = document.querySelector('.arrowhead-green-h');
    const crossGreen = document.querySelector('.cross-green');
    
    if (arrowGreenV) {
        arrowGreenV.style.strokeDasharray = '226';
        arrowGreenV.style.strokeDashoffset = '226';
    }
    if (arrowGreenH) {
        arrowGreenH.style.strokeDasharray = '435';
        arrowGreenH.style.strokeDashoffset = '435';
    }
    if (arrowheadGreenV) arrowheadGreenV.style.opacity = '0';
    if (arrowheadGreenH) arrowheadGreenH.style.opacity = '0';
    if (crossGreen) crossGreen.style.opacity = '0';
    
    // Cacher flèche rouge
    const arrowRedH = document.querySelector('.arrow-red-h');
    const arrowRedV = document.querySelector('.arrow-red-v');
    const arrowheadRedH = document.querySelector('.arrowhead-red-h');
    const arrowheadRedV = document.querySelector('.arrowhead-red-v');
    const crossRed = document.querySelector('.cross-red');
    
    if (arrowRedH) {
        arrowRedH.style.strokeDasharray = '526';
        arrowRedH.style.strokeDashoffset = '526';
    }
    if (arrowRedV) {
        arrowRedV.style.strokeDasharray = '338';
        arrowRedV.style.strokeDashoffset = '338';
    }
    if (arrowheadRedH) arrowheadRedH.style.opacity = '0';
    if (arrowheadRedV) arrowheadRedV.style.opacity = '0';
    if (crossRed) crossRed.style.opacity = '0';
})();

// Fonction pour animer la flèche bleue (Image de 9)
function showImageBlue() {
    const btn = document.getElementById('btnImageBlue');
    if (btn) btn.disabled = true;
    
    const arrowV = document.querySelector('.arrow-blue-v');
    const arrowH = document.querySelector('.arrow-blue-h');
    const arrowheadV = document.querySelector('.arrowhead-blue-v');
    const arrowheadH = document.querySelector('.arrowhead-blue-h');
    const cross = document.querySelector('.cross-blue');
    
    // Animer flèche verticale
    if (arrowV) {
        arrowV.style.transition = 'stroke-dashoffset 0.8s ease-out';
        arrowV.style.strokeDashoffset = '0';
    }
    
    // Apparaître pointe verticale
    setTimeout(() => {
        if (arrowheadV) {
            arrowheadV.style.transition = 'opacity 0.3s';
            arrowheadV.style.opacity = '1';
        }
    }, 700);
    
    // Animer flèche horizontale
    setTimeout(() => {
        if (arrowH) {
            arrowH.style.transition = 'stroke-dashoffset 1s ease-out';
            arrowH.style.strokeDashoffset = '0';
        }
    }, 1000);
    
    // Apparaître pointe horizontale
    setTimeout(() => {
        if (arrowheadH) {
            arrowheadH.style.transition = 'opacity 0.3s';
            arrowheadH.style.opacity = '1';
        }
    }, 1900);
    
    // Apparaître croix
    setTimeout(() => {
        if (cross) {
            cross.style.transition = 'opacity 0.3s';
            cross.style.opacity = '1';
        }
    }, 800);
}

// Fonction pour animer la flèche verte (Image de 15)
function showImageGreen() {
    const btn = document.getElementById('btnImageGreen');
    if (btn) btn.disabled = true;
    
    const arrowV = document.querySelector('.arrow-green-v');
    const arrowH = document.querySelector('.arrow-green-h');
    const arrowheadV = document.querySelector('.arrowhead-green-v');
    const arrowheadH = document.querySelector('.arrowhead-green-h');
    const cross = document.querySelector('.cross-green');
    
    // Animer flèche verticale
    if (arrowV) {
        arrowV.style.transition = 'stroke-dashoffset 0.8s ease-out';
        arrowV.style.strokeDashoffset = '0';
    }
    
    // Apparaître pointe verticale
    setTimeout(() => {
        if (arrowheadV) {
            arrowheadV.style.transition = 'opacity 0.3s';
            arrowheadV.style.opacity = '1';
        }
    }, 700);
    
    // Animer flèche horizontale
    setTimeout(() => {
        if (arrowH) {
            arrowH.style.transition = 'stroke-dashoffset 1.2s ease-out';
            arrowH.style.strokeDashoffset = '0';
        }
    }, 1000);
    
    // Apparaître pointe horizontale
    setTimeout(() => {
        if (arrowheadH) {
            arrowheadH.style.transition = 'opacity 0.3s';
            arrowheadH.style.opacity = '1';
        }
    }, 2100);
    
    // Apparaître croix
    setTimeout(() => {
        if (cross) {
            cross.style.transition = 'opacity 0.3s';
            cross.style.opacity = '1';
        }
    }, 800);
}

// Fonction pour animer la flèche rouge (Antécédent de 26)
function showAntecedentRed() {
    const btn = document.getElementById('btnAntecedentRed');
    if (btn) btn.disabled = true;
    
    const arrowH = document.querySelector('.arrow-red-h');
    const arrowV = document.querySelector('.arrow-red-v');
    const arrowheadH = document.querySelector('.arrowhead-red-h');
    const arrowheadV = document.querySelector('.arrowhead-red-v');
    const cross = document.querySelector('.cross-red');
    
    // Animer flèche horizontale
    if (arrowH) {
        arrowH.style.transition = 'stroke-dashoffset 1.2s ease-out';
        arrowH.style.strokeDashoffset = '0';
    }
    
    // Apparaître pointe horizontale
    setTimeout(() => {
        if (arrowheadH) {
            arrowheadH.style.transition = 'opacity 0.3s';
            arrowheadH.style.opacity = '1';
        }
    }, 1100);
    
    // Animer flèche verticale
    setTimeout(() => {
        if (arrowV) {
            arrowV.style.transition = 'stroke-dashoffset 1s ease-out';
            arrowV.style.strokeDashoffset = '0';
        }
    }, 1400);
    
    // Apparaître pointe verticale
    setTimeout(() => {
        if (arrowheadV) {
            arrowheadV.style.transition = 'opacity 0.3s';
            arrowheadV.style.opacity = '1';
        }
    }, 2300);
    
    // Apparaître croix
    setTimeout(() => {
        if (cross) {
            cross.style.transition = 'opacity 0.3s';
            cross.style.opacity = '1';
        }
    }, 1200);
}

// Fonction pour réinitialiser toutes les animations du graphique
function resetGraphAnimations() {
    // Réactiver tous les boutons
    const btnBlue = document.getElementById('btnImageBlue');
    const btnGreen = document.getElementById('btnImageGreen');
    const btnRed = document.getElementById('btnAntecedentRed');
    
    if (btnBlue) btnBlue.disabled = false;
    if (btnGreen) btnGreen.disabled = false;
    if (btnRed) btnRed.disabled = false;
    
    // Réinitialiser flèche bleue
    const arrowBlueV = document.querySelector('.arrow-blue-v');
    const arrowBlueH = document.querySelector('.arrow-blue-h');
    const arrowheadBlueV = document.querySelector('.arrowhead-blue-v');
    const arrowheadBlueH = document.querySelector('.arrowhead-blue-h');
    const crossBlue = document.querySelector('.cross-blue');
    
    if (arrowBlueV) {
        arrowBlueV.style.transition = 'none';
        arrowBlueV.style.strokeDashoffset = '88';
    }
    if (arrowBlueH) {
        arrowBlueH.style.transition = 'none';
        arrowBlueH.style.strokeDashoffset = '260';
    }
    if (arrowheadBlueV) {
        arrowheadBlueV.style.transition = 'none';
        arrowheadBlueV.style.opacity = '0';
    }
    if (arrowheadBlueH) {
        arrowheadBlueH.style.transition = 'none';
        arrowheadBlueH.style.opacity = '0';
    }
    if (crossBlue) {
        crossBlue.style.transition = 'none';
        crossBlue.style.opacity = '0';
    }
    
    // Réinitialiser flèche verte
    const arrowGreenV = document.querySelector('.arrow-green-v');
    const arrowGreenH = document.querySelector('.arrow-green-h');
    const arrowheadGreenV = document.querySelector('.arrowhead-green-v');
    const arrowheadGreenH = document.querySelector('.arrowhead-green-h');
    const crossGreen = document.querySelector('.cross-green');
    
    if (arrowGreenV) {
        arrowGreenV.style.transition = 'none';
        arrowGreenV.style.strokeDashoffset = '226';
    }
    if (arrowGreenH) {
        arrowGreenH.style.transition = 'none';
        arrowGreenH.style.strokeDashoffset = '435';
    }
    if (arrowheadGreenV) {
        arrowheadGreenV.style.transition = 'none';
        arrowheadGreenV.style.opacity = '0';
    }
    if (arrowheadGreenH) {
        arrowheadGreenH.style.transition = 'none';
        arrowheadGreenH.style.opacity = '0';
    }
    if (crossGreen) {
        crossGreen.style.transition = 'none';
        crossGreen.style.opacity = '0';
    }
    
    // Réinitialiser flèche rouge
    const arrowRedH = document.querySelector('.arrow-red-h');
    const arrowRedV = document.querySelector('.arrow-red-v');
    const arrowheadRedH = document.querySelector('.arrowhead-red-h');
    const arrowheadRedV = document.querySelector('.arrowhead-red-v');
    const crossRed = document.querySelector('.cross-red');
    
    if (arrowRedH) {
        arrowRedH.style.transition = 'none';
        arrowRedH.style.strokeDashoffset = '526';
    }
    if (arrowRedV) {
        arrowRedV.style.transition = 'none';
        arrowRedV.style.strokeDashoffset = '338';
    }
    if (arrowheadRedH) {
        arrowheadRedH.style.transition = 'none';
        arrowheadRedH.style.opacity = '0';
    }
    if (arrowheadRedV) {
        arrowheadRedV.style.transition = 'none';
        arrowheadRedV.style.opacity = '0';
    }
    if (crossRed) {
        crossRed.style.transition = 'none';
        crossRed.style.opacity = '0';
    }
}

// ========================================
// ANIMATIONS DU TABLEAU DE VALEURS
// ========================================

// Variables globales pour contrôler l'animation
let pointsShown = false;
let curveShown = false;
let animationInProgress = false;

// IMMÉDIATEMENT cacher la courbe et les croix dès le chargement du script
(function() {
    const curve = document.querySelector('.table-curve');
    if (curve) {
        curve.style.display = 'none';
        curve.style.opacity = '0';
    }
    
    // Cacher toutes les croix
    for (let i = 0; i < 7; i++) {
        const cross = document.querySelector(`.table-cross-${i}`);
        if (cross) {
            cross.style.opacity = '0';
        }
    }
})();

// Fonction pour afficher les points
function showTablePoints() {
    if (pointsShown || animationInProgress) return;
    
    animationInProgress = true;
    const btnPoints = document.getElementById('btnShowPoints');
    if (btnPoints) btnPoints.disabled = true;
    
    const totalCrosses = 7;
    const delayBetweenCrosses = 800;
    
    // Faire apparaître les croix une par une
    for (let i = 0; i < totalCrosses; i++) {
        setTimeout(() => {
            const cross = document.querySelector(`.table-cross-${i}`);
            if (cross) {
                cross.style.transition = 'opacity 0.5s ease-in';
                cross.style.opacity = '1';
                
                // FORCER la croix à rester visible
                setTimeout(() => {
                    cross.style.transition = 'none';
                    cross.style.opacity = '1';
                }, 600);
            }
            
            // Après la dernière croix, activer le bouton courbe
            if (i === totalCrosses - 1) {
                setTimeout(() => {
                    pointsShown = true;
                    animationInProgress = false;
                    
                    // Activer le bouton "Tracer la courbe"
                    const btnCurve = document.getElementById('btnShowCurve');
                    if (btnCurve) {
                        btnCurve.disabled = false;
                        btnCurve.style.backgroundColor = '#2ecc71';
                        btnCurve.style.cursor = 'pointer';
                    }
                }, 600);
            }
        }, i * delayBetweenCrosses);
    }
}

// Fonction pour afficher la courbe
function showTableCurve() {
    if (!pointsShown || curveShown || animationInProgress) return;
    
    animationInProgress = true;
    const btnCurve = document.getElementById('btnShowCurve');
    if (btnCurve) btnCurve.disabled = true;
    
    const curve = document.querySelector('.table-curve');
    if (curve) {
        curve.style.display = 'block';
        setTimeout(() => {
            curve.style.transition = 'opacity 1.5s ease-in';
            curve.style.opacity = '1';
            
            setTimeout(() => {
                curve.style.transition = 'none';
                curve.style.opacity = '1';
                curveShown = true;
                animationInProgress = false;
            }, 1600);
        }, 50);
    }
}

// Fonction pour réinitialiser
function resetTableAnimation() {
    pointsShown = false;
    curveShown = false;
    animationInProgress = false;
    
    // Réactiver le bouton points
    const btnPoints = document.getElementById('btnShowPoints');
    if (btnPoints) btnPoints.disabled = false;
    
    // Désactiver le bouton courbe
    const btnCurve = document.getElementById('btnShowCurve');
    if (btnCurve) {
        btnCurve.disabled = true;
        btnCurve.style.backgroundColor = '#95a5a6';
        btnCurve.style.cursor = 'not-allowed';
    }
    
    // Cacher la courbe
    const curve = document.querySelector('.table-curve');
    if (curve) {
        curve.style.transition = 'none';
        curve.style.display = 'none';
        curve.style.opacity = '0';
    }
    
    // Cacher toutes les croix
    for (let i = 0; i < 7; i++) {
        const cross = document.querySelector(`.table-cross-${i}`);
        if (cross) {
            cross.style.transition = 'none';
            cross.style.opacity = '0';
        }
    }
}
