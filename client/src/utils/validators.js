import { EMPLOYEE_STATUSES } from './constants.js';

export const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validatePhone = (phone) => {
  return /^(?:(?:\+|0{0,2})91(\s*[-]\s*)?|[0]?)?[6789]\d{9}$|^(\+\d{1,3}[- ]?)?\d{10}$/.test(
    phone.trim()
  );
};

export const validateEmployeeForm = (form) => {
  const errors = {};

  if (!form.employeeId || !form.employeeId.trim()) {
    errors.employeeId = 'Employee ID is required (e.g. EMP-001)';
  }

  if (!form.fullName || form.fullName.trim().length < 2) {
    errors.fullName = 'Full Name must be at least 2 characters';
  } else if (form.fullName.trim().length > 60) {
    errors.fullName = 'Full Name cannot exceed 60 characters';
  }

  if (!form.email || !validateEmail(form.email)) {
    errors.email = 'Please provide a valid email address';
  }

  if (!form.phone || !validatePhone(form.phone)) {
    errors.phone = 'Valid 10-digit Indian or international phone number required';
  }

  if (!form.department) {
    errors.department = 'Department is required';
  }

  if (!form.role || !form.role.trim()) {
    errors.role = 'Role is required';
  }

  if (!form.joiningDate) {
    errors.joiningDate = 'Joining date is required';
  } else {
    const today = new Date().toISOString().split('T')[0];
    if (form.joiningDate > today) {
      errors.joiningDate = 'Joining date cannot be in the future';
    }
  }

  if (form.status === EMPLOYEE_STATUSES.ON_LEAVE) {
    if (!form.leaveStart) {
      errors.leaveStart = 'Leave start date is required when status is On Leave';
    }
    if (!form.leaveEnd) {
      errors.leaveEnd = 'Leave end date is required when status is On Leave';
    }
    if (form.leaveStart && form.leaveEnd && form.leaveEnd < form.leaveStart) {
      errors.leaveEnd = 'Leave end date cannot be earlier than leave start date';
    }
  }

  return errors;
};

export const validateTaskForm = (form) => {
  const errors = {};

  if (!form.title || form.title.trim().length < 3) {
    errors.title = 'Title must be at least 3 characters';
  } else if (form.title.trim().length > 100) {
    errors.title = 'Title cannot exceed 100 characters';
  }

  if (form.description && form.description.length > 1000) {
    errors.description = 'Description cannot exceed 1000 characters';
  }

  if (!form.assignedEmployee) {
    errors.assignedEmployee = 'Please assign an employee';
  }

  if (!form.department) {
    errors.department = 'Department is required';
  }

  if (!form.priority) {
    errors.priority = 'Priority is required';
  }

  if (!form.startDate) {
    errors.startDate = 'Start date is required';
  }

  if (!form.dueDate) {
    errors.dueDate = 'Due date is required';
  } else if (form.startDate && form.dueDate < form.startDate) {
    errors.dueDate = 'Due date cannot be earlier than start date';
  }

  return errors;
};

