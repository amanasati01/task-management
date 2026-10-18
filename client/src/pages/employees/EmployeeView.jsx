import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Row, Col, Card, Button, Table, Badge } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { employeeApi } from '../../api/employeeApi.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import PriorityBadge from '../../components/common/PriorityBadge.jsx';
import ConfirmModal from '../../components/common/ConfirmModal.jsx';
import Loader from '../../components/common/Loader.jsx';
import { formatDate, formatDueDate } from '../../utils/formatters.js';

const EmployeeView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        setLoading(true);
        const res = await employeeApi.getEmployee(id);
        if (res.success) {
          setEmployee(res.data);
          setTasks(res.tasks || []);
        }
      } catch (err) {
        toast.error(err.message || 'Failed to load employee details');
        navigate('/employees');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeDetails();
  }, [id, navigate]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await employeeApi.deleteEmployee(id);
      toast.success('Employee deleted successfully');
      navigate('/employees');
    } catch (err) {
      toast.error(err.message || 'Failed to delete employee');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return <Loader message="Loading employee profile..." />;
  }

  if (!employee) {
    return null;
  }

  const hasActiveTasks = employee.activeTaskCount > 0;

  return (
    <div>
      <PageHeader
        title={employee.fullName}
        subtitle={`${employee.employeeId} • ${employee.role} in ${employee.department}`}
        actions={
          <div className="d-flex gap-2">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => navigate('/employees')}
            >
              <i className="bi bi-arrow-left me-1"></i> Back to Roster
            </Button>
            <Button
              as={Link}
              to={`/employees/${employee._id}/edit`}
              variant="outline-primary"
              size="sm"
            >
              <i className="bi bi-pencil me-1"></i> Edit
            </Button>
            <Button
              variant="outline-danger"
              size="sm"
              disabled={hasActiveTasks}
              title={
                hasActiveTasks
                  ? 'Cannot delete an employee with active tasks'
                  : 'Delete employee'
              }
              onClick={() => setShowDeleteModal(true)}
            >
              <i className="bi bi-trash me-1"></i> Delete
            </Button>
          </div>
        }
      />

      <Row className="g-4 mb-4">
        <Col md={5} lg={4}>
          <Card className="content-card shadow-sm border-0 mb-4">
            <Card.Header className="bg-white py-3 border-bottom">
              <h5 className="mb-0 fw-bold">Employee Information</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <small className="text-muted d-block">Employee ID</small>
                <span className="fw-bold font-monospace text-primary fs-6">
                  {employee.employeeId}
                </span>
              </div>

              <div className="mb-3">
                <small className="text-muted d-block">Status</small>
                <StatusBadge status={employee.status} />
              </div>

              {employee.status === 'On Leave' && (
                <div className="mb-3 p-2 bg-warning-subtle rounded border border-warning">
                  <small className="text-warning-emphasis fw-bold d-block">
                    Leave Duration
                  </small>
                  <span>
                    {formatDate(employee.leaveStart)} — {formatDate(employee.leaveEnd)}
                  </span>
                </div>
              )}

              <div className="mb-3">
                <small className="text-muted d-block">Email Address</small>
                <a href={`mailto:${employee.email}`} className="text-decoration-none">
                  {employee.email}
                </a>
              </div>

              <div className="mb-3">
                <small className="text-muted d-block">Phone Number</small>
                <span>{employee.phone}</span>
              </div>

              <div className="mb-3">
                <small className="text-muted d-block">Department</small>
                <span className="badge bg-light text-dark border">
                  {employee.department}
                </span>
              </div>

              <div className="mb-3">
                <small className="text-muted d-block">Joining Date</small>
                <span>{formatDate(employee.joiningDate)}</span>
              </div>

              <div className="mb-3">
                <small className="text-muted d-block">Active Workload Capacity</small>
                <span className="fw-bold">{employee.activeTaskCount} / 3 active tasks</span>
              </div>

              <div>
                <small className="text-muted d-block mb-1">Skills</small>
                <div className="d-flex flex-wrap gap-1">
                  {employee.skills && employee.skills.length > 0 ? (
                    employee.skills.map((skill, index) => (
                      <Badge key={index} bg="secondary" className="fw-normal">
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted small">No skills listed</span>
                  )}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={7} lg={8}>
          <Card className="content-card shadow-sm border-0">
            <Card.Header className="bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold">Assigned Tasks ({tasks.length})</h5>
              <Button as={Link} to="/tasks/new" variant="primary" size="sm">
                <i className="bi bi-plus-lg me-1"></i> Assign New Task
              </Button>
            </Card.Header>

            <div className="table-responsive">
              <Table hover className="align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Task ID</th>
                    <th>Title</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Due Date</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-muted">
                        No tasks assigned to this employee yet.
                      </td>
                    </tr>
                  ) : (
                    tasks.map((task) => (
                      <tr
                        key={task._id}
                        className={task.isOverdue ? 'table-danger-subtle' : ''}
                      >
                        <td>
                          <span className="font-monospace fw-bold text-primary">
                            {task.taskId}
                          </span>
                        </td>
                        <td>
                          <Link
                            to={`/tasks/${task._id}`}
                            className="text-decoration-none fw-semibold text-dark"
                          >
                            {task.title}
                          </Link>
                        </td>
                        <td>
                          <PriorityBadge priority={task.priority} />
                        </td>
                        <td>
                          <StatusBadge status={task.status} isOverdue={task.isOverdue} />
                        </td>
                        <td>
                          <span className={task.isOverdue ? 'text-danger fw-bold' : ''}>
                            {formatDueDate(task.dueDate, task.isOverdue)}
                          </span>
                        </td>
                        <td className="text-end">
                          <Button
                            as={Link}
                            to={`/tasks/${task._id}`}
                            variant="light"
                            size="sm"
                          >
                            <i className="bi bi-eye"></i>
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </Card>
        </Col>
      </Row>

      <ConfirmModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Confirm Employee Deletion"
        message={`Are you sure you want to delete ${employee.fullName}?`}
        confirmText="Delete"
        confirmVariant="danger"
        isLoading={deleting}
      />
    </div>
  );
};

export default EmployeeView;

