export class CustomError extends Error {
	public statusCode: number;
	public code?: string;
	public details: any;

	constructor(message: string, statusCode = 400, code?: string, details?: any) {
		super(message);
		this.name = 'CustomError';
		this.statusCode = statusCode;
		this.code = code;
		this.details = details;
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, CustomError);
		}

		Object.setPrototypeOf(this, CustomError.prototype);
	}
}

export const isCustomError = (error: unknown): error is CustomError => {
	return error instanceof CustomError || (error !== null && typeof error === 'object' && 'isCustomError' in error);
};
