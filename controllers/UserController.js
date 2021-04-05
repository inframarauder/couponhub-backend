const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const { BadRequest, NotFound, Unauthorized } = require("../utils/error");
const { sendVerificationCode } = require("../utils/email");

exports.createUser = async (req, res, next) => {
  try {
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      throw new BadRequest("This email is already registered.Try logging in.");
    } else {
      user = await new User(req.body).save();
      user.password = undefined;
      const token = user.createToken();
      return res.status(201).json({ success: true, data: { user, token } });
    }
  } catch (error) {
    next(error);
  }
};

exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new BadRequest("Email or Password not provided");
    } else {
      const user = await User.findOne({ email });
      if (!user) {
        throw new NotFound("No user registered with this email");
      } else {
        let valid = await bcrypt.compare(password, user.password);
        if (valid) {
          const token = user.createToken();
          user.password = undefined;
          return res.status(201).json({ success: true, data: { user, token } });
        } else {
          throw new Unauthorized("Incorrect password");
        }
      }
    }
  } catch (error) {
    next(error);
  }
};

exports.sendVerificationEmail = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      throw new NotFound("User not found!");
    } else {
      if (!user.verificationCode) {
        user.verificationCode = Math.floor(100000 + Math.random() * 900000);
        await user.save();
      }
      sendVerificationCode(user.email, user.verificationCode);
      return res.status(200).json({
        success: true,
        message: `Verification code sent to ${user.email}`,
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      throw new NotFound("User not found!");
    } else if (user.verificationCode !== req.body.code) {
      throw new BadRequest("Invalid code");
    } else {
      user.verificationCode = null;
      user.isEmailVerified = true;
      await user.save();
      const token = user.createToken(); // new token with verification status updated
      return res.status(200).json({
        success: true,
        message: "Email verified successfully!",
        token,
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id, { password: 0 }).lean();

    if (!user) {
      throw new NotFound("User not found!");
    } else {
      return res.status(200).json({ success: true, user });
    }
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    return res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};
