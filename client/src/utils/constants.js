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

export const TASK_STATUSES = {
  TODO: 'Todo',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled'
};

export const ALLOWED_STATUS_TRANSITIONS = {
  [TASK_STATUSES.TODO]: [TASK_STATUSES.IN_PROGRESS, TASK_STATUSES.CANCELLED],
  [TASK_STATUSES.IN_PROGRESS]: [TASK_STATUSES.COMPLETED, TASK_STATUSES.CANCELLED],
  [TASK_STATUSES.COMPLETED]: [],
  [TASK_STATUSES.CANCELLED]: []
};

export const MAX_ACTIVE_TASKS_PER_EMPLOYEE = 3;

