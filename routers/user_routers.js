const express = require('express');
const router = express.Router();
const authControllers = require('../controllers/user_controller');
const { signupSchema, loginSchema } = require('../validator/auth_validator');
const validate = require('../middleware/validate_middleware');
const authMiddleware = require('../middleware/auth_middleware');

router.route("/register").post( authControllers.register);

router.route("/login").post(validate(loginSchema),authControllers.login);

router.route('/user').get( authMiddleware, authControllers.users);


module.exports = router;
