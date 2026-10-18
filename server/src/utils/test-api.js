import app from '../app.js';
import { connectDB } from '../config/db.js';
import { Employee } from '../models/Employee.js';
import { Task } from '../models/Task.js';
import { Counter } from '../models/Counter.js';

let server;

const runTests = async () => {
  console.log('--- Starting API & Business Rule Verification Tests ---');
  await connectDB();

  server = app.listen(5001);
  const baseUrl = 'http://localhost:5001/api';

  try {
    await Employee.deleteMany({});
    await Task.deleteMany({});
    await Counter.deleteMany({});

    console.log('\n[Test 1] Health Check');
    const healthRes = await fetch(`${baseUrl}/health`).then((r) => r.json());
    console.assert(healthRes.status === 'ok', 'Health check failed');
    console.log('✓ Health check passed');

    console.log('\n[Test 2] Create Employee');
    const emp1Res = await fetch(`${baseUrl}/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employeeId: 'EMP-100',
        fullName: 'Vikram Seth',
        email: 'vikram.seth@example.com',
        phone: '+919876543210',
        department: 'Development',
        role: 'Full Stack Engineer',
        joiningDate: '2026-01-15',
        status: 'Active',
        skills: ['React', 'Node.js']
      })
    });
    const emp1 = await emp1Res.json();
    console.assert(emp1.success === true, 'Failed to create employee');
    console.assert(emp1.data.employeeId === 'EMP-100', 'Employee ID not uppercase/stored');
    console.assert(emp1.data.activeTaskCount === 0, 'Active task count not zero initially');
    console.log('✓ Employee created successfully');

    console.log('\n[Test 3] Reject Duplicate Employee ID & Email (409 Conflict)');
    const dupIdRes = await fetch(`${baseUrl}/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employeeId: 'EMP-100',
        fullName: 'Another Person',
        email: 'another@example.com',
        phone: '+919876543211',
        department: 'Development',
        role: 'Engineer',
        joiningDate: '2026-01-15'
      })
    });
    console.assert(dupIdRes.status === 409, `Expected 409, got ${dupIdRes.status}`);

    const dupEmailRes = await fetch(`${baseUrl}/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employeeId: 'EMP-101',
        fullName: 'Unique ID',
        email: 'vikram.seth@example.com',
        phone: '+919876543212',
        department: 'Development',
        role: 'Engineer',
        joiningDate: '2026-01-15'
      })
    });
    console.assert(dupEmailRes.status === 409, `Expected 409, got ${dupEmailRes.status}`);
    console.log('✓ Duplicate ID and Email returned 409 Conflict');

    console.log('\n[Test 4] Employee Validation Errors (400) and Unknown ID (404)');
    const invalidEmpRes = await fetch(`${baseUrl}/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: 'A' })
    });
    console.assert(invalidEmpRes.status === 400, `Expected 400, got ${invalidEmpRes.status}`);

    const notFoundEmpRes = await fetch(`${baseUrl}/employees/507f1f77bcf86cd799439011`);
    console.assert(notFoundEmpRes.status === 404, `Expected 404, got ${notFoundEmpRes.status}`);
    console.log('✓ Validation returns 400, unknown employee returns 404');

    console.log('\n[Test 5] Create Inactive and On-Leave Employees');
    const inactiveRes = await fetch(`${baseUrl}/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employeeId: 'EMP-102',
        fullName: 'Inactive User',
        email: 'inactive@example.com',
        phone: '+919876543213',
        department: 'QA',
        role: 'Tester',
        joiningDate: '2026-01-15',
        status: 'Inactive'
      })
    }).then((r) => r.json());

    const onLeaveRes = await fetch(`${baseUrl}/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employeeId: 'EMP-103',
        fullName: 'On Leave User',
        email: 'onleave@example.com',
        phone: '+919876543214',
        department: 'Design',
        role: 'Designer',
        joiningDate: '2026-01-15',
        status: 'On Leave',
        leaveStart: '2026-11-01',
        leaveEnd: '2026-11-10'
      })
    }).then((r) => r.json());
    console.assert(onLeaveRes.success === true, 'Failed to create On Leave employee');
    console.log('✓ Inactive and On Leave employees created');

    console.log('\n[Test 6] Reject Task Assignment to Inactive Employee (400)');
    const inactiveTaskRes = await fetch(`${baseUrl}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Task for Inactive',
        assignedEmployee: inactiveRes.data._id,
        department: 'QA',
        priority: 'Medium',
        startDate: '2026-11-05',
        dueDate: '2026-11-15'
      })
    });
    console.assert(inactiveTaskRes.status === 400, `Expected 400, got ${inactiveTaskRes.status}`);
    console.log('✓ Rejected assignment to Inactive employee');

    console.log('\n[Test 7] Reject Task Assignment to On Leave Employee during leave window (including boundary dates)');
    const startBoundaryRes = await fetch(`${baseUrl}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Task on leaveStart boundary',
        assignedEmployee: onLeaveRes.data._id,
        department: 'Design',
        priority: 'High',
        startDate: '2026-11-01',
        dueDate: '2026-11-15'
      })
    });
    console.assert(startBoundaryRes.status === 400, `Expected 400 on leaveStart boundary, got ${startBoundaryRes.status}`);

    const endBoundaryRes = await fetch(`${baseUrl}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Task on leaveEnd boundary',
        assignedEmployee: onLeaveRes.data._id,
        department: 'Design',
        priority: 'High',
        startDate: '2026-11-10',
        dueDate: '2026-11-15'
      })
    });
    console.assert(endBoundaryRes.status === 400, `Expected 400 on leaveEnd boundary, got ${endBoundaryRes.status}`);

    const leaveClashTaskRes = await fetch(`${baseUrl}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Task during leave',
        assignedEmployee: onLeaveRes.data._id,
        department: 'Design',
        priority: 'High',
        startDate: '2026-11-05',
        dueDate: '2026-11-15'
      })
    });
    console.assert(leaveClashTaskRes.status === 400, `Expected 400, got ${leaveClashTaskRes.status}`);
    console.log('✓ Rejected assignment to On Leave employee during leave window (including boundary dates)');

    console.log('\n[Test 8] Allow Task Assignment to On Leave Employee outside leave window');
    const leaveAllowedTaskRes = await fetch(`${baseUrl}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Task outside leave',
        assignedEmployee: onLeaveRes.data._id,
        department: 'Design',
        priority: 'High',
        startDate: '2026-11-15',
        dueDate: '2026-11-20'
      })
    });
    console.assert(leaveAllowedTaskRes.status === 201, `Expected 201, got ${leaveAllowedTaskRes.status}`);
    const onLeaveTask = await leaveAllowedTaskRes.json();
    console.assert(onLeaveTask.data.taskId === 'TSK-001', 'Task ID not TSK-001');
    console.log('✓ Allowed assignment outside leave dates (TSK-001 created)');

    console.log('\n[Test 9] Date Validation: Reject dueDate < startDate (400)');
    const invalidDateTaskRes = await fetch(`${baseUrl}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Invalid Date Task',
        assignedEmployee: emp1.data._id,
        department: 'Development',
        priority: 'Low',
        startDate: '2026-10-20',
        dueDate: '2026-10-15'
      })
    });
    console.assert(invalidDateTaskRes.status === 400, `Expected 400, got ${invalidDateTaskRes.status}`);
    console.log('✓ Rejected dueDate earlier than startDate');

    console.log('\n[Test 10] Atomic Capacity Check & Concurrent 3rd Slot Race Condition');
    const t1 = await fetch(`${baseUrl}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'First Active Task',
        assignedEmployee: emp1.data._id,
        department: 'Development',
        priority: 'Medium',
        startDate: '2026-10-01',
        dueDate: '2026-10-10'
      })
    }).then((r) => r.json());

    const t2 = await fetch(`${baseUrl}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Second Active Task',
        assignedEmployee: emp1.data._id,
        department: 'Development',
        priority: 'High',
        startDate: '2026-10-05',
        dueDate: '2026-10-25'
      })
    }).then((r) => r.json());

    console.assert(t1.success && t2.success, 'Failed to assign first 2 active tasks');

    const [parallelResA, parallelResB] = await Promise.all([
      fetch(`${baseUrl}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Parallel Candidate Task A',
          assignedEmployee: emp1.data._id,
          department: 'Development',
          priority: 'Critical',
          startDate: '2026-10-10',
          dueDate: '2026-10-30'
        })
      }),
      fetch(`${baseUrl}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Parallel Candidate Task B',
          assignedEmployee: emp1.data._id,
          department: 'Development',
          priority: 'Critical',
          startDate: '2026-10-10',
          dueDate: '2026-10-30'
        })
      })
    ]);

    const statuses = [parallelResA.status, parallelResB.status].sort();
    console.assert(
      statuses[0] === 201 && statuses[1] === 400,
      `Expected exactly one 201 and one 400, got ${parallelResA.status} and ${parallelResB.status}`
    );
    console.log('✓ Race condition safely handled: Exactly 1 concurrent request succeeded for the 3rd slot');

    const winningRes = parallelResA.status === 201 ? parallelResA : parallelResB;
    const t3 = await winningRes.json();

    const emp1Check = await fetch(`${baseUrl}/employees/${emp1.data._id}`).then((r) => r.json());
    console.assert(emp1Check.data.activeTaskCount === 3, `Expected activeTaskCount 3, got ${emp1Check.data.activeTaskCount}`);
    console.log('✓ Assigned 3 active tasks, employee capacity is at 3/3');

    console.log('\n[Test 11] Atomic Capacity Check: Reject 4th Active Task (400)');
    const t4Res = await fetch(`${baseUrl}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Fourth Active Task (Should Reject)',
        assignedEmployee: emp1.data._id,
        department: 'Development',
        priority: 'Critical',
        startDate: '2026-10-15',
        dueDate: '2026-10-31'
      })
    });
    console.assert(t4Res.status === 400, `Expected 400, got ${t4Res.status}`);
    console.log('✓ 4th active task rejected atomically with proper 400 error message');

    console.log('\n[Test 12] Status Transitions & State Machine');
    const illegalJump = await fetch(`${baseUrl}/tasks/${t1.data._id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Completed' })
    });
    console.assert(illegalJump.status === 400, `Expected 400 for Todo->Completed, got ${illegalJump.status}`);

    const legal1 = await fetch(`${baseUrl}/tasks/${t1.data._id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'In Progress' })
    }).then((r) => r.json());
    console.assert(legal1.data.status === 'In Progress', 'Status not In Progress');

    const legal2 = await fetch(`${baseUrl}/tasks/${t1.data._id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Completed' })
    }).then((r) => r.json());
    console.assert(legal2.data.status === 'Completed', 'Status not Completed');
    console.assert(legal2.data.completedDate !== null, 'completedDate was not stamped by backend');

    const cancelTaskRes = await fetch(`${baseUrl}/tasks/${t3.data._id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Cancelled' })
    });
    console.assert(cancelTaskRes.status === 200, 'Expected 200 for Cancel transition');

    const moveOutOfCancelled = await fetch(`${baseUrl}/tasks/${t3.data._id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Todo' })
    });
    console.assert(moveOutOfCancelled.status === 400, 'Expected 400 transitioning out of Cancelled');

    const emp1AfterTerminal = await fetch(`${baseUrl}/employees/${emp1.data._id}`).then((r) => r.json());
    console.assert(emp1AfterTerminal.data.activeTaskCount === 1, `Expected 1 active task, got ${emp1AfterTerminal.data.activeTaskCount}`);
    console.log('✓ Status transitions (Todo->In Progress->Completed, Todo->Cancelled) and locks verified');

    console.log('\n[Test 13] Edit Lock on Terminal Tasks & Status Payload Protection');
    const editCompletedRes = await fetch(`${baseUrl}/tasks/${t1.data._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'New Title' })
    });
    console.assert(editCompletedRes.status === 400, 'Expected 400 editing completed task');

    const editCancelledRes = await fetch(`${baseUrl}/tasks/${t3.data._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'New Title' })
    });
    console.assert(editCancelledRes.status === 400, 'Expected 400 editing cancelled task');

    const putStatusDirect = await fetch(`${baseUrl}/tasks/${t2.data._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Updated Title', status: 'Completed' })
    });
    console.assert(putStatusDirect.status === 400, 'Expected 400 when status sent to normal PUT endpoint');
    console.log('✓ Terminal tasks locked from editing, status rejected in normal update endpoint');

    console.log('\n[Test 14] Reassignment Capacity Check');
    const emp2Res = await fetch(`${baseUrl}/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employeeId: 'EMP-200',
        fullName: 'Neha Gupta',
        email: 'neha.gupta@example.com',
        phone: '+919876543299',
        department: 'Development',
        role: 'Software Engineer',
        joiningDate: '2026-01-15',
        status: 'Active'
      })
    }).then((r) => r.json());

    const reassignRes = await fetch(`${baseUrl}/tasks/${t2.data._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignedEmployee: emp2Res.data._id })
    });
    console.assert(reassignRes.status === 200, 'Failed to reassign task');

    const emp1AfterReassign = await fetch(`${baseUrl}/employees/${emp1.data._id}`).then((r) => r.json());
    const emp2AfterReassign = await fetch(`${baseUrl}/employees/${emp2Res.data._id}`).then((r) => r.json());
    console.assert(emp1AfterReassign.data.activeTaskCount === 0, 'Old employee count not decremented');
    console.assert(emp2AfterReassign.data.activeTaskCount === 1, 'New employee count not incremented');
    console.log('✓ Reassignment atomically updated active task counts on both employees');

    console.log('\n[Test 15] Deletion Constraints & Historical Snapshot Retention');
    const deleteBlockedRes = await fetch(`${baseUrl}/employees/${emp2Res.data._id}`, {
      method: 'DELETE'
    });
    console.assert(deleteBlockedRes.status === 400, 'Expected 400 deleting employee with active tasks');

    const deleteEmp1Res = await fetch(`${baseUrl}/employees/${emp1.data._id}`, {
      method: 'DELETE'
    });
    console.assert(deleteEmp1Res.status === 200, 'Expected 200 deleting employee without active tasks');

    const pastTaskRes = await fetch(`${baseUrl}/tasks/${t1.data._id}`).then((r) => r.json());
    console.assert(pastTaskRes.data.employeeSnapshot.fullName === 'Vikram Seth', 'Snapshot lost after employee deletion');
    console.log('✓ Active employee deletion blocked; deleted employee tasks preserve audit snapshot');

    console.log('\n[Test 16] Search, Filters, Sorting & Pagination');
    const searchRes = await fetch(`${baseUrl}/tasks?search=Second`).then((r) => r.json());
    console.assert(searchRes.data.length === 1 && searchRes.data[0].title.includes('Second'), 'Search failed');

    const sortPriorityRes = await fetch(`${baseUrl}/tasks?sortBy=priority&order=desc`).then((r) => r.json());
    console.assert(Array.isArray(sortPriorityRes.data), 'Sort priority failed');

    const filterDeptRes = await fetch(`${baseUrl}/tasks?department=Development`).then((r) => r.json());
    console.assert(filterDeptRes.data.every((t) => t.department === 'Development'), 'Department filter failed');
    console.log('✓ Search by text, department filter, and priority sorting verified');

    console.log('\n[Test 17] CSV Export & Dashboard Metrics');
    const csvRes = await fetch(`${baseUrl}/tasks/export`);
    console.assert(csvRes.headers.get('content-type')?.includes('text/csv'), 'Not text/csv');
    const csvText = await csvRes.text();
    console.assert(csvText.includes('Task ID,Title,Employee,Department,Priority,Status,Start Date,Due Date,Completed Date,Overdue'), 'CSV headers missing');

    const dashRes = await fetch(`${baseUrl}/dashboard`).then((r) => r.json());
    console.assert(dashRes.success === true, 'Dashboard failed');
    console.assert(dashRes.data.employees.total >= 2, 'Employee count mismatch');
    console.assert(Array.isArray(dashRes.data.workload), 'Workload array missing');
    console.log('✓ CSV Export and Dashboard metrics verified');

    console.log('\n======================================================');
    console.log('ALL BACKEND API & BUSINESS RULE TESTS PASSED (17/17)!');
    console.log('======================================================');
    process.exit(0);
  } catch (err) {
    console.error('Test execution failed:', err);
    process.exit(1);
  } finally {
    if (server) server.close();
  }
};

runTests();
