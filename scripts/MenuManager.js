"use strict";

import Card from "./Card.js";
import Paginator from "./Paginator.js";
import ProductPage from "./ProductPage.js";
import { CARDS_API_URL } from "./variables.js";


export default class MenuManager {
    constructor(
        menuSelector,
        loaderSelector,
        searchSelector,
        categorySelector,
        sortSelector,
        priceFilterSelector
    ) {
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

    /**
     * @description Асинхронная функция-сборщик и инициализатор всего на этой страничке сайта
     */
    async init() {
        this.showLoader();
        try {
            await this.updateCardsAndPagination();

            const productId = this.url.searchParams.get("product");
            if (productId) {
                const card = this.cards.find(c => c.getItemData().id == productId);
                if (card) this.openCard(card);
            }

            this.addEventListeners();
        } catch (err) {
            this.showErrorMessage(err);
        }
    }

    /**
     * @description Функция показа загрузки
     */
    showLoader() {
        this.loading.style.display = "block";
    }

    /**
     * @description Функция скрытия загрузки
     */
    hideLoader() {
        this.loading.style.display = "none";
    }

    /**
     * @description Асинхронная функция отрисовки всех карточек и отрисовки пагинации
     */
    async updateCardsAndPagination() {
        this.showLoader();
        try {
            const data = await this.filterSearchAndCategory();

            if (!data || data.length === 0) {
                this.showNoResultsMessage();
                this.hideLoader();
                return;
            }

            this.hideNoResultsMessage();
            this.menu.innerHTML = "";

            this.cards = data.map(item => {
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

            if (this.filteredCards.length > 0) {
                this.createPaginator();
                this.showPage(this.currentPage);
            }

            this.hideLoader();
        } catch (error) {
            this.hideLoader();
            this.showNoResultsMessage();
            if (this.paginator?.container) {
                this.paginator.container.remove();
                this.paginator = null;
            }
        }
    }

    /**
     * @description Функция получения информации о продукте и при нажаьии ее открытии
     */
    openCard(card) {
        const productData = card.getItemData();
        if (!this.url.href.includes("product")) {
            this.url.searchParams.set("product", productData.id);
        }
        history.replaceState({}, "", this.url);
        this.productPage.show(productData);
    }

    /**
     * @description Функция создания пагинации, обращаясь к классу
     */
    createPaginator() {
        this.paginator = new Paginator(this.filteredCards.length, this.itemsPerPage, page =>
            this.showPage(page)
        );
        const container = this.paginator.createButtons();
        this.menu.parentElement.appendChild(container);
    }

    /**
     * @description Функция добавления параметра page в ссылке
     */
    updatePageParameter(page) {
        this.url.searchParams.set("page", page + 1);
        window.history.replaceState({}, "", this.url);
    }

    /**
     * @description Функция показа страницы, обновления кнопок и пагинации
     */
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

    /**
     * @description Функция показа/скрытия кнопок пагинации
     */
    togglePagination() {
        const pagination = document.querySelector(".pagination");
        if (pagination) {
            pagination.style.display =
                this.filteredCards.length > this.itemsPerPage ? "flex" : "none";
        }
    }

    /**
     * @description Функция получения вубранных категорий
     */
    getSelectedCategories() {
        return Array.from(this.categoryCheckboxes)
            .filter(chk => chk.checked)
            .map(chk => chk.value.toLowerCase());
    }

    /**
     * @description Функция получения минимальной и максимальной цены для фильтра
     */
    getPriceRange() {
        let minPrice = parseInt(this.minPriceInput.value);
        let maxPrice = parseInt(this.maxPriceInput.value);
        return { minPrice, maxPrice };
    }

    /**
     * @description Асинхронная функция для применения всех параметров и дальнейшего получения всех карточек, какие прошли проверку
     */
    async filterSearchAndCategory() {
        const term = this.search.value.trim();
        const categories = this.getSelectedCategories();
        const { minPrice, maxPrice } = this.getPriceRange();

        this.apiUrl.search = "";

        if (term) this.apiUrl.searchParams.set("title", term);


        if (categories.length > 0) this.apiUrl.searchParams.set("category", categories.join("|"));

        const sortValue = this.sortSelector.value;
        if (sortValue === "highest") {
            this.apiUrl.searchParams.set("sortBy", "price");
            this.apiUrl.searchParams.set("order", "desc");
        } else if (sortValue === "lowest") {
            this.apiUrl.searchParams.set("sortBy", "price");
            this.apiUrl.searchParams.set("order", "asc");
        }

        console.log(this.apiUrl.href);

        const res = await fetch(this.apiUrl);
        if (!res.ok) {
            return [];
        }
        let data = await res.json();

        data = data.filter(item => {
            const price = parseInt(item.price);
            return (
                (minPrice && minPrice ? price >= minPrice : true) &&
                (maxPrice && maxPrice ? price <= maxPrice : true)
            );
        });

        return data;
    }

    /**
     * @description Функция обновления диапазона цены в фильтре
     */
    updatePriceDisplay() {
        const { minPrice, maxPrice } = this.getPriceRange();
        const priceText = document.querySelector(".filter__price");
        if (priceText) {
            priceText.textContent = `From $${minPrice} to $${maxPrice}`;
        }
    }

    /**
     * @description Функция показа no-results при отсутствии результатов
     */
    showNoResultsMessage() {
        this.hideLoader();
        this.menu.innerHTML = "";

        const msg = document.createElement("div");
        msg.className = "no-results";
        Object.assign(msg.style, {
            textAlign: "center",
            padding: "40px",
            fontSize: "20px",
            color: "#666",
            width: "100%",
        });

        msg.innerHTML = `<h3>No results found</h3>`;

        this.menu.appendChild(msg);

        if (this.paginator?.container) {
            this.paginator.container.remove();
            this.paginator = null;
        }
    }

    /**
     * @description Функция создания элемента ошибки
     */
    createErrorElement(error) {
        const problemMessage = document.createElement("div");
        problemMessage.textContent = `Error: ${error.message}`;
        Object.assign(problemMessage.style, {
            display: "flex",
            width: "900px",
            fontSize: "30px",
            fontFamily: "Helvetica",
            color: "red",
            justifyContent: "center",
            padding: "20px",
        });
        return problemMessage;
    }

    /**
     * @description Функция показа ошибки
     */
    showErrorMessage(error) {
        this.hideLoader();
        this.menu.innerHTML = "";
        this.menu.appendChild(this.createErrorElement(error));
        if (this.paginator?.container) {
            this.paginator.container.remove();
            this.paginator = null;
        }
    }

    /**
     * @description Функция скрытия no-results при отсутствии результатов
     */
    hideNoResultsMessage() {
        const msg = document.querySelector(".no-results");
        if (msg) msg.remove();
    }

    /**
     * @description Функция добавления обработчиков событий
     */
    addEventListeners() {
        const debouncedUpdate = this.debounce(() => this.updateCardsAndPagination(), 500);

        this.search.addEventListener("input", debouncedUpdate);
        this.categoryCheckboxes.forEach(chk => chk.addEventListener("change", debouncedUpdate));
        this.sortSelector.addEventListener("change", debouncedUpdate);
        this.priceFilter.addEventListener("change", debouncedUpdate);

        this.minPriceInput.addEventListener("input", () => {
            this.updatePriceDisplay();
            if (parseInt(this.minPriceInput.value) > parseInt(this.maxPriceInput.value)) {
                this.minPriceInput.value = this.maxPriceInput.value;
                return;
            }
            debouncedUpdate();
        });

        this.maxPriceInput.addEventListener("input", () => {
            this.updatePriceDisplay();
            if (parseInt(this.maxPriceInput.value) < parseInt(this.minPriceInput.value)) {
                this.maxPriceInput.value = this.minPriceInput.value;
                return;
            }
            debouncedUpdate();
        });
    }

    /**
     * @param {Function} func - функция которую нужно дебаунсить
     * @param {number} delay - задержка в миллисекундах
     *
     * @description Функция для задержки выполнения функции
     */
    debounce(func, delay) {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func(this, args), delay);
        };
    }
}
