import { CAREPLAN_BACKEND_API_URL, CAREPLAN_SERVICE_API_KEY } from "$env/static/private";
import { DashboardManager } from "$routes/api/cache/dashboard/dashboard.manager";
import { get } from "./common.careplan";

////////////////////////////////////////////////////////////////

export const getEnrollmentTaskById = async (sessionId: string, enrollmentTaskId: string) => {
    const url = CAREPLAN_BACKEND_API_URL + `/enrollment-tasks/${enrollmentTaskId}`;
    const cacheKey = `session-${sessionId}:req-getEnrollmentTaskById-${enrollmentTaskId}`;
    if (await DashboardManager.has(cacheKey)) {
            return await DashboardManager.get(cacheKey);
        }
    const result = await get(sessionId, url, true );
    await DashboardManager.set(cacheKey, result);
    return result;
};

export const searchEnrollmentTask = async (sessionId: string, searchParams?: any) => {
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
    const url = CAREPLAN_BACKEND_API_URL + `/enrollment-tasks/search${searchString}`;
    console.log('url',url)

    const result = await get(sessionId, url, true);
    return result;
};

