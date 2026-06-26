/**
 * Response Utility
 * Standarisasi format response JSON untuk semua API endpoint
 */

/**
 * Response success dengan data
 * @param {Object} res - Express response object
 * @param {*} data - Data yang akan dikirim
 * @param {String} message - Pesan sukses
 * @param {Number} statusCode - HTTP status code (default: 200)
 */
const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Response error
 * @param {Object} res - Express response object
 * @param {String} message - Pesan error
 * @param {Number} statusCode - HTTP status code (default: 400)
 * @param {Array} errors - Detail errors (optional)
 */
const sendError = (res, message = 'Error', statusCode = 400, errors = null) => {
  const response = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * Response untuk pagination
 * @param {Object} res - Express response object
 * @param {Array} data - Data array
 * @param {Object} pagination - Pagination info (page, limit, total, totalPages)
 * @param {String} message - Pesan sukses
 */
const sendPaginated = (res, data, pagination, message = 'Success') => {
  return res.status(200).json({
    success: true,
    message,
    data: {
      items: data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: pagination.totalPages,
      },
    },
  });
};

module.exports = {
  sendSuccess,
  sendError,
  sendPaginated,
};
