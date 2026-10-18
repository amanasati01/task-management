import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { taskApi } from '../../api/taskApi.js';
import TaskForm from '../../components/tasks/TaskForm.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import Loader from '../../components/common/Loader.jsx';
import { TASK_STATUSES } from '../../utils/constants.js';

const TaskEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true);
        const res = await taskApi.getTask(id);
        if (res.success && res.data) {
          const taskData = res.data;
          if (
            taskData.status === TASK_STATUSES.COMPLETED ||
            taskData.status === TASK_STATUSES.CANCELLED
          ) {
            toast.error(`Task ${taskData.taskId} is ${taskData.status} and cannot be edited`);
            navigate(`/tasks/${id}`);
            return;
          }
          setTask(taskData);
        }
      } catch (err) {
        toast.error(err.message || 'Failed to load task details');
        navigate('/tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id, navigate]);

  const handleSubmit = async (formData, setErrors) => {
    try {
      setIsSubmitting(true);
      setServerError(null);
      const res = await taskApi.updateTask(id, formData);
      if (res.success) {
        toast.success(`Task ${res.data.taskId} updated successfully`);
        navigate('/tasks');
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to update task';
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
    return <Loader message="Fetching task details..." />;
  }

  return (
    <div>
      <PageHeader
        title={`Edit Task: ${task?.taskId}`}
        subtitle={`Update attributes, reschedule, or reassign ${task?.title}`}
      />
      <TaskForm
        initialData={task}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        isEdit={true}
        serverError={serverError}
        onClearServerError={() => setServerError(null)}
      />
    </div>
  );
};

export default TaskEdit;
