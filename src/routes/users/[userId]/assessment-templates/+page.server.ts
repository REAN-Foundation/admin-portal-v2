import { error, type ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createSearchFilters } from '$lib/utils/search.utils';
import { searchAssessmentTemplates } from '../../../api/services/reancare/assessments/assessment-templates';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
    const sessionId = event.cookies.get('sessionId');
    event.depends('app:assessmentTemplate')
    
    const searchFilters = createSearchFilters(event, {
        orderBy: "Title",
        order: "ascending",
        itemsPerPage: 10
    });
    
    console.log('Search Parametersxxxxxxx', searchFilters);
    const response = await searchAssessmentTemplates(sessionId, searchFilters);
    if (response.Status === 'failure' || response.HttpCode !== 200) {
        throw error(response.HttpCode, response.Message);
    }
    const assessmentTemplate = response?.Data?.AssessmentTemplateRecords || [];
    return {
        assessmentTemplate,
        sessionId,
        message: response?.Message || 'Assessment Templates retrieved successfully',
        title: 'Clinical-Assessments'
    };
};
