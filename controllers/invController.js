const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build specific vehicle detail view
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
  try {
    const inv_id = req.params.inv_id;
    const data = await invModel.getInventoryById(inv_id);

    if (!data || data.length === 0) {
      return res.status(404).render("errors/404", { 
        title: "Vehicle Not Found" 
      });
    }

    const vehicle = data[0]; // <-- get the single vehicle object
    const detail = await utilities.buildVehicleDetail(vehicle);
    const nav = await utilities.getNav();
    const title = `${vehicle.inv_make} ${vehicle.inv_model}`; // <-- fix here

    res.render("inventory/detail", {
      title,
      nav,
      detail,
    });

  } catch (error) {
    next(error);
  }
};

/* ****************************************
 * Deliver inventory management view
 * **************************************** */
invCont.buildManagement = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    // Normalize flash messages
    let messages = req.flash("notice")
    if (!Array.isArray(messages)) messages = []

    res.render("inventory/manage", {
      title: "Inventory Management",
      nav,
      messages,
    })
  } catch (error) {
    next(error)
  }
}

/* ****************************************
 * Deliver add-classification view (Task 2)
 * **************************************** */
invCont.buildAddClassification = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    let messages = req.flash("notice")
    if (!Array.isArray(messages)) messages = []

    res.render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      messages,
      errors: null,
    })
  } catch (error) {
    next(error)
  }
}

/* ****************************************
 * Process add-classification form submission
 * **************************************** */
invCont.addClassification = async function (req, res, next) {
  try {
    const { classification_name } = req.body
    const nav = await utilities.getNav()

    // Insert into DB
    const result = await invModel.addClassification(classification_name)

    if (result.rowCount > 0) {
      req.flash("notice", `${classification_name} added successfully!`)
      return res.redirect("/inv/") // redirect to management view
    } else {
      req.flash("notice", "Failed to add classification.")
      return res.render("inventory/add-classification", {
        title: "Add New Classification",
        nav,
        messages: req.flash("notice"),
        errors: null
      })
    }
  } catch (error) {
    next(error)
  }
}

/* ****************************************
 * Deliver add-inventory view
 * **************************************** */
invCont.buildAddInventory = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList(); // build dropdown
    let messages = req.flash("notice");
    if (!Array.isArray(messages)) messages = [];

    res.render("inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      messages,
      errors: null,
      classificationList,
      // pass sticky fields
      inv_make: "",
      inv_model: "",
      inv_description: "",
      inv_image: "/images/no-image.png",
      inv_thumbnail: "/images/no-image.png",
      inv_price: "",
      inv_year: "",
      inv_miles: "",
      inv_color: "",
      classification_id: "",
    });
  } catch (error) {
    next(error);
  }
};


/* ****************************************
 * Process add-inventory form submission
 * **************************************** */
invCont.addInventory = async function (req, res, next) {
  try {
    const {
      classification_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
    } = req.body;

    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList(classification_id);

    // Insert into the database
    const result = await invModel.addInventory({
      classification_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
    });

    if (result.rowCount > 0) {
      req.flash("notice", `${inv_make} ${inv_model} added successfully!`);
      return res.redirect("/inv/"); // redirect to management view
    } else {
      req.flash("notice", "Failed to add vehicle.");
      return res.render("inventory/add-inventory", {
        title: "Add Inventory Item",
        nav,
        classificationList,
        messages: req.flash("notice"),
        errors: null,
        ...req.body, // sticky form fields
      });
    }
  } catch (error) {
    next(error);
  }
};


module.exports = invCont