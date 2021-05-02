const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/user.model");
const Token = require("../models/token.model");
const {
  BadRequest,
  NotFound,
  Unauthorized,
  Forbidden,
} = require("../utils/error");
const {
  sendVerificationCode,
  sendPasswordResetCode,
} = require("../utils/email");

exports.createUser = async (req, res, next) => {
  try {
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      throw new BadRequest("This email is already registered.Try logging in.");
    } else {
      user = await new User(req.body).save();
      const accessToken = user.createAccessToken();
      const refreshToken = await user.createRefreshToken();

      return res.status(201).json({ accessToken, refreshToken });
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
      } else if (user.blacklisted) {
        throw new Forbidden(
          "Your account has been blacklisted. Account access shall be restricted until further notice."
        );
      } else {
        let valid = await bcrypt.compare(password, user.password);
        if (valid) {
          const accessToken = user.createAccessToken();
          const refreshToken = await user.createRefreshToken();

          return res.status(201).json({ accessToken, refreshToken });
        } else {
          throw new Unauthorized("Incorrect password");
        }
      }
    }
  } catch (error) {
    next(error);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new BadRequest("Refresh token missing!");
    } else {
      const token = await Token.findOne({ token: refreshToken }).lean();
      if (token) {
        const payload = jwt.verify(
          token.token,
          process.env.REFRESH_TOKEN_SECRET
        );
        const user = await User.findById(payload._id);
        if (!user) {
          throw new NotFound("User not found");
        } else if (user.blacklisted) {
          throw new Forbidden("Account blacklisted");
        } else {
          const accessToken = user.createAccessToken();
          return res.status(200).json({ accessToken });
        }
      } else {
        throw new Unauthorized("Token expired!");
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
      sendVerificationCode(user.name, user.email, user.verificationCode);
      return res.status(200).json({
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
      const accessToken = user.createAccessToken(); // new token with verification status updated
      return res.status(200).json({
        message: "Email verified successfully!",
        accessToken,
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.googleAuth = async (req, res, next) => {
  try {
    const { tokenId } = req.body;
    if (!tokenId) {
      throw new BadRequest("Token Id missing for google auth");
    } else {
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
      const { payload } = await client.verifyIdToken({
        idToken: tokenId,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const { name, email } = payload;
      let user = await User.findOne({ email });
      if (user) {
        //user exists - login (check blacklist)
        if (user.blacklisted) {
          throw new Forbidden("Account blacklisted");
        }
      } else {
        //user does not exist - register new user
        user = await new User({ authType: "google", name, email }).save();
      }

      //generate tokens
      const accessToken = user.createAccessToken();
      const refreshToken = await user.createRefreshToken();
      return res.status(201).json({ accessToken, refreshToken });
    }
  } catch (error) {
    next(error);
  }
};

exports.sendPasswordResetEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw new BadRequest("Email must be provided");
    } else {
      let user = await User.findOne({ email });
      if (!user) {
        throw new NotFound("No user registered with this email!");
      } else {
        user.verificationCode = Math.floor(100000 + Math.random() * 900000);
        await user.save();
        sendPasswordResetCode(user, user.verificationCode);
        return res.status(200).json({
          message:
            "A verification code has been sent to your email. Please enter it here",
        });
      }
    }
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { email, password, code } = req.body;
    if (!email || !password || !code) {
      throw new BadRequest("Email,Password and Code must be provided!");
    } else {
      const user = await User.findOne({ email });
      if (user && user.verificationCode === parseInt(code)) {
        user.password = password;
        await user.save();
        return res.status(200).json({ message: "Password reset successfully" });
      } else {
        throw new BadRequest("Invalid code");
      }
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
      return res.status(200).json({ user });
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

exports.logoutUser = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    await Token.findOneAndDelete({ token: refreshToken });
    return res.status(200).json({ success: "User logged out!" });
  } catch (error) {
    next(error);
  }
};
