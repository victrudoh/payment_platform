const moment = require("moment");

var moment1 = require("moment-timezone");

//generate random IDs for flutterwave tx_ref
let tx_ref = 0;
let date = new Date().toISOString();
let rand = Math.floor(Math.random() * Date.now());

const get_Tx_Ref = () => {
  // const time = moment().format("YYYY-MM-DD HH:MM:SS");
  // const time1 = time.replace(/[\-]|[\s]|[\:]/g, "");
  // const date1 = date.replace(/[\-]|[\s]|[\:]/g, "");
  // console.log("date", date1);

  const time2 = moment1().tz("Africa/Lagos").format("YYYY-MM-DD HH:MM:SS");
  const time3 = time2.replace(/[\-]|[\s]|[\:]/g, "");
  // console.log("time2", time3);
  tx_ref = time3;

  // console.log("time", time1);
  // const rand = Math.floor(Math.random() * Date.now());
  // const rand1 = Math.floor(Math.random() * Date.now());
  // const ref = time.replace(/[\-]|[\s]|[\:]/g, "") | rand;
  // tx_ref = parseInt(ref) * rand1;

  // let date1 = date.replace(/\-/g, "");
  // let date2 = date1.replace(/\:/g, "");
  // let date3 = date2.replace(/\./g, "");
  // tx_ref = `${date3}${rand}`;

  // tx_ref = time1;

  // console.log("tx_ref", tx_ref);

  return tx_ref;
};

module.exports = {
  get_Tx_Ref,
  tx_ref,
};
