const getSelectedCategories = () => {
    const checkboxes = document.querySelectorAll(".menu__category input[type=checkbox]");
    return Array.from(checkboxes)
        .filter(chk => chk.checked)
        .map(chk => chk.value);
}

const filterCards = (cards, selectedCategories) => {
    if (selectedCategories.length === 0) return cards; // если ничего не выбрано — возвращаем все
    return cards.filter(card => selectedCategories.includes(card.category));
}

const renderCards = (filteredCards, currentPage, cardsPerPage) => {
    const start = (currentPage - 1) * cardsPerPage;
    const end = start + cardsPerPage;
    const visibleCards = filteredCards.slice(start, end);

    const container = document.querySelector(".menu__cards");
    container.innerHTML = "";
    visibleCards.forEach(card => {
        const cardElement = document.createElement("div");
        cardElement.className = "menu-card";
        cardElement.textContent = card.name;
        container.appendChild(cardElement);
    })
}

const onCategoryChange = () => {
    const selectedCategories = getSelectedCategories();
    const filtered = filterCards(allCardsData, selectedCategories);
    currentPage = 1;
    renderCards(filtered, currentPage, cardsPerPage);
}

document.querySelectorAll(".menu__category input[type=checkbox]").forEach(chk => {
    chk.addEventListener("change", onCategoryChange());
})
