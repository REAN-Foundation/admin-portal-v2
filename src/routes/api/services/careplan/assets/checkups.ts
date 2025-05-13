import { CAREPLAN_BACKEND_API_URL } from '$env/static/private';
import { del, get, post, put } from '../common.careplan';

////////////////////////////////////////////////////////////////

export const createCheckups = async (
    sessionId: string,
    name: string,
    description: string,
    tags: string[],
    version: string 
) => {
    const body = {
        Name: name,
        Description: description,
        Tags: tags,
        Version: !version || version?.length === 0 ? 'V 1.0' : version,
    };

    const url = CAREPLAN_BACKEND_API_URL + '/assets/checkups';
    return await post(sessionId, url, body, true);
};

export const getCheckupsById = async (sessionId: string, checkupsId: string) => {
    const url = CAREPLAN_BACKEND_API_URL + `/assets/checkups/${checkupsId}`;
    return await get(sessionId, url, true);
};

export const searchCheckups = async (sessionId: string, searchParams) => {
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
    const url = CAREPLAN_BACKEND_API_URL + `/assets/checkups/search${searchString}`;
    return await get(sessionId, url, true);
};

export const updateCheckups = async (
sessionId: string, checkupsId: string, name: string, description: string, tags: string[], version: string) => {
    const body = {
        Name: name,
        Description: description,
        Tags: tags,
        Version: !version || version?.length === 0 ? 'V 1.0' : version,
    };

    const url = CAREPLAN_BACKEND_API_URL + `/assets/checkups/${checkupsId}`;
    return await put(sessionId, url, body, true);
};

export const deleteCheckups = async (sessionId: string, checkupsId: string) => {
    const url = CAREPLAN_BACKEND_API_URL + `/assets/checkups/${checkupsId}`;
    return await del(sessionId, url, true);
};
