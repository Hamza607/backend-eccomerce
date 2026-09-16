const express = require("express");
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  loginLimiter,
} = require("../controllers/authController");
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const asynchandler = require("../utils/asyncHandler");
const {
  registerValidation,
  loginValidation,
  changePasswordValidation,
  updateProfileValidation,
} = require("../validations/AuthValidator");

const router = express.Router();

router.post("/register", registerValidation, validate, register);

router.post("/login", loginLimiter, loginValidation, validate, login);

router.get("/me", auth, asynchandler(getMe));

router.put(
  "/profile",
  auth,
  updateProfileValidation,
  asynchandler(updateProfile),
);

router.put(
  "/change-password",
  auth,
  changePasswordValidation,
  asynchandler(changePassword),
);

module.exports = router;
