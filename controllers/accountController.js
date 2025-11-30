const utilities = require("../utilities")
const bcrypt = require("bcryptjs")
const accountModel = require("../models/account-model");
const { validationResult } = require("express-validator")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const accountController = require("../controllers/accountController")


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
    account_firstname: "",
    account_lastname: "",
    account_email: ""
  })
}

/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav();

  // Extract form values first
  const { account_firstname, account_lastname, account_email, account_password } = req.body;

  // Check for validation errors
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return res.status(400).render("account/register", {
      title: "Register",
      nav,
      messages: req.flash("notice"),
      errors: validationErrors.array(), 
      account_firstname,
      account_lastname,
      account_email
    });
  }

  // Hash the password
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(account_password, 10);
  } catch (error) {
    req.flash("notice", "Sorry, there was an error processing the registration.");
    return res.status(500).render("account/register", {
      title: "Register",
      nav,
      messages: req.flash("notice"),
      errors: null,
      account_firstname,
      account_lastname,
      account_email
    });
  }

  // Register in the database
  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );

  // SUCCESS
  if (regResult) {
    req.flash("notice", `Congratulations, you're registered ${account_firstname}. Please log in.`);
    return res.redirect("/account/login");
  }

  // FAILURE
  req.flash("notice", "Sorry, the registration failed.");
  return res.status(501).render("account/register", {
    title: "Register",
    nav,
    messages: req.flash("notice"),
    errors: null,
    account_firstname,
    account_lastname,
    account_email
  });
}


/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })
      const cookieOptions = { httpOnly: true, maxAge: 3600 * 1000 }
      if (process.env.NODE_ENV !== "development") cookieOptions.secure = true
      res.cookie("jwt", accessToken, cookieOptions)
      return res.redirect("/account/")
    } else {
      req.flash("notice", "Please check your credentials and try again.")
      return res.status(400).render("account/login", { title: "Login", nav, errors: null, account_email })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

async function buildAccount(req, res) {
  let nav = await utilities.getNav()

  res.render("account/account", {
    title: "Account Management",
    nav,
    messages: req.flash("notice"),
    errors: null
  })
}

/* ****************************************
 *  Build Edit Account View
 * *************************************** */
async function buildEditAccount(req, res) {
  let nav = await utilities.getNav()
  const account = res.locals.accountData

  res.render("account/edit-account", {
    title: "Edit Account",
    nav,
    messages: req.flash("notice"),
    errors: null,
    account
  })
}


/* ****************************************
 *  Update Account Information (JWT version)
 * *************************************** */
async function updateAccount(req, res) {
  let nav = await utilities.getNav()

  const { account_firstname, account_lastname, account_email } = req.body
  const account_id = res.locals.accountData.account_id // from JWT

  const updateResult = await accountModel.updateAccount(
    account_id,
    account_firstname,
    account_lastname,
    account_email
  )

  if (updateResult) {
    req.flash("notice", "Account information updated successfully.")

    // Create a new JWT with updated info
    const updatedAccountData = {
      account_id,
      account_firstname,
      account_lastname,
      account_email,
      account_type: res.locals.accountData.account_type
    }
    const accessToken = jwt.sign(updatedAccountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })
    const cookieOptions = { httpOnly: true, maxAge: 3600 * 1000 }
    if (process.env.NODE_ENV !== "development") cookieOptions.secure = true
    res.cookie("jwt", accessToken, cookieOptions)

    return res.redirect("/account/")
  }

  req.flash("notice", "Update failed.")
  return res.render("account/edit-account", {
    title: "Edit Account",
    nav,
    messages: req.flash("notice"),
    errors: null,
    account: res.locals.accountData
  })
}


module.exports = {
  buildLogin,
  buildRegister, registerAccount,
  accountLogin, buildAccount,
  buildEditAccount, updateAccount  
}

