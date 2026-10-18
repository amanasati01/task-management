import React from 'react';
import { EMPLOYEE_STATUSES, TASK_STATUSES } from '../../utils/constants.js';

const StatusBadge = ({ status, isOverdue = false }) => {
  if (!status) return null;

  let badgeClass = 'badge-status ';

  switch (status) {
    case EMPLOYEE_STATUSES.ACTIVE:
      badgeClass += 'badge-status-active';
      break;
    case EMPLOYEE_STATUSES.INACTIVE:
      badgeClass += 'badge-status-inactive';
      break;
    case EMPLOYEE_STATUSES.ON_LEAVE:
      badgeClass += 'badge-status-on-leave';
      break;
    case TASK_STATUSES.TODO:
      badgeClass += 'badge-task-todo';
      break;
    case TASK_STATUSES.IN_PROGRESS:
      badgeClass += 'badge-task-in-progress';
      break;
    case TASK_STATUSES.COMPLETED:
      badgeClass += 'badge-task-completed';
      break;
    case TASK_STATUSES.CANCELLED:
      badgeClass += 'badge-task-cancelled';
      break;
    default:
      badgeClass += 'bg-light text-dark';
  }

  return (
    <div className="d-inline-flex align-items-center gap-1">
      <span className={badgeClass}>{status}</span>
      {isOverdue && <span className="badge-overdue">OVERDUE</span>}
    </div>
  );
};

export default StatusBadge;

