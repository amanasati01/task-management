import React from 'react';
import { Spinner } from 'react-bootstrap';

const Loader = ({ message = 'Loading details...' }) => {
  return (
    <div className="loader-container">
      <Spinner animation="border" variant="primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
      <div className="loader-text">{message}</div>
    </div>
  );
};

export default Loader;

