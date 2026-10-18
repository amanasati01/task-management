import React, { useState } from 'react';
import { Dropdown, Spinner } from 'react-bootstrap';
import StatusBadge from '../common/StatusBadge.jsx';

const StatusDropdown = ({ task, onStatusChange, isUpdating = false }) => {
  const allowedNext = task.allowedNextStatuses || [];
  const isTerminal = allowedNext.length === 0;

  if (isTerminal) {
    return (
      <div className="d-inline-flex align-items-center gap-1" title="Terminal status (cannot be modified)">
        <StatusBadge status={task.status} isOverdue={task.isOverdue} />
        <i className="bi bi-lock-fill text-muted small"></i>
      </div>
    );
  }

  return (
    <Dropdown>
      <Dropdown.Toggle
        variant="light"
        size="sm"
        className="p-1 border rounded d-inline-flex align-items-center gap-1 bg-white shadow-none"
        disabled={isUpdating}
      >
        {isUpdating ? (
          <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
        ) : (
          <StatusBadge status={task.status} isOverdue={task.isOverdue} />
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu className="shadow-sm">
        <Dropdown.Header className="small text-muted py-1">Change Status To:</Dropdown.Header>
        {allowedNext.map((nextStatus) => (
          <Dropdown.Item
            key={nextStatus}
            onClick={() => onStatusChange(task, nextStatus)}
            className="d-flex align-items-center gap-2 py-1"
          >
            <i className="bi bi-arrow-right-short text-primary"></i>
            <StatusBadge status={nextStatus} />
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default StatusDropdown;

