const moment = require("moment");
const Complaint = require("../models/complaint.model");
const User = require("../models/user.model");

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

  getFaqController: async (req, res, next) => {
    res.render("user/faq", {
      pageTitle: "FAQ",
      path: "faq",
      role: req.user?.role,
    });
  },

  getContactUsController: async (req, res, next) => {
    let message = req.flash("error");
    //so the error message box will not always be active
    if (message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }

    const user = await User.findOne({ username: req.user.username });

    res.render("user/contactUs", {
      pageTitle: "Contact us",
      path: "contact",
      role: req.user?.role,
      errorMessage: message,
      user,
    });
  },

  postContactUsController: async (req, res, next) => {
    const user = req.body.user_id;
    const username = req.body.username;
    const picture = req.body.picture;
    const email = req.body.email;
    const complaint = req.body.complaint;
    const Othercomplaint = req.body.Othercomplaint;
    const description = req.body.description;

    if (!email) {
      console.log("No email");
      req.flash("error", "Please enter email");
      return res.redirect("/contactUs");
    } else if (complaint === "null") {
      console.log("No complaint");
      req.flash("error", "Please specify complaint");
    }

    const newComplaint = await new Complaint({
      user,
      username,
      email,
      picture,
      complaint,
      Othercomplaint,
      description,
      status: "unattended",
    });
    console.log("New complaint saved......");

    await newComplaint.save();

    res.redirect("/");

    // res.render("user/contactUs", {
    //   pageTitle: "Contact us",
    //   path: "contact",
    //   role: req.user?.role,
    //   errorMessage: message,
    // });
  },
};
