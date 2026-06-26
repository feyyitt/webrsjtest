/**
 * User Routes
 * Endpoint untuk user management (admin only)
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/role.middleware');

// Semua route butuh authentikasi dan role ADMIN
router.use(authenticate);
router.use(isAdmin);

/**
 * GET /api/users
 * Get all users with pagination and filters
 */
router.get('/', userController.getAllUsers);

/**
 * GET /api/users/:id
 * Get user by ID
 */
router.get('/:id', userController.getUserById);

/**
 * POST /api/users
 * Create new user
 */
router.post('/', userController.createUser);

/**
 * PUT /api/users/:id
 * Update user
 */
router.put('/:id', userController.updateUser);

/**
 * DELETE /api/users/:id
 * Delete user
 */
router.delete('/:id', userController.deleteUser);

/**
 * POST /api/users/:id/reset-password
 * Reset user password
 */
router.post('/:id/reset-password', userController.resetPassword);

module.exports = router;
