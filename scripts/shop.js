"use strict";

import MenuManager from "./MenuManager.js";
import BurgerMenu from "./BurgerMenu.js";

document.addEventListener("DOMContentLoaded", () => {
    document.querySelector(".header__burger").addEventListener("click", () => {
        new BurgerMenu(".header__burger", ".nav__list").showBurgerMenu();
    });
    new MenuManager(
        ".menu__cards",
        ".loader",
        "#menu__search-input",
        ".menu__category input[type=checkbox]",
        "#sortSelector",
        ".menu__filter"
    );
});
