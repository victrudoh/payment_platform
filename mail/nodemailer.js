const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");
const dotenv = require("dotenv");
dotenv.config();

let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // use SSL
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

const sendMail = (mailOptions) => {
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "PXN",
      link: "#",
      logo: "https://res.cloudinary.com/burby/image/upload/v1612994464/pxn_1-01_vu48zp.png",
    },
  });

  const body = mailGenerator.generate(mailOptions.setBody());
  const text = mailGenerator.generatePlaintext(mailOptions.setBody());

  transporter.sendMail(
    {
      from: `"PXN e-wallet" ${process.env.MAIL_USER}`,
      to: mailOptions.email,
      subject: mailOptions.subject || "No Subject",
      text: text,
      html: body,
    },
    function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    }
  );
};

module.exports = sendMail;
