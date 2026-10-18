import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { employeeApi } from '../../api/employeeApi.js';
import EmployeeForm from '../../components/employees/EmployeeForm.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';

const EmployeeAdd = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  const handleSubmit = async (formData, setErrors) => {
    try {
      setIsSubmitting(true);
      setServerError(null);
      const res = await employeeApi.createEmployee(formData);
      if (res.success) {
        toast.success(`Employee ${res.data.fullName} created successfully`);
        navigate('/employees');
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to create employee';
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

  return (
    <div>
      <PageHeader
        title="Add New Employee"
        subtitle="Onboard a new team member and configure their department and role."
      />
      <EmployeeForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        isEdit={false}
        serverError={serverError}
        onClearServerError={() => setServerError(null)}
      />
    </div>
  );
};

export default EmployeeAdd;
