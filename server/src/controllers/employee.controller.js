import { EmployeeService } from '../services/employee.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createEmployee = asyncHandler(async (req, res) => {
  const employee = await EmployeeService.createEmployee(req.body);
  res.status(201).json({
    success: true,
    message: 'Employee created successfully',
    data: employee
  });
});

export const getEmployees = asyncHandler(async (req, res) => {
  const result = await EmployeeService.getEmployees(req.query);
  res.status(200).json({
    success: true,
    data: result.employees,
    pagination: result.pagination
  });
});

export const getEmployeeById = asyncHandler(async (req, res) => {
  const result = await EmployeeService.getEmployeeById(req.params.id);
  res.status(200).json({
    success: true,
    data: result.employee,
    tasks: result.tasks
  });
});

export const updateEmployee = asyncHandler(async (req, res) => {
  const employee = await EmployeeService.updateEmployee(req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: 'Employee updated successfully',
    data: employee
  });
});

export const deleteEmployee = asyncHandler(async (req, res) => {
  const result = await EmployeeService.deleteEmployee(req.params.id);
  res.status(200).json({
    success: true,
    message: result.message
  });
});

export const getEmployeeOptions = asyncHandler(async (req, res) => {
  const options = await EmployeeService.getAssignableOptions();
  res.status(200).json({
    success: true,
    data: options
  });
});

