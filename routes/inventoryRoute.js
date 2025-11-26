// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities");
const invValidate = require("../utilities/inventory-validation")

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to build inventory detail view
router.get("/detail/:inv_id", utilities.handleErrors(invController.buildByInventoryId));

// Inventory management page (access via /inv/)
router.get(
  "/",
  utilities.handleErrors(invController.buildManagement)
)

// Deliver the add-classification view
router.get('/add-classification', invController.buildAddClassification);

// Process form submission
router.post(
  "/add-classification",
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  invController.addClassification
)

router.get("/add-inventory", utilities.handleErrors(async (req, res) => {
  let nav = await utilities.getNav();
  let classificationList = await utilities.buildClassificationList();
  res.render("inventory/add-inventory", {
    title: "Add Inventory Item",
    nav,
    classificationList,
    messages: req.flash("notice"),
    errors: null
  });
}));

router.post(
  "/add-inventory",
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  invController.addInventory
);

module.exports = router