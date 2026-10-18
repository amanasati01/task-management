import React from 'react';
import { InputGroup, Form, Button } from 'react-bootstrap';

const SearchBar = ({
  value,
  onChange,
  onSearch,
  onClear,
  placeholder = 'Search...',
  className = ''
}) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (onSearch) onSearch();
    }
  };

  return (
    <InputGroup className={`search-bar-input ${className}`}>
      <Form.Control
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="shadow-none"
      />
      {value && (
        <Button
          variant="outline-secondary"
          onClick={onClear}
          title="Clear search"
        >
          <i className="bi bi-x-lg"></i>
        </Button>
      )}
      <Button
        variant="primary"
        onClick={() => onSearch && onSearch()}
        className="d-flex align-items-center gap-1"
      >
        <i className="bi bi-search"></i>
        <span>Search</span>
      </Button>
    </InputGroup>
  );
};

export default SearchBar;
