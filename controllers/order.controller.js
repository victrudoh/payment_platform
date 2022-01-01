const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

const T_Model = require("../models/transaction.model");

module.exports = {

  getHistoryController: async (req, res, next) => {

    console.log("USer: ", req.user);
    const user = req.user._id;

    const orders = await T_Model.find({ user });

    res.render("order/history", {
      pageTitle: "Transactions history",
      path: "history",
      role: req.user?.role,
      orders,
    });
  },

  getReviewController: async (req, res, next) => {
    res.render("order/review", {
      pageTitle: "Review Order",
      path: "review",
      role: req.user?.role,
    });
  },

  getSummaryController: async (req, res, next) => {
    res.render("order/summary", {
      pageTitle: "Payment Summary",
      path: "summary",
      role: req.user?.role,
    });
  },

  postOrderController: async (req, res) => {
    const billersCode = req.body.billersCode;
    const serviceID = req.body.serviceID;
    const type = req.body.type;

    return res.redirect("/review");
  },

  reviewOrderController: async (req, res) => {
    const amount = req.body.amount;
    const phone = req.body.phone;

    return res.redirect("/summary");
  },
};
