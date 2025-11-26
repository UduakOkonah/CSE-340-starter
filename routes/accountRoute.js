const regValidate = require('../utilities/account-validation')

// Needed resources
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities")
const accountController = require("../controllers/accountController")
const { handleErrors } = require("../utilities")

// Deliver Login View
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Deliver Register View
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Process the registration data
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.loginAccount)
)
module.exports = router
