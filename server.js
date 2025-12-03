/* ******************************************
* This server.js file is the primary file of the
* application. It is used to control the project.
*******************************************/
/* ***********************
* Require Statements
*************************/
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const env = require("dotenv").config();
const app = express();
const static = require("./routes/static");
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const miscRouter = require("./routes/miscRouter");
const utilities = require("./utilities/")
const session = require("express-session")
const flash = require("connect-flash")
const pool = require('./database/')
const accountRoute = require("./routes/accountRoute")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const jwt = require('jsonwebtoken');
const favoritesRoute = require("./routes/favoritesRoute");

/* ***********************
 * Middleware
 * ************************/
 app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
  cookie: { maxAge: 1000 * 60 * 60 } // 1 hour
}))

app.use(cookieParser())

// Flash middleware
app.use(flash())

app.use((req, res, next) => {
  res.locals.messages = req.flash("notice")
  next()
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(utilities.checkJWTToken)

app.use((req, res, next) => {
  const token = req.cookies.jwt; // assuming you used cookie-parser

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      res.locals.account = decoded; // account info from token
    } catch (err) {
      res.locals.account = null;
    }
  } else {
    res.locals.account = null;
  }
  next();
});


/* ***********************
* View Engine and Templates
*************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout"); // not at views root

/* ***********************
* Routes
*************************/
app.use(static);

app.use(utilities.checkJWTToken)

// Index route
app.get("/", utilities.handleErrors(baseController.buildHome));

// Inventory routes
app.use("/inv", inventoryRoute);

app.use("/", miscRouter);

// Account routes
app.use("/account", accountRoute)

// Favorites routes
app.use("/", favoritesRoute);

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({status: 404, message: 'Sorry, we appear to have lost that page.'})
})

/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  if(err.status == 404){ message = err.message} else {message = 'Oh no! There was a crash. Maybe try a different route?'}
  res.render("errors/error", {
    title: err.status || '500',
    message,
    nav
  })
})

/* ***********************
* Local Server Information
* Values from .env (environment) file
*************************/
const port = process.env.PORT;
const host = process.env.HOST;

/* ***********************
* Log statement to confirm server operation
*************************/
app.listen(port, () => {
console.log(`app listening on ${host}:${port}`);
});