import { Employee } from '../models/Employee.js';
import { Task } from '../models/Task.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { TASK_STATUSES, EMPLOYEE_STATUSES } from '../utils/constants.js';
import { getTodayKolkataUtcMidnight } from '../utils/dateUtils.js';

export const getDashboardStats = asyncHandler(async (req, res) => {
  const today = getTodayKolkataUtcMidnight();

  const [employeeAgg = {}] = await Employee.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: {
          $sum: { $cond: [{ $eq: ['$status', EMPLOYEE_STATUSES.ACTIVE] }, 1, 0] }
        },
        inactive: {
          $sum: { $cond: [{ $eq: ['$status', EMPLOYEE_STATUSES.INACTIVE] }, 1, 0] }
        },
        onLeave: {
          $sum: { $cond: [{ $eq: ['$status', EMPLOYEE_STATUSES.ON_LEAVE] }, 1, 0] }
        }
      }
    }
  ]);

  const employees = {
    total: employeeAgg.total || 0,
    active: employeeAgg.active || 0,
    inactive: employeeAgg.inactive || 0,
    onLeave: employeeAgg.onLeave || 0
  };

  const [taskAgg = {}] = await Task.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        todo: {
          $sum: { $cond: [{ $eq: ['$status', TASK_STATUSES.TODO] }, 1, 0] }
        },
        inProgress: {
          $sum: { $cond: [{ $eq: ['$status', TASK_STATUSES.IN_PROGRESS] }, 1, 0] }
        },
        completed: {
          $sum: { $cond: [{ $eq: ['$status', TASK_STATUSES.COMPLETED] }, 1, 0] }
        },
        cancelled: {
          $sum: { $cond: [{ $eq: ['$status', TASK_STATUSES.CANCELLED] }, 1, 0] }
        },
        overdue: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $lt: ['$dueDate', today] },
                  { $ne: ['$status', TASK_STATUSES.COMPLETED] },
                  { $ne: ['$status', TASK_STATUSES.CANCELLED] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    }
  ]);

  const tasks = {
    total: taskAgg.total || 0,
    todo: taskAgg.todo || 0,
    inProgress: taskAgg.inProgress || 0,
    completed: taskAgg.completed || 0,
    cancelled: taskAgg.cancelled || 0,
    overdue: taskAgg.overdue || 0
  };

  const workloadAgg = await Employee.aggregate([
    {
      $project: {
        _id: 1,
        employeeId: 1,
        fullName: 1,
        department: 1,
        role: 1,
        status: 1,
        activeTasks: '$activeTaskCount'
      }
    },
    {
      $sort: { activeTasks: -1, fullName: 1 }
    },
    {
      $limit: 15
    }
  ]);

  const workload = workloadAgg.map((emp) => ({
    employee: {
      _id: emp._id,
      employeeId: emp.employeeId,
      fullName: emp.fullName,
      department: emp.department,
      role: emp.role,
      status: emp.status
    },
    activeTasks: emp.activeTasks || 0
  }));

  res.status(200).json({
    success: true,
    data: {
      employees,
      tasks,
      workload
    }
  });
});
