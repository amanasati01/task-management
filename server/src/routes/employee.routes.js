import { Router } from 'express';
import {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getEmployeeOptions
} from '../controllers/employee.controller.js';
import {
  validateEmployeeCreate,
  validateEmployeeUpdate,
  validateEmployeeIdParam
} from '../validators/employee.validator.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get('/options', getEmployeeOptions);

router
  .route('/')
  .post(validate(validateEmployeeCreate), createEmployee)
  .get(getEmployees);

router
  .route('/:id')
  .get(validate(validateEmployeeIdParam), getEmployeeById)
  .put(validate(validateEmployeeUpdate), updateEmployee)
  .delete(validate(validateEmployeeIdParam), deleteEmployee);

export default router;

