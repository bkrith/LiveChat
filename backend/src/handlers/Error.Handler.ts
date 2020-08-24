const ErrorHandler = (component: string, err: any) => {
	if (err) console.error({
		component: component,
		status: 'error',
		message: err.message || 'Something went wrong',
		stack: err.stack || ''
	});
};

export default ErrorHandler;
