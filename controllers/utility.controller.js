const axios = require("axios");
const dotenv = require("dotenv").config();
const moment = require("moment");

const FLW_services = require("../services/flutterwave.services");
const VTP_services = require("../services/vtpass.services");
const BAXI_services = require("../services/baxibox.services");

const sendMail = require("../services/mailer.services");

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

    console.log("Tx_ref in Get details controller: ", tx_ref.get_Tx_Ref());

    const distributors = await VTP_services.getServiceID();
    // const distributors = await BAXI_services.getElectricityBillers();

    res.render("order/meterDetails", {
      pageTitle: "order",
      path: "order",
      role: req.user?.role,
      errorMessage: message,
      distributors,
      // distributors: distributors.data.data.providers,
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
    console.log("~ verifyMeterNumber", verifyMeterNumber);

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

  buyChangeNumberController: async (req, res, next) => {
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
    console.log(" verifyMeterNumber", verifyMeterNumber);

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

    res.render("order/buyChangeNumber", {
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
    const transREf = await tx_ref.get_Tx_Ref();

    const payload = {
      tx_ref: transREf,
      amount: newAmount,
      currency: currency,
      payment_options: "card",
      // redirect_url: "http://localhost:4000/utility/verify",
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
    console.log("New transaction saved......");

    await transaction.save();

    const response = await FLW_services.initiateTransaction(payload);

    // console.log("🚀...response: ", response);
    return res.redirect(response);
  },

  // getVerifyController: async (req, res, next) => {
  //   try {
  //     const id = req.query.transaction_id;
  //     const tx_ref = req.query.tx_ref;
  //     const status = req.query.status;

  //     const verify = await FLW_services.verifyTransaction(id);

  //     const transaction = await T_Model.findOne({ tx_ref: tx_ref });

  //     const payload = {
  //       request_id: transaction.tx_ref,
  //       serviceID: transaction.serviceID,
  //       billersCode: transaction.billersCode,
  //       variation_code: transaction.meterType,
  //       amount: transaction.amount,
  //       phone: transaction.phone,
  //     };

  //     const makePayment = await VTP_services.makePayment(payload);

  //     console.log("makePayment", makePayment);

  //     const token = makePayment.token;
  //     const user = req.session.user;

  //     transaction.token = token;
  //     transaction.units = units;
  //     transaction.status = "successful";
  //     await transaction.save();

  //     const mailOptions = {
  //       to: transaction.email,
  //       subject: "Payment confirmation",
  //       html: `Hello ${user.username}, your transaction was successful. You purchased ${units} units, here is your token; <br/> <b>${token}</b>. <br/> Thanks for your patronage.`,
  //     };

  //     sendMail(mailOptions);

  //     res.render("order/verify", {
  //       pageTitle: "Verify Payment",
  //       path: "summary",
  //       role: req.user?.role,
  //       makePayment,
  //     });
  //   } catch (err) {
  //     console.log(err.body);
  //   }
  // },

  getVerifyController: async (req, res, next) => {
    try {
      const id = req.query.transaction_id;
      const tx_ref = req.query.tx_ref;
      const status = req.query.status;

      const verify = await FLW_services.verifyTransaction(id);

      if (verify.status === "successful") {
        const transaction = await T_Model.findOne({ tx_ref: tx_ref });

        if (transaction) {
          const payload = {
            request_id: transaction.tx_ref,
            serviceID: transaction.serviceID,
            billersCode: transaction.billersCode,
            variation_code: transaction.meterType,
            amount: transaction.amount,
            phone: transaction.phone,
          };

          const makePayment = await VTP_services.makePayment(payload);

          if (makePayment.data.response_description === "TRANSACTION FAILED") {
            res.status(500).send({
              success: false,
              message: "TRANSACTION FAILED",
            });
          } else if (
            makePayment.data.response_description === "REQUEST ID ALREADY EXIST"
          ) {
            res.status(500).send({
              success: false,
              message: "A Transaction with this ID Already exists",
            });
          } else if (
            makePayment.data.response_description === "TRANSACTION SUCCESSFUL"
          ) {
            const token = makePayment.data.token;
            const units = makePayment.data.units;
            const user = req.session.user;

            transaction.token = token;
            transaction.units = units;
            transaction.status = "successful";
            await transaction.save();

            const mailOptions = {
              to: transaction.email,
              subject: "Payment confirmation",
              html: `Hello ${user.username}, your transaction was successful. You purchased ${units} units, here is your token; <br/> <b>${token}</b>. <br/> Thanks for your patronage.`,
            };

            sendMail(mailOptions);

            res.render("order/verify", {
              pageTitle: "Verify Payment",
              path: "summary",
              role: req.user?.role,
              makePayment,
              transaction,
            });
          } else {
            res.status(400).send({
              success: false,
              message: makePayment.data.response_description,
            });
          }
        } else {
          res.status(400).send({
            success: false,
            message: "Transaction not found",
          });
        }
      } else {
        res.status(500).send({
          success: false,
          message: "Payment was not successful",
        });
      }
    } catch (err) {
      console.log("EERROOOORR: ", err);
      res.status(500).send({
        success: false,
        message: "Oops! Something is wrong",
        message11: err.message,
      });
    }
  },
};
