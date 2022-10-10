const express = require("express");
const {
  registeUser,
  verify,
  login,
  logout,
  addtask,
  removetask,
  updatetask,
  getMyProfile,
  updateProfile,
  updatePassword,
  forgotPassword,
  resetPassword,
  
} = require("../controllers/usercontroller");
const { isAuthenticated, isauthverifyed } = require("../middleware/auth");

const router = express.Router();
router.route("/register").post(registeUser);
router.route("/verify").post(isAuthenticated, verify); // first check user is present or not.
router.route("/login").post(login);
router.route("/logout").get(logout);

router.route("/newtask").post(isAuthenticated, addtask);
router
  .route("/task/:taskId")
  .get(isAuthenticated, updatetask)
  .delete(isAuthenticated, removetask);

router.route("/newtask").post(isAuthenticated, addtask);

router.route("/me").get(isAuthenticated, getMyProfile);
router.route("/updateprofile").put(isAuthenticated, updateProfile);
router.route("/updatepassword").put(isAuthenticated, updatePassword);
router.route("/forgotpassword").post(forgotPassword);
router.route("/resetpassword").put(resetPassword);

module.exports = router;
