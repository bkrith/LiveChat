import { Response } from 'express';
import ErrorHandler from './Error.Handler';

class HttpException extends Error {

	public status: number;
	public message: string;

	constructor(status: number, message: string) {
		super();

		this.status = status;
		this.message = message;
	}

}

const handleError = (error: HttpException, res: Response): void => {
	const status = error.status || 500;
	const message = error.message || 'Something went wrong';

	ErrorHandler('HTTP/Socket', error);

	res.status(status)
		.json({
			status,
			message,
		});
};

export { HttpException, handleError };
