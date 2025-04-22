import { error, type ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { searchLabRecordTypes } from '../../../api/services/reancare/lab-record-types';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	event.depends('app:lab-records')
	let labRecordTypes=[]
    const response = await searchLabRecordTypes(sessionId, {
        orderBy: "TypeName",
        order: "ascending"
    });
    if (response.Status === 'failure' || response.HttpCode !== 200) {
        throw error(response.HttpCode, response.Message);
    }
    labRecordTypes = response.Data.LabRecordTypes;
    return {
        labRecordTypes,
        sessionId,
        message: response.Message,
        title:'Clinical-Lab Records'
    };
		
};
