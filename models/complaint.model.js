const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ComplaintSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    picture: {
      type: String,
      required: true,
    },
    complaint: {
      type: String,
      required: true,
    },
    Othercomplaint: {
      type: String,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      required: true,
      defaultValue: "unattended",
    },
  },
  { timestamps: true }
);


module.exports = mongoose.model("Complaint", ComplaintSchema);
