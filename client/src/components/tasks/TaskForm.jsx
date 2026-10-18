import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { DEPARTMENTS, TASK_PRIORITIES } from '../../utils/constants.js';
import { validateTaskForm } from '../../utils/validators.js';
import { formatDateInput, formatDate } from '../../utils/formatters.js';
import { employeeApi } from '../../api/employeeApi.js';

const TaskForm = ({
  initialData = {},
  onSubmit,
  isSubmitting,
  isEdit = false,
  serverError = null,
  onClearServerError
}) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedEmployee: '',
    department: '',
    priority: TASK_PRIORITIES.MEDIUM,
    startDate: '',
    dueDate: ''
  });

  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoadingEmployees(true);
        const res = await employeeApi.getEmployeeOptions();
        setEmployees(res.data || []);
      } catch (err) {
        toast.error(err.message || 'Failed to load employee options');
      } finally {
        setLoadingEmployees(false);
      }
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        assignedEmployee:
          typeof initialData.assignedEmployee === 'object'
            ? initialData.assignedEmployee?._id || ''
            : initialData.assignedEmployee || '',
        department: initialData.department || '',
        priority: initialData.priority || TASK_PRIORITIES.MEDIUM,
        startDate: formatDateInput(initialData.startDate),
        dueDate: formatDateInput(initialData.dueDate)
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (serverError && onClearServerError) {
      onClearServerError();
    }
    setFormData((prev) => {
      const next = { ...prev, [name]: value };

      if (name === 'assignedEmployee') {
        const selectedEmp = employees.find((emp) => emp._id === value);
        if (selectedEmp && !next.department) {
          next.department = selectedEmp.department;
        }
      }

      return next;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const selectedEmployeeObj = employees.find(
    (emp) => emp._id === formData.assignedEmployee
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    const clientErrors = validateTaskForm(formData);
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    const payload = {
      title: formData.title,
      description: formData.description,
      assignedEmployee: formData.assignedEmployee,
      department: formData.department,
      priority: formData.priority,
      startDate: formData.startDate,
      dueDate: formData.dueDate
    };

    onSubmit(payload, setErrors);
  };

  return (
    <Card className="content-card shadow-sm border-0">
      <Card.Body className="p-4">
        {serverError && (
          <Alert
            variant="danger"
            dismissible
            onClose={onClearServerError}
            className="mb-4 d-flex align-items-center gap-2"
          >
            <i className="bi bi-exclamation-circle-fill"></i>
            <div>{serverError}</div>
          </Alert>
        )}

        {selectedEmployeeObj && selectedEmployeeObj.status === 'On Leave' && (
          <Alert variant="warning" className="d-flex align-items-center gap-2 mb-3">
            <i className="bi bi-exclamation-triangle-fill fs-5"></i>
            <div>
              <strong>Note:</strong> {selectedEmployeeObj.fullName} is On Leave from{' '}
              {formatDate(selectedEmployeeObj.leaveStart)} to{' '}
              {formatDate(selectedEmployeeObj.leaveEnd)}. Task start date cannot fall in this
              window.
            </div>
          </Alert>
        )}

        <Form onSubmit={handleSubmit} noValidate>
          <Form.Group className="mb-3" controlId="title">
            <Form.Label className="fw-semibold">
              Task Title <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="title"
              placeholder="e.g. Implement payment gateway webhook handler"
              value={formData.title}
              onChange={handleChange}
              isInvalid={!!errors.title}
            />
            <Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="description">
            <Form.Label className="fw-semibold">Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              placeholder="Provide context, acceptance criteria or details..."
              value={formData.description}
              onChange={handleChange}
              isInvalid={!!errors.description}
            />
            <Form.Control.Feedback type="invalid">
              {errors.description}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">Maximum 1000 characters.</Form.Text>
          </Form.Group>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="assignedEmployee">
                <Form.Label className="fw-semibold">
                  Assign To Employee <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  name="assignedEmployee"
                  value={formData.assignedEmployee}
                  onChange={handleChange}
                  isInvalid={!!errors.assignedEmployee}
                  disabled={loadingEmployees}
                >
                  <option value="">
                    {loadingEmployees ? 'Loading team members...' : 'Select Employee'}
                  </option>
                  {employees.map((emp) => {
                    const isCurrentAssigned =
                      isEdit &&
                      (initialData.assignedEmployee?._id === emp._id ||
                        initialData.assignedEmployee === emp._id);
                    const isFullCapacity = emp.activeTaskCount >= 3 && !isCurrentAssigned;

                    return (
                      <option
                        key={emp._id}
                        value={emp._id}
                        disabled={isFullCapacity}
                      >
                        {emp.fullName} ({emp.employeeId} - {emp.department}) [
                        {emp.activeTaskCount}/3 tasks
                        {isFullCapacity ? ' - FULL' : ''}
                        {emp.status === 'On Leave' ? ' - ON LEAVE' : ''}]
                      </option>
                    );
                  })}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.assignedEmployee}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Max capacity: 3 active tasks per employee.
                </Form.Text>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="department">
                <Form.Label className="fw-semibold">
                  Department <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  isInvalid={!!errors.department}
                >
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.department}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col md={4}>
              <Form.Group controlId="priority">
                <Form.Label className="fw-semibold">
                  Priority <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  isInvalid={!!errors.priority}
                >
                  {Object.values(TASK_PRIORITIES).map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.priority}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group controlId="startDate">
                <Form.Label className="fw-semibold">
                  Start Date <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  isInvalid={!!errors.startDate}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.startDate}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group controlId="dueDate">
                <Form.Label className="fw-semibold">
                  Due Date <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  min={formData.startDate || undefined}
                  isInvalid={!!errors.dueDate}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.dueDate}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">Must be on or after start date.</Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-end gap-2 pt-2 border-top">
            <Button
              variant="outline-secondary"
              onClick={() => navigate('/tasks')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button className="btn-maroon" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Saving...
                </>
              ) : isEdit ? (
                'Update Task'
              ) : (
                'Create Task'
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default TaskForm;

