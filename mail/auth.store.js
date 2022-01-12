const db = require("../models");
const config = require("../../config/auth.config");
const Op = db.Sequelize.Op;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const ErrorResponse = require("../utils/errorResponse");
const { v4: uuidv4 } = require("uuid");
const sendMail = require("../services/mailers/nodemailer");
const moment = require("moment");
const asyncHandler = require("../middleware/async");
const otpGenerator = require("otp-generator");
const RegistrationMail = require("../services/mailers/templates/registration-mail");
const ForgotPasswordMail = require("../services/mailers/templates/forgot-password");
const dotenv = require("dotenv").config();

const login = asyncHandler(async (req, res, next) => {
  const { username, password } = req.body;

  const user = await db.User.findOne({
    where: {
      [Op.or]: [{ username }, { phone: `+234${username.slice(1)}` }],
    },
  });

  if (!user) {
    return res.status(404).send({ success: false, message: "User not found" });
  }

  if (!user.isPhoneVerified) {
    await resendOtp(req, res, next);
  }

  let passwordIsValid = bcrypt.compareSync(password, user.password);

  if (!passwordIsValid) {
    return res
      .status(401)
      .send({ success: false, message: "Invalid password" });
  }
  // return user;
  let expire = 2592000;
  let token = jwt.sign({ user }, config.secret, { expiresIn: expire });
  const payload = {
    user: { ...user.dataValues },
    token,
    expiresIn: expire,
  };

  return res
    .status(200)
    .send({ success: true, message: "Login successful", data: payload });
});

const verificationOtp = asyncHandler(async (req, res, next) => {
  const { otp } = req.body;
  const userData = await db.User.findOne({
    where: { phoneVerificationOtp: otp },
    attributes: { exclude: ["createdAt", "updatedAt"] },
  });
  if (!userData) {
    return res
      .status(401)
      .send({ status: "fail", message: "OTP is invalid or has expired" });
  }
  const verifiedUser = await userData.update({
    isPhoneVerified: true,
    isActive: true,
    phoneVerificationOtp: null,
    otpExpires: null,
  });

  let expire = 2592000;
  let token = jwt.sign({ verifiedUser }, config.secret, { expiresIn: expire });
  const payload = {
    user: { ...verifiedUser.dataValues },
    token,
    expiresIn: expire,
  };

  return res
    .status(200)
    .send({ success: true, message: "Verification successful", data: payload });
});

const resendOtp = asyncHandler(async (req, res, next) => {
  const { username } = req.body;
  const otp = otpGenerator.generate(5, {
    digits: true,
    alphabets: false,
    specialChars: false,
    upperCase: false,
  });

  const user = await db.User.findOne({
    where: { username },
  });

  if (!user) {
    return res
      .status(404)
      .send({ status: "fail", message: "User with the ID doesn't exist" });
  }
  const expire = moment().add(15, "minutes").format("YYYY-MM-DD hh:mm:ss");

  await user.update({ phoneVerificationOtp: otp, otpExpires: expire });

  const message = `Use this otp to confirm your Account ${otp}, token expires in 15 minutes`;

  sendMail(new RegistrationMail(user.email, "Account Verification", user, otp));
  //sendSMS(user.phone, message);
  return res.status(200).send({
    status: "success",
    data: {},
    message:
      "A verification otp has been resent to your registered email and phone number, otp expires in 15 minutes",
  });
});

const forgotPassword = asyncHandler(async (req, res, next) => {
  const { username } = req.body;
  const user = await db.User.findOne({ where: { username } });
  if (!user) {
    return res.status(404).send({ success: false, message: "User not found" });
  } else {
    const expire = moment().add(15, "minutes").format("YYYY-MM-DD hh:mm:ss");
    const token = otpGenerator.generate(5, {
      digits: true,
      alphabets: false,
      specialChars: false,
      upperCase: false,
    });

    await user.update({ passwordResetToken: token, tokenExpiresIn: expire });

    sendMail(
      new ForgotPasswordMail(
        user.email,
        `PXN account password reset`,
        user,
        token
      )
    );

    return res.status(200).json({
      success: true,
      message:
        "A password reset token has been successfully sent to your registered mail, token expires in 15mins",
    });
  }
});

const resetPassword = asyncHandler(async (req, res, next) => {
  const { token, password } = req.body;
  const pass = bcrypt.hashSync(password, 8);
  const time = new Date().getTime();

  const user = await db.User.findOne({ where: { passwordResetToken: token } });

  if (!user) {
    return res.status(403).send({ success: false, message: "Invalid token" });
  }

  const tokenExpiresIn = new Date(user.tokenExpiresIn).getTime();

  if (time > tokenExpiresIn) {
    return res
      .status(404)
      .send({ success: false, message: "Token has expired" });
  }
  await user.update({
    password: pass,
    passwordResetToken: null,
    tokenExpiresIn: null,
  });

  return res
    .status(200)
    .send({ success: true, message: "Password reset successful" });
});

module.exports = {
  login,
  forgotPassword,
  resetPassword,
  verificationOtp,
  resendOtp,
};
