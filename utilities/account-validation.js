const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}
const accountModel = require("../models/account-model")


/*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */
  validate.registationRules = () => {
    return [
      // firstname is required and must be string
      body("account_firstname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a first name."), // on error this message is sent.
  
      // lastname is required and must be string
      body("account_lastname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 2 })
        .withMessage("Please provide a last name."), // on error this message is sent.
  
    // valid email is required and cannot already exist in the database
    body("account_email")
        .trim()
        .isEmail()
        .normalizeEmail() // refer to validator.js docs
        .withMessage("A valid email is required.")
        .custom(async (account_email) => {
            const emailExists = await accountModel.checkExistingEmail(account_email)
            if (emailExists){
            throw new Error("Email exists. Please log in or use different email")
            }
        }),
        
      // password is required and must be strong password
      body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ]
  }

/* ******************************
 * Check data and return errors or continue
 ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body

  let errors = validationResult(req)

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    return res.render("account/register", {
      title: "Registration",
      nav,
      errors,
      messages: [],
      account_firstname,
      account_lastname,
      account_email,
    })
  }

  next()
}

/* ******* LOGIN VALIDATION RULES ******* */
validate.loginRules = () => {
  return [
    body("account_email")
      .trim()
      .isEmail()
      .withMessage("Please provide a valid email address.")
      .normalizeEmail(),

    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password is required.")
  ]
}

/* ****** CHECK LOGIN DATA ****** */
validate.checkLoginData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    return res.render("account/login", {
      errors: errors.array(),
      title: "Login",
      nav,
      messages: req.flash("notice"),
      account_email: req.body.account_email
    })
  }
  next()
}


/* ******************************
 * Account Update Validation Rules
 ***************************** */
validate.updateAccountRules = () => {
  return [
    body("account_firstname")
      .trim()
      .notEmpty()
      .withMessage("First name is required."),

    body("account_lastname")
      .trim()
      .notEmpty()
      .withMessage("Last name is required."),

    body("account_email")
      .trim()
      .isEmail()
      .withMessage("Valid email is required.")
      .normalizeEmail()
      .custom(async (account_email, { req }) => {
        const accountId = req.body.account_id;
        const emailExists = await accountModel.checkExistingEmail(account_email);
        if (emailExists && emailExists.account_id != accountId) {
          throw new Error("Email already in use by another account.");
        }
      }),
  ];
};

/* ******************************
 * Check Account Update Data
 ***************************** */
validate.checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    return res.render("account/account-edit", {
      title: "Edit Account Information",
      nav,
      errors: errors.array(),
      messages: [],
      account: req.body,
    });
  }
  next();
};

/* ******************************
 * Password Validation Rules
 ***************************** */
validate.passwordRules = () => {
  return [
    body("new_password")
      .trim()
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{12,}$/)
      .withMessage(
        "Password must be at least 12 characters and include 1 number, 1 capital letter, and 1 special character."
      ),
  ];
};

/* ******************************
 * Check Password Data
 ***************************** */
validate.checkPasswordData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    return res.render("account/account-edit", {
      title: "Edit Account Information",
      nav,
      errors: errors.array(),
      messages: [],
      account: req.body,
    });
  }
  next();
};

module.exports = validate
