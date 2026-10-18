import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import apiRouter from './routes/index.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';
import { ENV } from './config/env.js';

const app = express();

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (ENV.NODE_ENV === 'production') {
      const allowed = Array.isArray(ENV.CLIENT_URL) ? ENV.CLIENT_URL : [ENV.CLIENT_URL];
      if (allowed.includes(origin)) return callback(null, true);
      return callback(new Error('CORS policy: Not allowed by CORS'));
    }
    return callback(null, true);
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (ENV.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: ENV.NODE_ENV
  });
});

app.use('/api', apiRouter);
app.use(notFound);
app.use(errorHandler);

export default app;
