import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Row, Col, Card, Button, Alert } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { taskApi } from '../../api/taskApi.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import PriorityBadge from '../../components/common/PriorityBadge.jsx';
import StatusDropdown from '../../components/tasks/StatusDropdown.jsx';
import ConfirmModal from '../../components/common/ConfirmModal.jsx';
import Loader from '../../components/common/Loader.jsx';
import { formatDate, formatDueDate, formatAssignedEmployee } from '../../utils/formatters.js';
import { TASK_STATUSES } from '../../utils/constants.js';

const TaskView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      const res = await taskApi.getTask(id);
      if (res.success && res.data) {
        setTask(res.data);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load task details');
      navigate('/tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskDetails();
  }, [id]);

  const handleStatusChange = async (taskItem, newStatus) => {
    try {
      setStatusUpdating(true);
      const res = await taskApi.updateTaskStatus(taskItem._id, newStatus);
      if (res.success) {
        toast.success(`Task status updated to ${newStatus}`);
        setTask(res.data);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update task status');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await taskApi.deleteTask(id);
      toast.success('Task deleted successfully');
      navigate('/tasks');
    } catch (err) {
      toast.error(err.message || 'Failed to delete task');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return <Loader message="Loading task details..." />;
  }

  if (!task) {
    return null;
  }

  const isLocked =
    task.status === TASK_STATUSES.COMPLETED || task.status === TASK_STATUSES.CANCELLED;

  return (
    <div>
      <PageHeader
        title={`${task.taskId}: ${task.title}`}
        subtitle={`Department: ${task.department} • Priority: ${task.priority}`}
        actions={
          <div className="d-flex gap-2 align-items-center">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => navigate('/tasks')}
            >
              <i className="bi bi-arrow-left me-1"></i> Back to Tasks
            </Button>
            <Button
              as={Link}
              to={`/tasks/${task._id}/edit`}
              variant="outline-primary"
              size="sm"
              disabled={isLocked}
              title={
                isLocked
                  ? 'Completed and Cancelled tasks cannot be edited'
                  : 'Edit task'
              }
            >
              <i className="bi bi-pencil me-1"></i> Edit
            </Button>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
            >
              <i className="bi bi-trash me-1"></i> Delete
            </Button>
          </div>
        }
      />

      {task.isOverdue && (
        <Alert variant="danger" className="d-flex align-items-center gap-2 mb-4">
          <i className="bi bi-exclamation-octagon-fill fs-5"></i>
          <div>
            <strong>Task Overdue:</strong> The due date ({formatDueDate(task.dueDate, task.isOverdue)}) has passed
            and this task has not been completed.
          </div>
        </Alert>
      )}

      <Row className="g-4">
        <Col lg={8}>
          <Card className="content-card shadow-sm border-0 mb-4">
            <Card.Header className="bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold">Description & Scope</h5>
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted small">Status:</span>
                <StatusDropdown
                  task={task}
                  onStatusChange={handleStatusChange}
                  isUpdating={statusUpdating}
                />
              </div>
            </Card.Header>
            <Card.Body className="p-4">
              <div className="mb-4">
                <p className="text-secondary mb-0">
                  {task.description || 'No detailed description provided for this task.'}
                </p>
              </div>

              <hr />

              <Row className="g-3 pt-2">
                <Col sm={4}>
                  <small className="text-muted d-block">Start Date</small>
                  <span className="fw-semibold">{formatDate(task.startDate)}</span>
                </Col>
                <Col sm={4}>
                  <small className="text-muted d-block">Due Date</small>
                  <span
                    className={`fw-semibold ${
                      task.isOverdue ? 'text-danger fw-bold' : ''
                    }`}
                  >
                    {formatDueDate(task.dueDate, task.isOverdue)}
                  </span>
                </Col>
                <Col sm={4}>
                  <small className="text-muted d-block">Completed Date</small>
                  <span className="fw-semibold">
                    {task.completedDate ? formatDate(task.completedDate) : '—'}
                  </span>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="content-card shadow-sm border-0 mb-4">
            <Card.Header className="bg-white py-3 border-bottom">
              <h5 className="mb-0 fw-bold">Assigned Employee</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <small className="text-muted d-block">Employee Name</small>
                {task.assignedEmployee && task.assignedEmployee._id ? (
                  <Link
                    to={`/employees/${task.assignedEmployee._id}`}
                    className="fw-bold text-decoration-none fs-6 text-dark"
                  >
                    {task.assignedEmployee.fullName}
                  </Link>
                ) : (
                  <span className="fw-bold fs-6 text-muted">
                    {formatAssignedEmployee(task)}
                  </span>
                )}
              </div>

              <div className="mb-3">
                <small className="text-muted d-block">Department</small>
                <span className="badge bg-light text-dark border">
                  {task.assignedEmployee?.department || task.employeeSnapshot?.department}
                </span>
              </div>

              <div className="mb-3">
                <small className="text-muted d-block">Designation</small>
                <span>
                  {task.assignedEmployee?.role || task.employeeSnapshot?.role || '—'}
                </span>
              </div>

              <div className="mb-3">
                <small className="text-muted d-block">Email</small>
                <span>
                  {task.assignedEmployee?.email || task.employeeSnapshot?.email || '—'}
                </span>
              </div>

              {task.assignedEmployee && task.assignedEmployee.status && (
                <div>
                  <small className="text-muted d-block mb-1">Status</small>
                  <StatusBadge status={task.assignedEmployee.status} />
                </div>
              )}
            </Card.Body>
          </Card>

          <Card className="content-card shadow-sm border-0">
            <Card.Header className="bg-white py-3 border-bottom">
              <h5 className="mb-0 fw-bold">Metadata</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-2">
                <small className="text-muted d-block">Priority</small>
                <PriorityBadge priority={task.priority} />
              </div>
              <div className="mb-2">
                <small className="text-muted d-block">Created At</small>
                <span>{formatDate(task.createdAt)}</span>
              </div>
              <div>
                <small className="text-muted d-block">Last Updated</small>
                <span>{formatDate(task.updatedAt)}</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <ConfirmModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Confirm Task Deletion"
        message={`Are you sure you want to delete task ${task.taskId} ("${task.title}")?`}
        confirmText="Delete"
        confirmVariant="danger"
        isLoading={deleting}
      />
    </div>
  );
};

export default TaskView;

