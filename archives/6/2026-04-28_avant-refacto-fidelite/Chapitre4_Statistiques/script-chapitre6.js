// Animation progressive lors du défilement
document.addEventListener('DOMContentLoaded', function() {
    // Configuration de l'Intersection Observer
    const observerOptions = {
        root: null, // utilise la fenêtre du navigateur
        rootMargin: '0px',
        threshold: 0.1 // déclenche quand 10% de l'élément est visible
    };

    // Callback pour l'Intersection Observer
    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Ajouter la classe 'visible' avec un délai progressif
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, 100);
                // Optionnel : arrêter d'observer cet élément une fois qu'il est visible
                // observer.unobserve(entry.target);
            }
        });
    };

    // Créer l'observer
    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observer tous les éléments avec la classe 'step'
    const stepElements = document.querySelectorAll('.step');
    stepElements.forEach(element => {
        observer.observe(element);
    });

    // Ajouter un délai progressif entre les éléments visibles simultanément
    let visibleCount = 0;
    stepElements.forEach((element, index) => {
        element.style.transitionDelay = `${index * 0.1}s`;
    });
});
