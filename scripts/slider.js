// SLIDER
document.addEventListener('DOMContentLoaded', () => {
    const sliderTrack = document.querySelector('.food__slider-track');
    const originalItems = Array.from(sliderTrack.children);
    
    originalItems.forEach(item => {
        const clone = item.cloneNode(true);
        sliderTrack.appendChild(clone);
    });
});

