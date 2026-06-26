/**
 * Auth Routes
 * Routing untuk authentication endpoints
 */

const express = require('express');
const authController = require('../controllers/auth.controller');
const { validateLogin } = require('../validators/auth.validator');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * POST /api/auth/login
 * Login user dengan username dan password
 */
router.post('/login', validateLogin, authController.login);

/**
 * GET /api/auth/me
 * Get current user profile (requires authentication)
 */
router.get('/me', authenticate, authController.me);

/**
 * POST /api/auth/change-password
 * Change password (requires authentication)
 */
router.post('/change-password', authenticate, authController.changePassword);

/**
 * PUT /api/auth/profile
 * Update profile (requires authentication)
 */
router.put('/profile', authenticate, authController.updateProfile);

module.exports = router;
