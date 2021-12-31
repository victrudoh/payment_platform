const axios = require("axios");
const dotenv = require("dotenv").config();
const moment = require("moment");

const FLW_services = require("../services/flutterwave.services");
const VTP_services = require("../services/vtpass.services");

const User = require("../models/user.model");
const T_Model = require("../models/transaction.model");

const tx_ref = require("../middlewares/tx_ref");

//generate random IDs for flutterwave tx_ref
// const time = moment().format("YYYY-MM-DD hh:mm:ss");
// const rand = Math.floor(Math.random() * Date.now());
// const rand1 = Math.floor(Math.random() * Date.now());
// const ref = time.replace(/[\-]|[\s]|[\:]/g, "") | rand;
// const tx_ref = ref + rand1;

module.exports = {
  getDetailsController: async (req, res, next) => {
    let message = req.flash("error");
    if (message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }

    const distributors = await VTP_services.getServiceID();

    res.render("order/meterDetails", {
      pageTitle: "order",
      path: "order",
      role: req.user?.role,
      errorMessage: message,
      distributors,
    });
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

    const verifyMeterNumber = await VTP_services.verifyMeterNumber(payload);

    if (serviceID === "Select Service Provider") {
      console.log("no service ID");
      req.flash("error", "Please Select Service Provider");
      return res.redirect("/utility/details");
    } else if (type === "Meter Type") {
      console.log("no metere type");
      req.flash("error", "Please Select meter type");
      return res.redirect("/utility/details");
    } else if (verifyMeterNumber.error) {
      console.log(verifyMeterNumber.error);
      req.flash("error", "Invalid Meter Number. Please check and Try Again");
      return res.redirect("/utility/details");
    }

    res.render("order/buy", {
      pageTitle: "order",
      path: "order",
      role: req.user?.role,
      details: verifyMeterNumber,
      user,
      serviceID,
      billersCode,
      type,
    });
  },

  postPayController: async (req, res, next) => {
    const currency = "NGN";
    const amount = parseInt(req.body.amount);
    const newAmount = amount + 100;
    // const tx_ref = await tx_ref();

    const payload = {
      tx_ref: tx_ref(),
      amount: newAmount,
      currency: currency,
      payment_options: "card",
      redirect_url: "http://localhost:4000/utility/verify",
      customer: {
        email: req.body.email,
        phonenumber: req.body.phone,
        name: req.body.name,
      },
      meta: {
        customer_id: req.body.user_id,
      },
      customizations: {
        title: "Utility Payments",
        description: "Pay with card",
        logo: "#",
      },
    };
    const billersCode = req.body.billersCode;
    const serviceID = req.body.serviceID;
    const meterType = req.body.meterType;
    const phone = req.body.phone;

    const transaction = await new T_Model({
      tx_ref: tx_ref,
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
    console.log("New transaction saved......");

    await transaction.save();

    const response = await FLW_services.initiateTransaction(payload);

    // console.log("🚀...response: ", response);
    return res.redirect(response);
  },

  getVerifyController: async (req, res, next) => {
    const id = req.query.transaction_id;
    const tx_ref = req.query.tx_ref;
    const status = req.query.status;

    const verify = await FLW_services.verifyTransaction(id);

    const transaction = await T_Model.findOne({ tx_ref: tx_ref });
    transaction.status = status;
    await transaction.save();

    // console.log("transaction", transaction);

    const payload = {
      request_id: transaction.tx_ref,
      serviceID: transaction.serviceID,
      billersCode: transaction.billersCode,
      variation_code: transaction.meterType,
      amount: transaction.amount,
      phone: transaction.phone,
    };

    const makePayment = await VTP_services.makePayment(payload);
    console.log("makePayment", makePayment);

    const token = makePayment.Token;
    const newStatus = makePayment.content.transactions.status;

    transaction.token = token;
    transaction.status = newStatus;
    await transaction.save();

    res.render("order/verify", {
      pageTitle: "Verify Payment",
      path: "summary",
      role: req.user?.role,
      makePayment,
    });
  },
};


