const moment = require("moment");
const Complaint = require("../../models/complaint.model");
const User = require("../../models/user.model");

module.exports = {
  getIndexController: async (req, res, next) => {
    try {
      return res.status(200).send({
        success: true,
      });
    } catch (err) {
      res.status(500).send({
        success: false,
        message: err.message,
      });
    }
  },

  getProfileController: async (req, res, next) => {
    try {
      return res.status(200).send({
        success: true,
      });
    } catch (err) {
      res.status(500).send({
        success: false,
        message: err.message,
      });
    }
  },

  getFaqController: async (req, res, next) => {
    try {
      return res.status(200).send({
        success: true,
      });
    } catch (err) {
      res.status(500).send({
        success: false,
        message: err.message,
      });
    }
  },

  getContactUsController: async (req, res, next) => {
    try {
      const user = await User.findOne({ username: req.user.username });
      return res.status(200).send({
        success: true,
      });
    } catch (err) {
      res.status(500).send({
        success: false,
        data: {
          user,
        },
        message: err.message,
      });
    }
  },

  postContactUsController: async (req, res, next) => {
    try {
      const user = req.body.user_id;
      const username = req.body.username;
      const picture = req.body.picture;
      const email = req.body.email;
      const complaint = req.body.complaint;
      const Othercomplaint = req.body.Othercomplaint;
      const description = req.body.description;

      if (!email) {
        res.status(500).send({
          success: false,
          message: "Please enter email",
        });
      } else if (complaint === "null") {
        res.status(500).send({
          success: false,
          message: "Please specify complaint",
        });
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

      await newComplaint.save();

      return res.status(200).send({
        success: true,
      });
    } catch (err) {
      res.status(500).send({
        success: false,
        message: err.message,
      });
    }
  },
};
