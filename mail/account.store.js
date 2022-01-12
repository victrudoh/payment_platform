const { v4: uuidv4 } = require("uuid");
const dotenv = require("dotenv").config();
const shortid = require("shortid");
const sendMail = require("../services/service.nodemailer");
const MonnifyService = require("../services/service.monnify");
const moment = require("moment");
const { transactionGenus, transactionType } = require("../utils/helpers");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const escapeStringRegexp = require("escape-string-regexp");
const activationMail = require("../templates/mail/activation");
const resetPasswordMail = require("../templates/mail/resetPasswordMail");

const register = asyncHandler(async (req, res, next) => {
  const { firstname, lastname, username, email, password, phone, referredBy } =
    req.body;
  const data = {};
  const activationToken = uuidv4();

  let referree = null;

  if (referredBy && referredBy !== "") {
    referree = await User.findOne({ phone: referredBy });
    if (!referree) {
      return next(new ErrorResponse("Referrer not found", 404));
    }
    if (referree && !referree.isMember) {
      return next(new ErrorResponse("Referrer is not yet a member", 400));
    }
    data.referredBy = referree.id;
  }

  data.firstname = firstname.charAt(0).toUpperCase() + firstname.slice(1);
  data.lastname = lastname.charAt(0).toUpperCase() + lastname.slice(1);
  data.name = `${firstname.charAt(0).toUpperCase() + firstname.slice(1)} ${
    lastname.charAt(0).toUpperCase() + lastname.slice(1)
  }`;
  data.username = username;
  data.password = bcrypt.hashSync(password, 10);
  data.phone = phone;
  data.email = email;
  data.activationToken = activationToken;

  const userData = new User(data);
  const user = await userData.save();

  // if (referree) {
  //   referree.referrals.push(user._id);
  //   await referree.save();
  // }

  const mailOptions = {
    from: "'Project One' projectoneofficial2020@gmail.com",
    to: user.email,
    subject: "Activate your P1 Million account",
    html: activationMail(user.firstname, activationToken),
  };
  sendMail(mailOptions);

  res.status(200).send({
    success: true,
    message: `Registration successful. Please activate your account using the link sent to ${user.email},`,
  });
});

const login = asyncHandler(async (req, res, next) => {
  const { id, password } = req.body;
  //check user schema if username or email matches id
  const $regex = "^" + escapeStringRegexp(id) + "$";
  const $options = "i";
  const user = await User.findOne({
    $or: [{ email: { $regex, $options } }, { username: { $regex, $options } }],
  });
  //check if user exists
  if (!user) {
    return next(new ErrorResponse("Invalid username/email", 400));
  }
  //check if password is valid
  const validate = await bcrypt.compareSync(password, user.password);
  if (!validate) {
    return next(new ErrorResponse("Invalid password", 400));
  }

  if (user.blocked) {
    return next(
      new ErrorResponse(
        "Your account has been restricted, please contact support",
        403
      )
    );
  }

  if (!user.isActive) {
    return resendActivation(req, res, next);
  }

  const userJwt = { id: user.id, email: user.email, username: user.username };
  let expire = 2592000;
  let token = await jwt.sign(userJwt, process.env.SECRET, {
    expiresIn: expire,
  });

  return res.status(200).send({
    success: true,
    message: "login successful",
    data: user,
    authorization: {
      token,
      expiresIn: expire,
    },
  });
});

const resendActivation = asyncHandler(async (req, res, next) => {
  const { id } = req.body;

  const activationToken = uuidv4();

  const $regex = "^" + escapeStringRegexp(id) + "$";
  const $options = "i";

  const user = await User.findOne({
    $or: [{ email: { $regex, $options } }, { username: { $regex, $options } }],
  });
  //check if user exists
  if (!user) {
    return next(new ErrorResponse("Invalid username/email", 400));
  }

  user.activationToken = activationToken;

  await user
    .save()
    .then(() => {
      const mailOptions = {
        from: "'Project One' projectoneofficial2020@gmail.com",
        to: user.email,
        subject: "Activate your P1 Million account",
        html: activationMail(user.firstname, activationToken),
      };
      sendMail(mailOptions);

      res.status(200).send({
        success: true,
        message: `Please activate your account using the link sent to ${user.email},`,
      });
    })
    .catch((err) => next(err));
});

const activateAccount = asyncHandler(async (req, res, next) => {
  const { token } = req.params;

  const user = await User.findOne({ activationToken: token });

  if (!user) {
    return next(new ErrorResponse("Invalid or expired token", 403));
  }

  user.activationToken = null;
  user.isActive = true;

  await user.save();

  res.status(200).send({
    success: true,
    message: "Account activation successful",
    data: user,
  });
});

const activateAccountAdmin = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(id);

  if (!user) {
    return next(new ErrorResponse("User not found", 404));
  }

  user.activationToken = null;
  user.isActive = true;

  await user.save();

  res.status(200).send({
    success: true,
    message: "Account activation successful",
    data: user,
  });
});

const passwordForgot = asyncHandler(async (req, res, next) => {
  const { id } = req.body;
  const $regex = "^" + escapeStringRegexp(id) + "$";
  const $options = "i";

  const user = await User.findOne({
    $or: [{ email: { $regex, $options } }, { username: { $regex, $options } }],
  });

  if (!user) {
    return next(new ErrorResponse("Account not found", 404));
  }
  //const resetToken = Math.floor(Math.random() * 9999) + 10000;
  const resetToken = uuidv4();
  const expire = moment().add(15, "minutes").format("YYYY-MM-DD hh:mm:ss");

  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = expire;

  await user.save();

  const mailOptions = {
    from: "'Project One' projectoneofficial2020@gmail.com",
    to: user.email,
    subject: "Password Reset Mail",
    html: resetPasswordMail(user.firstname, resetToken),
  };

  sendMail(mailOptions);
  //sendSMS(user.phone, message);
  res.status(200).send({
    success: true,
    message:
      "A link to reset your password has been sent to your registered email, link expires in 15 minutes",
  });
});

const passwordReset = asyncHandler(async (req, res, next) => {
  const { token, password } = req.body;
  const pass = bcrypt.hashSync(password, 8);
  const t = moment().format("YYYY-MM-DD hh:mm:ss");
  const time = new Date(t).getTime();

  const user = await User.findOne({ resetPasswordToken: token });
  if (!user) {
    return next(new ErrorResponse("Invalid link", 403));
  }
  if (time > new Date(user.resetPasswordExpires).getTime()) {
    return next(new ErrorResponse("Opps, Linked has expired"));
  }

  user.password = pass;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;

  await user.save();

  res.status(200).send({
    success: true,
    message:
      "Password changed successfully, please login to proceed to your dashboard",
  });
});

module.exports = {
  register,
  login,
  activateAccount,
  activateAccountAdmin,
  resendActivation,
  passwordForgot,
  passwordReset,
};
