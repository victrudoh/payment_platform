const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

const payloadContent = require("../middlewares/orderPayload");

const baseURL = process.env.VTPASS_BASE_URL;
const username = process.env.VTPASS_USERNAME;
const password = process.env.VTPASS_PASSWORD;

const options = {
  timeout: 1000 * 60,
  headers: {
    "content-type": "application/json",
    Authorization:
      "Basic " +
      new Buffer.from(username + ":" + password, "utf8").toString("base64"),
  },
};

module.exports = {
  getOrderController: async (req, res, next) => {
    let message = req.flash("error");
    //so the error message box will not always be active
    if (message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }

    res.render("order/order", {
      pageTitle: "order",
      path: "order",
      role: req.user?.role,
      errorMessage: message,
    });
  },

  postOrderController: async (req, res, next) => {
    try {
      const billersCode = req.body.billersCode;
      const serviceID = req.body.serviceID;
      const type = req.body.type;

      const payload = {
        billersCode: billersCode,
        serviceID: serviceID,
        type: type,
      };
      console.log("Currently in postOrderController.....");
      const response = await axios.post(
        `${baseURL}/merchant-verify`,
        payload,
        options
      );
      console.log(response.data);
      if (response.data.content.error) {
        req.flash("error", "Please Check your Meter Number and Try Again");
        res.redirect("/utility/order");
      } else {
        payloadContent(payload);
        // if (type === "prepaid") {
        //   res.redirect("/utility/prepaid");
        // } else if (type === "postpaid") {
        //   res.redirect("/utility/postpaid");
        // }
        res.redirect("/utility/review");
        return response.data;
      }
    } catch (err) {
      console.log(err);
    }
  },

  getReviewController: async (req, res, next) => {
    let message = req.flash("error");
    //so the error message box will not always be active
    if (message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }

    // console.log("Middleware: ", payloadContent.content);

    res.render("order/review", {
      pageTitle: "Review Order",
      path: "review",
      role: req.user?.role,
      errorMessage: message,
    });
  },

  postReviewController: async (req, res, next) => {
    try {
      console.log("Middleware: ", payloadContent);

      const payload = {
        request_id: "123776654474767352",
        serviceID: "portharcourt-electric",
        billersCode: "1111111111111",
        variation_code: "prepaid",
        amount: 5000,
        phone: 7066886668,
      };
      console.log("Currently in getPrepaidMeterPaymentController.....");
      const response = await axios.post(`${baseURL}/pay`, payload, options);
      console.log(response.data);
      return response.data;
    } catch (err) {
      console.log(err);
    }
  },

  getPostpaidMeterPaymentController: async (req, res, next) => {
    try {
      const payload = {
        request_id: "123776654474",
        serviceID: "portharcourt-electric",
        billersCode: "Scribbledd",
        variation_code: "prepaid",
        amount: 5000,
        phone: 07066,
      };
      console.log("Currently in getPrepaidMeterPaymentController.....");
      const response = await axios.post(`${baseURL}/pay`, payload, options);
      console.log(response.data);
      return response.data;
    } catch (err) {
      console.log(err);
    }
  },
};
