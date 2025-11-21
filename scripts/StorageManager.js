"use strict";

export default class StorageManager {
    /**
     * 
     * @description Функция поиска в localStorafe MenuItems
     */
    static getItems() {
        return JSON.parse(localStorage.getItem("MenuItems")) || [];
    }

    /**
     * 
     * @param {*} title - Получение названия продукта
     * @param {*} price - Получение цены продукта
     * @description Функция добавления карточки в localStorage
     */
    static addItem(title, price) {
        const allItems = StorageManager.getItems();
        const productItem = {
            title,
            price,
        }
        allItems.push(productItem);
        localStorage.setItem("MenuItems", JSON.stringify(allItems));
    }
}
