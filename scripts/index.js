"use strict";

import MenuManager from "./MenuManager.js";
import Card from "./Card.js";

document.addEventListener("DOMContentLoaded", () => {
    new MenuManager(
        ".menu__cards",
        ".loader",
        "#menu__search-input",
        ".menu__category input[type=checkbox]"
    );

    new Card().showCardInformation()
});
