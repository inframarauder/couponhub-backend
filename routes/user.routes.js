const router = require("express").Router();
const {
  createUser,
  verifyEmail,
  loginUser,
  getUserProfile,
  deleteUser,
  sendVerificationEmail,
  refreshToken,
  logoutUser,
  googleAuth,
  sendPasswordResetEmail,
  resetPassword,
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
 * @route POST /api/users/google_auth
 * @access 'public',
 * @body 'tokenId'
 */
router.post("/google_auth", googleAuth);

/**
 * @route POST /api/users/send_password_reset_mail
 * @access 'public'
 * @body 'email'
 */

router.post("/send_password_reset_mail", sendPasswordResetEmail);

/**
 * @route PUT /api/users/reset_password
 * @access 'public'
 * @body 'email','password','code'
 */

router.put("/reset_password", resetPassword);

/**
 * @route POST /api/users/refresh_token
 * @access 'public'
 * @body 'refreshToken'
 */

router.post("/refresh_token", refreshToken);

/**
 * @route GET /api/users/profile
 * @access 'logged in user'
 */
router.get("/profile", isAuthenticated, getUserProfile);

/**
 * @route DELETE /api/users/delete
 * @access 'logged in user'
 */
router.delete("/delete", isAuthenticated, deleteUser);

/**
 * @route DELETE /api/users/logout
 * @access 'logged in user'
 * @body 'refreshToken'
 */
router.delete("/logout", isAuthenticated, logoutUser);

module.exports = router;
