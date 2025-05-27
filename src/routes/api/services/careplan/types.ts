import { BACKEND_API_URL, CAREPLAN_BACKEND_API_URL } from "$env/static/private";
import { get } from "./common.careplan";

////////////////////////////////////////////////////////////////////////////////////////

export const getTimeSlots = async (): Promise<string[]> => {
    try {
        const headers = {};
        headers['Content-Type'] = 'application/json';
        const url = CAREPLAN_BACKEND_API_URL + '/types/time-slots';
        const res = await fetch(url, {
            method: 'GET',
            headers
        });
        const response = await res.json();
        if (response.Status === 'failure' || response.HttpCode !== 200) {
            console.log(`status code: ${response.HttpCode}`);
            console.log(`error message: ${response.Message}`);
            return [];
        }

        return response.Data.SlotTypes;
    } catch (error) {
        console.error(`Error retrieving Timeslot: ${error.message}`);
        return [];
    }
};
export const getAssetsType = async (sessionId: string) => {
    const url = BACKEND_API_URL + `/types/assets`;
    return await get(sessionId, url, false);
};