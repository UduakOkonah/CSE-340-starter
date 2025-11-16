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
  const inv_id = req.params.inv_id;
  const data = await invModel.getInventoryById(inv_id);
  
  if (!data || data.length === 0) {
    return res.status(404).render("errors/404", { title: "Vehicle Not Found" });
  }

  const detail = utilities.buildVehicleDetail(data); // <-- use your function here
  const nav = await utilities.getNav();
  const title = `${data[0].inv_make} ${data[0].inv_model}`;

  res.render("inventory/detail", {
    title,
    nav,
    detail,
  });
};


module.exports = invCont