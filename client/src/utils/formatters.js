export const formatDate = (dateValue) => {
  if (!dateValue) return '—';
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return '—';

  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  });
};

export const formatDueDate = (dateValue, isOverdue) => {
  if (!dateValue) return '—';
  const base = formatDate(dateValue);
  return isOverdue ? `${base} (Overdue)` : base;
};

export const formatDateInput = (dateValue) => {
  if (!dateValue) return '';
  if (typeof dateValue === 'string') {
    return dateValue.split('T')[0];
  }
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
};

export const formatAssignedEmployee = (task) => {
  if (!task) return 'Unassigned';

  if (task.assignedEmployee && typeof task.assignedEmployee === 'object' && task.assignedEmployee.fullName) {
    return task.assignedEmployee.fullName;
  }

  if (task.employeeSnapshot && task.employeeSnapshot.fullName) {
    return `${task.employeeSnapshot.fullName} (deleted)`;
  }

  return 'Unassigned';
};
