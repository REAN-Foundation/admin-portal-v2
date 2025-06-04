import { CAREPLAN_BACKEND_API_URL } from '$env/static/private';
import { DashboardManager } from '$routes/api/cache/dashboard/dashboard.manager';
import { del, get } from './common.careplan';

///////////////////////////////////////////////////////////////////////////////

export const getEnrollmentById = async (sessionId: string, enrollmentId: string) => {
    const url = CAREPLAN_BACKEND_API_URL + `/enrollments/${enrollmentId}`;
    const cacheKey = `session-${sessionId}:req-getEnrollmentById-${enrollmentId}`;
    if (await DashboardManager.has(cacheKey)) {
        return await DashboardManager.get(cacheKey);
    }
    const result = await get(sessionId, url, true);
    await DashboardManager.set(cacheKey, result);
    return result;
};

export const searchEnrollments = async (sessionId: string, searchParams?) => {
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
    console.log("url", url)

    const result = await get(sessionId, url, true);
    return result;
};

export const getEnrollmentStats = async (sessionId: string,participantId:string) => {
    const url = CAREPLAN_BACKEND_API_URL + `/enrollments/${participantId}/stats`;
    return await get(sessionId, url, true);
};

export const deleteEnrollment = async (sessionId: string, enrollmentId: string) => {
    const url = CAREPLAN_BACKEND_API_URL + `/enrollments/${enrollmentId}`;
    const result = await del(sessionId, url, true);

    const keysToBeDeleted = [
        `session-${sessionId}:req-getEnrollmentById-${enrollmentId}`,
    ];
    await DashboardManager.deleteMany(keysToBeDeleted);

    const findAndClearKeys = [
        `session-${sessionId}:req-searchEnrollments`,
    ];
    await DashboardManager.findAndClear(findAndClearKeys);

    return result;
};
