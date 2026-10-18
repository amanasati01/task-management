import React from 'react';

const PageHeader = ({ title, subtitle, actions }) => {
  return (
    <div className="page-header-container">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="d-flex align-items-center gap-2">{actions}</div>}
    </div>
  );
};

export default PageHeader;

