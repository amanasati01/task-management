import React from 'react';
import { Dropdown } from 'react-bootstrap';

const ActionMenu = ({ items = [] }) => {
  return (
    <Dropdown align="end">
      <Dropdown.Toggle
        variant="light"
        size="sm"
        className="btn-icon p-1 border-0 shadow-none bg-transparent"
        id="dropdown-action-menu"
      >
        <i className="bi bi-three-dots-vertical fs-6"></i>
      </Dropdown.Toggle>

      <Dropdown.Menu className="shadow-sm">
        {items.map((item, index) => {
          if (item.divider) {
            return <Dropdown.Divider key={index} />;
          }

          return (
            <Dropdown.Item
              key={index}
              onClick={item.onClick}
              className={`d-flex align-items-center gap-2 ${item.className || ''}`}
              disabled={item.disabled}
            >
              {item.icon && <i className={`bi ${item.icon}`}></i>}
              <span>{item.label}</span>
            </Dropdown.Item>
          );
        })}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default ActionMenu;

