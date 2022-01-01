const moment = require("moment");

//generate random IDs for flutterwave tx_ref
let tx_ref = 0;
const get_Tx_Ref = () => {
  const time = moment().format("YYYY-MM-DD hh:mm:ss");
  const rand = Math.floor(Math.random() * Date.now());
  const rand1 = Math.floor(Math.random() * Date.now());
  const ref = time.replace(/[\-]|[\s]|[\:]/g, "") | rand;
  tx_ref = parseInt(ref) * rand1;
  console.log(" ~ file: tx_ref.js ~ line 10 ~ tx_ref", tx_ref)

  return tx_ref;
};

module.exports = {
  get_Tx_Ref,
  tx_ref,
};
