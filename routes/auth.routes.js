const express = require("express");
const path = require("path");

const passport = require("passport");
require("../middlewares/passport");

const authController = require("../controllers/auth.controller");

const router = express.Router();

router.get("/login", authController.getLoginController);

router.post("/login", authController.postLoginController);

router.post("/logout", authController.postLogoutController);

router.get("/signup", authController.getSignupController);

router.post("/signup", authController.postSignupController);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/failed' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect("/googleLogin");
  }
);

router.get("/googleLogin", authController.getGoogleLoginController);


router.get("/profile", authController.getProfileController);

router.post("/profile_update", authController.postUpdateProfileController);

// router.post("/profile", authController.getEditProfileController);

// router.post("/edit_profile", authController.postEditProfileController);

module.exports = router;
