const router = require("express").Router();
const {
  createUser,
  verifyEmail,
  loginUser,
  getUserProfile,
  deleteUser,
  sendVerificationEmail,
} = require("../controllers/UserController");

const { isAuthenticated } = require("../middlewares/auth");

/**
 * @route POST /api/users/signup
 * @access 'public'
 * @body - 'name','email','password'
 */
router.post("/signup", createUser);

/**
 * @route PUT /api/users/send_verification_email
 * @access 'logged in user'
 */
router.put("/send_verification_mail", isAuthenticated, sendVerificationEmail);

/**
 * @route PUT /api/users/verify_email
 * @access 'logged in user'
 * @body - 'code'
 */
router.put("/verify_email", isAuthenticated, verifyEmail);

/**
 * @route POST /api/users/login
 * @access 'public'
 * @body -'email','password'
 */

router.post("/login", loginUser);

/**
 * @route GET /api/users/profile
 * @access 'logged in user'
 * @params 'userId'
 */
router.get("/profile/:userId", isAuthenticated, getUserProfile);

/**
 * @route DELETE /api/users/delete
 * @access 'logged in user'
 */
router.delete("/delete", isAuthenticated, deleteUser);

module.exports = router;
