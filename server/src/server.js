import app from './app.js';
import { connectDB } from './config/db.js';
import { ENV } from './config/env.js';

const startServer = async () => {
  await connectDB();

  const server = app.listen(ENV.PORT, () => {
    console.log(`[Server] Running in ${ENV.NODE_ENV} mode on port ${ENV.PORT}`);
    console.log(`[Server] API available at http://localhost:${ENV.PORT}/api`);
  });

  const handleShutdown = (signal) => {
    console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      console.log('[Server] HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => handleShutdown('SIGINT'));
  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
};

startServer();

