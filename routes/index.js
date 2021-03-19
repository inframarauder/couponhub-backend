const router = require("express").Router();
const userRoutes = require("./user.routes");
const couponRoutes = require("./coupon.routes");
const errorHandler = require("../middlewares/errorHandler");

//routes
router.use("/users", userRoutes);
router.use("/coupons", couponRoutes);

//general error handling middleware
router.use(errorHandler);
module.exports = router;
