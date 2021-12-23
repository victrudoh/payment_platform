const express = require("express");
const orderController = require("../controllers/order.controller");

const router = express.Router();


router.get("/order", orderController.getOrderController);

router.post("/order", orderController.postOrderController);

router.get("/review", orderController.getReviewController);

router.post("/review", orderController.reviewOrderController);

router.get("/summary", orderController.getSummaryController);

module.exports = router;
