import { body, param, query } from 'express-validator';
import { DEPARTMENTS, EMPLOYEE_STATUSES } from '../utils/constants.js';
import { getTodayKolkataUtcMidnight, normalizeToUtcMidnight } from '../utils/dateUtils.js';

const phoneRegex = /^(?:(?:\+|0{0,2})91(\s*[-]\s*)?|[0]?)?[6789]\d{9}$|^(\+\d{1,3}[- ]?)?\d{10}$/;

export const validateEmployeeCreate = [
  body('employeeId')
    .trim()
    .notEmpty()
    .withMessage('Employee ID is required')
    .isLength({ min: 2, max: 20 })
    .withMessage('Employee ID must be between 2 and 20 characters')
    .customSanitizer((val) => (val ? val.toUpperCase() : val)),

  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 60 })
    .withMessage('Full name must be between 2 and 60 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail({ gmail_remove_dots: false }),

  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(phoneRegex)
    .withMessage('Please enter a valid 10-digit Indian mobile number or international phone number'),

  body('department')
    .trim()
    .notEmpty()
    .withMessage('Department is required')
    .isIn(DEPARTMENTS)
    .withMessage(`Department must be one of: ${DEPARTMENTS.join(', ')}`),

  body('role')
    .trim()
    .notEmpty()
    .withMessage('Role is required')
    .isLength({ min: 2, max: 80 })
    .withMessage('Role must be between 2 and 80 characters'),

  body('joiningDate')
    .notEmpty()
    .withMessage('Joining date is required')
    .isISO8601()
    .withMessage('Joining date must be a valid date (YYYY-MM-DD)')
    .custom((value) => {
      const today = getTodayKolkataUtcMidnight();
      const joining = normalizeToUtcMidnight(value);
      if (joining.getTime() > today.getTime()) {
        throw new Error('Joining date cannot be in the future');
      }
      return true;
    }),

  body('status')
    .optional()
    .trim()
    .isIn(Object.values(EMPLOYEE_STATUSES))
    .withMessage(`Status must be one of: ${Object.values(EMPLOYEE_STATUSES).join(', ')}`),

  body('skills')
    .optional()
    .customSanitizer((val) => {
      if (Array.isArray(val)) return val.map((s) => String(s).trim()).filter(Boolean);
      if (typeof val === 'string') {
        return val
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }
      return [];
    }),

  body('leaveStart')
    .custom((value, { req }) => {
      if (req.body.status === EMPLOYEE_STATUSES.ON_LEAVE) {
        if (!value) {
          throw new Error('Leave start date is required when status is On Leave');
        }
        if (isNaN(new Date(value).getTime())) {
          throw new Error('Leave start date must be a valid date');
        }
      }
      return true;
    }),

  body('leaveEnd')
    .custom((value, { req }) => {
      if (req.body.status === EMPLOYEE_STATUSES.ON_LEAVE) {
        if (!value) {
          throw new Error('Leave end date is required when status is On Leave');
        }
        if (isNaN(new Date(value).getTime())) {
          throw new Error('Leave end date must be a valid date');
        }
        const start = normalizeToUtcMidnight(req.body.leaveStart);
        const end = normalizeToUtcMidnight(value);
        if (start && end && end.getTime() < start.getTime()) {
          throw new Error('Leave end date must be on or after leave start date');
        }
      }
      return true;
    })
];

export const validateEmployeeUpdate = [
  param('id')
    .isMongoId()
    .withMessage('Invalid employee ID format'),

  body('fullName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Full name cannot be empty')
    .isLength({ min: 2, max: 60 })
    .withMessage('Full name must be between 2 and 60 characters'),

  body('email')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Email cannot be empty')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail({ gmail_remove_dots: false }),

  body('phone')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Phone cannot be empty')
    .matches(phoneRegex)
    .withMessage('Please enter a valid 10-digit Indian mobile number or international phone number'),

  body('department')
    .optional()
    .trim()
    .isIn(DEPARTMENTS)
    .withMessage(`Department must be one of: ${DEPARTMENTS.join(', ')}`),

  body('role')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Role cannot be empty')
    .isLength({ min: 2, max: 80 })
    .withMessage('Role must be between 2 and 80 characters'),

  body('joiningDate')
    .optional()
    .isISO8601()
    .withMessage('Joining date must be a valid date')
    .custom((value) => {
      const today = getTodayKolkataUtcMidnight();
      const joining = normalizeToUtcMidnight(value);
      if (joining.getTime() > today.getTime()) {
        throw new Error('Joining date cannot be in the future');
      }
      return true;
    }),

  body('status')
    .optional()
    .trim()
    .isIn(Object.values(EMPLOYEE_STATUSES))
    .withMessage(`Status must be one of: ${Object.values(EMPLOYEE_STATUSES).join(', ')}`),

  body('skills')
    .optional()
    .customSanitizer((val) => {
      if (Array.isArray(val)) return val.map((s) => String(s).trim()).filter(Boolean);
      if (typeof val === 'string') {
        return val
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }
      return [];
    }),

  body('leaveStart')
    .custom((value, { req }) => {
      if (req.body.status === EMPLOYEE_STATUSES.ON_LEAVE) {
        if (!value) {
          throw new Error('Leave start date is required when status is On Leave');
        }
      }
      return true;
    }),

  body('leaveEnd')
    .custom((value, { req }) => {
      if (req.body.status === EMPLOYEE_STATUSES.ON_LEAVE) {
        if (!value) {
          throw new Error('Leave end date is required when status is On Leave');
        }
        const start = normalizeToUtcMidnight(req.body.leaveStart);
        const end = normalizeToUtcMidnight(value);
        if (start && end && end.getTime() < start.getTime()) {
          throw new Error('Leave end date must be on or after leave start date');
        }
      }
      return true;
    })
];

export const validateEmployeeIdParam = [
  param('id')
    .isMongoId()
    .withMessage('Invalid employee ID format')
];

