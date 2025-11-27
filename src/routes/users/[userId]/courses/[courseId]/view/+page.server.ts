import { getCourseById } from '$routes/api/services/reancare/educational/course';
import { searchModules } from '$routes/api/services/reancare/educational/modules';
import type { PageServerLoad } from './$types';
import type { ServerLoadEvent } from '@sveltejs/kit';
import { BACKEND_API_URL } from '$env/static/private';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
    const courseId = event.params.courseId;
    const response = await getCourseById(sessionId, courseId);

    const course = response?.Data;
    const imageResourceId = course?.ImageResourceId || course?.ImageUrl;
    const id = response?.Data?.id;

    if (imageResourceId) {
        course['ImageResourceUrl'] =
            BACKEND_API_URL + `/file-resources/${imageResourceId}/download?disposition=inline`;
    } else {
        course['ImageResourceUrl'] = null;
    }

    let modules = [];
    try {
        const modulesResponse = await searchModules(sessionId, {
            courseId: courseId,
            itemsPerPage: 100,
            pageIndex: 0,
            orderBy: "Name",
            order: "ascending"
        });
        
        const modulesData = modulesResponse?.Data?.CourseModuleRecords;
        if (modulesData) {
            if (modulesData.Items && Array.isArray(modulesData.Items)) {
                modules = modulesData.Items;
            } else if (Array.isArray(modulesData)) {
                modules = modulesData;
            }
        }
    } catch (error) {
        console.error('Error fetching modules:', error);
    }

    return {
        location: `${id}/edit`,
        course,
        modules,
        message: response?.Message || 'Course retrieved successfully',
        title:'Educational-Learning Journey-Courses View'
    };
};

