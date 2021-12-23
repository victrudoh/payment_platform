const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

const baseURL = process.env.VTPASS_BASE_URL;
const username = process.env.VTPASS_USERNAME;
const password = process.env.VTPASS_PASSWORD;

module.exports = {
  getOrderController: async (req, res, next) => {
    res.render("order/order", {
      pageTitle: "order",
      path: "order",
      role: req.user?.role,
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
