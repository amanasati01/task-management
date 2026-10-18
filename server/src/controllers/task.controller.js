import { TaskService } from '../services/task.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { tasksToCsv } from '../utils/csv.js';

export const createTask = asyncHandler(async (req, res) => {
  const task = await TaskService.createTask(req.body);
  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: task
  });
});

export const getTasks = asyncHandler(async (req, res) => {
  const result = await TaskService.getTasks(req.query);
  res.status(200).json({
    success: true,
    data: result.tasks,
    pagination: result.pagination
  });
});

export const getTaskById = asyncHandler(async (req, res) => {
  const task = await TaskService.getTaskById(req.params.id);
  res.status(200).json({
    success: true,
    data: task
  });
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await TaskService.updateTask(req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: 'Task updated successfully',
    data: task
  });
});

export const updateTaskStatus = asyncHandler(async (req, res) => {
  const task = await TaskService.updateTaskStatus(req.params.id, req.body.status);
  res.status(200).json({
    success: true,
    message: `Task status updated to ${req.body.status}`,
    data: task
  });
});

export const deleteTask = asyncHandler(async (req, res) => {
  const result = await TaskService.deleteTask(req.params.id);
  res.status(200).json({
    success: true,
    message: result.message
  });
});

export const exportTasksCsv = asyncHandler(async (req, res) => {
  const tasks = await TaskService.getAllTasksForExport(req.query);
  const csvContent = tasksToCsv(tasks);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="tasks-export.csv"');
  return res.status(200).send(csvContent);
});

