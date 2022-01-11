// const Product = require("../models/product.model");
const Order = require("../../models/transaction.model");
const User = require("../../models/user.model");
const Complaint = require("../../models/complaint.model");
const VTP_services = require("../../services/vtpass.services");
const escapeStringRegexp = require("escape-string-regexp");

module.exports = {
  getPendingTransactionsController: async (req, res, next) => {
    try {
      const orders = await Order.find({ status: "initiated" });

      return res.status(200).send({
        success: true,
        message: "Successful",
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

  getCompletedTranscationsController: async (req, res, next) => {
    try {
      const orders = await Order.find({ status: "delivered" });

      return res.status(200).send({
        success: true,
        message: "Successful",
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

  toggleDisableProductController: async (req, res, next) => {
    try {
      const prodId = req.body.productId;
      const product = await Product.findById(prodId);
      const productState = product.isDisabled;
      product.isDisabled = !productState;

      await product.save();
      const orders = await Order.find({ status: "delivered" });

      return res.status(200).send({
        success: true,
        message: "Successful",
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

  getDashboardController: async (req, res) => {
    try {
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

      return res.status(200).send({
        success: true,
        data: {
          admin,
          users,
          orders,
          pending,
          delivered,
          complaint,
        },
      });
    } catch (err) {
      res.status(500).send({
        success: false,
        message: err.message,
      });
    }
  },

  getUsersController: async (req, res, next) => {
    try {
      const users = await User.find({ role: "user" });

      return res.status(200).send({
        success: true,
        data: {
          users,
        },
      });
    } catch (err) {
      res.status(500).send({
        success: false,
        message: err.message,
      });
    }
  },

  postEditUserController: async (req, res, next) => {
    try {
      const userId = req.params.id;
      const user = await User.findOne({ _id: userId });

      return res.status(200).send({
        success: true,
        data: {
          user,
        },
      });
    } catch (err) {
      res.status(500).send({
        success: false,
        message: err.message,
      });
    }
  },

  postUpdateUserController: async (req, res, next) => {
    try {
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
      return res.status(200).send({
        success: true,
        message: "Updated user",
      });
    } catch (err) {
      res.status(500).send({
        success: false,
        message: err.message,
      });
    }
  },

  getUserTransactionsController: async (req, res, next) => {
    try {
      const userId = req.params.id;
      const user = await User.findOne({ _id: userId });

      const orders = await Order.find({ user: userId });

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

  getUserPendingTransactionsController: async (req, res, next) => {
    try {
      const userId = req.params.id;
      const user = await User.findOne({ _id: userId });

      const orders = await Order.find({ user: userId, status: "initiated" });

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

  postVerifyUserTransaction: async (req, res, next) => {
    try {
      const request_id = req.body.request_id;
      const user_id = req.body.user_id;

      const payload = {
        request_id,
      };

      const verifyMeterNumber = await VTP_services.queryTransactionStatus(
        payload
      );

      const updatedOrder = await Order.findOne({ tx_ref: request_id });

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

  getComplaintsController: async (req, res, next) => {
    try {
      const complaints = await Complaint.find();

      return res.status(200).send({
        success: true,
        data: {
          editing: false,
          role: req.user.role,
          complaints,
        },
      });
    } catch (err) {
      res.status(500).send({
        success: false,
        message: err.message,
      });
    }
  },

  getDisabledProductsController: async (req, res, next) => {
    try {
      const prods = await Product.find({ isDisabled: true });
      const disabledMode = req.query.disable;

      return res.status(200).send({
        success: true,
        data: {
          prods,
          disable: disabledMode,
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
