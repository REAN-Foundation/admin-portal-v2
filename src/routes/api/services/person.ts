import { BACKEND_API_URL } from '$env/static/private';
import { get_ } from './common';

export const getPersonRolesForPhone = async (phone: string) => {
	const url =BACKEND_API_URL + '/persons/roles-for-phone?phone=' + phone;
	return await get_(url, false);
};

export const getPersonRolesForEmail = async (email: string) => {
	const url =BACKEND_API_URL + '/persons/roles-for-email?email=' + email;
	return await get_(url, false);
};
