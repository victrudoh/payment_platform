const express = require("express");
const path = require("path");
const passport = require("passport");
require("../middlewares/passport");

const adminController = require("../controllers/api/admin.controller");
const utilityController = require("../controllers/api/utility.controller");
const userController = require("../controllers/api/user.controller");
const orderController = require("../controllers/api/order.controller");
const authController = require("../controllers/api/auth.controller");
const isAuthenticated = require("../middlewares/isAuthenticated");
const {authorize} = require("../middlewares/roleCheck");


const router = express.Router();


// ADMIN APIs
router.get("/dashboard", authorize('admin'), adminController.getDashboardController);

router.get("/pendingTransactions", authorize('admin'), adminController.getPendingTransactionsController);

router.get("/completedTranscations", authorize('admin'), adminController.getCompletedTranscationsController);

router.post("/orders", authorize('admin'), adminController.getPendingTransactionsController);

router.get("/users", authorize("admin"), adminController.getUsersController);

router.get("/edit_user/:id", authorize("admin"), adminController.postEditUserController);

router.post("/update_user", authorize("admin"), adminController.postUpdateUserController);

router.get("/view_transactions/:id", authorize("admin"), adminController.getUserTransactionsController);

router.get("/view_pending_transactions/:id", authorize("admin"), adminController.getUserPendingTransactionsController);

router.post("/verify_transaction", authorize("admin"), adminController.postVerifyUserTransaction);

router.get("/complaints", authorize("admin"), adminController.getComplaintsController);

router.get("/out_of_stock", authorize("admin"), adminController.getDisabledProductsController);


// UTILITY APIs
router.get("/details", utilityController.getDetailsController);

router.post("/buy", utilityController.postBuyController);

router.get("/buyChangeNumber", utilityController.buyChangeNumberController);

router.post("/pay", utilityController.postPayController);

router.get("/verify", utilityController.getVerifyController);


// USER APIs
router.get("/", userController.getIndexController);

router.get("/faq", userController.getFaqController);

router.get("/contactUs", isAuthenticated, authorize('user'), userController.getContactUsController);

router.post("/contactUs", userController.postContactUsController);


// ORDER APIs
router.get("/history", orderController.getHistoryController);

router.post("/order", orderController.postOrderController);

router.get("/review", orderController.getReviewController);

router.post("/review", orderController.reviewOrderController);

router.get("/summary", orderController.getSummaryController);

// AUTH APIs
router.get("/login", authController.getLoginController);

router.post("/login", authController.postLoginController);

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


module.exports = router;
