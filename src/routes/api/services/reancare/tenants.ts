import { BACKEND_API_URL, API_CLIENT_INTERNAL_KEY } from '$env/static/private';
import { Helper } from '$lib/utils/helper';
import { del, get, post, put } from './common.reancare';

////////////////////////////////////////////////////////////////

export const createTenant = async (
	sessionId: string,
	name: string,
	description: string,
    code: string,
    phone: string,
	email: string,
) => {
	const body = {
		Name: name,
		Description: description ? description : null,
    Code: code,
		Phone: phone ? phone : null,
    Email: email ? email : null
	};

	if (Helper.isPhone(phone)) {
		body.Phone = Helper.sanitizePhone(phone);
	};
	const url = BACKEND_API_URL + '/tenants';
	return await post(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
};

export const getTenantById = async (sessionId: string, tenantId: string) => {
	const url = BACKEND_API_URL + `/tenants/${tenantId}`;
	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};

export const searchTenants = async (sessionId: string, searchParams?: any) => {
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
	const url = BACKEND_API_URL + `/tenants/search${searchString}`;
	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};

export const updateTenant = async (
	sessionId: string,
  tenantId: string,
	name: string,
	description: string,
  code: string,
  phone: string,
	email: string,
) => {
	const body = {
    Name: name,
		Description: description ? description : null,
    Code: code,
		Phone: phone ? phone : null,
    Email: email ? email : null,
	};
	if (Helper.isPhone(phone)) {
		body.Phone = Helper.sanitizePhone(phone);
	};
	const url = BACKEND_API_URL + `/tenants/${tenantId}`;
	return await put(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
};

export const deleteTenant = async (sessionId: string, tenantId: string) => {
	const url = BACKEND_API_URL + `/tenants/${tenantId}`;
	return await del(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};
