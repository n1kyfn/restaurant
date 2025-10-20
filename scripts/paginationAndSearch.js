// PAGINATION AND SEARCH
document.addEventListener("DOMContentLoaded", () => {
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    const menu = document.querySelector(".menu__cards");
    const itemsPerPage = 15;
    let currentPage = 0;
    let cards = [];
    let filteredCards = [];

    fetch('/assets/data/menu.json')
        .then(response => response.json())
        .then(data => {
            shuffleArray(data);
            menu.innerHTML = '';
            cards = data.map(item => {
                const card = document.createElement('div');
                card.className = "menu__card";
                card.innerHTML = `
                    <div class="card__img" data-category="${item.title.toLowerCase().trim()}">
                        <img src="/images/shop-images/menu-inner/${item.img}" alt="card-img">
                    </div>
                    <h4 class="card__title" id="card__title">${item.title}</h4>
                    <div class="card__prices">
                        <h4 class="card__price">$${item.price}</h4>
                        ${item.oldPrice ? `<h4 class="card__price crossed-out">$${item.oldPrice}</h4>` : ''}
                    </div>
                `;
                menu.appendChild(card);
                return card;
            });
            filteredCards = cards.slice();
            createPageButtons();
            showPage(currentPage);
        });

    function showPage(page) {
        const startIndex = page * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        cards.forEach(card => card.style.display = "none");

        filteredCards.forEach((card, index) => {
            if (index >= startIndex && index < endIndex) {
                card.style.display = "block";
            }
        });

        updateActiveButtonStates();
        togglePagination();
    }

    function createPageButtons() {
        const oldPagination = document.querySelector(".pagination");
        if (oldPagination) oldPagination.remove();

        const totalPages = Math.ceil(filteredCards.length / itemsPerPage);
        const paginationContainer = document.createElement("div");
        paginationContainer.classList.add("pagination");
        paginationContainer.style.display = "flex";
        paginationContainer.style.alignItems = "center";
        paginationContainer.style.justifyContent = "center";
        paginationContainer.style.gap = "8px";

        const prevButton = document.createElement("button");
        prevButton.textContent = "<<";
        prevButton.disabled = currentPage === 0;
        prevButton.addEventListener("click", () => {
            if (currentPage > 0) {
                currentPage--;
                showPage(currentPage);
            }
        });
        paginationContainer.appendChild(prevButton);

        for (let i = 0; i < totalPages; i++) {
            const pageButton = document.createElement("button");
            pageButton.textContent = i + 1;
            pageButton.addEventListener("click", () => {
                currentPage = i;
                showPage(currentPage);
            });
            paginationContainer.appendChild(pageButton);
        }

        const nextButton = document.createElement("button");
        nextButton.textContent = ">>";
        nextButton.disabled = currentPage === totalPages - 1 || totalPages === 0;
        nextButton.addEventListener("click", () => {
            if (currentPage < totalPages - 1) {
                currentPage++;
                showPage(currentPage);
            }
        });
        paginationContainer.appendChild(nextButton);

        menu.parentNode.insertBefore(paginationContainer, menu.nextSibling);
    }

    function updateActiveButtonStates() {
        const pageButtons = document.querySelectorAll(".pagination button");
        const totalPages = Math.ceil(filteredCards.length / itemsPerPage);

        pageButtons.forEach((button, index) => {
            if (index === 0) {
                button.disabled = currentPage === 0;
            } else if (index === pageButtons.length - 1) {
                button.disabled = currentPage === totalPages -1 || totalPages === 0;
            } else {
                const pageIndex = index - 1;
                button.classList.toggle("active", pageIndex === currentPage);
                button.classList.toggle("disable", pageIndex !== currentPage);
            }
        });
    }


    function togglePagination() {
        const pagination = document.querySelector(".pagination");
        if (pagination) {
            if (filteredCards.length > itemsPerPage) {
                pagination.style.display = "flex";
                pagination.style.alignItems = "center"
                pagination.style.justifyContent = "center";
            }
            else {
                pagination.style.display = "none";
            }
        }
    }

    // --------------SEARCH---------------
    const search = document.getElementById("menu__search-input");
    const menuInner = document.querySelector(".menu__inner"); 
    const btn = document.querySelector(".menu__search-btn");

    search.addEventListener("input", () => {
        btn.addEventListener("click", () => {

            const filteredSearch = search.value.toLowerCase().trim();
    
            filteredCards = cards.filter(card => {
                const title = card.querySelector(".card__title").textContent.toLowerCase();
                return title.includes(filteredSearch);
            });
            if (filteredCards.length === 0) {
                menuInner.innerHTML = `<h3 class="no-results">No results found</h3>`;
                return;
            }
            currentPage = 0;
            createPageButtons();
            showPage(currentPage);
        })
    });
});
