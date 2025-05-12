import { CAREPLAN_BACKEND_API_URL } from '$env/static/private';
import { del, get, post, put } from '../common.careplan';

////////////////////////////////////////////////////////////////

export const createGoals = async (
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

    const url = CAREPLAN_BACKEND_API_URL + '/assets/goals';
    return await post(sessionId, url, body, true);
};

export const getGoalsById = async (sessionId: string, goalsId: string) => {
    const url = CAREPLAN_BACKEND_API_URL + `/assets/goals/${goalsId}`;
    return await get(sessionId, url, true);
};

export const searchGoals = async (sessionId: string, searchParams) => {
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
    const url = CAREPLAN_BACKEND_API_URL + `/assets/goals/search${searchString}`;
    return await get(sessionId, url, true);
};

export const updateGoals = async (
sessionId: string, goalsId: string, name: string, description: string, tags: string[], version: string) => {
    const body = {
        Name: name,
        Description: description,
        Tags: tags,
        Version: !version || version?.length === 0 ? 'V 1.0' : version,
    };

    const url = CAREPLAN_BACKEND_API_URL + `/assets/goals/${goalsId}`;
    return await put(sessionId, url, body, true);
};

export const deleteGoals = async (sessionId: string, goalsId: string) => {
    const url = CAREPLAN_BACKEND_API_URL + `/assets/goals/${goalsId}`;
    return await del(sessionId, url, true);
};
