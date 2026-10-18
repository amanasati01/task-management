import React from 'react';
import { Pagination as BsPagination } from 'react-bootstrap';

const Pagination = ({ pagination, onPageChange, entityName = 'tasks' }) => {
  if (!pagination || pagination.totalPages <= 1) {
    return null;
  }

  const { page, totalPages, total, limit } = pagination;

  const startRecord = (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, total);

  const items = [];
  const maxButtons = 5;
  let startPage = Math.max(1, page - Math.floor(maxButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxButtons - 1);

  if (endPage - startPage + 1 < maxButtons) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  for (let number = startPage; number <= endPage; number++) {
    items.push(
      <BsPagination.Item
        key={number}
        active={number === page}
        onClick={() => onPageChange(number)}
      >
        {number}
      </BsPagination.Item>
    );
  }

  return (
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-3 gap-2">
      <small className="text-muted">
        Showing <span className="fw-semibold">{startRecord}-{endRecord}</span> of{' '}
        <span className="fw-semibold">{total}</span> {entityName}
      </small>

      <BsPagination className="mb-0">
        <BsPagination.First
          disabled={page === 1}
          onClick={() => onPageChange(1)}
        />
        <BsPagination.Prev
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        />
        {items}
        <BsPagination.Next
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
        />
        <BsPagination.Last
          disabled={page === totalPages}
          onClick={() => onPageChange(totalPages)}
        />
      </BsPagination>
    </div>
  );
};

export default Pagination;
