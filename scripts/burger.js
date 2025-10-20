// burger
document.addEventListener("DOMContentLoaded", () => {
    const burger = document.querySelector('.header__burger');
    const menu = document.querySelector('.header__list');
    const body = document.body;
    
    burger.addEventListener('click', () => {
        burger.classList.toggle('active');
        menu.classList.toggle('active');
        body.classList.toggle('lock');
    });
})