//  PAGINATION AND SEARCH / LOCALSTORAGE
document.addEventListener("DOMContentLoaded", () => {
    // размешиваем
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    const menu = document.querySelector(".menu__cards");
    const itemsPerPage = 15; // по дефолту 15 карточек на странице
    let currentPage = 0;
    let cards = [];
    let filteredCards = [];

    // создаем карточки товаров
    fetch("/assets/data/menu.json")
        .then(response => response.json())
        .then(data => {
            shuffleArray(data);
            menu.innerHTML = "";
            cards = data.map(item => {
                const card = document.createElement("div");
                card.className = "menu__card";
                card.innerHTML = `
                    <div class="card__img" data-category="${item.title.toLowerCase().trim()}">
                        <img src="/images/shop-images/menu-inner/${item.img}" alt="card-img">
                    </div>
                    <h4 class="card__title" id="card__title">${item.title}</h4>
                    <div class="card__prices">
                        <h4 class="card__price">$${item.price}</h4>
                        ${item.oldPrice ? `<h4 class="card__price crossed-out">$${item.oldPrice}</h4>` : ""}
                    </div>
                `;

                card.addEventListener("click", () => {
                    const item = {
                        title: card.querySelector(".card__title").textContent,
                        price: card.querySelector(".card__price").textContent
                    };

                    let items = JSON.parse(localStorage.getItem("items")) || [];
                    let prices = JSON.parse(localStorage.getItem("prices")) || [];
                        
                    items.push(item.title);
                    prices.push(item.price);

                    localStorage.setItem("items", JSON.stringify(items));
                    localStorage.setItem("prices", JSON.stringify(prices));

                    alert(`Добавлено в localStorage: ${item.title}`);
                });

                // добавляем их в меню
                menu.appendChild(card);
                return card;
            });
        filteredCards = cards.slice();
        createPageButtons();
        // показываем текущую страничку
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

        // стили для кнопок пагинации
        paginationContainer.style.display = "flex";
        paginationContainer.style.alignItems = "center";
        paginationContainer.style.justifyContent = "center";
        paginationContainer.style.gap = "8px";

        // генерируем кнопки для предыдущей и следующей странички 
        const prevButton = document.createElement("button");
        prevButton.textContent = "<";
        prevButton.disabled = currentPage === 0;
        prevButton.addEventListener("click", () => {
            if (currentPage > 0) {
                showPage(currentPage--);
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
        nextButton.textContent = ">";
        nextButton.disabled = currentPage === totalPages - 1 || totalPages === 0;
        nextButton.addEventListener("click", () => {
            if (currentPage < totalPages - 1) {
                showPage(currentPage++);
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
                button.disabled = currentPage === totalPages - 1 || totalPages === 0;
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
            } else {
                pagination.style.display = "none";
            }
        }
    }

    const search = document.getElementById("menu__search-input");
    const btn = document.querySelector(".menu__search-btn");
    const categoryCheckboxes = document.querySelectorAll(".menu__category input[type=checkbox]");

    function getSelectedCategories() {
        return Array.from(categoryCheckboxes)
            .filter(chk => chk.checked)
            .map(chk => chk.value.toLowerCase());
    }

    // показываем или убираем "No results found"
    function showNoResultsMessage() {
        let msg = document.querySelector(".no-results");
        if (!msg) {
            msg = document.createElement("h3");
            msg.className = "no-results";
            msg.textContent = "No results found";

            // msg.style.display = "flex";
            // msg.style.justifyContent = "center";
            // msg.style.alignItems = "center";

            menu.appendChild(msg);
        }
    }
    function hideNoResultsMessage() {
        let msg = document.querySelector(".no-results");
        if (msg) msg.remove();
    }

    // фильтр по категории
    function applyFilters() {
        const searchTerm = search.value.toLowerCase().trim();
        const selectedCategories = getSelectedCategories();
        filteredCards = cards.filter(card => {
            const title = card.querySelector(".card__title").textContent.toLowerCase();
            const category = card.querySelector(".card__img").getAttribute("data-category").toLowerCase();
            const matchesSearch = title.includes(searchTerm);
            const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(category);
            return matchesSearch && matchesCategory;
        });

        hideNoResultsMessage();

        cards.forEach(card => card.style.display = "none");

        if (filteredCards.length === 0) {
            showNoResultsMessage();
            togglePagination();
            return;
        }
        currentPage = 0;
        createPageButtons();
        showPage(currentPage);
    }

    btn.addEventListener("click", e => {
        e.preventDefault();
        applyFilters();
    });

    search.addEventListener("input", applyFilters);
    categoryCheckboxes.forEach(chk => {
        chk.addEventListener("change", applyFilters);
    });

});
