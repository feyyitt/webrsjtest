/**
 * Auth Service
 * Business logic untuk authentication
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const config = require('../config/env');

/**
 * Login user
 * @param {string} username - Username
 * @param {string} password - Password
 * @returns {Object} User data dan token
 */
const login = async (username, password) => {
  // Cari user berdasarkan username
  const user = await prisma.users.findUnique({
    where: { username },
  });

  // Validasi user exist
  if (!user) {
    throw new Error('Username atau password salah');
  }

  // Validasi user active
  if (!user.is_active) {
    throw new Error('Akun tidak aktif');
  }

  // Validasi password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  
  if (!isPasswordValid) {
    throw new Error('Username atau password salah');
  }

  // Generate JWT token
  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
    },
    config.jwtSecret,
    {
      expiresIn: config.jwtExpiresIn,
    }
  );

  // Return user data tanpa password
  const { password: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    token,
  };
};

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Object} User data
 */
const getUserById = async (userId) => {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      nama: true,
      role: true,
      is_active: true,
      created_at: true,
      updated_at: true,
    },
  });

  if (!user) {
    throw new Error('User tidak ditemukan');
  }

  if (!user.is_active) {
    throw new Error('Akun tidak aktif');
  }

  return user;
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token sudah kadaluarsa');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Token tidak valid');
    }
    throw error;
  }
};

/**
 * Change Password
 * @param {string} userId - User ID
 * @param {string} oldPassword - Old password
 * @param {string} newPassword - New password
 * @returns {Object} Success message
 */
const changePassword = async (userId, oldPassword, newPassword) => {
  // Get user with password
  const user = await prisma.users.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User tidak ditemukan');
  }

  // Verify old password
  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
  if (!isPasswordValid) {
    throw new Error('Password lama tidak sesuai');
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password
  await prisma.users.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
      updated_at: new Date(),
    },
  });

  return {
    message: 'Password berhasil diubah',
  };
};

/**
 * Update Profile (nama only - username/role controlled by admin)
 * @param {string} userId - User ID
 * @param {string} nama - New name
 * @returns {Object} Updated user data
 */
const updateProfile = async (userId, nama) => {
  const user = await prisma.users.update({
    where: { id: userId },
    data: {
      nama,
      updated_at: new Date(),
    },
    select: {
      id: true,
      username: true,
      nama: true,
      role: true,
      is_active: true,
      created_at: true,
      updated_at: true,
    },
  });

  return user;
};

module.exports = {
  login,
  getUserById,
  verifyToken,
  changePassword,
  updateProfile,
};
