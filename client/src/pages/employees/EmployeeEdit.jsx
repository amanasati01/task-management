import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { employeeApi } from '../../api/employeeApi.js';
import EmployeeForm from '../../components/employees/EmployeeForm.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import Loader from '../../components/common/Loader.jsx';

const EmployeeEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setLoading(true);
        const res = await employeeApi.getEmployee(id);
        if (res.success && res.data) {
          setEmployee(res.data);
        }
      } catch (err) {
        toast.error(err.message || 'Failed to fetch employee details');
        navigate('/employees');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id, navigate]);

  const handleSubmit = async (formData, setErrors) => {
    try {
      setIsSubmitting(true);
      setServerError(null);
      const res = await employeeApi.updateEmployee(id, formData);
      if (res.success) {
        toast.success(`Employee ${res.data.fullName} updated successfully`);
        navigate('/employees');
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to update employee';
      setServerError(errorMsg);
      toast.error(errorMsg);

      if (err.errors && Array.isArray(err.errors)) {
        const fieldErrors = {};
        err.errors.forEach((e) => {
          if (e.field) fieldErrors[e.field] = e.message;
        });
        setErrors(fieldErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <Loader message="Fetching employee profile..." />;
  }

  return (
    <div>
      <PageHeader
        title={`Edit Employee: ${employee?.fullName}`}
        subtitle={`Update details for ${employee?.employeeId}`}
      />
      <EmployeeForm
        initialData={employee}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        isEdit={true}
        serverError={serverError}
        onClearServerError={() => setServerError(null)}
      />
    </div>
  );
};

export default EmployeeEdit;
