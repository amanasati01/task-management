import { Router } from 'express';
import employeeRoutes from './employee.routes.js';
import taskRoutes from './task.routes.js';
import dashboardRoutes from './dashboard.routes.js';

const apiRouter = Router();

apiRouter.use('/employees', employeeRoutes);
apiRouter.use('/tasks', taskRoutes);
apiRouter.use('/dashboard', dashboardRoutes);

export default apiRouter;

