const jwt = require("jsonwebtoken")
require("dotenv").config()

// Middleware to verify Employee or Admin access
function checkEmployeeOrAdmin(req, res, next) {
  const token = req.cookies.jwt

  if (!token) {
    req.flash("notice", "You must be logged in to access that page.")
    return res.redirect("/account/login")
  }

  try {
    // Decode JWT
    const accountData = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

    // Check the account type
    if (accountData.account_type === "Employee" || accountData.account_type === "Admin") {
      req.accountData = accountData        // Pass account data to route
      return next()
    } else {
      req.flash("notice", "You do not have permission to access this page.")
      return res.redirect("/account/login")
    }

  } catch (err) {
    req.flash("notice", "Invalid session, please log in again.")
    return res.redirect("/account/login")
  }
}

module.exports = { checkEmployeeOrAdmin }
