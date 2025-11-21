"use strict";

import StorageManager from "./StorageManager.js";
import ReviewApi from "./ReviewApi.js";

export default class ProductPage {
    constructor() {
        this.menuContainer = document.querySelector(".menu");
        this.originalMenuContent = this.menuContainer.innerHTML;
        this.currentProduct = null;
        this.starPath = "../assets/icons/star.svg";
    }

    /**
     * @description Функция отрисовки странички информации о блюде
     */
    show(product) {
        this.currentProduct = product;

        this.menuContainer.innerHTML = `
                <div class="container">
                    <div class="card__page">
                        <div class="card__page-left">
                            <img src="/images/shop-images/menu-inner/${
                                product.img
                            }" class="card__page-img">
                        </div>

                        <div class="card__page-right">
                            <a href="#" class="back-btn"><i class="fa-solid fa-x"></i></a>
                            <div class="card__page-info">
                                <h2 class="card__page-title">${product.title}</h2>
                                <div class="card__page-prices">
                                <h3 class="card__page-price">$${product.price}</h3>
                                ${
                                    product.oldPrice
                                    ? `<h3 class="card__page-old-price">$${product.oldPrice}</h3>`
                                    : ""
                                }
                                </div>
                                <p class="card__page-desc"><b>Description:</b> <br> ${
                                    product.description
                                }</p>
                                <h3 class="card__page-calories"><span>Calories:</span> ${product.calories} kcal</h3>
                                <button class="card__page-btn">Add to Cart  <i class="fa-solid fa-cart-shopping"></i></button>
                            </div>
                        </div>
                        <div class="reviews">
                            <form class="review-form">
                                <h2 class="review-form__title">Create Your Review</h2>
                                <input type="number" placeholder="Enter your rating..." id="review-rating" min="1" max="5">
                                <input type="text" placeholder="Enter your name..." id="review-name">
                                <input type="text" placeholder="Enter header..." id="review-title">
                                <textarea placeholder="Enter your review..." id="review-desc" max="1000"></textarea>
                                <button type="submit" class="review-btn">Add</button>
                            </form>
                            <h2 class="reviews__title">Reviews</h2>
                            <div class="reviews-container">
    
                            </div>
                        </div>
                        <h2>There might be more to it than that))</h2>
                    </div>
                </div>
            `;

        window.scrollTo({
            top: 400,
            behavior: "smooth",
        });

        this.menuContainer.querySelector(".back-btn").addEventListener("click", () => this.hide());
        this.menuContainer.querySelector(".card__page-btn").addEventListener("click", () => {
            this.addToCart(product);
        });
        this.menuContainer
            .querySelector(".review-form")
            .addEventListener("submit", e => this.createReview(e));

        this.loadReviews();
    }

    /**
     * @description Асинхронная функция добавления всех отзывов
     */
    async loadReviews() {
        try {
            const reviews = await ReviewApi.getAllReviews();
            const productReviews = reviews.filter(
                review =>
                    review.productId === this.currentProduct.id ||
                    review.productTitle === this.currentProduct.title
            );
            this.renderReviews(productReviews);
        } catch (error) {
            console.error("Ошибка при загрузке отзывов:", error);
        }
    }

    /**
     * @description Асинхронная функция создания отзыва
     */
    async createReview(event) {
        event.preventDefault();

        try {
            const reviewRating = document.querySelector("#review-rating");
            const reviewName = document.querySelector("#review-name");
            const reviewTitle = document.querySelector("#review-title");
            const reviewDesc = document.querySelector("#review-desc");

            if (!reviewTitle.value.trim() || !reviewDesc.value.trim() || !reviewRating.value) {
                alert("Пожалуйста, заполните все поля!");
                return;
            }

            const newReview = {
                name: reviewName.value,
                title: reviewTitle.value,
                desc: reviewDesc.value,
                rating: parseInt(reviewRating.value),
                productId: this.currentProduct.id,
                productTitle: this.currentProduct.title,
            };

            const createdReview = await ReviewApi.createNewReview(newReview);
            console.log("Отзыв создан:", createdReview);

            reviewRating.value = "";
            reviewName.value = "";
            reviewTitle.value = "";
            reviewDesc.value = "";

            await this.loadReviews();
            this.showMessage("Отзыв успешно добавлен!");
        } catch (error) {
            console.error("Ошибка при создании отзыва:", error);
            this.showMessage("Не удалось добавить отзыв");
        }
    }
    
    /**
     * @description Асинхронная функция удаления отзыва
     */
    async deleteReview(id) {
        if (!confirm("Вы точно хотите удалить этот отзыв?")) return;
        try {
            await ReviewApi.deleteReview(id);
            await this.loadReviews();
        } catch (err) {
            console.error("Ошибка при удалении отзыва: ", err);
        }
    }
    
    /**
     * @description Функция отрисовки отзывов
     */
    renderReviews(reviews) {
        const reviewsContainer = document.querySelector(".reviews-container");

        if (!reviewsContainer) return;

        if (!reviews || reviews.length === 0) {
            reviewsContainer.innerHTML = `
            <h2 class="reviews-container__empty">There are no reviews for this product yet!</h2>
        `;
            return;
        }

        reviewsContainer.innerHTML = reviews
            .map(
                review => `
        <div class="review">
            <div class="review__header">
                <h5 class="review__name">${review.name}</h5>
                <div class="review__rating">${this.createStarRating(review.rating)}</div>
            </div>
            <h4 class="review__title"><b>Title:</b> ${review.title}</h4>
            <p class="review__desc"><b>Review:</b> ${review.desc}</p>
            <button onclick="productPage.deleteReview('${
                review.id
            }')" class="review__btn">Удалить</button>
        </div>
    `
            )
            .join("");
    }

    /**
     * @description Функция добавления звезд по рейтингу
     */
    createStarRating(rating) {
        let starsHtml = "";

        for (let i = 0; i < 5; i++) {
            if (i < rating) {
                starsHtml += `<img src="${this.starPath}" class="star-icon" alt="star" width="20" height="20">`;
            }
        }

        return `<div class="star-rating">${starsHtml}</div>`;
    }

    /**
     * @description Функция показа сообщения
     */
    showMessage(message) {
        alert(message);
    }

    /**
     * @description Функция скрытия этой страницы
     */
    hide() {
        const url = new URL(window.location.href);
        url.searchParams.delete("product");
        history.replaceState({}, "", url);
        location.reload();
    }

    /**
     * @description Функция добавления в корзину
     */
    addToCart(product) {
        StorageManager.addItem(product.title, product.price);
        alert(`Продукт ${product.title} добавлен в корзину!`);
    }
}

const productPage = new ProductPage();
window.productPage = productPage;
