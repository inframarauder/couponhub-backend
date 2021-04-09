const router = require("express").Router();
const {
  createCoupon,
  listCoupons,
  buyCoupon,
  reportCoupon,
} = require("../controllers/CouponController");
const { isAuthenticated, isVerified } = require("../middlewares/auth");
const { filterCoupons } = require("../middlewares/filter");

/**
 * @route POST /api/coupons/create
 * @access only logged in and verified user
 * @body 'code','expiryDate','sourcePlatform','redeemPlatform','type','amount','title','description'
 */
router.post("/create", isAuthenticated, isVerified, createCoupon);

/**
 * @route GET /api/coupons/list
 * @access only logged in user
 *
 */
router.get("/list", isAuthenticated, filterCoupons, listCoupons);

/**
 * @route PUT /api/coupons/buy
 * @access only logged in and verified user
 * @body 'couponId'
 */
router.put("/buy", isAuthenticated, isVerified, buyCoupon);

/**
 * @route POST /api/coupons/report
 * @access only logged in and verified user
 * @body  'couponId','reason'
 */

router.post("/report", isAuthenticated, isVerified, reportCoupon);

module.exports = router;
