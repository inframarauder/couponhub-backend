const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
    }, // coupon code
    expiryDate: {
      type: Date,
      required: true,
    }, //expiry date of the coupon
    sourcePlatform: {
      type: String,
      required: true,
    }, // platform from where coupon was obtained
    redeemPlatform: {
      type: String,
      required: true,
    }, //platform where coupon can be redeemed
    type: {
      type: String,
      required: true,
      enum: ["percentage", "flat", "free"],
    }, //type of discount - percentage,flat or free
    amount: {
      type: Number,
      required: function () {
        return this.type === "percentage" || this.type === "flat";
      },
    }, // amount of discount
    title: {
      type: String,
      required: true,
    }, // short title for the coupon ad
    description: {
      type: String,
      required: true,
    }, // detailed description of the coupon with all the terms and conditions
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    }, //user who created the ad for the coupon
    status: {
      type: String,
      enum: ["sold", "available"],
      default: "available",
    }, //to keep track of the status of a coupon in the DB
    soldTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }, // user who buys the coupon
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coupon", couponSchema);
