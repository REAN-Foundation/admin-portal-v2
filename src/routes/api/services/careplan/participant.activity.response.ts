import { CAREPLAN_BACKEND_API_URL } from "$env/static/private";
import { DashboardManager } from "$routes/api/cache/dashboard/dashboard.manager";
import { get } from "./common.careplan";

///////////////////////////////////////////////////////////////////////////////

export const searchParticipantActivities = async (sessionId: string, participantId: string) => {
    const url = CAREPLAN_BACKEND_API_URL + `/participant-activity-responses/search?participantId=${participantId}`;
    const cacheKey = `session-${sessionId}:req-searchParticipantActivities-${participantId}`;

    console.log("URL----",url);
    if (await DashboardManager.has(cacheKey)) {
            return await DashboardManager.get(cacheKey);
        }
        const result = await get(sessionId, url, false);
        await DashboardManager.set(cacheKey, result);
        return result;
};


