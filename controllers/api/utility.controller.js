const axios = require("axios");
const dotenv = require("dotenv").config();

const FLW_services = require("../../services/flutterwave.services");
const VTP_services = require("../../services/vtpass.services");
const BAXI_services = require("../../services/baxibox.services");

const sendMail = require("../../services/mailer.services");

const User = require("../../models/user.model");
const T_Model = require("../../models/transaction.model");

const tx_ref = require("../../middlewares/tx_ref");

module.exports = {
  getDetailsController: async (req, res, next) => {
    try {
      const distributors = await VTP_services.getServiceID();
      // const distributors = await BAXI_services.getElectricityBillers();

      return res.status(200).send({
        success: true,
        data: {
          distributors,
          // distributors: distributors.data.data.providers,
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
        // redirect_url: "http://localhost:4000/utility/verify",
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

  getVerifyController: async (req, res, next) => {
    try {
      const id = req.query.transaction_id;
      const tx_ref = req.query.tx_ref;
      const status = req.query.status;

      const verify = await FLW_services.verifyTransaction(id);

      if (verify.status === "successful") {
        const transaction = await T_Model.findOne({ tx_ref: tx_ref });
        console.log("transaction: ", transaction);

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
          console.log("makePayment: ", makePayment.data.response_description);

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

            transaction.token = token;
            transaction.units = units;
            transaction.status = "successful";
            await transaction.save();

            const mailOptions = {
              to: transaction.email,
              subject: "Payment confirmation",
              html: `Hello, your transaction was successful. You purchased ${units} units, here is your token; <br/> <b>${token}</b>. <br/> Thanks for your patronage.`,
            };

            await sendMail(mailOptions);

            return res.status(200).send({
              success: true,
              data: {
                transaction,
              },
              message: "transaction successful",
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
        // message: err.message,
      });
    }
  },

  getBaxiLoginController: async (req, res, next) => {
    try {
      console.log("baxi");

      const categories = await BAXI_services.getElectricityBillers();
      console.log("getBaxiLoginController: ~ categories", categories.data.data);

      return res.status(200).send({
        success: true,
        data: {
          categories: categories.data.data.providers,
        },
      });
    } catch (err) {
      console.log(err.response);
      res.status(500).send({
        success: false,
        message: err.message,
      });
    }
  },
};
