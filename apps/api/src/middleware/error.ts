import { ErrorHandler } from 'hono';
import { env } from '@luxbot/config';

export const errorHandler: ErrorHandler = (err, c) => {
  console.error('Unhandled error:', err);

  return c.json({
    error: 'Internal Server Error',
    message: env.NODE_ENV === 'development' ? err.message : undefined,
  }, 500);
};
