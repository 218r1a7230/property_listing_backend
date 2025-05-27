import { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
  statusCode: number;
  isOperational?: boolean;
  code?: number;
  keyValue?: Record<string, unknown>;
  errors?: Record<string, { message: string }>;
}

export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Default error response
  let statusCode = 500;
  let message = 'Something went wrong';
  let errorDetails: Record<string, unknown> = {};

  // Handle known error types
  if (isAppError(error)) {
    statusCode = error.statusCode || 500;
    message = error.message;

    // Mongoose duplicate key error
    if (error.code === 11000) {
      message = `Duplicate field value entered: ${JSON.stringify(error.keyValue)}`;
      statusCode = 400;
    }

    // Mongoose validation error
    if (error.name === 'ValidationError' && error.errors) {
      const errors = Object.values(error.errors).map(el => el.message);
      message = `Invalid input data: ${errors.join('. ')}`;
      statusCode = 400;
      errorDetails = { errors };
    }
  } else if (error instanceof Error) {
    message = error.message;
  }

  // Development vs production error details
  const errorResponse: Record<string, unknown> = {
    success: false,
    message,
    statusCode
  };

  if (process.env.NODE_ENV === 'development') {
    errorResponse.error = error;
    errorResponse.stack = (error as Error)?.stack;
  }

  // Log the error
  console.error('ERROR 💥:', error);

  // Send response
  res.status(statusCode).json(errorResponse);
};

// Type guard for AppError
function isAppError(error: unknown): error is AppError {
  return (
    error instanceof Error &&
    'statusCode' in error &&
    typeof (error as Record<string, unknown>).statusCode === 'number'
  );
}