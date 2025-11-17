"use strict";

import Card from "./Card.js";
import Paginator from "./Paginator.js";
import StorageManager from "./StorageManager.js";
import ProductPage from "./ProductPage.js";

export default class MenuManager {
    /**
     *
     * @param {menuSelector} - ".menu__cards"
     * @param {loaderSelector} - ".loader"
     * @param {searchSelector} - "#menu__search-input"
     * @param {categorySelector} - ".menu__category input[type=checkbox]"
     */
    constructor(menuSelector, loaderSelector, searchSelector, categorySelector) {
        this.menu = document.querySelector(menuSelector);
        this.loading = document.querySelector(loaderSelector);
        this.search = document.querySelector(searchSelector);
        this.categoryCheckboxes = document.querySelectorAll(categorySelector);
        this.productPage = new ProductPage();
        this.itemsPerPage = 15;
        this.currentPage = 0;
        this.cards = [];
        this.filteredCards = [];
        this.paginator = undefined;

        this.url = new URL(window.location.href);
        this.apiUrl = new URL("https://6904539d6b8dabde4963350b.mockapi.io/api/menu-items");

        this.init();
    }

    async init() {
        try {
            await this.updateCardsAndPagination();
            this.addEventListeners();
        } catch (err) {
            this.loading.style.display = "none";
            const problemMessage = document.createElement("div");
            problemMessage.textContent = `Error: ${err.message}`;
            Object.assign(problemMessage.style, {
                display: "flex",
                width: "900px",
                fontSize: "30px",
                fontFamily: "Helvetica",
                color: "red",
            });
            this.menu.appendChild(problemMessage);
        }
    }

    async updateCardsAndPagination() {
        const filteredData = await this.filterSearchAndCategory();
        this.hideNoResultsMessage();
        this.menu.innerHTML = "";
        this.cards = filteredData.map(item => {
            const card = new Card(item);
            card.addListener(() => this.onCardClick(card));
            this.menu.appendChild(card.element);
            return card;
        });
            
        this.filteredCards = [...this.cards];

        this.currentPage = 0;

        if (this.paginator && this.paginator.container) {
            this.paginator.container.remove();
        }

        this.createPaginator();
        this.showPage(this.currentPage);

        this.loading.style.display = "none";
    }

    /**
     *
     * @param {card} - menu card
     */
    onCardClick(card) {
        const productData = card.getItemData();
        this.productPage.show(productData);
        StorageManager.addItem(card.getTitle(), card.getPrice());
    }

    createPaginator() {
        this.paginator = new Paginator(this.filteredCards.length, this.itemsPerPage, page =>
            this.showPage(page)
        );
        const container = this.paginator.createButtons();
        this.menu.parentElement.appendChild(container);
    }

    updatePageParameter(page) {
        this.url.searchParams.set("page", page + 1);
        window.history.replaceState({}, "", this.url);
    }

    showPage(page) {
        this.currentPage = page;
        const start = page * this.itemsPerPage;
        const end = start + this.itemsPerPage;

        this.cards.forEach(card => (card.element.style.display = "none"));
        this.filteredCards
            .slice(start, end)
            .forEach(card => (card.element.style.display = "block"));

        this.paginator.updateButtons();
        this.togglePagination();

        this.updatePageParameter(page);
    }

    togglePagination() {
        const pagination = document.querySelector(".pagination");
        if (pagination)
            pagination.style.display =
                this.filteredCards.length > this.itemsPerPage ? "flex" : "none";
    }

    getSelectedCategories() {
        return Array.from(this.categoryCheckboxes)
            .filter(chk => chk.checked)
            .map(chk => chk.value.toLowerCase());
    }

    async filterSearchAndCategory() {
        const term = this.search.value.trim();
        const categories = this.getSelectedCategories();

        this.apiUrl.searchParams.delete("category");
        this.apiUrl.searchParams.set("title", term);

        categories.forEach(category => {
            this.apiUrl.searchParams.append("category", category);
        });

        const res = await fetch(this.apiUrl);
        const data = await res.json();
        console.log("Ответ API:", data, Array.isArray(data), this.apiUrl.href);
        this.deleteApiUrlHistory();
        return data;
    }

    deleteApiUrlHistory() {
        this.apiUrl.searchParams.delete("page");
        this.apiUrl.searchParams.delete("title");
        this.apiUrl.searchParams.delete("category");
    }

    showNoResultsMessage() {
        if (!document.querySelector(".no-results")) {
            const msg = document.createElement("h3");
            msg.className = "no-results";
            msg.textContent = "No results found";
            this.menu.appendChild(msg);
        }
    }

    hideNoResultsMessage() {
        const msg = document.querySelector(".no-results");
        if (msg) msg.remove();
    }

    addEventListeners() {
        const debouncedUpdate = this.debounce(() => this.updateCardsAndPagination(), 500);
        this.search.addEventListener("input", debouncedUpdate);
        this.categoryCheckboxes.forEach(chk => chk.addEventListener("change", debouncedUpdate));
    }

    debounce(func, delay) {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func(this, args), delay);
        };
    }
}
