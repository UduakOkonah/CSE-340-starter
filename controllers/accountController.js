const utilities = require("../utilities")
const bcrypt = require("bcryptjs")
const accountModel = require("../models/account-model");

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();

  // Normalize flash messages
  let messages = req.flash("notice")
  if (!Array.isArray(messages)) {
    messages = []
  }

  res.render("account/login", {
    title: "Login",
    nav,
    messages, 
    errors: [],
    account_email: ""  
  });
}

/* ****************************************
*  LOGIN ACCOUNT CONTROLLER
* *************************************** */
async function loginAccount(req, res) {
  let nav = await utilities.getNav()
  const errors = validationResult(req)

  // If validation failed
  if (!errors.isEmpty()) {
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      messages: req.flash("notice"),
      errors: errors.array(),
      account_email: req.body.account_email   // sticky
    })
  }

  const { account_email, account_password } = req.body

  // Check if account exists
  const account = await accountModel.getAccountByEmail(account_email)

  if (!account) {
    req.flash("notice", "No account found with that email.")
    return res.redirect("/account/login")
  }

  // Compare passwords
  const match = await bcrypt.compare(account_password, account.account_password)

  if (!match) {
    req.flash("notice", "Incorrect password.")
    return res.redirect("/account/login")
  }

  // Store session
  req.session.account = {
    account_id: account.account_id,
    account_firstname: account.account_firstname,
    account_lastname: account.account_lastname,
    account_email: account.account_email
  }

  req.flash("notice", `Welcome back ${account.account_firstname}`)
  res.redirect("/")
}


/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res) {
  let nav = await utilities.getNav()
  
  // Normalize flash messages
  let messages = req.flash("notice")
  if (!Array.isArray(messages)) {
    messages = []
  }

  res.render("account/register", {
    title: "Register",
    nav,
    messages,
    errors: null,
  })
}

/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()

  // Extract form values first
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password
  } = req.body

  // Hash the password
  let hashedPassword
  try {
    hashedPassword = await bcrypt.hash(account_password, 10)
  } catch (error) {
    req.flash("notice", "Sorry, there was an error processing the registration.")
    return res.status(500).render("account/register", {
      title: "Register",
      nav,
      messages: req.flash("notice"),
      errors: null
    })
  }

  // Register in the database
  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  // SUCCESS
  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you're registered ${account_firstname}. Please log in.`
    )
    return res.redirect("/account/login")   // <-- FIXED
  }

  // FAILURE
  req.flash("notice", "Sorry, the registration failed.")
  return res.status(501).render("account/register", {
    title: "Register",
    nav,
    messages: req.flash("notice"),
    errors: null
  })
}



module.exports = { buildLogin, loginAccount, buildRegister, registerAccount }
