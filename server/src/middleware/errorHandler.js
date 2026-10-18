import { ApiError } from '../utils/ApiError.js';
import { ENV } from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errors = err.errors || [];

  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern || err.keyValue || {})[0];
    if (field === 'employeeId') {
      message = 'Employee ID already exists. Please use a unique Employee ID.';
    } else if (field === 'email') {
      message = 'An employee with this email address already exists.';
    } else if (field === 'taskId') {
      message = 'Task ID collision detected. Please retry.';
    } else {
      message = `Duplicate value entered for ${field}.`;
    }
    errors = [{ field, message }];
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ID format: ${err.value}`;
    errors = [{ field: err.path, message: `Invalid identifier format: ${err.value}` }];
  }

  if (err.name === 'ValidationError') {
    statusCode = 400;
    const validationErrors = Object.values(err.errors).map((item) => ({
      field: item.path,
      message: item.message
    }));
    message = validationErrors[0]?.message || 'Validation failed';
    errors = validationErrors;
  }

  if (ENV.NODE_ENV === 'development' && statusCode === 500) {
    console.error('[Unhandled Server Error]', err);
  }

  const response = {
    success: false,
    message
  };

  if (errors && errors.length > 0) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};
