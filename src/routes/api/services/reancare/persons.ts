import { API_CLIENT_INTERNAL_KEY, BACKEND_API_URL } from '$env/static/private';

////////////////////////////////////////////////////////////////

export const getPersonRolesForPhone = async (phone: string) => {
    const headers = {};
    headers['Content-Type'] = 'application/json';
    headers['x-api-key'] = API_CLIENT_INTERNAL_KEY;
    const url = BACKEND_API_URL + '/persons/roles-for-phone?phone=' + phone;
    const res = await fetch(url, {
        method: 'GET',
        headers
    });
    const response = await res.json();
    console.log('response', response);
    return response;
};

export const getPersonRolesForEmail = async (email: string) => {
    const headers = {};
    headers['Content-Type'] = 'application/json';
    headers['x-api-key'] = API_CLIENT_INTERNAL_KEY;
    const url = BACKEND_API_URL + '/persons/roles-for-email?email=' + email;
    const res = await fetch(url, {
        method: 'GET',
        headers
    });
    const response = await res.json();
    console.log('response', response);
    return response;
};
