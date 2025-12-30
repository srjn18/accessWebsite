// Elastic Pop + Tilt Hover Animation for .vm-card
document.addEventListener('DOMContentLoaded', () => {
  const vmCards = document.querySelectorAll('.vm-card');
  
  vmCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      // Random tilt direction (-1.5deg or +1.5deg)
      const tilt = Math.random() > 0.5 ? 1.5 : -1.5;
      card.style.animation = `elasticPop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)`;
      card.style.transform = `scale(1.05) rotate(${tilt}deg)`;
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.animation = `elasticBounceBack 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)`;
      card.style.transform = `scale(1) rotate(0deg)`;
      
      // Reset animation after it completes
      setTimeout(() => {
        card.style.animation = '';
      }, 500);
    });
  });
});
