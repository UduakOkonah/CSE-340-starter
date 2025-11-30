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
    const classificationSelect = await utilities.buildClassificationList()

    res.render("inventory/manage", {
      title: "Inventory Management",
      nav,
      classificationSelect,
      errors: null
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

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id);
    let nav = await utilities.getNav();

    // Get inventory item data
    const itemData = await invModel.getInventoryById(inv_id);

    if (!itemData || itemData.length === 0) {
      return res.status(404).render("errors/404", { title: "Vehicle Not Found" });
    }

    // Build classification select list, mark the current classification as selected
    const classificationSelect = await utilities.buildClassificationList(itemData[0].classification_id);

    const itemName = `${itemData[0].inv_make} ${itemData[0].inv_model}`;

    // Render the edit-inventory view
    res.render("./inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      errors: null,
      inv_id: itemData[0].inv_id,
      inv_make: itemData[0].inv_make,
      inv_model: itemData[0].inv_model,
      inv_year: itemData[0].inv_year,
      inv_description: itemData[0].inv_description,
      inv_image: itemData[0].inv_image,
      inv_thumbnail: itemData[0].inv_thumbnail,
      inv_price: itemData[0].inv_price,
      inv_miles: itemData[0].inv_miles,
      inv_color: itemData[0].inv_color,
      classification_id: itemData[0].classification_id
    });

  } catch (error) {
    next(error);
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
    })
  }
}

module.exports = invCont