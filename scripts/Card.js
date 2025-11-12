"use strict";

export default class Card {
    constructor(item) {
        this.item = item;
        this.element = this.createCardElement();
    }

    createCardElement() {
        const card = document.createElement("div");
        card.className = "menu__card";
        card.style.cursor = "pointer";
        card.innerHTML = `
            <div class="card__img" data-category="${this.item.title.toLowerCase().trim()}">
                <img src="/images/shop-images/menu-inner/${this.item.img}" alt="card-img">
            </div>
          <h4 class="card__title">${this.item.title}</h4>
          <div class="card__prices">
            <h4 class="card__price">$${this.item.price}</h4>
            ${this.item.oldPrice ? `<h4 class="card__price crossed-out">$${this.item.oldPrice}</h4>` : ""}
          </div>
          `;
        return card;
    }

    addListener(callback) {
        this.element.addEventListener("click", () => callback(this));
    }

    getTitle() {
        return this.item.title;
    }

    getPrice() {
        return `$${this.item.price}`;
    }
}
