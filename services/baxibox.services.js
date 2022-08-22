const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

const baseURL = process.env.BAXI_BASE_URL;
const token = process.env.BAXI_API_KEY;
// console.log(token)

const options = {
  timeout: 1000 * 60,
  headers: {
    "content-type": "application/json",
    "x-api-key": token,
  },
};

const login = () => {
  console.log("first login");
  const header = {
    timeout: 1000 * 60,
    headers: {
      "content-type": "application/json",
      Authorization:
        "Basic " +
        new Buffer.from(
          process.env.BAXI_USERNAME + ":" + process.env.BAXI_SECRET,
          "utf8"
        ).toString("base64"),
    },
  };

  return axios.post(`${baseURL}/api/v1/auth/login`, {}, header);
};

const getAllBillerCategory = async () => {
  //console.log(auth)
  return axios.get(`${baseURL}/billers/category/all`, options);
};

const getBillerType = async (type) => {
  //console.log(auth)
  return axios.get(`${baseURL}/services/${type}/providers`, options);
};

const accountVerify = async (payload) => {
  const uri = `${baseURL}/services/namefinder/query`;
  const encodedURI = encodeURI(uri);
  return axios.post(encodedURI, payload, options);
};

//AIRTIME ENDPOINTS

const airtimeRequest = async (payload) => {
  const uri = `${baseURL}/services/airtime/request?phone=${payload.phone}&amount=${payload.amount}&service_type=${payload.service_type}&plan=prepaid&agentId=${payload.agentId}&agentReference=${payload.agentReference}`;
  const encodedURI = encodeURI(uri);
  return axios.post(encodedURI, {}, options);
};

//DATABUNDLE ENDPOINTS

const getDataBundles = async (service_type) => {
  //console.log(auth)
  const uri = `${baseURL}/services/databundle/bundles?service_type=${service_type}`;
  const encodedURI = encodeURI(uri);
  return axios.post(encodedURI, {}, options);
};

const databundleRequest = async (payload) => {
  const uri = `${baseURL}/services/databundle/request?phone=${payload.phone}&amount=${payload.amount}&service_type=${payload.service_type}&plan=prepaid&datacode=${payload.datacode}&agentId=${payload.agentId}&agentReference=${payload.agentReference}`;
  const encodedURI = encodeURI(uri);
  return axios.post(encodedURI, {}, options);
};

//ELECTRICITY ENDPOINTS

const getElectricityBillers = async () => {
  //console.log(auth)
  return axios.get(`${baseURL}/services/electricity/billers`, options);
};

const elecricityRequest = async (payload) => {
  const uri = `${baseURL}/services/electricity/request`;
  const encodedURI = encodeURI(uri);
  return axios.post(encodedURI, payload, options);
};

//CABLE TV ENDPOINTS

const getMultichoiceList = async (service_type) => {
  //console.log(auth)
  const uri = `${baseURL}/services/multichoice/list?service_type=${service_type}`;
  const encodedURI = encodeURI(uri);
  return axios.post(encodedURI, {}, options);
};

const getMultichoiceAdons = async (payload) => {
  //console.log(auth)
  const uri = `${baseURL}/services/multichoice/addons?service_type=${payload.service_type}&product_code=${payload.product_code}`;
  const encodedURI = encodeURI(uri);
  return axios.post(encodedURI, {}, options);
};

const cabletvRequest = async (payload) => {
  const uri = `${baseURL}/services/multichoice/request?smartcard_number=${payload.smartcard_number}&total_amount=${payload.total_amount}&product_code=${payload.product_code}&product_monthsPaidFor=${payload.product_monthsPaidFor}&addon_code=${payload.addon_code}&addon_monthsPaidFor=${payload.addon_monthsPaidFor}&service_type=${payload.service_type}&agentId=${payload.agentId}&agentReference=${payload.agentReference}`;
  const encodedURI = encodeURI(uri);
  return axios.post(encodedURI, {}, options);
};

module.exports = {
  getAllBillerCategory,
  getBillerType,

  airtimeRequest,

  getDataBundles,
  databundleRequest,

  getElectricityBillers,
  accountVerify,
  elecricityRequest,

  getMultichoiceList,
  getMultichoiceAdons,
  cabletvRequest,
};
