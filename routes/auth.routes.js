const express = require("express");
const path = require("path");
const authController = require("../controllers/auth.controller");

const router = express.Router();

router.get("/login", authController.getLoginController);

router.post("/login", authController.postLoginController);

router.post("/logout", authController.postLogoutController);

router.get("/signup", authController.getSignupController);

router.post("/signup", authController.postSignupController);

// router.get("/profile", authController.getProfileController);

// router.post("/profile", authController.getEditProfileController);

// router.post("/edit_profile", authController.postEditProfileController);

module.exports = router;
