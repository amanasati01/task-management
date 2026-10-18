import { Router } from 'express';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
  exportTasksCsv
} from '../controllers/task.controller.js';
import {
  validateTaskCreate,
  validateTaskUpdate,
  validateTaskStatusUpdate,
  validateTaskIdParam
} from '../validators/task.validator.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get('/export', exportTasksCsv);

router
  .route('/')
  .post(validate(validateTaskCreate), createTask)
  .get(getTasks);

router
  .route('/:id')
  .get(validate(validateTaskIdParam), getTaskById)
  .put(validate(validateTaskUpdate), updateTask)
  .delete(validate(validateTaskIdParam), deleteTask);

router.put('/:id/status', validate(validateTaskStatusUpdate), updateTaskStatus);

export default router;
