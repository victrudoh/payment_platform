const bcrypt = require("bcryptjs");

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
      return res.redirect("/login");
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
      role: req.user?.role,
      user: user,
      errorMessage: message,
    });
  },

  postUpdateProfileController: async (req, res, next) => {
    const user_id = req.body.user_id;
    const username = req.body.username;
    const email = req.body.email;
    // const password = req.body.password;
    const gender = req.body.gender;
    const phone = req.body.phone;

    if (!username || !email || !gender || !phone) {
      console.log("Missing field...");
      req.flash("error", "Please provide all the available fields");
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

  // getEditProfileController: async (req, res) => {
  //   const user = await User.findOne({ username: req.user.username });

  //   res.render("auth/edit_profile", {
  //     pageTitle: "profile",
  //     path: "profile",
  //     role: req.user?.role,
  //     user: user,
  //   });
  // },

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
};
