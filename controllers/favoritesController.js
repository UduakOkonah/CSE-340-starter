const favoritesModel = require('../models/favoritesModel');
const utilities = require("../utilities");
const favoritesController = {};

// Show Favorites View
favoritesController.showFavoritesView = async (req, res, next) => {
  try {
    let nav = await utilities.getNav(); 
    const account_id = res.locals.accountData.account_id;
    const favorites = await favoritesModel.getFavoritesByAccount(account_id);

    res.render('favorites/favorites', {
      title: "My Favorites",
      nav,
      favorites,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

// Add a favorite
favoritesController.addFavorite = async (req, res, next) => {
  try {
    const account_id = res.locals.accountData.account_id;
    const inv_id = parseInt(req.body.inv_id);

    await favoritesModel.addFavorite(account_id, inv_id);
    req.flash("notice", "Vehicle added to favorites");
    res.redirect(`/inv/detail/${inv_id}`);
  } catch (error) {
    next(error);
  }
};

// Remove a favorite
favoritesController.removeFavorite = async (req, res, next) => {
  try {
    const account_id = res.locals.accountData.account_id;
    const inv_id = parseInt(req.body.inv_id);

    await favoritesModel.removeFavorite(account_id, inv_id);
    req.flash("notice", "Vehicle removed from favorites");
    res.redirect("/favorites");
  } catch (error) {
    next(error);
  }
};

module.exports = favoritesController;
