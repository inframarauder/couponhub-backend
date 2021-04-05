exports.filterCoupons = (req, res, next) => {
  const { status, searchText, type, postedBy } = req.query;

  let mongoQuery = {
    status: "available",
    expiryDate: { $gte: new Date() },
  };
  let mongoProjection = {
    code: 0,
  };

  if (status && status === "sold") {
    mongoQuery["status"] = status;
    mongoQuery["soldTo"] = req.user._id;
    delete mongoProjection["code"];
  }

  if (searchText) {
    let regexQuery = { $regex: searchText, $options: "i" };
    mongoQuery["$or"] = [
      { redeemPlatform: regexQuery },
      { title: regexQuery },
      { description: regexQuery },
      { sourcePlatform: regexQuery },
    ];
  }

  if (type) {
    if (type !== "all") {
      mongoQuery["type"] = type;
    }
  }

  res.locals.query = mongoQuery;
  res.locals.projection = mongoProjection;

  next();
};
