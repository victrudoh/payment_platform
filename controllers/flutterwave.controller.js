const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();
const moment = require("moment");

const baseURL = process.env.FLUTTERWAVE_BASE_URL;
const username = process.env.FLUTTERWAVE_USERNAME;
const password = process.env.FLUTTERWAVE_PASSWORD;

const options = {
  timeout: 1000 * 60,
  headers: {
    "content-type": "application/json",
    Authorization:
      "Basic " +
      new Buffer.from(username + ":" + password, "utf8").toString("base64"),
    // Authorization: Bearer {SEC_KEY},
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

    const powerOptions = [{ name: "nepa" }, { name: "phcn" }];

    res.render("order/order", {
      pageTitle: "order",
      path: "order",
      role: req.user?.role,
      errorMessage: message,
      powerOptions,
      powerOptions,
    });
  },

  postReviewController: async (req, res, next) => {
    const momentID = moment().format();

    const tx_ref = momentID;
    const amount = 500;
    const payment_options = "card";
    const redirect_url = "/";
    const customer = {
      email: "example@example.com",
      phonenumber: "08012345678",
      name: "Takeshi Kovacs",
    };
    const customizations = {
      title: "Pied Piper Payments",
      description: "Middleout is not free. Pay the price",
      logo: "https://assets.piedpiper.com/logo.png",
    };

    const payload = {
      tx_ref,
      amount,
      payment_options,
      redirect_url,
      customer,
      customizations,
    };

    const response = await axios.post(`${baseURL}`, payload, options);
    console.log(response.data);

    // if (response.data.content.error) {
    //   req.flash("error", "Please Check your Meter Number and Try Again");
    //   res.redirect("/utility/order");
    // }

    // res.render("order/review", {
    //   pageTitle: "Review Order",
    //   path: "review",
    //   role: req.user?.role,
    //   payload,
    // });
  },
};
