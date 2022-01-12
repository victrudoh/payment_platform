class RegistrationMail {
  constructor(email, subject, user, token) {
    this.email = email;
    this.body = "";
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
          "Welcome to PXN! We're very excited to have you on board.",
          `Just one more step to complete your PXN registration, use this token to verify your account <b>${this.token}</b>. <br/> Token expires in 15 miniutes`,
        ],
      },
    };

    return this.body;
  }
}

module.exports = RegistrationMail;
