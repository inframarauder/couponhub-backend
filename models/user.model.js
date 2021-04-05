const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    authType: {
      type: String,
      default: "plain",
      enum: ["plain", "google"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      required: [
        function () {
          return this.authType === "plain";
        },
        "Password is required",
      ],
      minlength: [6, "Password must be atleast 6 characters long"],
    },

    name: {
      type: String,
      required: [true, "Name is required"],
    },
    credits: {
      type: Number,
      default: 0,
      min: 0,
    },
    verificationCode: {
      type: Number,
    },
  },
  { timestamps: true }
);

userSchema.methods.createToken = function () {
  try {
    const { JWT_PRIVATE_KEY } = process.env;
    const user = { _id: this._id, isEmailVerified: this.isEmailVerified };
    return jwt.sign({ user }, JWT_PRIVATE_KEY);
  } catch (error) {
    console.error("Error in jwt generation\n", error);
  }
};

userSchema.pre("save", async function (next) {
  try {
    if (this.isNew) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }

    return next();
  } catch (error) {
    console.error("Error in password hashing\n", error);
  }
});

module.exports = mongoose.model("User", userSchema);
