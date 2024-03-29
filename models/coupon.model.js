const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Coupon Code is required!"],
    },
    expiryDate: {
      type: Date,
      required: [true, "Expiry Date is required!"],
      min: [Date.now(), "Cannot add expired coupoons"],
    },
    sourcePlatform: {
      type: String,
      required: [true, "Source platform is required"],
    },
    redeemPlatform: {
      type: String,
      required: [true, "Redeem platform is required"],
    },
    type: {
      type: String,
      required: [true, "Type is required"],
      enum: ["percentage", "flat", "free"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Food",
        "Fashion",
        "Education",
        "Tech",
        "Healthcare",
        "Lifestyle",
        "Finance",
        "Shopping",
        "Streaming",
        "Gaming",
        "Travel",
        "Utilities",
        "Other",
      ],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["sold", "available"],
      default: "available",
    },
    soldTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coupon", couponSchema);
