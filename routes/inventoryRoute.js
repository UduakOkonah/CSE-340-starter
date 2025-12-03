// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities");
const invValidate = require("../utilities/inventory-validation")
const { inventoryRules, checkUpdateData } = require("../utilities/inventory-validation");
const auth = require("../utilities/account-authorization")

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to build inventory detail view
router.get("/detail/:inv_id", utilities.handleErrors(invController.buildByInventoryId));

// Inventory management page (access via /inv/)
router.get(
  "/",
  auth.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildManagement)
)

// Deliver the add-classification view
router.get('/add-classification', auth.checkEmployeeOrAdmin, invController.buildAddClassification);

// Process form submission
router.post(
  "/add-classification",
  auth.checkEmployeeOrAdmin,
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  invController.addClassification
)

router.get("/add-inventory", auth.checkEmployeeOrAdmin, utilities.handleErrors(async (req, res) => {
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
  auth.checkEmployeeOrAdmin,
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  invController.addInventory
);

router.get(
  "/getInventory/:classification_id", 
  utilities.handleErrors(invController.getInventoryJSON)
);

/* ****************************************
 *  Edit Inventory Item
 * **************************************** */
router.get("/edit/:inv_id",  auth.checkEmployeeOrAdmin,utilities.handleErrors(invController.editInventoryView));

/* ***************************
 *  Update Inventory Data
 * ************************** */
router.post(
  "/update/",
  auth.checkEmployeeOrAdmin,
  inventoryRules(),
  checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
);

// Route to build delete confirmation view
router.get(
  "/delete/:inv_id",
  auth.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.deleteInventoryView)
);

// Route to carry out delete
router.post(
  "/delete/",
  auth.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.deleteInventory)
);

module.exports = router