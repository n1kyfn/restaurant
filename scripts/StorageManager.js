"use strict";

export default class StorageManager {
    static getItems() {
        return JSON.parse(localStorage.getItem("item")) || [];
    }

    static getPrices() {
        return JSON.parse(localStorage.getItem("prices")) || [];
    }

    /**
     * 
     * @param {title} getTitle() 
     * @param {price} getPrice()
     */
    static addItem(title, price) {
        const items = StorageManager.getItems();
        const prices = StorageManager.getPrices();

        items.push(title);
        prices.push(price);
        
        localStorage.setItem("items", JSON.stringify(items));
        localStorage.setItem("prices", JSON.stringify(prices));
    }
}
