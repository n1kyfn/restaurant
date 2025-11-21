"use strict"

export default class Slider {

    /**
     * 
     * @param {*} sliderSelector - '.food__slider-track'
     */
    constructor(sliderSelector) {
        this.sliderTrack = document.querySelector(sliderSelector);
        this.originalItems = Array.from(this.sliderTrack.children);
        this.originalItems.forEach(item => {
            const clone = item.cloneNode(true);
            this.sliderTrack.appendChild(clone);
        });
    }
}