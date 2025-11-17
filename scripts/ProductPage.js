export default class ProductPage {
    constructor() {
        this.menuContainer = document.querySelector(".menu");
        this.originalMenuContent = this.menuContainer.innerHTML;
    }

    show(product) {
        this.menuContainer.innerHTML = `
            <div class="container">
                <div class="card__page">
                    <div class="card__page-left">
                        <img src="/images/shop-images/menu-inner/${product.img}" class="card__page-img">
                    </div>

                    <div class="card__page-right">
                        <a href="#" class="back-btn"><i class="fa-solid fa-x"></i></a>
                        <div class="card__page-info">
                            <h2 class="card__page-title">${product.title}</h2>
                            <div class="card__page-prices">
                                <h3 class="card__page-price">$${product.price}</h3>
                                ${product.oldPrice ? `<h3 class="card__page-old-price">$${product.oldPrice}</h3>` : ""}
                            </div>
                            <p class="card__page-desc"><span>Описание блюда:</span> <br> ${product.description}</p>
                            <button class="card__page-btn">Добавить в корзину</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.menuContainer.querySelector(".back-btn").addEventListener("click", () => this.hide());
    }

    hide() {
        location.reload();
    }
}
