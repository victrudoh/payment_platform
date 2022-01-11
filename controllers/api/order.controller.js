const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();
const T_Model = require("../../models/transaction.model");

module.exports = {
  getHistoryController: async (req, res, next) => {
    try {
      const user = req.user?._id;

      const orders = await T_Model.find({ user });

      return res.status(200).send({
        success: true,
        data: {
          orders,
        },
      });
    } catch (err) {
      res.status(500).send({
        success: false,
        message: err.message,
      });
    }
  },

  getReviewController: async (req, res, next) => {
    try {
      return res.status(200).send({
        success: true,
      });
    } catch (err) {
      res.status(500).send({
        success: false,
        message: err.message,
      });
    }
  },

  getSummaryController: async (req, res, next) => {
    try {
      return res.status(200).send({
        success: true,
      });
    } catch (err) {
      res.status(500).send({
        success: false,
        message: err.message,
      });
    }
  },

  postOrderController: async (req, res) => {
    try {
      const billersCode = req.body.billersCode;
      const serviceID = req.body.serviceID;
      const type = req.body.type;
      return res.status(200).send({
        success: true,
        data: {
          billersCode,
          serviceID,
          type,
        },
      });
    } catch (err) {
      res.status(500).send({
        success: false,
        message: err.message,
      });
    }
  },

  reviewOrderController: async (req, res) => {
    try {
      const amount = req.body.amount;
      const phone = req.body.phone;
      return res.status(200).send({
        success: true,
        data: {
          amount,
          phone,
        },
      });
    } catch (err) {
      res.status(500).send({
        success: false,
        message: err.message,
      });
    }
  },
};
