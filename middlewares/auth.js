const jwt = require("jsonwebtoken");

// check if user is authenticated.
exports.isAuthenticated = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(403).json({ error: "User not authorized!" });
  }
  let token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(403).json({ error: "Access denied, no token provided!" });
  } else {
    try {
      const { JWT_PRIVATE_KEY } = process.env;
      const payload = jwt.verify(token, JWT_PRIVATE_KEY);
      req.user = payload.user;
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ error: "Session timed out,please login again" });
      } else if (error.name === "JsonWebTokenError") {
        return res
          .status(401)
          .json({ error: "Invalid token,please login again!" });
      } else {
        console.error(error);
        return res.status(400).json({ error });
      }
    }
  }
};

//check if user is email verified

exports.isVerified = (req, res, next) => {
  const { user } = req;
  if (user.isEmailVerified) {
    next();
  } else {
    return res
      .status(403)
      .json({ error: "Please verify your email to perform this action!" });
  }
};
