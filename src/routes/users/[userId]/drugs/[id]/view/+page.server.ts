import type {ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getDrugById } from '../../../../../api/services/reancare/drugs';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
    const drugId = event.params.id;
    const response = await getDrugById(sessionId, drugId);

    // if (response.Status === 'failure' || response.HttpCode !== 200) {
    //     throw error(response.HttpCode, response.Message);
    // }
    const drug = response?.Data?.Drug;
    const id = response?.Data?.Drug?.id;
    return {
        location: `${id}/edit`,
        drug,
        message: response.Message,
        title: 'Clinical-Drugs View'
    };

};
