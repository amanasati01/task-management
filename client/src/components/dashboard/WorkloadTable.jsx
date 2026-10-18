import React from 'react';
import { Table, ProgressBar, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge.jsx';

const WorkloadTable = ({ workload = [] }) => {
  if (workload.length === 0) {
    return (
      <Card className="content-card shadow-sm border-0 p-4 text-center">
        <p className="text-muted mb-0">No employee workload data available.</p>
      </Card>
    );
  }

  const getVariant = (count) => {
    if (count >= 3) return 'danger';
    if (count === 2) return 'warning';
    return 'success';
  };

  return (
    <Card className="content-card shadow-sm border-0">
      <Card.Header className="bg-white py-3 border-bottom">
        <h5 className="mb-0 fw-bold">Employee Workload & Capacity</h5>
      </Card.Header>
      <div className="table-responsive">
        <Table hover className="align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>Status</th>
              <th>Active Tasks</th>
              <th>Capacity Usage</th>
            </tr>
          </thead>
          <tbody>
            {workload.map((item) => {
              const emp = item.employee;
              const count = item.activeTasks || 0;
              const percentage = Math.min(100, Math.round((count / 3) * 100));

              return (
                <tr key={emp._id}>
                  <td>
                    <Link
                      to={`/employees/${emp._id}`}
                      className="text-decoration-none fw-semibold text-dark d-block"
                    >
                      {emp.fullName}
                    </Link>
                    <small className="text-muted font-monospace">{emp.employeeId}</small>
                  </td>
                  <td>
                    <span className="badge bg-light text-dark border">
                      {emp.department}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={emp.status} />
                  </td>
                  <td>
                    <span className="fw-bold">{count}</span> / 3 tasks
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div className="flex-grow-1">
                        <ProgressBar
                          now={percentage}
                          variant={getVariant(count)}
                          className="rounded-pill"
                        />
                      </div>
                      <small className="text-muted fw-semibold">{percentage}%</small>
                    </div>
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

export default WorkloadTable;

