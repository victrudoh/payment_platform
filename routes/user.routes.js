const express = require("express");
const userController = require("../controllers/user.controller");
const isAuthenticated = require("../middlewares/isAuthenticated");
const { authorize } = require("../middlewares/roleCheck");

const router = express.Router();

router.get("/", userController.getIndexController);

router.get("/faq", userController.getFaqController);

router.get("/contactUs", isAuthenticated, authorize('user'), userController.getContactUsController);

router.post("/contactUs", userController.postContactUsController);

module.exports = router;
