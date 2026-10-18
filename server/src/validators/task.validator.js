import { body, param } from 'express-validator';
import { DEPARTMENTS, TASK_PRIORITIES, TASK_STATUSES } from '../utils/constants.js';
import { normalizeToUtcMidnight } from '../utils/dateUtils.js';

export const validateTaskCreate = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),

  body('assignedEmployee')
    .notEmpty()
    .withMessage('Assigned employee is required')
    .isMongoId()
    .withMessage('Invalid assigned employee ID'),

  body('department')
    .trim()
    .notEmpty()
    .withMessage('Department is required')
    .isIn(DEPARTMENTS)
    .withMessage(`Department must be one of: ${DEPARTMENTS.join(', ')}`),

  body('priority')
    .trim()
    .notEmpty()
    .withMessage('Priority is required')
    .isIn(Object.values(TASK_PRIORITIES))
    .withMessage(`Priority must be one of: ${Object.values(TASK_PRIORITIES).join(', ')}`),

  body('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Start date must be a valid date (YYYY-MM-DD)'),

  body('dueDate')
    .notEmpty()
    .withMessage('Due date is required')
    .isISO8601()
    .withMessage('Due date must be a valid date (YYYY-MM-DD)')
    .custom((value, { req }) => {
      const start = normalizeToUtcMidnight(req.body.startDate);
      const due = normalizeToUtcMidnight(value);
      if (start && due && due.getTime() < start.getTime()) {
        throw new Error('Due date must not be earlier than start date');
      }
      return true;
    }),

  body('status')
    .custom((val) => {
      if (val !== undefined && val !== TASK_STATUSES.TODO) {
        throw new Error('New tasks always start with Todo status. Status cannot be set during creation.');
      }
      return true;
    })
];

export const validateTaskUpdate = [
  param('id')
    .isMongoId()
    .withMessage('Invalid task ID format'),

  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),

  body('assignedEmployee')
    .optional()
    .isMongoId()
    .withMessage('Invalid assigned employee ID'),

  body('department')
    .optional()
    .trim()
    .isIn(DEPARTMENTS)
    .withMessage(`Department must be one of: ${DEPARTMENTS.join(', ')}`),

  body('priority')
    .optional()
    .trim()
    .isIn(Object.values(TASK_PRIORITIES))
    .withMessage(`Priority must be one of: ${Object.values(TASK_PRIORITIES).join(', ')}`),

  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),

  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date')
    .custom((value, { req }) => {
      const startDate = req.body.startDate;
      if (startDate) {
        const start = normalizeToUtcMidnight(startDate);
        const due = normalizeToUtcMidnight(value);
        if (start && due && due.getTime() < start.getTime()) {
          throw new Error('Due date must not be earlier than start date');
        }
      }
      return true;
    }),

  body('status')
    .custom((val) => {
      if (val !== undefined) {
        throw new Error('Status can ONLY change through PUT /api/tasks/:id/status');
      }
      return true;
    })
];

export const validateTaskStatusUpdate = [
  param('id')
    .isMongoId()
    .withMessage('Invalid task ID format'),

  body('status')
    .trim()
    .notEmpty()
    .withMessage('Status is required')
    .isIn(Object.values(TASK_STATUSES))
    .withMessage(`Status must be one of: ${Object.values(TASK_STATUSES).join(', ')}`)
];

export const validateTaskIdParam = [
  param('id')
    .isMongoId()
    .withMessage('Invalid task ID format')
];
