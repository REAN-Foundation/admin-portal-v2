import { CAREPLAN_BACKEND_API_URL, CAREPLAN_SERVICE_API_KEY } from "$env/static/private";
import { del, get } from "./common.careplan";

////////////////////////////////////////////////////////////////

export const getEnrollmentById = async (sessionId: string, enrollmentId: string) => {
    const url = CAREPLAN_BACKEND_API_URL + `/enrollments/${enrollmentId}`;
    return await get(sessionId, url, true, CAREPLAN_SERVICE_API_KEY);
};

export const searchEnrollments = async (sessionId: string, searchParams?: any) => {
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
    const url = CAREPLAN_BACKEND_API_URL + `/enrollments/search${searchString}`;

     console.log("URL----",url);
    return await get(sessionId, url, true, CAREPLAN_SERVICE_API_KEY);
};

export const getEnrollmentStats = async (sessionId: string,participantId:string) => {
    const url = CAREPLAN_BACKEND_API_URL + `/enrollments/${participantId}/stats`;
    return await get(sessionId, url, true, CAREPLAN_SERVICE_API_KEY);
};

export const deleteEnrollment = async (sessionId: string,  enrollmentId: string) => {
    const url = CAREPLAN_BACKEND_API_URL + `/enrollments/${enrollmentId}`;
    return await del(sessionId, url, true);
};

