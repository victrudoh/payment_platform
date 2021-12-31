const moment = require("moment");

//generate random IDs for flutterwave tx_ref
const get_Tx_Ref = () => {
  const time = moment().format("YYYY-MM-DD hh:mm:ss");
  const rand = Math.floor(Math.random() * Date.now());
  const rand1 = Math.floor(Math.random() * Date.now());
  const ref = time.replace(/[\-]|[\s]|[\:]/g, "") | rand;
  const tx_ref = ref + rand1;

  return tx_ref;
};

module.exports = get_Tx_Ref;
