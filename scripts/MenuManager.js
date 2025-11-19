"use strict";

import Card from "./Card.js";
import Paginator from "./Paginator.js";
import ProductPage from "./ProductPage.js";
import { CARDS_API_URL } from "./variables.js";

export default class MenuManager {
    /**
     *
     * @param {*} menuSelector - ".menu__cards"
     * @param {*} loaderSelector - ".loader"
     * @param {*} searchSelector - "#menu__search-input"
     * @param {*} categorySelector - ".menu__category input[type=checkbox]"
     * @param {*} sortSelector - "#selector" 
     * @param {*} priceFilterSelector - ".price-filter"
     */
    constructor(menuSelector, loaderSelector, searchSelector, categorySelector, sortSelector, priceFilterSelector) {
        this.menu = document.querySelector(menuSelector);
        this.loading = document.querySelector(loaderSelector);
        this.search = document.querySelector(searchSelector);
        this.categoryCheckboxes = document.querySelectorAll(categorySelector);
        this.sortSelector = document.querySelector(sortSelector);

        this.priceFilter = document.querySelector(priceFilterSelector);
        this.minPriceInput = document.querySelector("#minPrice");
        this.maxPriceInput = document.querySelector("#maxPrice");

        this.productPage = new ProductPage();
        this.itemsPerPage = 15;
        this.currentPage = 0;
        this.cards = [];
        this.filteredCards = [];
        this.paginator = null;

        this.url = new URL(window.location.href);
        this.apiUrl = new URL(CARDS_API_URL);

        this.init();
    }

    async init() {
        try {
            await this.updateCardsAndPagination();

            const productId = this.url.searchParams.get("product");
            const card = this.cards.find(c => c.getItemData().id == productId);
            if (card) this.openCard(card);

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

        if (!filteredData || filteredData.length === 0) {
            this.showNoResultsMessage();
            return;
        }

        this.hideNoResultsMessage();
        this.menu.innerHTML = "";
        this.cards = filteredData.map(item => {
            const card = new Card(item);
            card.addListener(() => this.openCard(card));
            this.menu.appendChild(card.element);
            return card;
        });

        this.filteredCards = [...this.cards];

        this.currentPage = 0;

        if (this.paginator?.container) {
            this.paginator.container.remove();
        }

        this.createPaginator();
        this.showPage(this.currentPage);
        this.loading.style.display = "none";
    }

    openCard(card) {
        const productData = card.getItemData();
        if (!this.url.href.includes("product")) {
            this.url.searchParams.append("product", productData.id);
        }
        history.replaceState({}, "", this.url);

        this.productPage.show(productData);
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

        this.filteredCards.slice(start, end).forEach(card => {
            card.element.style.display = "block";
        });

        this.paginator.updateButtons();
        this.togglePagination();
        this.updatePageParameter(page);
    }

    togglePagination() {
        const pagination = document.querySelector(".pagination");
        if (pagination) {
            pagination.style.display =
                this.filteredCards.length > this.itemsPerPage ? "flex" : "none";
        }
    }

    getSelectedCategories() {
        return Array.from(this.categoryCheckboxes)
            .filter(chk => chk.checked)
            .map(chk => chk.value.toLowerCase());
    }

    getPriceRange() {
        let minPrice = parseInt(this.minPriceInput.value);
        let maxPrice = parseInt(this.maxPriceInput.value);
        return { minPrice, maxPrice };
    }

    async filterSearchAndCategory() {
        const term = this.search.value.trim();
        const categories = this.getSelectedCategories();
        const { minPrice, maxPrice } = this.getPriceRange();

        this.apiUrl.searchParams.delete("category");
        this.apiUrl.searchParams.set("title", term);

        categories.forEach(cat => {
            this.apiUrl.searchParams.append("category", cat);
        });

        const res = await fetch(this.apiUrl);
        let data = await res.json();

        data = data.filter(item => {
            const price = parseInt(item.price);
            return price >= minPrice && price <= maxPrice;
        });

        const sortValue = this.sortSelector.value;
        if (sortValue === "highest") {
            data.sort((a, b) => b.price - a.price);
        } else if (sortValue === "lowest") {
            data.sort((a, b) => a.price - b.price);
        }

        this.deleteApiUrlHistory();
        return data;
    }

    updatePriceDisplay() {
        const { minPrice, maxPrice } = this.getPriceRange();

        const priceText = document.querySelector(".filter__price");
        if (priceText) {
            priceText.textContent = `From $${minPrice} to $${maxPrice}`;
        }
    }

    deleteApiUrlHistory() {
        this.apiUrl.searchParams.delete("page");
        this.apiUrl.searchParams.delete("title");
        this.apiUrl.searchParams.delete("category");
    }

    showNoResultsMessage() {
        this.loading.style.display = "none";
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
        this.sortSelector.addEventListener("change", debouncedUpdate);
        this.priceFilter.addEventListener("change", debouncedUpdate)

        this.minPriceInput.addEventListener("input", () => {
            this.updatePriceDisplay();
            if (parseInt(this.minPriceInput.value) > parseInt(this.maxPriceInput.value)) {
                this.minPriceInput.value = this.maxPriceInput.value;
                return;
            }
        });

        this.maxPriceInput.addEventListener("input", () => {
            this.updatePriceDisplay();
            if (parseInt(this.maxPriceInput.value) < parseInt(this.minPriceInput.value)) {
                this.maxPriceInput.value = this.minPriceInput.value;
                return
            }
        });

        this.updatePriceDisplay();
    }

    /**
     * @param {Function} func - функция которую нужно дебаунсить
     * @param {number} delay - задержка в миллисекундах
     */
    debounce(func, delay) {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }
}
