import React, { useState, useEffect, useCallback } from 'react';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { employeeApi } from '../../api/employeeApi.js';
import { useQueryParams } from '../../hooks/useQueryParams.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import EmployeeFilters from '../../components/employees/EmployeeFilters.jsx';
import EmployeeTable from '../../components/employees/EmployeeTable.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import ConfirmModal from '../../components/common/ConfirmModal.jsx';
import Loader from '../../components/common/Loader.jsx';

const EmployeeList = () => {
  const { params, setParam, setMultipleParams, resetParams } = useQueryParams();

  const [searchInput, setSearchInput] = useState(params.search || '');
  const debouncedSearch = useDebounce(searchInput, 400);

  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (debouncedSearch !== (params.search || '')) {
      setMultipleParams({ search: debouncedSearch, page: 1 });
    }
  }, [debouncedSearch]);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const query = {
        page: params.page || 1,
        limit: params.limit || 10,
        search: params.search || '',
        department: params.department || '',
        status: params.status || '',
        sortBy: params.sortBy || 'createdAt',
        order: params.order || 'desc'
      };

      const res = await employeeApi.getEmployees(query);
      if (res.success) {
        setEmployees(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleDeleteConfirm = async () => {
    if (!employeeToDelete) return;

    try {
      setDeleting(true);
      await employeeApi.deleteEmployee(employeeToDelete._id);
      toast.success(`Employee ${employeeToDelete.fullName} deleted successfully`);
      setEmployeeToDelete(null);
      fetchEmployees();
    } catch (err) {
      toast.error(err.message || 'Failed to delete employee');
    } finally {
      setDeleting(false);
    }
  };

  const handleOrderToggle = () => {
    const nextOrder = params.order === 'asc' ? 'desc' : 'asc';
    setParam('order', nextOrder);
  };

  const handleResetFilters = () => {
    setSearchInput('');
    resetParams();
  };

  return (
    <div>
      <PageHeader
        title="Employees"
        subtitle="Manage department rosters, workload allocations, and employee profiles."
        actions={
          <Button
            as={Link}
            to="/employees/new"
            variant="primary"
            className="d-flex align-items-center gap-1 shadow-sm"
          >
            <i className="bi bi-person-plus"></i> Add Employee
          </Button>
        }
      />

      <EmployeeFilters
        search={searchInput}
        onSearchChange={setSearchInput}
        onSearch={() => setMultipleParams({ search: searchInput, page: 1 })}
        department={params.department || ''}
        onDepartmentChange={(val) => setMultipleParams({ department: val, page: 1 })}
        status={params.status || ''}
        onStatusChange={(val) => setMultipleParams({ status: val, page: 1 })}
        sortBy={params.sortBy || 'createdAt'}
        onSortByChange={(val) => setParam('sortBy', val)}
        order={params.order || 'desc'}
        onOrderToggle={handleOrderToggle}
        onReset={handleResetFilters}
      />

      {loading ? (
        <Loader message="Loading employees..." />
      ) : (
        <>
          <EmployeeTable
            employees={employees}
            onDelete={(emp) => setEmployeeToDelete(emp)}
          />
          <Pagination
            pagination={pagination}
            onPageChange={(page) => setParam('page', page)}
            entityName="employees"
          />
        </>
      )}

      <ConfirmModal
        show={Boolean(employeeToDelete)}
        onHide={() => setEmployeeToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Confirm Employee Deletion"
        message={`Are you sure you want to delete ${employeeToDelete?.fullName} (${employeeToDelete?.employeeId})? This action cannot be undone.`}
        confirmText="Delete Employee"
        confirmVariant="danger"
        isLoading={deleting}
      />
    </div>
  );
};

export default EmployeeList;

