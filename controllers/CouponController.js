const Coupon = require("../models/coupon.model");
const User = require("../models/user.model");
const Report = require("../models/report.model");
const { NotFound, BadRequest } = require("../utils/error");

exports.createCoupon = async (req, res, next) => {
  try {
    //create new coupon
    await new Coupon({
      ...req.body,
      postedBy: req.user._id,
    }).save();

    //increase user credits by 1
    await User.findByIdAndUpdate(req.user._id, { $inc: { credits: 1 } });

    //send response
    return res.status(201).json({
      success: true,
      message: "Coupon created successfully , 1 credit added to your account!",
    });
  } catch (error) {
    next(error);
  }
};

exports.listCoupons = async (req, res, next) => {
  try {
    const { query, projection } = res.locals;
    const coupons = await Coupon.find(query, projection)
      .populate({ path: "postedBy", select: ["name", "email"] })
      .lean()
      .sort({ _id: -1 });

    return res.status(200).json({ success: true, data: coupons });
  } catch (error) {
    next(error);
  }
};

exports.buyCoupon = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    //buy coupon if user has greater than 0 credits
    if (user.credits > 0) {
      //buy coupon if found

      const { couponId } = req.body;
      if (!couponId) {
        throw new BadRequest("Coupon ID must be provided");
      } else {
        const coupon = await Coupon.findById(couponId);
        if (!coupon) {
          throw new NotFound("Coupon not found!");
        } else if (coupon.status !== "available") {
          throw new BadRequest("Coupon not available for purchase");
        } else if (coupon.postedBy === req.user._id) {
          throw new BadRequest(
            "You cannot buy coupons posted from your account"
          );
        } else {
          //update coupon status
          coupon.status = "sold";
          coupon.soldTo = req.user._id;
          await coupon.save();

          //update user credits
          user.credits -= 1;
          await user.save();

          return res.status(200).json({
            success: true,
            data: { coupon },
          });
        }
      }
    } else {
      throw new BadRequest("Insufficient credits to buy coupon!");
    }
  } catch (error) {
    next(error);
  }
};

exports.reportCoupon = async (req, res, next) => {
  try {
    const { couponId, reason } = req.body;
    await new Report({ couponId, reason }).save();

    const coupon = await Coupon.findById(couponId).lean();
    await User.findByIdAndUpdate(
      coupon.postedBy,
      { $inc: { reports: 1, credits: -1 } },
      { new: true, runValidators: true }
    );

    sendReportMail(report, user);

    return res
      .status(201)
      .json({ success: true, message: "Coupon reported successfully" });
  } catch (error) {
    next(error);
  }
};
