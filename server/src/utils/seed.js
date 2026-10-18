import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { Employee } from '../models/Employee.js';
import { Task } from '../models/Task.js';
import { Counter } from '../models/Counter.js';
import {
  DEPARTMENTS,
  EMPLOYEE_STATUSES,
  TASK_PRIORITIES,
  TASK_STATUSES,
  PRIORITY_RANK
} from './constants.js';
import { normalizeToUtcMidnight, getTodayKolkataUtcMidnight } from './dateUtils.js';

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('[Seed] Clearing existing collections...');
    await Employee.deleteMany({});
    await Task.deleteMany({});
    await Counter.deleteMany({});

    console.log('[Seed] Inserting sample employees...');
    const today = getTodayKolkataUtcMidnight();

    const datePast = new Date(today);
    datePast.setUTCDate(datePast.getUTCDate() - 30);

    const leaveStart = new Date(today);
    leaveStart.setUTCDate(leaveStart.getUTCDate() + 5);
    const leaveEnd = new Date(today);
    leaveEnd.setUTCDate(leaveEnd.getUTCDate() + 12);

    const employeesData = [
      {
        employeeId: 'EMP-001',
        fullName: 'Rahul Sharma',
        email: 'rahul.sharma@rootsmedia.in',
        phone: '+919876543210',
        department: 'Development',
        role: 'Senior Full Stack Engineer',
        joiningDate: datePast,
        status: EMPLOYEE_STATUSES.ACTIVE,
        skills: ['React', 'Node.js', 'MongoDB', 'Docker'],
        activeTaskCount: 2
      },
      {
        employeeId: 'EMP-002',
        fullName: 'Priya Nair',
        email: 'priya.nair@rootsmedia.in',
        phone: '+919812345678',
        department: 'Design',
        role: 'Lead UI/UX Designer',
        joiningDate: datePast,
        status: EMPLOYEE_STATUSES.ACTIVE,
        skills: ['Figma', 'Wireframing', 'Design Systems', 'Bootstrap'],
        activeTaskCount: 1
      },
      {
        employeeId: 'EMP-003',
        fullName: 'Ananya Verma',
        email: 'ananya.verma@rootsmedia.in',
        phone: '+919823456789',
        department: 'QA',
        role: 'Senior QA Automation Engineer',
        joiningDate: datePast,
        status: EMPLOYEE_STATUSES.ACTIVE,
        skills: ['Cypress', 'Jest', 'API Testing', 'Postman'],
        activeTaskCount: 1
      },
      {
        employeeId: 'EMP-004',
        fullName: 'Siddharth Sen',
        email: 'siddharth.sen@rootsmedia.in',
        phone: '+919834567890',
        department: 'HR',
        role: 'HR Manager',
        joiningDate: datePast,
        status: EMPLOYEE_STATUSES.ON_LEAVE,
        skills: ['Talent Acquisition', 'Employee Relations', 'Payroll'],
        leaveStart,
        leaveEnd,
        activeTaskCount: 0
      },
      {
        employeeId: 'EMP-005',
        fullName: 'Kavita Patel',
        email: 'kavita.patel@rootsmedia.in',
        phone: '+919845678901',
        department: 'Sales',
        role: 'Account Executive',
        joiningDate: datePast,
        status: EMPLOYEE_STATUSES.ACTIVE,
        skills: ['Client Acquisition', 'CRM', 'B2B Sales'],
        activeTaskCount: 1
      },
      {
        employeeId: 'EMP-006',
        fullName: 'Rohan Mehra',
        email: 'rohan.mehra@rootsmedia.in',
        phone: '+919856789012',
        department: 'Development',
        role: 'Frontend Developer',
        joiningDate: datePast,
        status: EMPLOYEE_STATUSES.INACTIVE,
        skills: ['Vue', 'CSS', 'JavaScript'],
        activeTaskCount: 0
      }
    ];

    const insertedEmployees = await Employee.insertMany(employeesData);
    const emp1 = insertedEmployees[0];
    const emp2 = insertedEmployees[1];
    const emp3 = insertedEmployees[2];
    const emp5 = insertedEmployees[4];

    console.log('[Seed] Initializing Counter for taskId...');
    await Counter.create({ _id: 'taskId', seq: 6 });

    const pastStart = new Date(today);
    pastStart.setUTCDate(pastStart.getUTCDate() - 10);
    const pastDue = new Date(today);
    pastDue.setUTCDate(pastDue.getUTCDate() - 2);

    const futureDue = new Date(today);
    futureDue.setUTCDate(futureDue.getUTCDate() + 7);

    const tasksData = [
      {
        taskId: 'TSK-001',
        title: 'Build Authentication and JWT Module',
        description: 'Implement JWT refresh token mechanism and security middleware.',
        assignedEmployee: emp1._id,
        employeeSnapshot: {
          employeeId: emp1.employeeId,
          fullName: emp1.fullName,
          email: emp1.email,
          department: emp1.department,
          role: emp1.role
        },
        department: emp1.department,
        priority: TASK_PRIORITIES.CRITICAL,
        priorityRank: PRIORITY_RANK[TASK_PRIORITIES.CRITICAL],
        status: TASK_STATUSES.IN_PROGRESS,
        startDate: pastStart,
        dueDate: futureDue
      },
      {
        taskId: 'TSK-002',
        title: 'Fix Database Connection Pooling Timeout',
        description: 'Optimize MongoDB Mongoose connection options and replica set failover.',
        assignedEmployee: emp1._id,
        employeeSnapshot: {
          employeeId: emp1.employeeId,
          fullName: emp1.fullName,
          email: emp1.email,
          department: emp1.department,
          role: emp1.role
        },
        department: emp1.department,
        priority: TASK_PRIORITIES.HIGH,
        priorityRank: PRIORITY_RANK[TASK_PRIORITIES.HIGH],
        status: TASK_STATUSES.TODO,
        startDate: pastStart,
        dueDate: pastDue
      },
      {
        taskId: 'TSK-003',
        title: 'Revamp Dashboard UI and Dark Mode Tokens',
        description: 'Create responsive design components and wireframes in Figma.',
        assignedEmployee: emp2._id,
        employeeSnapshot: {
          employeeId: emp2.employeeId,
          fullName: emp2.fullName,
          email: emp2.email,
          department: emp2.department,
          role: emp2.role
        },
        department: emp2.department,
        priority: TASK_PRIORITIES.HIGH,
        priorityRank: PRIORITY_RANK[TASK_PRIORITIES.HIGH],
        status: TASK_STATUSES.TODO,
        startDate: today,
        dueDate: futureDue
      },
      {
        taskId: 'TSK-004',
        title: 'End-to-End Regression Test Suite Execution',
        description: 'Automate test coverage for employee onboarding and task assignment flows.',
        assignedEmployee: emp3._id,
        employeeSnapshot: {
          employeeId: emp3.employeeId,
          fullName: emp3.fullName,
          email: emp3.email,
          department: emp3.department,
          role: emp3.role
        },
        department: emp3.department,
        priority: TASK_PRIORITIES.MEDIUM,
        priorityRank: PRIORITY_RANK[TASK_PRIORITIES.MEDIUM],
        status: TASK_STATUSES.IN_PROGRESS,
        startDate: pastStart,
        dueDate: pastDue
      },
      {
        taskId: 'TSK-005',
        title: 'Q4 Enterprise Client Onboarding Campaign',
        description: 'Prepare pitch decks, coordinate demos, and schedule client calls.',
        assignedEmployee: emp5._id,
        employeeSnapshot: {
          employeeId: emp5.employeeId,
          fullName: emp5.fullName,
          email: emp5.email,
          department: emp5.department,
          role: emp5.role
        },
        department: emp5.department,
        priority: TASK_PRIORITIES.MEDIUM,
        priorityRank: PRIORITY_RANK[TASK_PRIORITIES.MEDIUM],
        status: TASK_STATUSES.IN_PROGRESS,
        startDate: today,
        dueDate: futureDue
      },
      {
        taskId: 'TSK-006',
        title: 'Initial Brand Design Guidelines Document',
        description: 'Typography, color palettes and logo usage rules delivered.',
        assignedEmployee: emp2._id,
        employeeSnapshot: {
          employeeId: emp2.employeeId,
          fullName: emp2.fullName,
          email: emp2.email,
          department: emp2.department,
          role: emp2.role
        },
        department: emp2.department,
        priority: TASK_PRIORITIES.LOW,
        priorityRank: PRIORITY_RANK[TASK_PRIORITIES.LOW],
        status: TASK_STATUSES.COMPLETED,
        startDate: pastStart,
        dueDate: pastDue,
        completedDate: pastDue
      }
    ];

    await Task.insertMany(tasksData);

    console.log('[Seed] Database successfully seeded with 6 employees and 6 tasks!');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]', err);
    process.exit(1);
  }
};

seedDatabase();
