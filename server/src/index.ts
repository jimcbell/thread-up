import 'dotenv/config';
import express, { Express } from 'express';
import cors from 'cors';
import routes from './routes/index';
import errorHandler from './middleware/errorHandler';
import requestLogger from './middleware/requestLogger';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { uploadProcessingWorker } from './workers/uploadProcessor';

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(requestLogger);

// Routes
app.use('/api', routes);

// Error handling (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 Server running on port ${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);

  // Start background worker
  uploadProcessingWorker().catch((err: Error) => {
    // eslint-disable-next-line no-console
    console.error('Worker failed to start:', err);
  });
});

export default app;
