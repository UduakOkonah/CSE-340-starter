const express = require("express");
const router = express.Router();
const favoritesController = require("../controllers/favoritesController");
const utilities = require("../utilities");

// Show favorites
router.get("/favorites", utilities.checkJWTToken, favoritesController.showFavoritesView);

// Add favorite
router.post("/favorites/add", utilities.checkJWTToken, favoritesController.addFavorite);

// Remove favorite
router.post("/favorites/remove", utilities.checkJWTToken, favoritesController.removeFavorite);

module.exports = router;
