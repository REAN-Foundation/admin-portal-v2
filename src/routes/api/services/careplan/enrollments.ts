import { BACKEND_API_URL, CAREPLAN_BACKEND_API_URL } from '$env/static/private';
import { DashboardManager } from '$routes/api/cache/dashboard/dashboard.manager';
import { del, get, post } from './common.careplan';

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

export const createEnrollment = async (
    sessionId: string,
    tenantName: string,
    patientUserId: string,
    planCode: string,
    planName: string,
    channel: string = 'WhatsApp',
    numberOfDays: number = 1,
    startHour: number = 9,
    startMinutes: number = 0,
    intervalMinutes: number = 0,
    startFromTomorrow: boolean = false
) => {
    const url = BACKEND_API_URL + `/care-plans/patients/${patientUserId}/enroll`;
    
    const startDate = new Date();
    if (startFromTomorrow) {
        startDate.setDate(startDate.getDate() + 1);
    }
    
    const body = {
        Provider : 'REAN',
        StartDate: startDate.toISOString(),
        TenantName : tenantName,
        PlanCode : planCode,
        PlanName : planName,
        Channel : channel,
        IsTest : true,
        ScheduleConfig :{
            NumberOfDays: numberOfDays,
            StartHour: startHour,
            StartMinutes: startMinutes,
            IntervalMinutes: intervalMinutes,
            StartFromTomorrow: startFromTomorrow
        }
 
    };
    
    console.log('body', body);
    console.log('url', url);
    const result = await post(sessionId, url, body, true);

    const findAndClearKeys = [
        `session-${sessionId}:req-searchEnrollments`,
    ];
    await DashboardManager.findAndClear(findAndClearKeys);

    return result;
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
