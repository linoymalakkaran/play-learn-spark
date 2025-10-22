import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const validationMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array().map(error => ({
        field: error.type === 'field' ? error.path : 'unknown',
        message: error.msg,
        value: error.type === 'field' ? error.value : undefined
      })),
      timestamp: new Date().toISOString()
    });
    return;
  }
  
  next();
};

export default validationMiddleware;