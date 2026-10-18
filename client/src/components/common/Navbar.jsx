import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { NavLink, Link } from 'react-router-dom';

const AppNavbar = () => {
  return (
    <Navbar expand="lg" className="app-navbar mb-4" variant="dark">
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2">
          <i className="bi bi-kanban-fill text-info fs-4"></i>
          <div>
            <span className="navbar-brand-title">Roots Media</span>
            <span className="badge bg-secondary ms-2 navbar-badge">Task Manager</span>
          </div>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-navbar-nav" />

        <Navbar.Collapse id="main-navbar-nav">
          <Nav className="me-auto ms-lg-4">
            <Nav.Link as={NavLink} to="/" end className="app-nav-link">
              <i className="bi bi-speedometer2 me-1"></i> Dashboard
            </Nav.Link>
            <Nav.Link as={NavLink} to="/employees" className="app-nav-link">
              <i className="bi bi-people me-1"></i> Employees
            </Nav.Link>
            <Nav.Link as={NavLink} to="/tasks" className="app-nav-link">
              <i className="bi bi-check2-square me-1"></i> Tasks
            </Nav.Link>
          </Nav>

          <div className="d-flex align-items-center gap-2 mt-3 mt-lg-0">
            <Button
              as={Link}
              to="/employees/new"
              variant="outline-light"
              size="sm"
              className="d-flex align-items-center gap-1"
            >
              <i className="bi bi-person-plus"></i> Add Employee
            </Button>
            <Button
              as={Link}
              to="/tasks/new"
              variant="info"
              size="sm"
              className="text-white d-flex align-items-center gap-1 fw-semibold"
            >
              <i className="bi bi-plus-lg"></i> Create Task
            </Button>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;

