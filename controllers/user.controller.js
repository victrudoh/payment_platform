const moment = require("moment");

module.exports = {
  getIndexController: async (req, res, next) => {
    res.render("user/index", {
      pageTitle: "Shop",
      path: "index",
      role: req.user?.role,
    });
  },

  getProfileController: async (req, res, next) => {
    res.render("user/index", {
      pageTitle: "Shop",
      path: "index",
      role: req.user?.role,
    });
  },
};
