document.addEventListener("DOMContentLoaded", () => {
    //--------------------------------------------------------------
    // функция перемешивания массива
    //--------------------------------------------------------------
    function shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            ;[arr[i], arr[j]] = [arr[j], arr[i]]
        }
    }

    //--------------------------------------------------------------
    // основные переменные
    //--------------------------------------------------------------
    const menu = document.querySelector(".menu__cards")
    const itemsPerPage = 15
    let currentPage = 0
    let cards = []
    let filteredCards = []
    const loading = document.querySelector(".loader");
        
    const params = new URLSearchParams();
    params.append('isGood', true);
    params.append('cards', itemsPerPage);
    const url = new URL('http://127.0.0.1:5500/pages/shop.html');
    url.search = params.toString();
    console.log(url.href);
    
    
    //--------------------------------------------------------------
    // загрузка данных и создание карточек
    //--------------------------------------------------------------
    fetch("https://6904539d6b8dabde4963350b.mockapi.io/api/menu-items", {
        method: "GET",
        headers: { "content-type": "application/json" },
    })
        .then(res => {
            if (res.ok) {
                return res.json()
            }
        })
        .then(data => {
            shuffleArray(data)
            menu.innerHTML = ""
            cards = data.map(item => {
                const card = document.createElement("div")
                card.className = "menu__card"
                card.style.cursor = "pointer"

                card.innerHTML = `
          <div class="card__img" data-category="${item.title.toLowerCase().trim()}">
            <img src="/images/shop-images/menu-inner/${item.img}" alt="card-img">
          </div>
          <h4 class="card__title">${item.title}</h4>
          <div class="card__prices">
            <h4 class="card__price">$${item.price}</h4>
            ${item.oldPrice ? `<h4 class="card__price crossed-out">$${item.oldPrice}</h4>` : ""}
          </div>
        `

                card.addEventListener("click", () => {
                    const title = card.querySelector(".card__title").textContent
                    const price = card.querySelector(".card__price").textContent

                    const items = JSON.parse(localStorage.getItem("items")) || []
                    const prices = JSON.parse(localStorage.getItem("prices")) || []

                    items.push(title)
                    prices.push(price)

                    localStorage.setItem("items", JSON.stringify(items))
                    localStorage.setItem("prices", JSON.stringify(prices))

                    alert(`Добавлено в localStorage: ${title}`)
                })

                menu.appendChild(card)
                return card
            })

            filteredCards = cards.slice()
            createPageButtons()
            showPage(currentPage)
        })
        .catch(err => {
            loading.style.display = "none";
            const problemMessage = document.createElement("div")
            problemMessage.textContent = `Error: ${err.message}`
            Object.assign(problemMessage.style, {
                display: "flex",
                width: "900px",
                fontSize: "30px",
                fontFamily: "Helvetica",
                color: "red",
            })
            menu.appendChild(problemMessage)
        })

    //--------------------------------------------------------------
    // функция отображения карточек текущей страницы
    //--------------------------------------------------------------
    function showPage(page) {
        const start = page * itemsPerPage
        const end = start + itemsPerPage
        cards.forEach(card => (card.style.display = "none"))
        filteredCards.forEach((card, i) => {
            if (i >= start && i < end) card.style.display = "block"
        })
        updateActiveButtonStates()
        togglePagination()
    }

    //--------------------------------------------------------------
    // создание кнопок пагинации
    //--------------------------------------------------------------
    function createPageButtons() {
        const old = document.querySelector(".pagination")
        if (old) old.remove()

        const totalPages = Math.ceil(filteredCards.length / itemsPerPage)
        const container = document.createElement("div")
        container.className = "pagination"
        Object.assign(container.style, {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
        })

        const prevBtn = document.createElement("button")
        prevBtn.textContent = "<"
        prevBtn.disabled = currentPage === 0
        prevBtn.addEventListener("click", () => {
            if (currentPage > 0) showPage(--currentPage)
        })
        container.appendChild(prevBtn)

        for (let i = 0; i < totalPages; i++) {
            const btn = document.createElement("button")
            btn.textContent = i + 1
            btn.addEventListener("click", () => {
                currentPage = i
                showPage(currentPage)
            })
            container.appendChild(btn)
        }

        const nextBtn = document.createElement("button")
        nextBtn.textContent = ">"
        nextBtn.disabled = currentPage === totalPages - 1 || totalPages === 0
        nextBtn.addEventListener("click", () => {
            if (currentPage < totalPages - 1) showPage(++currentPage)
        })
        container.appendChild(nextBtn)

        menu.parentNode.appendChild(container)
    }

    //--------------------------------------------------------------
    // обновление состояний кнопок пагинации
    //--------------------------------------------------------------
    function updateActiveButtonStates() {
        const buttons = document.querySelectorAll(".pagination button")
        const totalPages = Math.ceil(filteredCards.length / itemsPerPage)
        buttons.forEach((btn, i) => {
            if (i === 0) btn.disabled = currentPage === 0
            else if (i === buttons.length - 1)
                btn.disabled = currentPage === totalPages - 1 || totalPages === 0
            else {
                const pageIndex = i - 1
                btn.classList.toggle("active", pageIndex === currentPage)
                btn.classList.toggle("disable", pageIndex !== currentPage)
            }
        })
    }

    //--------------------------------------------------------------
    // показ или скрытие пагинации
    //--------------------------------------------------------------
    function togglePagination() {
        const pagination = document.querySelector(".pagination")
        if (pagination)
            pagination.style.display = filteredCards.length > itemsPerPage ? "flex" : "none"
    }

    const search = document.getElementById("menu__search-input")

    //--------------------------------------------------------------
    // выбор категорий через чекбоксы
    //--------------------------------------------------------------
    const categoryCheckboxes = document.querySelectorAll(".menu__category input[type=checkbox]")

    function getSelectedCategories() {
        return Array.from(categoryCheckboxes)
            .filter(chk => chk.checked)
            .map(chk => chk.value.toLowerCase())
    }

    //--------------------------------------------------------------
    // показываем или убираем сообщение "no results"
    //--------------------------------------------------------------
    function showNoResultsMessage() {
        if (!document.querySelector(".no-results")) {
            const msg = document.createElement("h3")
            msg.className = "no-results"
            msg.textContent = "No results found"
            menu.appendChild(msg)
        }
    }
    function hideNoResultsMessage() {
        const msg = document.querySelector(".no-results")
        if (msg) msg.remove()
    }

    //--------------------------------------------------------------
    // фильтрация карточек по поиску и категориям
    //--------------------------------------------------------------
    function applyFilters() {
        const term = search.value.toLowerCase().trim()
        const categories = getSelectedCategories()

        filteredCards = cards.filter(card => {
            const title = card.querySelector(".card__title").textContent.toLowerCase()
            const category = card
                .querySelector(".card__img")
                .getAttribute("data-category")
                .toLowerCase()
            const matchTerm = title.includes(term)
            const matchCat = categories.length === 0 || categories.includes(category)
            return matchTerm && matchCat
        })

        hideNoResultsMessage()
        cards.forEach(card => (card.style.display = "none"))

        if (!filteredCards.length) {
            showNoResultsMessage()
            togglePagination()
            return
        }

        currentPage = 0
        createPageButtons()
        showPage(currentPage)
    }

    //--------------------------------------------------------------
    // события для поиска и фильтров
    //--------------------------------------------------------------
    search.addEventListener("input", applyFilters)
    categoryCheckboxes.forEach(chk => chk.addEventListener("change", applyFilters))
})
