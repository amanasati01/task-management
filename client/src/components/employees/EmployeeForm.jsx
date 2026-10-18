import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { DEPARTMENTS, EMPLOYEE_STATUSES } from '../../utils/constants.js';
import { validateEmployeeForm } from '../../utils/validators.js';
import { formatDateInput } from '../../utils/formatters.js';

const EmployeeForm = ({
  initialData = {},
  onSubmit,
  isSubmitting,
  isEdit = false,
  serverError = null,
  onClearServerError
}) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    employeeId: '',
    fullName: '',
    email: '',
    phone: '',
    department: '',
    role: '',
    joiningDate: '',
    status: EMPLOYEE_STATUSES.ACTIVE,
    skills: '',
    leaveStart: '',
    leaveEnd: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({
        employeeId: initialData.employeeId || '',
        fullName: initialData.fullName || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        department: initialData.department || '',
        role: initialData.role || '',
        joiningDate: formatDateInput(initialData.joiningDate),
        status: initialData.status || EMPLOYEE_STATUSES.ACTIVE,
        skills: Array.isArray(initialData.skills)
          ? initialData.skills.join(', ')
          : initialData.skills || '',
        leaveStart: formatDateInput(initialData.leaveStart),
        leaveEnd: formatDateInput(initialData.leaveEnd)
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
      if (name === 'status' && value !== EMPLOYEE_STATUSES.ON_LEAVE) {
        next.leaveStart = '';
        next.leaveEnd = '';
      }
      return next;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const clientErrors = validateEmployeeForm(formData);
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    const skillsArray = formData.skills
      ? formData.skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    const payload = {
      ...formData,
      skills: skillsArray
    };

    if (isEdit) {
      delete payload.employeeId;
    }

    if (payload.status !== EMPLOYEE_STATUSES.ON_LEAVE) {
      delete payload.leaveStart;
      delete payload.leaveEnd;
    }

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

        <Form onSubmit={handleSubmit} noValidate>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="employeeId">
                <Form.Label className="fw-semibold">
                  Employee ID <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="employeeId"
                  placeholder="e.g. EMP-001"
                  value={formData.employeeId}
                  onChange={handleChange}
                  disabled={isEdit}
                  isInvalid={!!errors.employeeId}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.employeeId}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Unique identifier (e.g. EMP-001). Immutable after creation.
                </Form.Text>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="fullName">
                <Form.Label className="fw-semibold">
                  Full Name <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="fullName"
                  placeholder="e.g. Rahul Sharma"
                  value={formData.fullName}
                  onChange={handleChange}
                  isInvalid={!!errors.fullName}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.fullName}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="email">
                <Form.Label className="fw-semibold">
                  Email Address <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  placeholder="e.g. rahul.sharma@rootsmedia.in"
                  value={formData.email}
                  onChange={handleChange}
                  isInvalid={!!errors.email}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="phone">
                <Form.Label className="fw-semibold">
                  Phone Number <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="tel"
                  name="phone"
                  placeholder="e.g. +919876543210"
                  value={formData.phone}
                  onChange={handleChange}
                  isInvalid={!!errors.phone}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.phone}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
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

            <Col md={6}>
              <Form.Group controlId="role">
                <Form.Label className="fw-semibold">
                  Designation / Role <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="role"
                  placeholder="e.g. Senior Full Stack Engineer"
                  value={formData.role}
                  onChange={handleChange}
                  isInvalid={!!errors.role}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.role}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="joiningDate">
                <Form.Label className="fw-semibold">
                  Joining Date <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="date"
                  name="joiningDate"
                  value={formData.joiningDate}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  isInvalid={!!errors.joiningDate}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.joiningDate}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Cannot be in the future.
                </Form.Text>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="status">
                <Form.Label className="fw-semibold">
                  Status <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  isInvalid={!!errors.status}
                >
                  {Object.values(EMPLOYEE_STATUSES).map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.status}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {formData.status === EMPLOYEE_STATUSES.ON_LEAVE && (
            <div className="p-3 mb-3 bg-light rounded border border-warning">
              <h6 className="text-warning-emphasis fw-bold mb-2">
                <i className="bi bi-calendar-event me-2"></i> Leave Duration Settings
              </h6>
              <Row>
                <Col md={6}>
                  <Form.Group controlId="leaveStart">
                    <Form.Label className="fw-semibold">
                      Leave Start Date <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="date"
                      name="leaveStart"
                      value={formData.leaveStart}
                      onChange={handleChange}
                      isInvalid={!!errors.leaveStart}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.leaveStart}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group controlId="leaveEnd">
                    <Form.Label className="fw-semibold">
                      Leave End Date <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="date"
                      name="leaveEnd"
                      value={formData.leaveEnd}
                      onChange={handleChange}
                      min={formData.leaveStart || undefined}
                      isInvalid={!!errors.leaveEnd}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.leaveEnd}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
            </div>
          )}

          <Form.Group className="mb-4" controlId="skills">
            <Form.Label className="fw-semibold">Skills</Form.Label>
            <Form.Control
              type="text"
              name="skills"
              placeholder="e.g. React, Node.js, Express, MongoDB (comma separated)"
              value={formData.skills}
              onChange={handleChange}
            />
            <Form.Text className="text-muted">
              Enter skills separated by commas.
            </Form.Text>
          </Form.Group>

          <div className="d-flex justify-content-end gap-2 pt-2 border-top">
            <Button
              variant="outline-secondary"
              onClick={() => navigate('/employees')}
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
                'Update Employee'
              ) : (
                'Create Employee'
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default EmployeeForm;

