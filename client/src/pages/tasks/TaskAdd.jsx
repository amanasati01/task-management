import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { taskApi } from '../../api/taskApi.js';
import TaskForm from '../../components/tasks/TaskForm.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';

const TaskAdd = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  const handleSubmit = async (formData, setErrors) => {
    try {
      setIsSubmitting(true);
      setServerError(null);
      const res = await taskApi.createTask(formData);
      if (res.success) {
        toast.success(`Task ${res.data.taskId} created successfully`);
        navigate('/tasks');
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to create task';
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
        title="Create New Task"
        subtitle="Define a work item, set priority, schedule dates, and allocate to team members."
      />
      <TaskForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        isEdit={false}
        serverError={serverError}
        onClearServerError={() => setServerError(null)}
      />
    </div>
  );
};

export default TaskAdd;
