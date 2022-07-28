const bcrypt = require("bcryptjs");
const escapeStringRegexp = require("escape-string-regexp");
const { v4: uuidv4 } = require("uuid");
const moment = require("moment");
const resetPasswordMail = require("../templates/resetPasswordMail.templates");
const sendMail = require("../services/mailer.services");
const url = require("url");

const User = require("../models/user.model");

module.exports = {
  getLoginController: async (req, res) => {
    let message = req.flash("error");
    if (message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }
    res.render("auth/login", {
      pageTitle: "Login",
      path: "login",
      errorMessage: message,
      role: null,
    });
  },

  postLoginController: async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    const user = await User.findOne({ email: email });
    if (!user) {
      req.flash("error", "Invalid email or password");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
      req.session.isLoggedIn = true;
      req.session.user = user;
      return req.session.save((err) => {
        console.log(err, "postLoginController 2nd log");
        if (user.role === "user") {
          console.log("this user is: ", user.role);
          res.redirect("/");
        } else if (user.role === "admin") {
          console.log("this user is: ", user.role);
          res.redirect("/admin/dashboard");
        }
      });
    }
    req.flash("error", "Invalid email or password");
    res.redirect("/login");
  },

  postLogoutController: (req, res, next) => {
    req.session.destroy((err) => {
      console.log(err, "postLogoutController");
      res.redirect("/");
    });
  },

  getSignupController: async (req, res) => {
    let message = req.flash("error");
    //so the error message box will not always be active
    if (message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }
    res.render("auth/signup", {
      pageTitle: "Signup",
      path: "signup",
      errorMessage: message,
      role: null,
    });
  },

  postSignupController: async (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const gender = req.body.gender;
    const role = req.body.role;

    const emailExists = await User.findOne({ email: email });
    if (emailExists) {
      req.flash("error", "email already exists, try another?");
      return res.redirect("/signup");
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
z
    return res.redirect("/login");
  },

  getProfileController: async (req, res) => {
    let message = req.flash("error");
    //so the error message box will not always be active
    if (message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }

    const user = await User.findOne({ username: req.user.username });

    console.log("Display name:   ", req.user.displayName);

    res.render("auth/profile", {
      pageTitle: "profile",
      path: "profile",
      role: req.user ? req.user.role : "",
      user: user,
      errorMessage: message,
    });
  },

  getEditProfileController: async (req, res) => {
    let message = req.flash("error");
    //so the error message box will not always be active
    if (message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }

    const user = await User.findOne({ username: req.user.username });

    res.render("auth/edit_profile", {
      pageTitle: "profile",
      path: "profile",
      role: req.user?.role,
      errorMessage: message,
      user: user,
    });
  },

  postEditProfileController: async (req, res, next) => {
    const user_id = req.body.user_id;
    const username = req.body.username;
    const email = req.body.email;
    const gender = req.body.gender;
    const phone = req.body.phone;

    if (!gender) {
      req.flash("error", "Please specify gender");
      return res.redirect("/profile");
    } else if (!phone) {
      req.flash("error", "Please enter phone number");
      return res.redirect("/profile");
    }

    const user = await User.findById(user_id);

    user.username = username;
    user.email = email;
    user.password = user.password;
    user.gender = gender;
    user.phone = phone;
    user.role = "user";

    await user.save();
    console.log("User profile Updated....");

    return res.redirect("/profile");
  },

  // postEditProfileController: async (req, res) => {
  //   const userId = req.body.id;
  //   const UpdatedUsername = req.body.username;
  //   const UpdatedEmail = req.body.email;
  //   const UpdatedPassword = req.body.password;
  //   const UpdatedPhysicalAddress = req.body.physicalAddress;
  //   const UpdatedGender = req.body.gender;
  //   const UpdatedRole = req.body.role;

  //   const user = await User.findById(userId);

  //   user.username = UpdatedUsername;
  //   user.email = UpdatedEmail;
  //   user.password = UpdatedPassword;
  //   user.physicalAddress = UpdatedPhysicalAddress;
  //   user.gender = UpdatedGender;
  //   user.role = UpdatedRole;

  //   await user.save();
  //   console.log("User profile Updated....");

  //   return res.redirect("/profile");
  // },

  getGoogleLoginController: async (req, res) => {
    const username = req.user.displayName;
    const email = req.user.email;
    const password = req.user.email;
    const gender = "other";
    const role = "user";
    const picture = req.user.photos[0].value;

    const userFound = await User.findOne({ email: email });
    if (userFound) {
      req.session.isLoggedIn = true;
      req.session.user = userFound;
      return req.session.save((err) => {
        console.log(err, "postLoginController 2nd log");
        if (userFound.role === "user") {
          console.log("this user is: ", userFound.role);
          res.redirect("/profile");
        } else if (userFound.role === "admin") {
          console.log("this user is: ", userFound.role);
          res.redirect("/admin/dashboard");
        }
      });
    }

    const user = await new User({
      username: username,
      email: email,
      password: password,
      gender: gender,
      role: role,
      picture: picture,
    });

    const save = await user.save();
    req.session.isLoggedIn = true;
    req.session.user = user;
    await req.session.save();

    return res.redirect("/profile");
  },

  getForgotPasswordController: async (req, res) => {
    try {
      let message = req.flash("error");
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render("auth/forgot_password", {
        pageTitle: "Forgot password",
        path: "profile",
        role: req.user?.role,
        errorMessage: message,
      });
    } catch (err) {
      console.log(err);
    }
  },

  postForgotPasswordController: async (req, res) => {
    try {
      const { email } = req.body;
      const $regex = "^" + escapeStringRegexp(email) + "$";
      const $options = "i";

      const user = await User.findOne({
        $or: [
          { email: { $regex, $options } },
          { username: { $regex, $options } },
        ],
      });

      if (!user) {
        req.flash("error", "This email is not linked to an account");
        return res.redirect("/forgot_password");
      }
      const resetToken = uuidv4();
      const expire = moment().add(15, "minutes").format("YYYY-MM-DD hh:mm:ss");

      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = expire;

      await user.save();

      const mailOptions = {
        to: user.email,
        subject: "Password Reset Mail",
        html: resetPasswordMail(user.username, resetToken),
        // html: `<h4>Hi ${user.username}, <br> <h4>click on the link below to reset your account password, or copy and paste the link into your preferred browser</h4> <br> <a href='http://localhost:4000/reset_password?token=${resetToken}'>${process.env.APP_URL}/reset_password?token=${resetToken}</a><br><br> <p>if you didn't initiate this request, please ignore this mail, or contact Admin for further support</p>`,
      };

      sendMail(mailOptions);
      res.render("auth/success_message", {
        pageTitle: "Password reset",
        path: "profile",
        role: req.user?.role,
      });
    } catch (err) {
      console.log(err);
    }
  },

  getResetPasswordController: async (req, res) => {
    try {
      let message = req.flash("error");
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }

      const token = req.query.token;

      res.render("auth/reset_password", {
        pageTitle: "Reset password",
        path: "profile",
        role: req.user?.role,
        errorMessage: message,
        token,
      });
    } catch (err) {
      console.log(err);
    }
  },

  postResetPasswordController: async (req, res) => {
    try {
      const queyObject = url.parse(req.url, true).query;
      console.log("postResetPasswordController: ~ queyObject", queyObject);

      const { token, password } = req.body;
      console.log("Req.body: ", req.body);
      const pass = await bcrypt.hash(password, 12);
      const t = moment().format("YYYY-MM-DD hh:mm:ss");
      const time = new Date(t).getTime();

      const user = await User.findOne({ resetPasswordToken: token });
      console.log("postResetPasswordController: ~ user", user);
      if (!user) {
        req.flash("error", "Invalid link");
        return res.redirect("/forgot_password");
      }
      if (time > new Date(user.resetPasswordExpires).getTime()) {
        req.flash("error", "Oops, link has expired");
        return res.redirect("/forgot_password");
      }

      user.password = pass;
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;

      await user.save();
      res.redirect("/login");

      // res.status(200).send({
      //   success: true,
      //   message:
      //     "Password changed successfully, please login to proceed to your dashboard",
      // });
    } catch (err) {
      console.log(err);
    }
  },
};
