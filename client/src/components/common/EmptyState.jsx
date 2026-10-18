import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const EmptyState = ({
  icon = 'bi-inbox',
  title = 'No records found',
  message = 'There are no items matching your criteria. Try adjusting your filters or adding a new record.',
  actionText,
  actionLink,
  onActionClick
}) => {
  return (
    <Card className="empty-state-card border-0 shadow-sm my-3">
      <Card.Body>
        <div className="empty-state-icon">
          <i className={`bi ${icon}`}></i>
        </div>
        <h5 className="empty-state-title">{title}</h5>
        <p className="empty-state-text">{message}</p>
        {actionText && actionLink && (
          <Button as={Link} to={actionLink} variant="primary" size="sm">
            {actionText}
          </Button>
        )}
        {actionText && onActionClick && (
          <Button onClick={onActionClick} variant="primary" size="sm">
            {actionText}
          </Button>
        )}
      </Card.Body>
    </Card>
  );
};

export default EmptyState;

