import { error, type ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { searchLabRecordTypes } from '../../../api/services/reancare/lab-record-types';
import { createSearchFilters } from '$lib/utils/search.utils';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
    const sessionId = event.cookies.get('sessionId');
    event.depends('app:lab-records')
    const searchFilters = createSearchFilters(event, {
        orderBy: "TypeName",
        order: "ascending",
        itemsPerPage: 10
    });
    
    console.log('Search Parameters:', searchFilters);
    const response = await searchLabRecordTypes(sessionId, searchFilters);

    if (response.Status === 'failure' || response.HttpCode !== 200) {
        throw error(response.HttpCode, response.Message);
    }
    const labRecordTypes = response.Data.LabRecordTypes;

    return {
        labRecordTypes,
        sessionId,
        message: response.Message,
        title: 'Clinical-Lab Records'
    };
};
