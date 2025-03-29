import { API_CLIENT_INTERNAL_KEY, BACKEND_API_URL } from '$env/static/private';
import { error } from '@sveltejs/kit';
import { SessionManager } from '../../sessions/session.manager';
import { del, get } from './common.reancare';

////////////////////////////////////////////////////////////////

export const executeQuery = async (
	sessionId: string,
	name: string,
	description: string,
  format: string,
	query: string,
	tags: string,
  userId ?: string,
	tenantId ?: string,
) => {
	const bodyObj = {
		Name: name,
		Description: description ? description : null,
    Format: format,
		UserId: userId,
    TenantId: tenantId ,
		Query: query,
		Tags: tags
	};
	console.log("bodyObj", bodyObj)
	const url = BACKEND_API_URL + '/custom-query';
	
	const session = await SessionManager.getSession(sessionId);
	const accessToken = session.accessToken;

	const headers = {};
	headers['x-api-key'] = API_CLIENT_INTERNAL_KEY;
	headers['Authorization'] = `Bearer ${accessToken}`;
	headers['Content-Type'] = 'application/json';
	const body = JSON.stringify(bodyObj);
	console.log(body);
	const res = await fetch(url, {
		method: 'POST',
		body,
		headers
	});
	const contentType = res.headers.get('content-type');
	if (contentType.includes('application/json')) {
		const jsonData = await res.json();
		let filename = '';
			const disposition = res.headers.get('content-disposition');
			if (disposition) {
				const tokens = disposition.split('filename=');
				if (tokens.length > 1) {
					  filename = tokens[1];
				}
			}
		return {
			success: true,
			Data: {
				Buffer: jsonData,
				FileName: filename,
				MimeType: contentType
			}
		};
	} else if (contentType.includes('text/csv')) {
		const csvData = await res.text();
			let filename = '';
			const disposition = res.headers.get('content-disposition');
			if (disposition) {
				const tokens = disposition.split('filename=');
				if (tokens.length > 1) {
					  filename = tokens[1];
				}
			}
		return {
			success: true,
			Data: {
				Buffer: csvData,
				FileName: filename,
				MimeType: contentType
			}
		};
	} else {
		const response = await res.json();
			console.log(`post_ response message: ${response.Message}`);
			throw error(response.HttpCode, response.Message);
	}
};

export const getQueryById = async (sessionId: string, queryId: string) => {
	const url = BACKEND_API_URL + `/custom-query/${queryId}`;
	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};

export const searchQueries= async (sessionId: string, searchParams?: any) => {
	let searchString = '';
	if (searchParams) {
		const keys = Object.keys(searchParams);
		if (keys.length > 0) {
			searchString = '?';
			const params = [];
			for (const key of keys) {
				if (searchParams[key]) {
					const param = `${key}=${searchParams[key]}`;
					params.push(param);
				}
			}
			searchString += params.join('&');
		}
	}
	const url = BACKEND_API_URL + `/custom-query/search${searchString}`;
	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};

export const updateQuery = async (
	sessionId: string,
	queryId: string,
	name: string,
	description: string,
  format: string,
	query: string,
	tags: string,
  userId ?: string,
	tenantId ?: string,
) => {
	const bodyObj = {
		Name: name,
		Description: description ? description : null,
    Format: format,
		UserId: userId,
    TenantId: tenantId ,
		Query: query,
		Tags: tags
	};
	console.log("bodyObj", bodyObj)
	const url = BACKEND_API_URL + `/custom-query/${queryId}`;
	
	const session = await SessionManager.getSession(sessionId);
	const accessToken = session.accessToken;

	const headers = {};
	headers['x-api-key'] = API_CLIENT_INTERNAL_KEY;
	headers['Authorization'] = `Bearer ${accessToken}`;
	headers['Content-Type'] = 'application/json';
	const body = JSON.stringify(bodyObj);
	console.log(body);
	const res = await fetch(url, {
		method: 'PUT',
		body,
		headers
	});
	const contentType = res.headers.get('content-type');
	if (contentType.includes('application/json')) {
		const jsonData = await res.json();
		let filename = '';
			const disposition = res.headers.get('content-disposition');
			if (disposition) {
				const tokens = disposition.split('filename=');
				if (tokens.length > 1) {
					  filename = tokens[1];
				}
			}
		return {
			success: true,
			Data: {
				Buffer: jsonData,
				FileName: filename,
				MimeType: contentType
			}
		};
	} else if (contentType.includes('text/csv')) {
		const csvData = await res.text();
		console.log("csvData",csvData)
			let filename = '';
			const disposition = res.headers.get('content-disposition');
			if (disposition) {
				const tokens = disposition.split('filename=');
				if (tokens.length > 1) {
					  filename = tokens[1];
				}
			}
		return {
			success: true,
			Data: {
				Buffer: csvData,
				FileName: filename,
				MimeType: contentType
			}
		};
	} else {
		const response = await res.json();
			console.log(`put_ response message: ${response.Message}`);
			throw error(response.HttpCode, response.Message);
	}
};

export const deleteQuery = async (sessionId: string, queryId: string) => {
	const url = BACKEND_API_URL + `/custom-query/${queryId}`;
	return await del(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};
