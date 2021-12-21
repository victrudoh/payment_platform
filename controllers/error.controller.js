const userModel = require("../Models/user.model");

module.exports = {
  get404: (req, res, next) => {
    res.status(404).render("404", {
      pageTitle: "404",
      path: "",
      role: req.user?.role,
    });
  },
};
