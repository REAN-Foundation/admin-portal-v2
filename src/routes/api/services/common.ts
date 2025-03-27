import chalk from 'chalk';
import { error } from '@sveltejs/kit';
import { API_CLIENT_INTERNAL_KEY, BACKEND_API_URL } from '$env/static/private';
import { SessionManager } from '../sessions/session.manager';

/////////////////////////////////////////////////////////////////////////////
//Base URL
export const post_ = async (
	url: string,
	bodyObj: string | any,
	authorizeUser: boolean,
	sessionId?: string
) => {
	try {
		const headers = await setHeaders(authorizeUser, sessionId);

		const body = JSON.stringify(bodyObj);
		console.log('body==>', body);

		const res = await fetch(url, {
			method: 'POST',
			body,
			headers
		});

		const response = await res.json();
		const message = response.Message;

		// console.log(res);

		if (!res.ok) {
			if (res.status === 500) {
				throw error(500, { message: res.statusText });
			} else {
				console.log(chalk.red(`post_ response message: ${message}`));
				return response;
			}
		}
		console.log(chalk.green(`post_ response message: ${message}`));
		return response;
	} catch (err) {
		console.log(chalk.red(`post_ exception: ${err}`));
		throw error(500, { message: 'Internal Server Error' });
	}
};

export const get_ = async (url: string, authorizeUser: boolean = false, sessionId?: string) => {
	try {
		const headers = await setHeaders(authorizeUser, sessionId);

		const res = await fetch(url, {
			method: 'GET',
			headers
		});

		const response = await res.json();

		const message = response.Message;

		if (!res.ok) {
			if (res.status === 500) {
				throw error(500, { message: res.statusText });
			} else {
				console.log(chalk.red(`get_ response message: ${message}`));
				return response;
			}
		}
		console.log(chalk.green(`get_ response message: ${message}`));
		return response;
	} catch (err) {
		console.log(chalk.red(`get_ exception: ${err}`));
		throw error(500, { message: 'Internal Server Error' });
	}
};

export const put_ = async (
	url: string,
	bodyObj: unknown,
	authorizeUser: boolean = false,
	sessionId?: string
) => {
	try {
		const headers = await setHeaders(authorizeUser, sessionId);

		const body = JSON.stringify(bodyObj);
		console.log('Pre API call');
		console.log(bodyObj);

		const res = await fetch(url, {
			method: 'PUT',
			body,
			headers
		});

		const response = await res.json();
		console.log('Api called' + response);
		const message = response.Message;

		if (!res.ok) {
			if (res.status === 500) {
				throw error(500, { message: res.statusText });
			} else {
				console.log(chalk.red(`put_ response message: ${message}`));
				return response;
			}
		}
		console.log(chalk.green(`put_ response message: ${message}`));
		return response;
	} catch (err) {
		console.log(chalk.red(`put_ exception: ${err}`));
		throw error(500, { message: 'Internal Server Error' });
	}
};

export const delete_ = async (url: string, authorizeUser: boolean = false, sessionId?: string) => {
	try {
		const headers = await setHeaders(authorizeUser, sessionId);

		const res = await fetch(url, {
			method: 'DELETE',
			headers
		});

		const response = await res.json();
		console.log(response);
		const message = response.Message;

		if (!res.ok) {
			if (res.status === 500) {
				throw error(500, { message: res.statusText });
			} else {
				console.log(chalk.red(`delete_ response message: ${message}`));
				return response;
			}
		}
		console.log(chalk.green(`delete_ response message: ${message}`));
		return response;
	} catch (err) {
		console.log(chalk.red(`delete_ exception: ${err}`));
		throw error(500, { message: 'Internal Server Error' });
	}
};

const setHeaders = async (authorizeUser: boolean, sessionId?: string, isFormData = false) => {
	try {
		const headers: Record<string, string> = {
			'x-api-key': API_CLIENT_INTERNAL_KEY
		};

		if (!isFormData) {
			headers['Content-Type'] = 'application/json';
		}

		if (authorizeUser && sessionId) {
			const session = await SessionManager.getSession(sessionId);
			const accessToken = session?.accessToken;
			headers['Authorization'] = `Bearer ${accessToken}`;
		}

		return headers;
	} catch (err) {
		console.log(chalk.red(`Error in setHeaders: ${(err as Error).message}`));
		throw new Error(`Failed to set headers: ${(err as Error).message}`);
	}
};
