const express = require("express");
const userController = require("../controllers/user.controller");
// const isAuthenticated = require("../Middlewares/isAuthenticated");
// const { authorize } = require("../Middlewares/roleCheck");

const router = express.Router();

router.get("/", userController.getIndexController);

module.exports = router;
