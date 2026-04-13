import { isCustomError } from '@backend/utils/error';
import logger from '@backend/utils/logger';
import { errorResponse } from '@backend/utils/response';
import { Context } from 'hono';
import { ContentfulStatusCode } from 'hono/utils/http-status';

export const globalErrorHandler = (err: Error, c: Context) => {
  if (isCustomError(err)) {
    return c.json(
      errorResponse(err.message, err.statusCode, err.details),
      err.statusCode as ContentfulStatusCode,
    );
  }

  if (err.name === 'ZodError') {
    return c.json(errorResponse(err.message, 400), 400);
  }

  logger.error(`Internal server error`, err);
  return c.json(errorResponse('INTERNAL_SERVER_ERROR', 500), 500);
};
