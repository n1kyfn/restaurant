"use strict"

import { REVIEWS_API_URL } from "./variables.js";

export default class ReviewApi {
    static async getAllReviews() {
        try {
            const res = await fetch(REVIEWS_API_URL);

            if (!res.ok) {
                throw new Error("Failed to get data!");
            }

            const data = await res.json();
            return data;
        }
        catch (err) {
            console.error("Error:", err);
        }
    }

    static async createNewReview(review) {
        try {
            const res = await fetch(REVIEWS_API_URL, {
                method: "POST",
                headers: {
                    "Content-type": "application/json",
                },
                body: JSON.stringify(review),
            })
            if (!res.ok) {
                throw new Error("Failed to post data!");
            }
            const data = await res.json();
            return data;
        }
        catch (err) {
            console.error("Error:", err);
        }
    }

    static async deleteReview(id) {
        try {
            const res = await fetch(`${REVIEWS_API_URL}/${id}`, {method: "DELETE"})

            if (!res.ok) {
                throw new Error("Failed to post data!");
            }
            const data = await res.json();
            return data;
        }
        catch (err) {
            console.error("Error:", err);
        }
    }
}