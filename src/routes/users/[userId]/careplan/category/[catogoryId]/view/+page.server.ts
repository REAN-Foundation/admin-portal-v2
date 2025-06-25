import type { PageServerLoad } from './$types';
import type { ServerLoadEvent } from '@sveltejs/kit';
import { getCareplanCategoryById } from '../../../../../../api/services/careplan/careplan.category';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
    const categoryId = event.params.catogoryId;
    const response = await getCareplanCategoryById(sessionId, categoryId);
    console.log("response==>",response);    
    const careplanCategory = response?.Data || [];
    console.log("careplanCategory==>",careplanCategory);
    const id = response?.Data.id || '';
    return {
        location: `${id}/edit`,
        careplanCategory,
        message: response?.Message || 'Careplan Category retrieved successfully',
        title:'Careplan Categories-Category View'
    };
};
