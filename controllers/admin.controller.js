// const Product = require("../models/product.model");
const Order = require("../models/transaction.model");
const User = require("../models/user.model");
const Complaint = require("../models/complaint.model");

const VTP_services = require("../services/vtpass.services");

const escapeStringRegexp = require("escape-string-regexp");

module.exports = {
  getPendingTransactionsController: async (req, res, next) => {
    const orders = await Order.find({ status: "initiated" });
    console.log("getOrdersController: ~ Orders:", orders);

    res.render("admin/orders", {
      path: "dashboard",
      pageTitle: "All Orders",
      orders: orders,
      role: req.user?.role,
    });
  },

  getCompletedTranscationsController: async (req, res, next) => {
    const orders = await Order.find({ status: "delivered" });
    console.log("getOrdersController: ~ Orders:", orders);

    res.render("admin/orders", {
      path: "dashboard",
      pageTitle: "All Orders",
      orders: orders,
      role: req.user?.role,
    });
  },

  // getOrdersPaymentController: async (req, res, next) => {
  //   const query = {};
  //   for (let value of Object.keys(req.body)) {
  //     query[value] = req.body[value];
  //   }
  //   Order.find(query)
  //     .then((orders) => {
  //       res.render("admin/orderspayment", {
  //         path: "dashboard",
  //         pageTitle: "All Orders",
  //         orders: orders,
  //         role: req.user?.role,
  //       });
  //     })
  //     .catch((err) => console.log(err, "getOrdersController"));
  // },

  toggleDisableProductController: async (req, res, next) => {
    const prodId = req.body.productId;
    console.log("this is a comment on product toggle", prodId);
    const product = await Product.findById(prodId);
    const productState = product.isDisabled;
    product.isDisabled = !productState;

    await product.save();
    res.redirect("/admin/dashboard");
  },

  getDashboardController: async (req, res) => {
    const active = req.session.user._id;
    const admin = await User.findOne({ role: "admin", _id: active });

    const user = await User.find({ role: "user" });
    const users = user.length;

    const order = await Order.find();
    const orders = order.length;

    const pending1 = await Order.find({ status: "initiated" });
    const pending = pending1.length;

    const delivered1 = await Order.find({ status: "delivered" });
    const delivered = delivered1.length;

    const complaint1 = await Complaint.find({ status: "unattended" });
    const complaint = complaint1.length;

    // const outProd = await Product.find({ isDisabled: true });
    // const outProds = outProd.length;

    res.render("admin/dashboard", {
      pageTitle: "Dashboard",
      path: "dashboard",
      role: req.user.role,
      admin: admin,
      users: users,
      orders,
      pending,
      delivered,
      complaint,
    });
  },

  getUsersController: async (req, res, next) => {
    const users = await User.find({ role: "user" });

    res.render("admin/users", {
      pageTitle: "All Users",
      path: "dashboard",
      editing: false,
      role: req.user.role,
      users,
    });
  },

  postEditUserController: async (req, res, next) => {
    const userId = req.params.id;
    const user = await User.findOne({ _id: userId });
    res.render("admin/edit_user", {
      pageTitle: "Edit User",
      path: "dashboard",
      editing: false,
      role: req.user.role,
      user,
    });
  },

  postUpdateUserController: async (req, res, next) => {
    const userId = req.body.userId;
    const updatedUsername = req.body.username;
    const updatedEmail = req.body.email;
    const updatedPassword = req.body.password;
    const updatedPhysicalAddress = req.body.physicalAddress;
    const updatedRole = req.body.role;

    const user = await User.findById(userId);

    user.username = updatedUsername;
    user.email = updatedEmail;
    user.password = updatedPassword;
    user.physicalAddress = updatedPhysicalAddress;
    user.role = updatedRole;

    await user.save();
    res.redirect("/admin/users");
  },

  getUserTransactionsController: async (req, res, next) => {
    const userId = req.params.id;
    const user = await User.findOne({ _id: userId });

    const orders = await Order.find({ user: userId });
    // console.log("getOrdersController: ~ Orders:", orders);

    res.render("admin/orders", {
      path: "dashboard",
      pageTitle: "All Orders",
      orders: orders,
      role: req.user?.role,
    });
  },

  getUserPendingTransactionsController: async (req, res, next) => {
    const userId = req.params.id;
    const user = await User.findOne({ _id: userId });

    const orders = await Order.find({ user: userId, status: "initiated" });
    // console.log("getOrdersController: ~ Orders:", orders);

    res.render("admin/orders", {
      path: "dashboard",
      pageTitle: "All Orders",
      orders: orders,
      role: req.user?.role,
    });
  },

  postVerifyUserTransaction: async (req, res, next) => {
    const request_id = req.body.request_id;
    const user_id = req.body.user_id;
    // console.log("postVerifyUserTransaction: ~ request_id", request_id);

    const payload = {
      request_id,
    };

    const verifyMeterNumber = await VTP_services.queryTransactionStatus(
      payload
    );
    console.log("verifyMeterNumber", verifyMeterNumber);

    const updatedOrder = await Order.findOne({ tx_ref: request_id });
    console.log("~ postVerifyUserTransaction: ~ updatedOrder", updatedOrder)

    updatedOrder.email = updatedOrder.email;
    updatedOrder.fullname = updatedOrder.fullname;
    updatedOrder.phone = updatedOrder.phone;
    updatedOrder.tx_ref = updatedOrder.tx_ref;
    updatedOrder.amount = updatedOrder.amount;
    updatedOrder.currency = updatedOrder.currency;
    updatedOrder.billersCode = updatedOrder.billersCode;
    updatedOrder.serviceID = updatedOrder.serviceID;
    updatedOrder.meterType = updatedOrder.meterType;
    updatedOrder.status = updatedOrder.status;
    updatedOrder.token = verifyMeterNumber.purchased_code;

    await updatedOrder.save();
    console.log("Verified transaction and saved...");

    return res.redirect("/admin/completedTranscations");


  },

  getComplaintsController: async (req, res, next) => {
    const complaints = await Complaint.find();

    res.render("admin/complaints", {
      pageTitle: "User complaints",
      path: "dashboard",
      editing: false,
      role: req.user.role,
      complaints,
    });
  },

  getDisabledProductsController: async (req, res, next) => {
    const prods = await Product.find({ isDisabled: true });
    const disabledMode = req.query.disable;
    console.log("getDisabledProductsController: ~ disabledMode", disabledMode);

    res.render("admin/adminProduct_list", {
      pageTitle: "Disabled Products",
      path: "dashboard",
      role: req.user.role,
      disable: disabledMode,
      prods,
    });
  },
};