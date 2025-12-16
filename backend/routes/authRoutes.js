const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Register route
router.post('/register', [
  check('username', 'Username is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password must be at least 6 characters').isLength({ min: 6 })
], authController.register);

// Login route
router.post('/login', [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
], authController.login);

// Get current user
router.get('/me', auth, authController.getCurrentUser);

// Update profile
router.put('/profile', auth, authController.updateProfile);

// Logout
router.post('/logout', auth, authController.logout);

module.exports = router;