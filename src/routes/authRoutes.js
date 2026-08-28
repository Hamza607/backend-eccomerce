const express = require("express");
const { register, login, getMe } = require("../controllers/authController");
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  registerValidation,
  loginValidation,
} = require("../validations/AuthValidator");

const router = express.Router();

router.post("/register", registerValidation, validate, register);

router.post("/login", loginValidation, validate, login);

router.get("/me", auth, getMe);

module.exports = router;
