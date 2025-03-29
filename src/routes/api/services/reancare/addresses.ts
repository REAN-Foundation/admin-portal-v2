import { BACKEND_API_URL,API_CLIENT_INTERNAL_KEY } from '$env/static/private';
import { del, get, post, put } from "./common.reancare";
//////////////////////////////////////////////////////////////////////////////////////////////////

export const createAddress = async (
	sessionId: string,
	type: string,
	addressLine: string,
	city: string,
	district: string,
	state: string,
	country: string,
	postalCode: number
) => {
	const body = {
		Type: type ? type : 'Home',
		AddressLine: addressLine,
		City: city ? city : null,
		District: district ? district : null,
		State: state ? state : null,
		Country: country ? country : null,
		PostalCode: postalCode ? postalCode : null
	};
	const url = BACKEND_API_URL + '/addresses';
	return await post(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
};

export const getAddressById = async (sessionId: string, addressId: string) => {
	const url = BACKEND_API_URL + `/addresses/${addressId}`;
	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};

export const searchAddress = async (sessionId: string, searchParams?: any) => {
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
	const url = BACKEND_API_URL + `/addresses/search${searchString}`;

	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};

export const updateAddress = async (
	sessionId: string,
	addressId: string,
	type: string,
	addressLine: string,
	city: string,
	district: string,
	state: string,
	country: string,
	postalCode: number
) => {
	const body = {
		Type: type ? type : 'Home',
		AddressLine: addressLine,
		City: city ? city : null,
		District: district ? district : null,
		State: state ? state : null,
		Country: country ? country : null,
		PostalCode: postalCode ? postalCode : null
	};
	const url = BACKEND_API_URL + `/addresses/${addressId}`;
	return await put(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
};

export const deleteAddress = async (sessionId: string, addressId: string) => {
	const url = BACKEND_API_URL + `/api-clients/${addressId}`;
	return await del(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};
