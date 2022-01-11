const userModel = require("../../models/user.model");

module.exports = {
  get404: (req, res, next) => {
    res.status(404).send("404");
  },
};
