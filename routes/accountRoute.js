const regValidate = require('../utilities/account-validation')

// Needed resources
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities")
const accountController = require("../controllers/accountController")

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

// Deliver Account Management View
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccount))

// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

// Deliver Edit Account View
router.get(
  "/edit",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildEditAccount)
)

router.post(
  "/edit",
  utilities.checkLogin,
  utilities.handleErrors(accountController.updateAccount)
)


module.exports = router
