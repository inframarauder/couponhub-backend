const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  coupon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Coupon",
    required: [true, "Coupon must be mentioned in report"],
  },
  reason: {
    type: String,
    required: [true, "Reason must be provided"],
  },
});

module.exports = mongoose.model("Report", reportSchema);
