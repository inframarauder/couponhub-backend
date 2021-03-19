const { GeneralError } = require("../utils/error");

module.exports = (err, req, res, next) => {
  if (err instanceof GeneralError) {
    const code = err.getCode();
    return res.status(code).json({
      error: err.message,
    });
  } else {
    console.error(`Error in ${req.method} ${req.originalUrl}\n`, err);
    return res.status(500).json({
      error: "Internal Server Error!",
    });
  }
};
