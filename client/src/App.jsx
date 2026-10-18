import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { Toaster } from 'react-hot-toast';

import AppNavbar from './components/common/Navbar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import EmployeeList from './pages/employees/EmployeeList.jsx';
import EmployeeAdd from './pages/employees/EmployeeAdd.jsx';
import EmployeeEdit from './pages/employees/EmployeeEdit.jsx';
import EmployeeView from './pages/employees/EmployeeView.jsx';
import TaskList from './pages/tasks/TaskList.jsx';
import TaskAdd from './pages/tasks/TaskAdd.jsx';
import TaskEdit from './pages/tasks/TaskEdit.jsx';
import TaskView from './pages/tasks/TaskView.jsx';
import NotFound from './pages/NotFound.jsx';

function App() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <AppNavbar />

      <main className="flex-grow-1 pb-5">
        <Container>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/employees" element={<EmployeeList />} />
            <Route path="/employees/new" element={<EmployeeAdd />} />
            <Route path="/employees/:id" element={<EmployeeView />} />
            <Route path="/employees/:id/edit" element={<EmployeeEdit />} />
            <Route path="/tasks" element={<TaskList />} />
            <Route path="/tasks/new" element={<TaskAdd />} />
            <Route path="/tasks/:id" element={<TaskView />} />
            <Route path="/tasks/:id/edit" element={<TaskEdit />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Container>
      </main>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '8px',
            background: '#334155',
            color: '#ffffff'
          }
        }}
      />
    </div>
  );
}

export default App;

