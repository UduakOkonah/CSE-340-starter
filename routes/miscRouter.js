const express = require("express");
const router = new express.Router();

router.get("/cause-error", (req, res, next) => {
  // intentionally cause an error
  try {
    throw new Error("Intentional 500 error for testing");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
