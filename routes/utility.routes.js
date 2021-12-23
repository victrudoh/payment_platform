const express = require("express");
const utilityController = require("../controllers/utility.controller");
const payloadContent = require("../middlewares/orderPayload");

const router = express.Router();

router.get("/order", utilityController.getOrderController);

router.post("/order", utilityController.postOrderController);

router.get("/review", utilityController.getReviewController);

router.post("/review", utilityController.postReviewController);

// router.get("/prepaid", utilityController.getOrderController);

// router.post("/prepaid", utilityController.getPrepaidMeterPaymentController);

router.get("/postpaid", utilityController.getOrderController);

router.post("/postpaid", utilityController.getPostpaidMeterPaymentController);

module.exports = router;
