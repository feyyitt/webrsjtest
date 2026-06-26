/**
 * User Service
 * Business logic untuk user management (admin only)
 */

const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const { v4: uuidv4 } = require('uuid');

/**
 * Get all users with pagination
 * @param {Object} params - Query parameters (page, limit, search, role)
 * @returns {Object} Users list with pagination
 */
const getAllUsers = async (params) => {
  const { page = 1, limit = 10, search = '', role = '' } = params;
  const skip = (page - 1) * limit;

  const where = {
    AND: [
      search ? {
        OR: [
          { username: { contains: search, mode: 'insensitive' } },
          { nama: { contains: search, mode: 'insensitive' } },
        ],
      } : {},
      role ? { role } : {},
    ],
  };

  const [users, total] = await Promise.all([
    prisma.users.findMany({
      where,
      skip,
      take: Number(limit),
      select: {
        id: true,
        username: true,
        nama: true,
        role: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    }),
    prisma.users.count({ where }),
  ]);

  return {
    items: users,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
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

  return user;
};

/**
 * Create new user
 * @param {Object} data - User data (username, password, nama, role)
 * @returns {Object} Created user
 */
const createUser = async (data) => {
  const { username, password, nama, role } = data;

  // Check if username already exists
  const existingUser = await prisma.users.findUnique({
    where: { username },
  });

  if (existingUser) {
    throw new Error('Username sudah digunakan');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.users.create({
    data: {
      id: uuidv4(),
      username,
      password: hashedPassword,
      nama,
      role,
      is_active: true,
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

/**
 * Update user
 * @param {string} userId - User ID
 * @param {Object} data - Update data (username, nama, role, is_active)
 * @returns {Object} Updated user
 */
const updateUser = async (userId, data) => {
  const { username, nama, role, is_active } = data;

  // Check if user exists
  const existingUser = await prisma.users.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    throw new Error('User tidak ditemukan');
  }

  // If username changed, check if new username is available
  if (username && username !== existingUser.username) {
    const usernameExists = await prisma.users.findUnique({
      where: { username },
    });

    if (usernameExists) {
      throw new Error('Username sudah digunakan');
    }
  }

  // Update user
  const user = await prisma.users.update({
    where: { id: userId },
    data: {
      username: username || existingUser.username,
      nama: nama || existingUser.nama,
      role: role || existingUser.role,
      is_active: is_active !== undefined ? is_active : existingUser.is_active,
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

/**
 * Delete user
 * @param {string} userId - User ID
 * @returns {Object} Success message
 */
const deleteUser = async (userId) => {
  // Check if user exists
  const user = await prisma.users.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User tidak ditemukan');
  }

  // Delete user (or deactivate)
  await prisma.users.delete({
    where: { id: userId },
  });

  return {
    message: 'User berhasil dihapus',
  };
};

/**
 * Reset user password
 * @param {string} userId - User ID
 * @param {string} newPassword - New password
 * @returns {Object} Success message
 */
const resetPassword = async (userId, newPassword) => {
  // Check if user exists
  const user = await prisma.users.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User tidak ditemukan');
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
    message: 'Password berhasil direset',
  };
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  resetPassword,
};

