const utilities = require(".");
const { body, validationResult } = require("express-validator")

/* ***************
 * Classification Rules
 **************** */
const classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .isAlpha("en-US", { ignore: " " })
      .withMessage("Classification name must contain ONLY letters.")
      .isLength({ min: 3 })
      .withMessage("Classification name must be at least 3 characters long.")
  ]
}

/* ***************
 * Inventory Rules (Add Vehicle)
 **************** */
const inventoryRules = () => {
  return [
    body("inv_make")
      .trim()
      .notEmpty()
      .withMessage("Vehicle make is required."),
    body("inv_model")
      .trim()
      .notEmpty()
      .withMessage("Vehicle model is required."),
    body("inv_description")
      .trim()
      .notEmpty()
      .withMessage("Vehicle description is required."),
    body("inv_image")
      .trim()
      .notEmpty()
      .withMessage("Vehicle image path is required."),
    body("inv_thumbnail")
      .trim()
      .notEmpty()
      .withMessage("Vehicle thumbnail path is required."),
    body("inv_price")
      .trim()
      .notEmpty()
      .withMessage("Price is required.")
      .isFloat({ gt: 0 })
      .withMessage("Price must be a positive number."),
    body("inv_year")
      .trim()
      .notEmpty()
      .withMessage("Year is required.")
      .isInt({ min: 1900, max: new Date().getFullYear() })
      .withMessage("Year must be a valid number."),
    body("inv_miles")
      .trim()
      .notEmpty()
      .withMessage("Mileage is required.")
      .isInt({ min: 0 })
      .withMessage("Mileage must be a positive integer."),
    body("inv_color")
      .trim()
      .notEmpty()
      .withMessage("Color is required."),
    body("classification_id")
      .notEmpty()
      .withMessage("Classification must be selected."),
  ];
};

/* ***************
 * Check classification data
 **************** */
const checkClassificationData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await require("./index").getNav()
    return res.render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: errors.array(),
      classification_name: req.body.classification_name
    })
  }
  next()
}

/* ***************
 * Check inventory data for adding vehicle
 **************** */
const checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await require("./index").getNav();
    let classificationList = await require("./index").buildClassificationList(req.body.classification_id);
    return res.render("inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      errors: errors.array(),
      classificationList,
      ...req.body, // sticky fields
    });
  }
  next();
};

/* ***************
 * Check inventory data for updating
 * Redirects back to edit view if there are errors
 **************** */
const checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await require("./index").getNav();
    let classificationList = await require("./index").buildClassificationList(req.body.classification_id);
    return res.render("inventory/edit-inventory", { // updated view
      title: `Edit ${req.body.inv_make} ${req.body.inv_model}`, // updated title
      nav,
      errors: errors.array(),
      classificationSelect: classificationList,
      ...req.body, // sticky fields including inv_id
    });
  }
  next();
};

module.exports = {
  classificationRules,
  checkClassificationData,
  inventoryRules,
  checkInventoryData,
  checkUpdateData,
};