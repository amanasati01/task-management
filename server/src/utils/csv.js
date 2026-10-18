import { formatDateOnly } from './dateUtils.js';

const escapeCsvField = (field) => {
  if (field === null || field === undefined) {
    return '""';
  }
  const str = String(field);
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
};

export const tasksToCsv = (tasks) => {
  const headers = [
    'Task ID',
    'Title',
    'Employee',
    'Department',
    'Priority',
    'Status',
    'Start Date',
    'Due Date',
    'Completed Date',
    'Overdue'
  ];

  const rows = tasks.map((task) => {
    let employeeName = 'Unassigned';
    if (task.assignedEmployee && task.assignedEmployee.fullName) {
      employeeName = task.assignedEmployee.fullName;
    } else if (task.employeeSnapshot && task.employeeSnapshot.fullName) {
      employeeName = `${task.employeeSnapshot.fullName} (deleted)`;
    }

    return [
      escapeCsvField(task.taskId),
      escapeCsvField(task.title),
      escapeCsvField(employeeName),
      escapeCsvField(task.department),
      escapeCsvField(task.priority),
      escapeCsvField(task.status),
      escapeCsvField(formatDateOnly(task.startDate)),
      escapeCsvField(formatDateOnly(task.dueDate)),
      escapeCsvField(formatDateOnly(task.completedDate)),
      escapeCsvField(task.isOverdue ? 'Yes' : 'No')
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\r\n');
};
