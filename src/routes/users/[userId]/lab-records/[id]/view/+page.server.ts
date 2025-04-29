// import { error, type RequestEvent, type ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getLabRecordTypeById } from '../../../../../api/services/reancare/lab-record-types';
import type { ServerLoadEvent } from '@sveltejs/kit';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
    const labRecordTypeId = event.params.id;
    const response = await getLabRecordTypeById(sessionId, labRecordTypeId);


    const labRecordType = response?.Data?.LabRecordType;
    const id = response?.Data?.LabRecordType?.id;
    return {
        location: `${id}/edit`,
        labRecordType,
        message: response.Message,
        title:'Clinical-Lab Records View'
    };
};
