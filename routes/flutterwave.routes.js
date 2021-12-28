const express = require("express");
const flutterwaveController = require("../controllers/flutterwave.controller");

const router = express.Router();

router.get("/order", flutterwaveController.getOrderController);

router.post("/review", flutterwaveController.postReviewController);

// router.post("/summary", flutterwaveController.postSummaryController);

module.exports = router;
