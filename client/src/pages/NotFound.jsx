import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <Container className="text-center py-5">
      <div className="py-5">
        <h1 className="display-1 fw-bold text-primary">404</h1>
        <h2 className="mb-3 fw-bold">Page Not Found</h2>
        <p className="text-muted mb-4">
          The page or resource you are looking for does not exist or has been moved.
        </p>
        <Button as={Link} to="/" variant="primary">
          <i className="bi bi-house-door me-1"></i> Back to Dashboard
        </Button>
      </div>
    </Container>
  );
};

export default NotFound;

