const moment = require("moment");

module.exports = {
  getIndexController: async (req, res, next) => {
    res.render("user/index", {
      pageTitle: "Utility Platform",
      path: "index",
      role: req.user?.role,
    });
  },

  getProfileController: async (req, res, next) => {
    res.render("user/index", {
      pageTitle: "Profile",
      path: "index",
      role: req.user?.role,
    });
  },
};
