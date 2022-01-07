const express = require("express");
const path = require("path");
const adminController = require("../controllers/admin.controller");
const isAuthenticated = require("../middlewares/isAuthenticated");
const {authorize} = require("../middlewares/roleCheck");
// const upload = require("../Middlewares/multer");
// const uploadExcel = require("../Middlewares/uploadExcel");


const router = express.Router();


router.get("/dashboard", authorize('admin'), adminController.getDashboardController);

router.get("/pendingTransactions", authorize('admin'), adminController.getPendingTransactionsController);

router.get("/completedTranscations", authorize('admin'), adminController.getCompletedTranscationsController);

// router.get("/ordersPayment", authorize('admin'), adminController.getOrdersPaymentController);

router.post("/orders", authorize('admin'), adminController.getPendingTransactionsController);

router.get("/users", authorize("admin"), adminController.getUsersController);

router.get("/edit_user/:id", authorize("admin"), adminController.postEditUserController);

router.post("/update_user", authorize("admin"), adminController.postUpdateUserController);

router.get("/view_transactions/:id", authorize("admin"), adminController.getUserTransactionsController);

router.get("/view_pending_transactions/:id", authorize("admin"), adminController.getUserPendingTransactionsController);

router.post("/verify_transaction", authorize("admin"), adminController.postVerifyUserTransaction);

router.get("/complaints", authorize("admin"), adminController.getComplaintsController);

router.get("/out_of_stock", authorize("admin"), adminController.getDisabledProductsController);

module.exports = router;
