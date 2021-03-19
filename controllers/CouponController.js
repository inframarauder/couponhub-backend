const Coupon = require("../models/coupon.model");
const User = require("../models/user.model");
const Joi = require("joi");
const validate = require("../utils/validate");
const { NotFound, BadRequest } = require("../utils/error");

exports.createCoupon = async (req, res, next) => {
  try {
    const schema = Joi.object({
      code: Joi.string().required(),
      expiryDate: Joi.date().required().greater("now"),
      sourcePlatform: Joi.string().required(),
      redeemPlatform: Joi.string().required(),
      type: Joi.string().required().valid("percentage", "flat", "free"),
      amount: Joi.when("type", [
        {
          is: "percentage",
          then: Joi.number().required().min(0).max(100),
        },
        {
          is: "flat",
          then: Joi.number().required().min(0),
        },
      ]),
      title: Joi.string().required().max(100),
      description: Joi.string().required(),
    });

    const isValid = validate(schema, req.body);
    if (isValid) {
      //create new coupon
      await new Coupon({
        ...req.body,
        postedBy: req.user._id,
      }).save();

      //increase user credits by 1
      await User.findByIdAndUpdate(req.user._id, { $inc: { credits: 1 } });

      //send response
      return res.status(201).json({
        message:
          "Coupon created successfully , 1 credit added to your account!",
      });
    }
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

    return res.status(200).json(coupons);
  } catch (error) {
    next(error);
  }
};

exports.buyCoupon = async (req, res, next) => {
  try {
    const schema = Joi.object({
      couponId: Joi.string().required(),
    });
    const isValid = validate(schema, req.body);
    if (isValid) {
      //check if user has atleast 1 credit:
      const user = await User.findById(req.user._id);

      //buy coupon if user has greater than 0 credits
      if (user.credits > 0) {
        //buy coupon if found

        const { couponId } = req.body;
        const coupon = await Coupon.findOneAndUpdate(
          {
            _id: couponId,
            status: "available",
            postedBy: { $ne: req.user._id }, // you cannot buy coupons posted by you
          },
          { status: "sold", soldTo: req.user._id },
          { new: true, runValidators: true }
        ).lean();

        if (coupon) {
          //deduct 1 credit from user
          user.credits -= 1;
          await user.save();

          //send response
          return res.status(200).json({
            code: coupon.code,
          });
        } else {
          throw new NotFound("Coupon not found!");
        }
      } else {
        throw new BadRequest("Insufficient credits to buy coupon!");
      }
    }
  } catch (error) {
    next(error);
  }
};
