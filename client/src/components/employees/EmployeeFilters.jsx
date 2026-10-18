import React from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import SearchBar from '../common/SearchBar.jsx';
import { DEPARTMENTS, EMPLOYEE_STATUSES } from '../../utils/constants.js';

const EmployeeFilters = ({
  search,
  onSearchChange,
  onSearch,
  department,
  onDepartmentChange,
  status,
  onStatusChange,
  sortBy,
  onSortByChange,
  order,
  onOrderToggle,
  onReset
}) => {
  const hasActiveFilters = Boolean(
    search || department || status || sortBy !== 'createdAt' || order !== 'desc'
  );

  return (
    <div className="bg-white p-3 rounded shadow-sm mb-4">
      <Row className="g-2 mb-2 align-items-center">
        <Col lg={5} md={6}>
          <SearchBar
            value={search}
            onChange={onSearchChange}
            onSearch={onSearch}
            onClear={() => onSearchChange('')}
            placeholder="Search by name, ID, email, role..."
          />
        </Col>

        <Col lg={3} md={3} sm={6}>
          <Form.Select
            value={department}
            onChange={(e) => onDepartmentChange(e.target.value)}
            className="shadow-none"
          >
            <option value="">All Departments</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </Form.Select>
        </Col>

        <Col lg={2} md={3} sm={6}>
          <Form.Select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="shadow-none"
          >
            <option value="">All Statuses</option>
            {Object.values(EMPLOYEE_STATUSES).map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </Form.Select>
        </Col>

        <Col lg={2} md={12} className="text-end">
          <Button
            as={Link}
            to="/employees/new"
            variant="primary"
            className="w-100 d-flex align-items-center justify-content-center gap-1 shadow-sm"
          >
            <i className="bi bi-person-plus"></i> + Add Employee
          </Button>
        </Col>
      </Row>

      <Row className="g-2 align-items-center pt-2 border-top">
        <Col lg={4} md={6}>
          <div className="d-flex align-items-center gap-2">
            <span className="small text-muted text-nowrap">Sort by:</span>
            <Form.Select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value)}
              className="shadow-none form-select-sm"
            >
              <option value="createdAt">Date Created</option>
              <option value="fullName">Full Name</option>
              <option value="employeeId">Employee ID</option>
              <option value="joiningDate">Joining Date</option>
              <option value="activeTaskCount">Active Tasks</option>
            </Form.Select>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={onOrderToggle}
              title={`Sort ${order === 'asc' ? 'Descending' : 'Ascending'}`}
              className="d-flex align-items-center"
            >
              <i className={`bi bi-sort-${order === 'asc' ? 'up' : 'down'}`}></i>
            </Button>
          </div>
        </Col>

        <Col lg={8} md={6} className="text-end">
          {hasActiveFilters && (
            <Button
              variant="link"
              onClick={onReset}
              className="text-decoration-none text-danger p-0 small"
            >
              Clear Filters
            </Button>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default EmployeeFilters;
