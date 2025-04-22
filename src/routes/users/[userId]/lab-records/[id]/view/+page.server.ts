import { error, type RequestEvent, type ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getLabRecordTypeById } from '../../../../../api/services/reancare/lab-record-types';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
    const labRecordTypeId = event.params.id;
    const response = await getLabRecordTypeById(sessionId, labRecordTypeId);

    // if (response.Status === 'failure' || response.HttpCode !== 200) {
    //     throw error(response.HttpCode, response.Message);
    // }
    const labRecordType = response?.Data?.LabRecordType;
    const id = response?.Data?.LabRecordType?.id;
    return {
        location: `${id}/edit`,
        labRecordType,
        message: response.Message,
        title:'Clinical-Lab Records View'
    };
};
