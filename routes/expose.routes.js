const express = require("express");
const path = require("path");

const passport = require("passport");
require("../middlewares/passport");

const exposeController = require("../controllers/expose.controller");

const router = express.Router();

router.get("/login", exposeController.getLoginController);

router.post("/login", exposeController.postLoginController);

router.get("/signup", exposeController.getSignupController);

router.post("/signup", exposeController.postSignupController);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/failed" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/googleLogin");
  }
);

router.get("/googleLogin", exposeController.getGoogleLoginController);

module.exports = router;
