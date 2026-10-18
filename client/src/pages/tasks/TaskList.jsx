import React, { useState, useEffect, useCallback } from 'react';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { taskApi } from '../../api/taskApi.js';
import { useQueryParams } from '../../hooks/useQueryParams.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import TaskFilters from '../../components/tasks/TaskFilters.jsx';
import TaskTable from '../../components/tasks/TaskTable.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import ConfirmModal from '../../components/common/ConfirmModal.jsx';
import Loader from '../../components/common/Loader.jsx';

const TaskList = () => {
  const { params, setParam, setMultipleParams, resetParams } = useQueryParams();

  const [searchInput, setSearchInput] = useState(params.search || '');
  const debouncedSearch = useDebounce(searchInput, 400);

  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (debouncedSearch !== (params.search || '')) {
      setMultipleParams({ search: debouncedSearch, page: 1 });
    }
  }, [debouncedSearch]);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const query = {
        page: params.page || 1,
        limit: params.limit || 10,
        search: params.search || '',
        department: params.department || '',
        priority: params.priority || '',
        status: params.status || '',
        isOverdue: params.isOverdue || '',
        dueFrom: params.dueFrom || '',
        dueTo: params.dueTo || '',
        sortBy: params.sortBy || 'createdAt',
        order: params.order || 'desc'
      };

      const res = await taskApi.getTasks(query);
      if (res.success) {
        setTasks(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleStatusChange = async (task, newStatus) => {
    try {
      setStatusUpdatingId(task._id);
      const res = await taskApi.updateTaskStatus(task._id, newStatus);
      if (res.success) {
        toast.success(`Task ${task.taskId} marked as ${newStatus}`);
        fetchTasks();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update task status');
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;

    try {
      setDeleting(true);
      await taskApi.deleteTask(taskToDelete._id);
      toast.success(`Task ${taskToDelete.taskId} deleted successfully`);
      setTaskToDelete(null);
      fetchTasks();
    } catch (err) {
      toast.error(err.message || 'Failed to delete task');
    } finally {
      setDeleting(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      const exportParams = {
        search: params.search || '',
        department: params.department || '',
        priority: params.priority || '',
        status: params.status || '',
        isOverdue: params.isOverdue || '',
        dueFrom: params.dueFrom || '',
        dueTo: params.dueTo || '',
        sortBy: params.sortBy || 'createdAt',
        order: params.order || 'desc'
      };

      await taskApi.exportTasksCsv(exportParams);
      toast.success('Tasks CSV downloaded successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to export CSV');
    } finally {
      setIsExporting(false);
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
        title="Tasks"
        subtitle="Track assignments, priorities, timelines, and status lifecycle across departments."
        actions={
          <Button
            as={Link}
            to="/tasks/new"
            variant="primary"
            className="d-flex align-items-center gap-1 shadow-sm"
          >
            <i className="bi bi-plus-lg"></i> Create Task
          </Button>
        }
      />

      <TaskFilters
        search={searchInput}
        onSearchChange={setSearchInput}
        onSearch={() => setMultipleParams({ search: searchInput, page: 1 })}
        department={params.department || ''}
        onDepartmentChange={(val) => setMultipleParams({ department: val, page: 1 })}
        priority={params.priority || ''}
        onPriorityChange={(val) => setMultipleParams({ priority: val, page: 1 })}
        status={params.status || ''}
        onStatusChange={(val) => setMultipleParams({ status: val, page: 1 })}
        isOverdue={params.isOverdue === 'true'}
        onOverdueToggle={() =>
          setMultipleParams({
            isOverdue: params.isOverdue === 'true' ? '' : 'true',
            page: 1
          })
        }
        dueFrom={params.dueFrom || ''}
        onDueFromChange={(val) => setMultipleParams({ dueFrom: val, page: 1 })}
        dueTo={params.dueTo || ''}
        onDueToChange={(val) => setMultipleParams({ dueTo: val, page: 1 })}
        sortBy={params.sortBy || 'createdAt'}
        onSortByChange={(val) => setParam('sortBy', val)}
        order={params.order || 'desc'}
        onOrderToggle={handleOrderToggle}
        onReset={handleResetFilters}
        onExportCsv={handleExportCsv}
        isExporting={isExporting}
      />

      {loading ? (
        <Loader message="Loading tasks..." />
      ) : (
        <>
          <TaskTable
            tasks={tasks}
            onDelete={(task) => setTaskToDelete(task)}
            onStatusChange={handleStatusChange}
            statusUpdatingId={statusUpdatingId}
          />
          <Pagination
            pagination={pagination}
            onPageChange={(page) => setParam('page', page)}
            entityName="tasks"
          />
        </>
      )}

      <ConfirmModal
        show={Boolean(taskToDelete)}
        onHide={() => setTaskToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Confirm Task Deletion"
        message={`Are you sure you want to delete task "${taskToDelete?.title}" (${taskToDelete?.taskId})? This action cannot be undone.`}
        confirmText="Delete Task"
        confirmVariant="danger"
        isLoading={deleting}
      />
    </div>
  );
};

export default TaskList;

