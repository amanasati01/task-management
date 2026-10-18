import React from 'react';
import { Card } from 'react-bootstrap';

const StatCard = ({
  title,
  value,
  icon,
  iconBgClass = 'bg-primary-subtle text-primary',
  subtitle,
  onClick,
  clickable = false
}) => {
  return (
    <Card
      className={`stat-card h-100 ${clickable ? 'cursor-pointer' : ''}`}
      onClick={clickable ? onClick : undefined}
    >
      <Card.Body className="p-3">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <span className="stat-label">{title}</span>
          <div className={`stat-icon-wrapper ${iconBgClass}`}>
            <i className={`bi ${icon}`}></i>
          </div>
        </div>
        <div className="stat-value text-dark">{value}</div>
        {subtitle && <small className="text-muted mt-1 d-block">{subtitle}</small>}
      </Card.Body>
    </Card>
  );
};

export default StatCard;

