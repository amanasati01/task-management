import React from 'react';
import { TASK_PRIORITIES } from '../../utils/constants.js';

const PriorityBadge = ({ priority }) => {
  if (!priority) return null;

  let badgeClass = 'badge-status ';

  switch (priority) {
    case TASK_PRIORITIES.CRITICAL:
      badgeClass += 'badge-priority-critical';
      break;
    case TASK_PRIORITIES.HIGH:
      badgeClass += 'badge-priority-high';
      break;
    case TASK_PRIORITIES.MEDIUM:
      badgeClass += 'badge-priority-medium';
      break;
    case TASK_PRIORITIES.LOW:
      badgeClass += 'badge-priority-low';
      break;
    default:
      badgeClass += 'bg-light text-secondary';
  }

  return <span className={badgeClass}>{priority}</span>;
};

export default PriorityBadge;

