const express = require("express");
const path = require("path");
const adminController = require("../controllers/admin.controller");
const isAuthenticated = require("../Middlewares/isAuthenticated");
const {authorize} = require("../Middlewares/roleCheck");
// const upload = require("../Middlewares/multer");
// const uploadExcel = require("../Middlewares/uploadExcel");


const router = express.Router();

// router.get("/login", adminController.loginController);

router.get("/add_product", isAuthenticated, authorize('admin'), adminController.getAddProductController);

router.post("/add_product", isAuthenticated, authorize('admin'), adminController.postAddProductController);

router.get("/products", authorize('admin'), adminController.getProductController);

router.post("/productsSort", authorize('admin'), adminController.postSortProductsController);

router.get("/edit_product/:productId", isAuthenticated, authorize('admin'), adminController.getEditProductController);

router.post("/edit_product", isAuthenticated, authorize('admin'), adminController.postEditProductController);

router.post("/delete_product", isAuthenticated, authorize('admin'), adminController.postDeleteProductController);

router.post("/disable_product", isAuthenticated, authorize('admin'), adminController.toggleDisableProductController
);

router.get("/dashboard", authorize('admin'), adminController.getDashboardController);

router.get("/orders", authorize('admin'), adminController.getOrdersController);

router.get("/ordersPayment", authorize('admin'), adminController.getOrdersPaymentController);

router.post("/orders", authorize('admin'), adminController.getOrdersController);

router.get("/users", authorize("admin"), adminController.getUsersController);

router.get("/edit_user/:id", authorize("admin"), adminController.postEditUserController);

router.post("/update_user", authorize("admin"), adminController.postUpdateUserController);

router.get("/out_of_stock", authorize("admin"), adminController.getDisabledProductsController);

router.post("/upload", authorize("admin"), adminController.postUploadController);

router.post("/uploadExcel", authorize("admin"), adminController.postUploadExcelController);


module.exports = router;
