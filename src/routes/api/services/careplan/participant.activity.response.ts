import { CAREPLAN_BACKEND_API_URL, CAREPLAN_SERVICE_API_KEY } from "$env/static/private";
import { get } from "./common.careplan";


////////////////////////////////////////////////////////////////

export const searchParticipantActivities = async (sessionId: string, participantId: string) => {
    const url = CAREPLAN_BACKEND_API_URL + `/participant-activity-responses/search?participantId=${participantId}`;
     console.log("URL----",url);
    return await get(sessionId, url, false, CAREPLAN_SERVICE_API_KEY);
};


