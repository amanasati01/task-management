export const DEPARTMENTS = [
  'Development',
  'Design',
  'QA',
  'HR',
  'Sales'
];

export const EMPLOYEE_STATUSES = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  ON_LEAVE: 'On Leave'
};

export const TASK_PRIORITIES = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical'
};

export const PRIORITY_RANK = {
  [TASK_PRIORITIES.CRITICAL]: 4,
  [TASK_PRIORITIES.HIGH]: 3,
  [TASK_PRIORITIES.MEDIUM]: 2,
  [TASK_PRIORITIES.LOW]: 1
};

export const TASK_STATUSES = {
  TODO: 'Todo',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled'
};

export const ACTIVE_TASK_STATUSES = [
  TASK_STATUSES.TODO,
  TASK_STATUSES.IN_PROGRESS
];

export const ALLOWED_STATUS_TRANSITIONS = {
  [TASK_STATUSES.TODO]: [TASK_STATUSES.IN_PROGRESS, TASK_STATUSES.CANCELLED],
  [TASK_STATUSES.IN_PROGRESS]: [TASK_STATUSES.COMPLETED, TASK_STATUSES.CANCELLED],
  [TASK_STATUSES.COMPLETED]: [],
  [TASK_STATUSES.CANCELLED]: []
};

export const MAX_ACTIVE_TASKS_PER_EMPLOYEE = 3;

export const EMPLOYEE_SORT_FIELDS = [
  'createdAt',
  'fullName',
  'employeeId',
  'department',
  'role',
  'joiningDate',
  'status',
  'activeTaskCount'
];

export const TASK_SORT_FIELDS = [
  'createdAt',
  'dueDate',
  'startDate',
  'title',
  'priority',
  'status',
  'department'
];

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 50
};
