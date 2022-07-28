const axios = require("axios");
const dotenv = require("dotenv").config();

const FLW_services = require("../../services/flutterwave.services");
const VTP_services = require("../../services/vtpass.services");

const User = require("../../models/user.model");
const T_Model = require("../../models/transaction.model");

const tx_ref = require("../../middlewares/tx_ref");

module.exports = {
  getDetailsController: async (req, res, next) => {
    try {
      const distributors = await VTP_services.getServiceID();

      return res.status(200).send({
        success: true,
        data: {
          distributors,
        },
      });
    } catch (err) {
      res.status(500).send({
        success: false,
        message: err.message,
      });
    }
  },

  postBuyController: async (req, res, next) => {
    const billersCode = req.body.meter_no;
    const serviceID = req.body.serviceID;
    const type = req.body.type;

    console.log("JUST CHECKING: ", req.body);

    const payload = {
      billersCode,
      serviceID,
      type,
    };

    const user = await User.findOne({ username: req.user.username });
    console.log("User", user);

    const verifyMeterNumber = await VTP_services.verifyMeterNumber(payload);
    console.log("verifyMeterNumber", verifyMeterNumber);

    if (serviceID === "Select Service Provider") {
      console.log("no service ID");
      res.status(400).send({
        success: false,
        message: "Please Select Service Provider",
      });
    } else if (type === "Meter Type") {
      console.log("no metere type");
      res.status(400).send({
        success: false,
        message: "Please Select meter type",
      });
    } else if (verifyMeterNumber.error) {
      console.log(verifyMeterNumber.error);
      res.status(400).send({
        success: false,
        message: "Invalid Meter Number. Please check and Try Again",
        error: verifyMeterNumber.error,
      });
    }

    return res.status(200).send({
      success: true,
      data: {
        data: verifyMeterNumber,
      },
      message: "meter was found",
    });
  },

  buyChangeNumberController: async (req, res, next) => {
    try {
      const billersCode = req.body.meter_no;
      const serviceID = req.body.serviceID;
      const type = req.body.type;

      const payload = {
        billersCode,
        serviceID,
        type,
      };

      const user = await User.findOne({ username: req.user.username });

      const verifyMeterNumber = await VTP_services.verifyMeterNumber(payload);

      if (serviceID === "Select Service Provider") {
        res.status(500).send({
          success: false,
          message: "no service ID",
        });
      } else if (type === "Meter Type") {
        res.status(500).send({
          success: false,
          message: "no meter type",
        });
      } else if (verifyMeterNumber.error) {
        res.status(500).send({
          success: false,
          message: "Invalid Meter Number. Please check and Try Again",
        });
      }

      return res.status(200).send({
        success: true,
        data: {
          details: verifyMeterNumber,
          user,
          serviceID,
          billersCode,
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

  postPayController: async (req, res, next) => {
    try {
      const currency = "NGN";
      const amount = parseInt(req.body.amount);
      const newAmount = amount + 100;
      const transREf = await tx_ref.get_Tx_Ref();

      const payload = {
        tx_ref: transREf,
        amount: newAmount,
        currency: currency,
        payment_options: "card",
        redirect_url: "https://topapp.ng/utility/verify",
        customer: {
          email: req.body.email,
          phonenumber: req.body.phone,
          name: req.body.name,
        },
        meta: {
          customer_id: req.body.user_id,
        },
        customizations: {
          title: "Top App",
          description: "Pay with card",
          logo: "#",
        },
      };
      const billersCode = req.body.billersCode;
      const serviceID = req.body.serviceID;
      const meterType = req.body.meterType;
      const phone = req.body.phone;

      const transaction = await new T_Model({
        tx_ref: transREf,
        user: req.body.user_id,
        email: req.body.email,
        fullname: req.body.name,
        phone,
        currency,
        billersCode,
        serviceID,
        meterType,
        amount: req.body.amount,
        status: "initiated",
        token: "confirm payment to get token",
      });

      await transaction.save();

      const response = await FLW_services.initiateTransaction(payload);

      return res.status(200).send({
        success: true,
        data: {
          response,
          // transREf,
        },
      });
    } catch (err) {
      res.status(500).send({
        success: false,
        message: err.message,
      });
    }
  },

  // getVerifyController: async (req, res, next) => {
  //   try {
  //     //     const request_id = req.body.request_id;
  //     // const user_id = req.body.user_id;
  //     const request_id = req.query.tx_ref;

  //     const payload = {
  //       request_id,
  //     };

  //     const verifyMeterNumber = await VTP_services.queryTransactionStatus(
  //       payload
  //     );

  //     const updatedOrder = await T_Model.findOne({ tx_ref: request_id });
  //     // const updatedOrder = await Order.findOne({ user: user_id });

  //     updatedOrder.email = updatedOrder.email;
  //     updatedOrder.fullname = updatedOrder.fullname;
  //     updatedOrder.phone = updatedOrder.phone;
  //     updatedOrder.tx_ref = updatedOrder.tx_ref;
  //     updatedOrder.amount = updatedOrder.amount;
  //     updatedOrder.currency = updatedOrder.currency;
  //     updatedOrder.billersCode = updatedOrder.billersCode;
  //     updatedOrder.serviceID = updatedOrder.serviceID;
  //     updatedOrder.meterType = updatedOrder.meterType;
  //     updatedOrder.status = updatedOrder.status;
  //     updatedOrder.token = verifyMeterNumber.purchased_code;

  //     await updatedOrder.save();
  //     return res.status(200).send({
  //       success: true,
  //       data: updatedOrder,
  //     });
  //   } catch (err) {
  //     res.status(500).send({
  //       success: false,
  //       message: err.message,
  //     });
  //   }
  // },

  getVerifyController: async (req, res, next) => {
    try {
      const id = req.query.transaction_id;
      const tx_ref = req.query.tx_ref;
      const status = req.query.status;

      const verify = await FLW_services.verifyTransaction(id);

      const transaction = await T_Model.findOne({ tx_ref: tx_ref });

      const payload = {
        request_id: transaction.tx_ref,
        serviceID: transaction.serviceID,
        billersCode: transaction.billersCode,
        variation_code: transaction.meterType,
        amount: transaction.amount,
        phone: transaction.phone,
      };

      const makePayment = await VTP_services.makePayment(payload);
      const token = makePayment.token;
      const newStatus = makePayment.content.transactions.status;

      transaction.token = token;
      transaction.status = newStatus;
      await transaction.save();

      return res.status(200).send({
        success: true,
        data: {
          transaction,
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
