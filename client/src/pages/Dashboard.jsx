import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { dashboardApi } from '../api/dashboardApi.js';
import StatCard from '../components/dashboard/StatCard.jsx';
import WorkloadTable from '../components/dashboard/WorkloadTable.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import Loader from '../components/common/Loader.jsx';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    employees: { total: 0, active: 0, inactive: 0, onLeave: 0 },
    tasks: { total: 0, todo: 0, inProgress: 0, completed: 0, cancelled: 0, overdue: 0 },
    workload: []
  });

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await dashboardApi.getStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return <Loader message="Compiling team statistics and task metrics..." />;
  }

  const { employees, tasks, workload } = stats;
  const activeTasksTotal = (tasks.todo || 0) + (tasks.inProgress || 0);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Employee status, task metrics, and team workload overview."
        actions={
          <div className="d-flex gap-2">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={fetchStats}
              className="d-flex align-items-center gap-1"
            >
              <i className="bi bi-arrow-clockwise"></i> Refresh
            </Button>
            <Button
              as={Link}
              to="/tasks/new"
              variant="primary"
              size="sm"
              className="d-flex align-items-center gap-1"
            >
              <i className="bi bi-plus-lg"></i> + Add Task
            </Button>
          </div>
        }
      />

      <Row className="g-3 mb-4">
        <Col xl={3} md={6}>
          <StatCard
            title="Total Employees"
            value={employees.total}
            icon="people-fill"
            iconBgClass="bg-primary-subtle text-primary"
            subtitle={`${employees.active} Active • ${employees.onLeave} On Leave • ${employees.inactive} Inactive`}
            clickable
            onClick={() => navigate('/employees')}
          />
        </Col>

        <Col xl={3} md={6}>
          <StatCard
            title="Active Tasks"
            value={activeTasksTotal}
            icon="clock-history"
            iconBgClass="bg-info-subtle text-info"
            subtitle={`${tasks.inProgress} In Progress • ${tasks.todo} Todo`}
            clickable
            onClick={() => navigate('/tasks')}
          />
        </Col>

        <Col xl={3} md={6}>
          <StatCard
            title="Overdue Tasks"
            value={tasks.overdue}
            icon="exclamation-octagon-fill"
            iconBgClass="bg-danger-subtle text-danger"
            subtitle="Past due date & uncompleted"
            clickable
            onClick={() => navigate('/tasks?isOverdue=true')}
          />
        </Col>

        <Col xl={3} md={6}>
          <StatCard
            title="Completed Tasks"
            value={tasks.completed}
            icon="check-circle-fill"
            iconBgClass="bg-success-subtle text-success"
            subtitle={`${tasks.cancelled} Cancelled tasks`}
            clickable
            onClick={() => navigate('/tasks?status=Completed')}
          />
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        <Col lg={4}>
          <Card className="content-card shadow-sm border-0 h-100">
            <Card.Header className="bg-white py-3 border-bottom">
              <h5 className="mb-0 fw-bold">Task Status Distribution</h5>
            </Card.Header>
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                <span className="d-flex align-items-center gap-2">
                  <span className="badge bg-secondary p-1 rounded-circle"> </span> Todo
                </span>
                <span className="fw-bold">{tasks.todo}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                <span className="d-flex align-items-center gap-2">
                  <span className="badge bg-primary p-1 rounded-circle"> </span> In Progress
                </span>
                <span className="fw-bold">{tasks.inProgress}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                <span className="d-flex align-items-center gap-2">
                  <span className="badge bg-success p-1 rounded-circle"> </span> Completed
                </span>
                <span className="fw-bold text-success">{tasks.completed}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                <span className="d-flex align-items-center gap-2">
                  <span className="badge bg-danger p-1 rounded-circle"> </span> Cancelled
                </span>
                <span className="fw-bold text-danger">{tasks.cancelled}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center py-2">
                <span className="d-flex align-items-center gap-2 text-danger fw-semibold">
                  <i className="bi bi-clock-history"></i> Overdue (Action Needed)
                </span>
                <span className="fw-bold text-danger">{tasks.overdue}</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <WorkloadTable workload={workload} />
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;

