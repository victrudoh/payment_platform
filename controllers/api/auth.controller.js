const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/user.model");

module.exports = {
  getLoginController: async (req, res) => {
    res.send("Login");
  },

  postLoginController: async (req, res, next) => {
    try {
      const email = req.body.email;
      const password = req.body.password;

      const user = await User.findOne({ email: email });
      if (!user) {
        return res.status(404).send({
          success: false,
          message: "User not found",
        });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(400).send({
          success: false,
          message: "invalid login credentilas",
        });
      }
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
      return res.status(200).send({
        success: true,
        message: "Login successful",
        data: {
          user,
          token,
        },
      });
    } catch (err) {
      res.status(500).send({
        success: false,
        message: err.message,
      });
    }
  },

  getSignupController: async (req, res) => {
    try {
      res.send("Signup");
    } catch (err) {
      res.status(500).send({
        success: false,
        message: err.message,
      });
    }
  },

  postSignupController: async (req, res) => {
    try {
      const username = req.body.username;
      const email = req.body.email;
      const password = req.body.password;
      const gender = req.body.gender;
      const role = req.body.role;

      const emailExists = await User.findOne({ email: email });
      if (emailExists) {
        return res.status(400).send({
          success: false,
          message: "Email exists",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const user = await new User({
        username: username,
        email: email,
        password: hashedPassword,
        gender: gender,
        role: role,
      });

      const save = await user.save();
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

  getGoogleLoginController: async (req, res) => {
    try {
      const username = req.user.displayName;
      const email = req.user.email;
      const password = req.user.email;
      const gender = "other";
      const role = "user";
      const picture = req.user.photos[0].value;

      const userFound = await User.findOne({ email: email });

      const user = await new User({
        username: username,
        email: email,
        password: password,
        gender: gender,
        role: role,
        picture: picture,
      });

      const save = await user.save();

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
