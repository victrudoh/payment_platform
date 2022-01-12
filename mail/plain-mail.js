class PlainMail {
  constructor(email, subject = "", details = "", user, message) {
    this.email = email;
    this.subject = subject;
    this.user = user;
    this.message = message;
    this.details = details;
    this.template = "default";
  }

  setBody() {
    this.body = {
      body: {
        title: `Hi ${this.user.firstname}`,
        intro: [`${this.message}`, `${this.details}`],
      },
    };

    return this.body;
  }
}

module.exports = PlainMail;
