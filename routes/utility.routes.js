const express = require("express");
const utilityController = require("../controllers/utility.controller");
const payloadContent = require("../middlewares/orderPayload");

const router = express.Router();

router.get("/details", utilityController.getDetailsController)
;

router.post("/buy", utilityController.postBuyController);

router.get("/buyChangeNumber", utilityController.buyChangeNumberController);

router.post("/pay", utilityController.postPayController);

router.get("/verify", utilityController.getVerifyController);

// router.post("/summary", utilityController.postSummaryController);

module.exports = router;
