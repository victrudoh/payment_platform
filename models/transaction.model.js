const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TransactionSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    fullname: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    tx_ref: {
      type: String,
      required: true,
      unique: true,
    },
    flw_ref: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    billersCode: {
      type: Number,
      required: true,
    },
    serviceID: {
      type: String,
      required: true,
    },
    meterType: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      defaultValue: "confirm payment to get token"
    },
    status: {
      type: String,
      required: true,
      defaultValue: "initiated",
    },
  },
  { timestamps: true }
);

TransactionSchema.method("toJSON", function () {
  const { __v, ...object } = this.toObject();
  const newObject = {
    ...object,
  };

  return newObject;
});


module.exports = mongoose.model("Transaction", TransactionSchema);
