"use strict";

import MenuManager from "./MenuManager.js";

document.addEventListener("DOMContentLoaded", () => {
    new MenuManager(
        ".menu__cards",
        ".loader",
        "#menu__search-input",
        ".menu__category input[type=checkbox]"
    );
});
