import type { PageServerLoad } from './$types';
import type { ServerLoadEvent } from '@sveltejs/kit';
import { getCareplanCategoryById } from '../../../../../../api/services/careplan/careplan.category';

///////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
    const sessionId = event.cookies.get('sessionId');
    const categoryId = event.params.catogoryId;
    const response = await getCareplanCategoryById(sessionId, categoryId);

    const careplanCategory = response?.Data || [];
    const id = response?.Data.id;

    return {
        location: `${id}/edit`,
        careplanCategory,
        message: response?.Message || 'Careplan Category retrieved successfully',
        title: 'Careplan Categories-Category Edit'
    };
};
