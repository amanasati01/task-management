import React from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import SearchBar from '../common/SearchBar.jsx';
import { DEPARTMENTS, TASK_PRIORITIES, TASK_STATUSES } from '../../utils/constants.js';

const TaskFilters = ({
  search,
  onSearchChange,
  onSearch,
  department,
  onDepartmentChange,
  priority,
  onPriorityChange,
  status,
  onStatusChange,
  isOverdue,
  onOverdueToggle,
  dueFrom,
  onDueFromChange,
  dueTo,
  onDueToChange,
  sortBy,
  onSortByChange,
  order,
  onOrderToggle,
  onReset,
  onExportCsv,
  isExporting = false
}) => {
  const hasActiveFilters = Boolean(
    search ||
      department ||
      priority ||
      status ||
      isOverdue ||
      dueFrom ||
      dueTo ||
      sortBy !== 'createdAt' ||
      order !== 'desc'
  );

  return (
    <div className="bg-white p-3 rounded shadow-sm mb-4">
      <Row className="g-2 mb-2 align-items-center">
        <Col lg={4} md={6}>
          <SearchBar
            value={search}
            onChange={onSearchChange}
            onSearch={onSearch}
            onClear={() => onSearchChange('')}
            placeholder="Search by title, task ID, or assignee..."
          />
        </Col>

        <Col lg={2} md={3} sm={6}>
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
            value={priority}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="shadow-none"
          >
            <option value="">All Priorities</option>
            {Object.values(TASK_PRIORITIES).map((p) => (
              <option key={p} value={p}>
                {p}
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
            {Object.values(TASK_STATUSES).map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </Form.Select>
        </Col>

        <Col lg={2} md={3} sm={6}>
          <Button
            variant={isOverdue ? 'danger' : 'outline-danger'}
            onClick={onOverdueToggle}
            className="w-100 d-flex align-items-center justify-content-center gap-1 shadow-none"
          >
            <i className="bi bi-clock-history"></i>
            {isOverdue ? 'Overdue Only' : 'Filter Overdue'}
          </Button>
        </Col>
      </Row>

      <Row className="g-2 align-items-center pt-2 border-top">
        <Col lg={2} md={3} sm={6}>
          <Form.Group controlId="dueFrom">
            <Form.Control
              type="date"
              value={dueFrom}
              onChange={(e) => onDueFromChange(e.target.value)}
              placeholder="Due from"
              className="shadow-none form-control-sm"
              title="Due date from"
            />
          </Form.Group>
        </Col>

        <Col lg={2} md={3} sm={6}>
          <Form.Group controlId="dueTo">
            <Form.Control
              type="date"
              value={dueTo}
              onChange={(e) => onDueToChange(e.target.value)}
              placeholder="Due to"
              min={dueFrom || undefined}
              className="shadow-none form-control-sm"
              title="Due date to"
            />
          </Form.Group>
        </Col>

        <Col lg={3} md={6}>
          <div className="d-flex align-items-center gap-1">
            <span className="small text-muted text-nowrap">Sort:</span>
            <Form.Select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value)}
              className="shadow-none form-select-sm"
            >
              <option value="createdAt">Date Created</option>
              <option value="dueDate">Due Date</option>
              <option value="title">Title</option>
              <option value="priority">Priority (Importance)</option>
              <option value="startDate">Start Date</option>
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

        <Col
          lg={5}
          md={12}
          className="d-flex justify-content-lg-end justify-content-between align-items-center gap-2"
        >
          {hasActiveFilters && (
            <Button
              variant="link"
              onClick={onReset}
              className="text-decoration-none text-danger p-0 small"
            >
              Clear Filters
            </Button>
          )}

          <Button
            variant="outline-success"
            size="sm"
            onClick={onExportCsv}
            disabled={isExporting}
            className="d-flex align-items-center gap-1"
          >
            <i className="bi bi-file-earmark-spreadsheet"></i>
            {isExporting ? 'Exporting...' : 'Export To Csv'}
          </Button>

          <Button
            as={Link}
            to="/tasks/new"
            variant="primary"
            size="sm"
            className="d-flex align-items-center gap-1 shadow-sm"
          >
            <i className="bi bi-plus-lg"></i> + Add Task
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default TaskFilters;
