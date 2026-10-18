import { Task } from '../models/Task.js';
import { Employee } from '../models/Employee.js';
import { getNextTaskId } from '../models/Counter.js';
import { ApiError } from '../utils/ApiError.js';
import {
  TASK_STATUSES,
  ACTIVE_TASK_STATUSES,
  ALLOWED_STATUS_TRANSITIONS,
  MAX_ACTIVE_TASKS_PER_EMPLOYEE,
  EMPLOYEE_STATUSES,
  TASK_SORT_FIELDS,
  PAGINATION,
  PRIORITY_RANK
} from '../utils/constants.js';
import {
  normalizeToUtcMidnight,
  getTodayKolkataUtcMidnight,
  formatDateOnly
} from '../utils/dateUtils.js';

export class TaskService {
  static validateAssignmentRules(employee, startDate) {
    if (!employee) {
      throw ApiError.badRequest('Assigned employee does not exist');
    }

    if (employee.status === EMPLOYEE_STATUSES.INACTIVE) {
      throw ApiError.badRequest(`Cannot assign task: Employee "${employee.fullName}" is Inactive.`);
    }

    if (employee.status === EMPLOYEE_STATUSES.ON_LEAVE) {
      const taskStart = normalizeToUtcMidnight(startDate);
      const leaveStart = normalizeToUtcMidnight(employee.leaveStart);
      const leaveEnd = normalizeToUtcMidnight(employee.leaveEnd);

      if (
        leaveStart &&
        leaveEnd &&
        taskStart.getTime() >= leaveStart.getTime() &&
        taskStart.getTime() <= leaveEnd.getTime()
      ) {
        throw ApiError.badRequest(
          `Cannot assign task: Employee "${employee.fullName}" is on leave from ${formatDateOnly(
            leaveStart
          )} to ${formatDateOnly(leaveEnd)} (inclusive).`
        );
      }
    }
  }

  static async createTask(data) {
    delete data.status;
    delete data.completedDate;
    delete data.taskId;

    const startDate = normalizeToUtcMidnight(data.startDate);
    const dueDate = normalizeToUtcMidnight(data.dueDate);

    if (dueDate.getTime() < startDate.getTime()) {
      throw ApiError.badRequest('Due date must not be earlier than start date');
    }

    const employee = await Employee.findById(data.assignedEmployee);
    this.validateAssignmentRules(employee, startDate);

    const updatedEmployee = await Employee.findOneAndUpdate(
      {
        _id: employee._id,
        activeTaskCount: { $lt: MAX_ACTIVE_TASKS_PER_EMPLOYEE }
      },
      {
        $inc: { activeTaskCount: 1 }
      },
      { new: true }
    );

    if (!updatedEmployee) {
      throw ApiError.badRequest(
        `Employee "${employee.fullName}" already has ${MAX_ACTIVE_TASKS_PER_EMPLOYEE} active tasks. Please choose another employee.`
      );
    }

    try {
      const taskId = await getNextTaskId();

      const employeeSnapshot = {
        employeeId: employee.employeeId,
        fullName: employee.fullName,
        email: employee.email,
        department: employee.department,
        role: employee.role
      };

      const task = new Task({
        ...data,
        taskId,
        status: TASK_STATUSES.TODO,
        startDate,
        dueDate,
        employeeSnapshot,
        priorityRank: PRIORITY_RANK[data.priority] || 2
      });

      await task.save();
      return task;
    } catch (saveError) {
      await Employee.findByIdAndUpdate(employee._id, {
        $inc: { activeTaskCount: -1 }
      });
      throw saveError;
    }
  }

  static buildTaskFilter(queryParams) {
    const filter = {};
    const today = getTodayKolkataUtcMidnight();

    if (queryParams.search && queryParams.search.trim()) {
      const escaped = queryParams.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(escaped, 'i');
      filter.$or = [
        { title: searchRegex },
        { taskId: searchRegex },
        { 'employeeSnapshot.fullName': searchRegex }
      ];
    }

    if (queryParams.department && queryParams.department.trim()) {
      filter.department = queryParams.department.trim();
    }

    if (queryParams.priority && queryParams.priority.trim()) {
      filter.priority = queryParams.priority.trim();
    }

    if (queryParams.status && queryParams.status.trim()) {
      filter.status = queryParams.status.trim();
    }

    if (queryParams.isOverdue === 'true' || queryParams.overdue === 'true') {
      filter.dueDate = { $lt: today };
      filter.status = { $nin: [TASK_STATUSES.COMPLETED, TASK_STATUSES.CANCELLED] };
    }

    if (queryParams.dueFrom || queryParams.dueTo) {
      filter.dueDate = filter.dueDate || {};
      if (queryParams.dueFrom) {
        filter.dueDate.$gte = normalizeToUtcMidnight(queryParams.dueFrom);
      }
      if (queryParams.dueTo) {
        filter.dueDate.$lte = normalizeToUtcMidnight(queryParams.dueTo);
      }
    }

    return filter;
  }

  static async getTasks(queryParams) {
    const page = Math.max(1, parseInt(queryParams.page, 10) || PAGINATION.DEFAULT_PAGE);
    const limit = Math.min(
      PAGINATION.MAX_LIMIT,
      Math.max(1, parseInt(queryParams.limit, 10) || PAGINATION.DEFAULT_LIMIT)
    );
    const skip = (page - 1) * limit;

    const filter = this.buildTaskFilter(queryParams);

    const sortBy = TASK_SORT_FIELDS.includes(queryParams.sortBy)
      ? queryParams.sortBy
      : 'createdAt';
    const orderDirection = queryParams.order === 'asc' ? 1 : -1;

    let sortOptions = {};
    if (sortBy === 'priority') {
      sortOptions = { priorityRank: orderDirection, createdAt: -1 };
    } else {
      sortOptions = { [sortBy]: orderDirection };
    }

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .populate('assignedEmployee', 'fullName employeeId department status')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      Task.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  }

  static async getAllTasksForExport(queryParams) {
    const filter = this.buildTaskFilter(queryParams);
    return Task.find(filter)
      .populate('assignedEmployee', 'fullName employeeId department status')
      .sort({ createdAt: -1 });
  }

  static async getTaskById(id) {
    const task = await Task.findById(id).populate(
      'assignedEmployee',
      'fullName employeeId email department role status activeTaskCount'
    );
    if (!task) {
      throw ApiError.notFound(`Task not found with ID: ${id}`);
    }
    return task;
  }

  static async updateTask(id, data) {
    const task = await Task.findById(id);
    if (!task) {
      throw ApiError.notFound(`Task not found with ID: ${id}`);
    }

    if (
      task.status === TASK_STATUSES.COMPLETED ||
      task.status === TASK_STATUSES.CANCELLED
    ) {
      throw ApiError.badRequest(
        `Cannot edit task with status "${task.status}". Completed and Cancelled tasks are locked.`
      );
    }

    delete data.status;
    delete data.completedDate;
    delete data.taskId;

    const startDate = data.startDate
      ? normalizeToUtcMidnight(data.startDate)
      : task.startDate;
    const dueDate = data.dueDate
      ? normalizeToUtcMidnight(data.dueDate)
      : task.dueDate;

    if (dueDate.getTime() < startDate.getTime()) {
      throw ApiError.badRequest('Due date must not be earlier than start date');
    }

    const isReassigning =
      data.assignedEmployee &&
      data.assignedEmployee.toString() !== task.assignedEmployee.toString();

    if (isReassigning) {
      const newEmployee = await Employee.findById(data.assignedEmployee);
      this.validateAssignmentRules(newEmployee, startDate);

      const updatedNewEmp = await Employee.findOneAndUpdate(
        {
          _id: newEmployee._id,
          activeTaskCount: { $lt: MAX_ACTIVE_TASKS_PER_EMPLOYEE }
        },
        { $inc: { activeTaskCount: 1 } },
        { new: true }
      );

      if (!updatedNewEmp) {
        throw ApiError.badRequest(
          `Employee "${newEmployee.fullName}" already has ${MAX_ACTIVE_TASKS_PER_EMPLOYEE} active tasks. Please choose another employee.`
        );
      }

      await Employee.findByIdAndUpdate(task.assignedEmployee, {
        $inc: { activeTaskCount: -1 }
      });

      task.employeeSnapshot = {
        employeeId: newEmployee.employeeId,
        fullName: newEmployee.fullName,
        email: newEmployee.email,
        department: newEmployee.department,
        role: newEmployee.role
      };
      task.assignedEmployee = newEmployee._id;
    } else {
      const currentEmployee = await Employee.findById(task.assignedEmployee);
      if (currentEmployee) {
        this.validateAssignmentRules(currentEmployee, startDate);
      }
    }

    if (data.title) task.title = data.title;
    if (data.description !== undefined) task.description = data.description;
    if (data.department) task.department = data.department;
    if (data.priority) {
      task.priority = data.priority;
      task.priorityRank = PRIORITY_RANK[data.priority] || 2;
    }
    task.startDate = startDate;
    task.dueDate = dueDate;

    await task.save();
    return task;
  }

  static async updateTaskStatus(id, newStatus) {
    const task = await Task.findById(id);
    if (!task) {
      throw ApiError.notFound(`Task not found with ID: ${id}`);
    }

    const currentStatus = task.status;
    const allowedTransitions = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];

    if (!allowedTransitions.includes(newStatus)) {
      throw ApiError.badRequest(
        `Invalid status change from "${currentStatus}" to "${newStatus}". Allowed transitions: ${
          allowedTransitions.length > 0 ? allowedTransitions.join(', ') : 'None (Terminal state)'
        }`
      );
    }

    const wasActive = ACTIVE_TASK_STATUSES.includes(currentStatus);
    const becomesTerminal =
      newStatus === TASK_STATUSES.COMPLETED || newStatus === TASK_STATUSES.CANCELLED;

    if (wasActive && becomesTerminal) {
      await Employee.findByIdAndUpdate(task.assignedEmployee, {
        $inc: { activeTaskCount: -1 }
      });
    }

    if (newStatus === TASK_STATUSES.COMPLETED) {
      task.completedDate = new Date();
    }

    task.status = newStatus;
    await task.save();
    return task;
  }

  static async deleteTask(id) {
    const task = await Task.findById(id);
    if (!task) {
      throw ApiError.notFound(`Task not found with ID: ${id}`);
    }

    if (ACTIVE_TASK_STATUSES.includes(task.status)) {
      await Employee.findByIdAndUpdate(task.assignedEmployee, {
        $inc: { activeTaskCount: -1 }
      });
    }

    await Task.findByIdAndDelete(id);

    return {
      message: `Task "${task.taskId}" deleted successfully.`
    };
  }
}
