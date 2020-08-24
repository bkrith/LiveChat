import { Request, Response, NextFunction } from 'express';
import { HttpException, handleError } from '../handlers/HTTPException';

const errorMiddleware = (error: HttpException, req: Request, res: Response, next: NextFunction): void => {
	handleError(error, res);
};

export default errorMiddleware;
