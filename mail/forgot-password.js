class ForgotPasswordMail {
  constructor(email, subject = "", user, token) {
    this.email = email;
    this.subject = subject;
    this.user = user;
    this.token = token;
    this.template = "default";
  }

  setBody() {
    this.body = {
      body: {
        title: `Hi ${this.user.firstname}`,
        intro: [
          `You requested for a password reset, please enter the token below to fullfill this`,
          ` Token : ${this.token}`,
        ],
      },
    };

    return this.body;
  }
}

module.exports = ForgotPasswordMail;
