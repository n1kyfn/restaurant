"use strict";

import BurgerMenu from "./BurgerMenu.js";
import Slider from "./Slider.js";

document.addEventListener("DOMContentLoaded", () => {
    document.querySelector(".header__burger").addEventListener("click", () => {
        new BurgerMenu(".header__burger", ".header__list").showBurgerMenu();
    });

    new Slider('.food__slider-track');
});
