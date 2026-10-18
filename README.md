# Employee & Task Management System

I built this Employee & Task Management System for the Roots Media Marketing technical test using Node.js, Express, MongoDB, and React. It manages employee records, enforces a strict capacity limit of 3 active tasks per employee, validates task status lifecycles, computes overdue tasks, and exports filtered data to CSV.

## Deployment Links

- Frontend: https://task-management-h9351vz9t-aman-asatis-projects.vercel.app/
- Backend API: https://task-management-7ydn.onrender.com
- Health Check: https://task-management-7ydn.onrender.com/api/health

## Tech Stack

- Backend: Node.js (ES Modules), Express, Mongoose (MongoDB), express-validator, morgan, dotenv, cors.
- Frontend: React 18, Vite, React Router v6, Axios, react-bootstrap, bootstrap-icons, react-hot-toast, custom CSS (no inline styles).
- Database: MongoDB with atomic operations and counter collections.

## Setup & Running Locally

### 1. Backend Setup
```bash
cd server
cp .env.example .env
npm install
npm run seed
npm run dev
```
To run the automated API verification tests:
```bash
node src/utils/test-api.js
```

### 2. Frontend Setup
```bash
cd client
cp .env.example .env
npm install
npm run dev
```
To build for production:
```bash
npm run build
```

## Environment Variables

### Server (`server/.env`)
- `PORT`: Server port (default: `5000`)
- `MONGODB_URI`: MongoDB connection string (default: `mongodb://localhost:27017/task_management_db`)
- `NODE_ENV`: Environment mode (`development` or `production`)
- `CLIENT_URL`: Client URL for CORS in production (default: `http://localhost:5173`)
- `TIMEZONE`: Business timezone (default: `Asia/Kolkata`)

### Client (`client/.env`)
- `VITE_API_BASE_URL`: API root URL (default: `http://localhost:5000/api`)

## Folder Structure

```
task-management/
├── server/
│   ├── src/
│   │   ├── config/        # db.js, env.js
│   │   ├── models/        # Employee.js, Task.js, Counter.js
│   │   ├── controllers/   # employee.controller.js, task.controller.js, dashboard.controller.js
│   │   ├── services/      # employee.service.js, task.service.js
│   │   ├── routes/        # employee.routes.js, task.routes.js, dashboard.routes.js, index.js
│   │   ├── middleware/    # validate.js, errorHandler.js, notFound.js
│   │   ├── validators/    # employee.validator.js, task.validator.js
│   │   ├── utils/         # ApiError.js, asyncHandler.js, constants.js, dateUtils.js, csv.js, seed.js, test-api.js
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── client/
│   ├── src/
│   │   ├── api/           # axiosClient.js, employeeApi.js, taskApi.js, dashboardApi.js
│   │   ├── components/    # common, employees, tasks, dashboard
│   │   ├── pages/         # Dashboard, employees, tasks, NotFound
│   │   ├── hooks/         # useQueryParams.js, useDebounce.js
│   │   ├── utils/         # constants.js, formatters.js, validators.js
│   │   ├── styles/        # main.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/            # _redirects (Netlify SPA routing)
│   ├── vercel.json        # Vercel SPA rewrite
│   ├── .env.example
│   └── package.json
├── README.md
└── .gitignore
```

## Data Schema & Relationships

### Employee
- `employeeId`: Unique string, uppercase, trimmed (e.g. `EMP-001`).
- `fullName`: String (2-60 chars).
- `email`: Unique string, lowercased, validated.
- `phone`: String, validated for Indian 10-digit or international format.
- `department`: Fixed list (`Development`, `Design`, `QA`, `HR`, `Sales`).
- `role`: String.
- `joiningDate`: Date, cannot be in the future.
- `status`: Enum (`Active`, `Inactive`, `On Leave`).
- `skills`: Array of strings.
- `leaveStart`, `leaveEnd`: Dates required only when status is `On Leave`; cleared otherwise.
- `activeTaskCount`: Number tracked atomically by the backend.

### Task
- `taskId`: Sequential ID (`TSK-001`, `TSK-002`, ...) tracked by an atomic Counter collection.
- `title`: String (3-100 chars).
- `description`: Optional string (max 1000 chars).
- `assignedEmployee`: Reference ObjectId to Employee.
- `employeeSnapshot`: Snapshot `{ employeeId, fullName, email, department, role }` saved at assignment time.
- `department`: Department enum.
- `priority`: Enum (`Low`, `Medium`, `High`, `Critical`).
- `status`: Enum (`Todo`, `In Progress`, `Completed`, `Cancelled`), starts as `Todo`.
- `startDate`, `dueDate`: Dates stored as UTC midnight (`dueDate >= startDate`).
- `completedDate`: Date set only by the backend upon completion.

### Employee to Task Relationship & Deletion
Tasks store both an ObjectId reference (`assignedEmployee`) and an embedded snapshot (`employeeSnapshot`). If an employee has active tasks (`Todo` or `In Progress`), deleting them is rejected with a 400. If they have only completed or cancelled tasks, deletion is permitted; past tasks retain the snapshot and show the employee name with a `(deleted)` tag in the UI.

## Assumptions
- Timezone: `Asia/Kolkata` is used to determine today's date for overdue calculations (`today > dueDate` for non-terminal tasks). All dates are stored as date-only UTC midnight values to avoid client/server timezone date shifting.
- Status and leave changes: When an employee's status changes to `Inactive` or `On Leave`, existing tasks are not auto-reassigned to preserve historical records and avoid breaking other employees' capacity limits.
- Terminal tasks: `Completed` and `Cancelled` tasks cannot be edited via update endpoints; they can only be deleted.

## API Endpoints

| Method | Route | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/employees` | Create employee |
| GET | `/api/employees` | List employees with filters, sort, pagination |
| GET | `/api/employees/options` | Dropdown options for assignable employees |
| GET | `/api/employees/:id` | Get employee profile and their tasks |
| PUT | `/api/employees/:id` | Update employee profile |
| DELETE | `/api/employees/:id` | Delete employee (blocked if active tasks exist) |
| POST | `/api/tasks` | Create task with atomic capacity check |
| GET | `/api/tasks` | List tasks with search, filters, sort, pagination |
| GET | `/api/tasks/export` | Export filtered tasks to RFC 4180 CSV |
| GET | `/api/tasks/:id` | Get task details |
| PUT | `/api/tasks/:id` | Update task details (locked for terminal tasks) |
| PUT | `/api/tasks/:id/status` | Advance task status through allowed transitions |
| DELETE | `/api/tasks/:id` | Delete task and decrement capacity |
| GET | `/api/dashboard` | Aggregated dashboard stats and workload |

## Architecture Questions & Answers

### 1. Where do you validate status transitions and why?
I validate status transitions in the service layer on the backend (`task.service.js`) using a transitions map (`ALLOWED_STATUS_TRANSITIONS`). The frontend only restricts dropdown options for UX, but client requests can be bypassed. Checking this on the server guarantees the state machine cannot be violated.

### 2. Why does Completed Date come from the backend?
`completedDate` is set exclusively by the backend when the task transitions to Completed. This prevents clients from backdating, forging, or tampering with completion timestamps. The create and update endpoints completely ignore any client-supplied completion date.

### 3. How do you block inactive / on-leave assignment?
I check employee availability in the task service before saving. Inactive employees are always rejected with a 400. If the employee is On Leave, the assignment is rejected only if the task's start date falls inclusively between their leave start and leave end dates.

### 4. Why are filtering and pagination on the backend?
Filtering and pagination run on the database so the server sends only the slice of data needed, keeping payloads small and fast. It also ensures accurate total counts for pagination. Furthermore, the CSV export uses the exact same query logic to export the full filtered dataset across all pages.

### 5. Why do filters live in the URL?
Storing filter, search, sort, and pagination state in the URL makes the view shareable and bookmarkable. Users can refresh the page or use browser back/forward buttons without losing their active filter view.

### 6. What can go wrong if two requests assign a 4th active task at the same time?
A naive count-then-insert approach has a race condition where two concurrent requests both read an active count of 2 and both proceed to insert, resulting in 4 active tasks. I prevent this by using MongoDB's atomic `findOneAndUpdate` with `{ activeTaskCount: { $lt: 3 } }` and `$inc: { activeTaskCount: 1 }`. MongoDB serializes the writes, allowing exactly one request to increment and succeed while the other matches 0 documents and fails with a 400.
