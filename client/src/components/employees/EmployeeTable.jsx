import React from 'react';
import { Table, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge.jsx';
import ActionMenu from '../common/ActionMenu.jsx';
import EmptyState from '../common/EmptyState.jsx';
import { formatDate } from '../../utils/formatters.js';

const EmployeeTable = ({ employees = [], onDelete }) => {
  const navigate = useNavigate();

  if (employees.length === 0) {
    return (
      <EmptyState
        icon="bi-people"
        title="No employees found"
        message="No employees match your search or filter criteria. Try clearing filters or add a new employee."
        actionText="Add Employee"
        actionLink="/employees/new"
      />
    );
  }

  const getCapacityClass = (count) => {
    if (count >= 3) return 'capacity-full';
    if (count === 2) return 'capacity-busy';
    return 'capacity-available';
  };

  return (
    <Card className="content-card shadow-sm border-0">
      <div className="table-responsive">
        <Table hover className="align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Name & Designation</th>
              <th>Department</th>
              <th>Status</th>
              <th>Active Workload</th>
              <th>Joining Date</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => {
              const actionItems = [
                {
                  label: 'View Details',
                  icon: 'eye',
                  onClick: () => navigate(`/employees/${emp._id}`)
                },
                {
                  label: 'Edit Employee',
                  icon: 'pencil',
                  onClick: () => navigate(`/employees/${emp._id}/edit`)
                },
                { divider: true },
                {
                  label: 'Delete Employee',
                  icon: 'trash',
                  className: 'text-danger',
                  disabled: emp.activeTaskCount > 0,
                  onClick: () => onDelete(emp)
                }
              ];

              return (
                <tr key={emp._id}>
                  <td>
                    <span className="fw-bold font-monospace text-primary">
                      {emp.employeeId}
                    </span>
                  </td>
                  <td>
                    <div className="fw-semibold text-dark">{emp.fullName}</div>
                    <small className="text-muted">{emp.role}</small>
                  </td>
                  <td>
                    <span className="badge bg-light text-dark border">
                      {emp.department}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={emp.status} />
                    {emp.status === 'On Leave' && emp.leaveStart && emp.leaveEnd && (
                      <div className="text-muted small mt-1">
                        {formatDate(emp.leaveStart)} - {formatDate(emp.leaveEnd)}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`capacity-pill ${getCapacityClass(emp.activeTaskCount)}`}>
                      {emp.activeTaskCount} / 3 Tasks
                    </span>
                  </td>
                  <td>
                    <small className="text-muted">{formatDate(emp.joiningDate)}</small>
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

export default EmployeeTable;

