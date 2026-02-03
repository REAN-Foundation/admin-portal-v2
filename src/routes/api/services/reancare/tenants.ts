import { BACKEND_API_URL, API_CLIENT_INTERNAL_KEY} from '$env/static/private';
import { Helper } from '$lib/utils/helper';
import { DashboardManager } from '$routes/api/cache/dashboard/dashboard.manager';
import { del, get, post, put } from './common.reancare';

////////////////////////////////////////////////////////////////

export const createTenant = async (
	sessionId: string,
	name: string,
	description: string,
	code: string,
	phone: string,
	email: string,
	username: string,
	password: string
) => {
	const body = getTenantCreateModel(name, description, code, phone, email, username, password);

	if (Helper.isPhone(phone)) {
		body.Phone = Helper.sanitizePhone(phone);
	}
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
	email: string
) => {
	const body = {
		Name: name,
		Description: description ?? null,
		Code: code,
		Phone: phone ? phone : null,
		Email: email ? email : null
	};
	if (Helper.isPhone(phone)) {
		body.Phone = Helper.sanitizePhone(phone);
	}
	const url = BACKEND_API_URL + `/tenants/${tenantId}`;
	return await put(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
};

export const deleteTenant = async (sessionId: string, tenantId: string) => {
	const url = BACKEND_API_URL + `/tenants/${tenantId}`;
	return await del(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};

export const createBotSecret = async (sessionId: string, tenantId: string, body: any) => {
	const url = BACKEND_API_URL + `/tenants/${tenantId}/settings/secret/create-secret`;
	return await post(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
};

export const getBotSecret = async (sessionId: string, tenantId: string) => {
	console.log("Here in service file", sessionId, tenantId)
	const url = BACKEND_API_URL + `/tenants/${tenantId}/settings/secret`;
	const cacheKey = `session-${sessionId}:req-getBotSecret-${tenantId}`;
	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	};
	const result = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
	await DashboardManager.set(cacheKey, result);
	return result;
};

export const updateBotSecret = async (sessionId: string, tenantId: string, body: any) => {
	const url = BACKEND_API_URL + `/tenants/${tenantId}/settings/secret/`;
	const findAndClearKeys = [`session-${sessionId}:req-getBotSecret`];
	await DashboardManager.findAndClear(findAndClearKeys);
	return await put(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
};

export const createTenantSchema = async (
	sessionId: string,
	tenantId: string,
	// tenantCode: string,
) => {
	// let environment = NODE_ENV;
	// if (environment === 'development') {
	// 	environment = 'dev';
	// }
	// if(environment === 'production') {
	// 	environment = 'prod';
	// }
	// if (environment === 'uat') {
	// 	environment = 'uat';
	// }
	// const code = tenantCode.toLowerCase();
	// const SchemaName = `${code}_${environment}`;
	// const body = {
	// 	SchemaName,
	// 	Environment: environment
	// };
	const body = {};
	const url = BACKEND_API_URL + `/tenants/${tenantId}/settings/database/create-bot-schema`;

	return await post(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
};

const getTenantCreateModel = (name: string, description: string, code: string, phone: string, email: string, username: string, password: string) => {
	const body: any = {};
    if(name) body.Name = name;
    if(description) body.Description = description;
    if(code) body.Code = code;
    if(phone) body.Phone = phone;
    if(email) body.Email = email;
    if(username) body.UserName = username;
    if(password) body.Password = password;
    return body;
};
