import { Employee } from '../models/Employee.js';
import { Task } from '../models/Task.js';
import { ApiError } from '../utils/ApiError.js';
import {
  EMPLOYEE_STATUSES,
  ACTIVE_TASK_STATUSES,
  EMPLOYEE_SORT_FIELDS,
  PAGINATION
} from '../utils/constants.js';

export class EmployeeService {
  static async createEmployee(data) {
    const { activeTaskCount, ...cleanData } = data;

    const employee = new Employee({
      ...cleanData,
      activeTaskCount: 0
    });

    await employee.save();
    return employee;
  }

  static async getEmployees(query) {
    const page = Math.max(1, parseInt(query.page, 10) || PAGINATION.DEFAULT_PAGE);
    const limit = Math.min(
      PAGINATION.MAX_LIMIT,
      Math.max(1, parseInt(query.limit, 10) || PAGINATION.DEFAULT_LIMIT)
    );
    const skip = (page - 1) * limit;

    const filter = {};

    if (query.search && query.search.trim()) {
      const escaped = query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(escaped, 'i');
      filter.$or = [
        { fullName: searchRegex },
        { employeeId: searchRegex },
        { email: searchRegex },
        { role: searchRegex }
      ];
    }

    if (query.department && query.department.trim()) {
      filter.department = query.department.trim();
    }

    if (query.status && query.status.trim()) {
      filter.status = query.status.trim();
    }

    const sortBy = EMPLOYEE_SORT_FIELDS.includes(query.sortBy) ? query.sortBy : 'createdAt';
    const sortOrder = query.order === 'asc' ? 1 : -1;
    const sortOptions = { [sortBy]: sortOrder };

    const [employees, total] = await Promise.all([
      Employee.find(filter).sort(sortOptions).skip(skip).limit(limit),
      Employee.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      employees,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  }

  static async getEmployeeById(id) {
    const employee = await Employee.findById(id);
    if (!employee) {
      throw ApiError.notFound(`Employee not found with ID: ${id}`);
    }

    const tasks = await Task.find({ assignedEmployee: id }).sort({ createdAt: -1 });

    return {
      employee,
      tasks
    };
  }

  static async updateEmployee(id, data) {
    const employee = await Employee.findById(id);
    if (!employee) {
      throw ApiError.notFound(`Employee not found with ID: ${id}`);
    }

    delete data.employeeId;
    delete data.activeTaskCount;

    Object.keys(data).forEach((key) => {
      employee[key] = data[key];
    });

    await employee.save();
    return employee;
  }

  static async deleteEmployee(id) {
    const employee = await Employee.findById(id);
    if (!employee) {
      throw ApiError.notFound(`Employee not found with ID: ${id}`);
    }

    const activeTasksCount = await Task.countDocuments({
      assignedEmployee: id,
      status: { $in: ACTIVE_TASK_STATUSES }
    });

    if (activeTasksCount > 0 || employee.activeTaskCount > 0) {
      throw ApiError.badRequest(
        `Cannot delete employee "${employee.fullName}" with ${activeTasksCount} active task(s). Please reassign or complete their tasks first.`
      );
    }

    await Employee.findByIdAndDelete(id);

    return {
      message: `Employee "${employee.fullName}" deleted successfully.`
    };
  }

  static async getAssignableOptions() {
    return Employee.find(
      { status: { $in: [EMPLOYEE_STATUSES.ACTIVE, EMPLOYEE_STATUSES.ON_LEAVE] } },
      '_id employeeId fullName department role status activeTaskCount leaveStart leaveEnd'
    ).sort({ fullName: 1 });
  }
}
