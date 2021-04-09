const Coupon = require("../models/coupon.model");
const User = require("../models/user.model");
const { NotFound, BadRequest, Unauthorized } = require("../utils/error");
const { sendReportMail } = require("../utils/email");

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
    if (!couponId) {
      throw new BadRequest("Coupon ID must be provided in report");
    }
    if (!reason) {
      throw new BadRequest("You must specify a reason for the report");
    }

    const coupon = await Coupon.findById(couponId);

    if (!coupon) {
      throw new NotFound("Coupon not found");
    }

    if (coupon.soldTo !== req.user._id) {
      throw new BadRequest("You can only report coupons that belong to you");
    }

    const user = await User.findOneAndUpdate(
      { _id: coupon.postedBy },
      { $inc: { reports: 1, credits: -1 } },
      { new: true, runValidators: true }
    );

    await coupon.delete();

    sendReportMail(coupon, user, reason);

    return res
      .status(201)
      .json({ success: true, message: "Coupon reported successfully" });
  } catch (error) {
    next(error);
  }
};

exports.deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.couponId);
    if (coupon && coupon.postedBy === req.user._id) {
      await coupon.delete();
      return res.status(200).json({ success: true, message: "Coupon Deleted" });
    } else {
      throw new Unauthorized("You cant delete a coupon posted by someone else");
    }
  } catch (error) {
    next(error);
  }
};
