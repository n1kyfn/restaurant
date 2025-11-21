"use strict";

export default class Paginator {
    constructor(totalItems, itemsPerPage, onPageChange) {
        this.totalItems = totalItems;
        this.itemsPerPage = itemsPerPage;
        this.onPageChange = onPageChange;
        this.currentPage = 0;
        this.container = document.querySelector(".pagination");
    }

    /**
     * @description Функция отрисовки кнопок пагинации
     */
    createButtons() {
        if (this.container) this.container.remove();

        const totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        this.container = document.createElement("div");
        this.container.className = "pagination";
        Object.assign(this.container.style, {
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
        });

        const prevBtn = document.createElement("button");
        prevBtn.textContent = "<";
        prevBtn.disabled = this.currentPage === 0;
        prevBtn.addEventListener("click", () => {
            if (this.currentPage > 0) {
                this.changePage(this.currentPage - 1);
            }
        });
        this.container.appendChild(prevBtn);

        for (let i = 0; i < totalPages; i++) {
            const btn = document.createElement("button");
            btn.textContent = i + 1;
            btn.addEventListener("click", () => this.changePage(i));
            this.container.appendChild(btn);
        }

        const nextBtn = document.createElement("button");
        nextBtn.textContent = ">";
        nextBtn.disabled = this.currentPage >= totalPages - 1 || totalPages === 0;
        nextBtn.addEventListener("click", () => {
            if (this.currentPage < totalPages - 1) {
                this.changePage(this.currentPage + 1);
            }
        });
        this.container.appendChild(nextBtn);

        return this.container;
    }

    /**
     * @description Функция для изменения страницы меню
     */
    changePage(page) {
        this.currentPage = page;
        if (this.onPageChange) this.onPageChange(page); 
        this.updateButtons();
    }

    /**
     * @description Функция для установления активной и не активной кнопки
     */
    updateButtons() {
        const buttons = this.container.querySelectorAll("button");
        const totalPages = Math.ceil(this.totalItems / this.itemsPerPage);

        buttons.forEach((btn, i) => {
            if (i === 0) btn.disabled = this.currentPage === 0;
            else if (i === buttons.length - 1)
                btn.disabled = this.currentPage === totalPages - 1 || totalPages === 0;
            else {
                const pageIndex = i - 1;
                btn.classList.toggle("active", pageIndex === this.currentPage);
                btn.classList.toggle("disable", pageIndex !== this.currentPage);
            }
        });
    }
}
