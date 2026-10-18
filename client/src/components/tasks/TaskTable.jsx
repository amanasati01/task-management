import React from 'react';
import { Table, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import PriorityBadge from '../common/PriorityBadge.jsx';
import StatusDropdown from './StatusDropdown.jsx';
import ActionMenu from '../common/ActionMenu.jsx';
import EmptyState from '../common/EmptyState.jsx';
import { formatDate, formatDueDate, formatAssignedEmployee } from '../../utils/formatters.js';
import { TASK_STATUSES } from '../../utils/constants.js';

const TaskTable = ({
  tasks = [],
  onDelete,
  onStatusChange,
  statusUpdatingId
}) => {
  const navigate = useNavigate();

  if (tasks.length === 0) {
    return (
      <EmptyState
        icon="bi-check2-square"
        title="No tasks found"
        message="No tasks match your search or filter criteria. Create a new task or adjust your filters."
        actionText="Create Task"
        actionLink="/tasks/new"
      />
    );
  }

  return (
    <Card className="content-card shadow-sm border-0">
      <div className="table-responsive">
        <Table hover className="align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>Task ID</th>
              <th>Title</th>
              <th>Assigned To</th>
              <th>Department</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Due Date</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => {
              const isLocked =
                task.status === TASK_STATUSES.COMPLETED ||
                task.status === TASK_STATUSES.CANCELLED;

              const actionItems = [
                {
                  label: 'View Details',
                  icon: 'eye',
                  onClick: () => navigate(`/tasks/${task._id}`)
                },
                {
                  label: isLocked ? 'Edit (Locked)' : 'Edit Task',
                  icon: 'pencil',
                  disabled: isLocked,
                  onClick: () => navigate(`/tasks/${task._id}/edit`)
                },
                { divider: true },
                {
                  label: 'Delete Task',
                  icon: 'trash',
                  className: 'text-danger',
                  onClick: () => onDelete(task)
                }
              ];

              return (
                <tr
                  key={task._id}
                  className={task.isOverdue ? 'table-danger-subtle' : ''}
                >
                  <td>
                    <span className="fw-bold font-monospace text-primary">
                      {task.taskId}
                    </span>
                  </td>
                  <td>
                    <div className="fw-semibold text-dark">{task.title}</div>
                    {task.description && (
                      <small className="text-muted text-truncate d-inline-block task-desc-truncate">
                        {task.description}
                      </small>
                    )}
                  </td>
                  <td>
                    <div className="fw-medium text-dark">
                      {formatAssignedEmployee(task)}
                    </div>
                  </td>
                  <td>
                    <span className="badge bg-light text-dark border">
                      {task.department}
                    </span>
                  </td>
                  <td>
                    <PriorityBadge priority={task.priority} />
                  </td>
                  <td>
                    <StatusDropdown
                      task={task}
                      onStatusChange={onStatusChange}
                      isUpdating={statusUpdatingId === task._id}
                    />
                  </td>
                  <td>
                    <div className={task.isOverdue ? 'text-danger fw-bold' : 'text-dark'}>
                      {formatDueDate(task.dueDate, task.isOverdue)}
                    </div>
                  </td>
                  <td className="text-end">
                    <ActionMenu items={actionItems} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    </Card>
  );
};

export default TaskTable;
