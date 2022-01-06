const axios = require("axios");
const dotenv = require("dotenv").config();

const VTP_username = process.env.VTPASS_USERNAME;
const VTP_password = process.env.VTPASS_PASSWORD;
const VTP_baseURL = process.env.VTPASS_BASE_URL;

const options = {
  timeout: 1000 * 60,
  headers: {
    "content-type": "application/json",
    Authorization:
      "Basic " +
      new Buffer.from(VTP_username + ":" + VTP_password, "utf8").toString(
        "base64"
      ),
  },
};

const getServiceID = async () => {
  try {
    const response = await axios.get(
      `${VTP_baseURL}/services?identifier=electricity-bill`,
      options
    );
    // console.log(response.data.content);
    return response.data.content;
  } catch (err) {
    console.log(err);
  }
};

const verifyMeterNumber = async (payload) => {
  try {
    const response = await axios.post(`${VTP_baseURL}/merchant-verify`, payload, options);
    // console.log("verifyMeterNumber: ", response.data.content);
    return response.data.content;
  } catch (err) {
    console.log(err);
  }  
}

const makePayment = async (payload) => {
  try {
    const response = await axios.post(`${VTP_baseURL}/pay`, payload, options);
    console.log("makePayment: ", response.data);
    return response.data;
  } catch (err) {
    console.log(err);
  }  
}

const queryTransactionStatus = async (payload) => {
  try {
    const response = await axios.post(`${VTP_baseURL}/requery`, payload, options);
    console.log("queryTransactionStatus: ", response.data);
    return response.data;
  } catch (err) {
    console.log(err);
  }  
}



module.exports = {
  getServiceID,
  verifyMeterNumber,
  makePayment,
  queryTransactionStatus,
};
