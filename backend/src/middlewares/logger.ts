import { Request, Response, NextFunction } from 'express';

const loggerMiddleware = (req: Request, res: Response, next: NextFunction): void => {
	const { method, path } = req;

	console.log({
		method,
		path
	});
	next();
};

export default loggerMiddleware;
