"use strict"

export default class BurgerMenu {
    /**
     * 
     * @param {*} burgerSelector - ".header__burger"
     * @param {*} listSelector - ".header__list"
     */
    constructor(burgerSelector, listSelector) {
        this.burger = document.querySelector(burgerSelector);
        this.menu = document.querySelector(listSelector);
        this.body = document.body;
    }

    /**
     * @description Функция добавления классов для отображения корректного burger menu
     */
    showBurgerMenu() {
        this.burger.classList.toggle('active');
        this.menu.classList.toggle('active');
        this.body.classList.toggle('lock');
    }
}