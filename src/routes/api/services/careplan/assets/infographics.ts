import { CAREPLAN_BACKEND_API_URL } from '$env/static/private';
import { del, get, post, put } from '../common.careplan';

////////////////////////////////////////////////////////////////

export const createInfographics = async (
    sessionId: string,
    name: string,
    description: string,
    pathUrl: string,
    tags: string[],
    version: string 
) => {
    const body = {
        Name: name,
        Description: description,
        Url: pathUrl,
        Tags: tags,
        Version: !version || version?.length === 0 ? 'V 1.0' : version,
    };

    const url = CAREPLAN_BACKEND_API_URL + '/assets/infographics';
    return await post(sessionId, url, body, true);
};

export const getInfographicsById = async (sessionId: string, infographicsId: string) => {
    const url = CAREPLAN_BACKEND_API_URL + `/assets/infographics/${infographicsId}`;
    return await get(sessionId, url, true);
};

export const searchInfographics = async (sessionId: string, searchParams) => {
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
    const url = CAREPLAN_BACKEND_API_URL + `/assets/infographics/search${searchString}`;
    return await get(sessionId, url, true);
};

export const updateInfographics = async (
sessionId: string, infographicsId: string, name: string, description: string, pathUrl: string, tags: string[], version: string) => {
    const body = {
        Name: name,
        Description: description,
        Url: pathUrl,
        Tags: tags,
        Version: !version || version?.length === 0 ? 'V 1.0' : version,
    };

    const url = CAREPLAN_BACKEND_API_URL + `/assets/infographics/${infographicsId}`;
    return await put(sessionId, url, body, true);
};

export const deleteInfographics = async (sessionId: string, infographicsId: string) => {
    const url = CAREPLAN_BACKEND_API_URL + `/assets/infographics/${infographicsId}`;
    return await del(sessionId, url, true);
};
