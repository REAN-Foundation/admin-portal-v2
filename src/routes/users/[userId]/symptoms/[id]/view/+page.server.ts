import {type ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { BACKEND_API_URL } from '$env/static/private';
import { getSymptomById } from '../../../../../api/services/reancare/symptoms';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
    const symptomId = event.params.id;
    const response = await getSymptomById(sessionId, symptomId);

    // if (response.Status === 'failure' || response.HttpCode !== 200) {
    //     throw error(response.HttpCode, response.Message);
    // }
    const symptom = response?.Data?.SymptomType;
    const imageResourceId = symptom?.ImageResourceId;
    const id = response?.Data?.SymptomType?.id;

    if (imageResourceId) {
        symptom['ImageUrl'] =
            BACKEND_API_URL + `/file-resources/${imageResourceId}/download?disposition=inline`;
    } else {
        symptom['ImageUrl'] = null;
    }
    return {
        location: `${id}/edit`,
        symptom,
        message: response.Message,
        title:"Clinical-Symptoms View"
    };

};
