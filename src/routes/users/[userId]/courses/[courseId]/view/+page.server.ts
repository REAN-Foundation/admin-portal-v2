import { getCourseById } from '$routes/api/services/lms/courses';
import { searchModules } from '$routes/api/services/lms/course.modules';
import type { PageServerLoad } from './$types';
import type { ServerLoadEvent } from '@sveltejs/kit';
import { BACKEND_API_URL } from '$env/static/private';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
    const courseId = event.params.courseId;
    
    event.depends('app:module');
    event.depends('app:course');
    event.depends('app:content');
    
    const response = await getCourseById(sessionId, courseId);
    const course = response?.Data;
    const imageResourceId = course?.ImageResourceId || course?.ImageUrl;
    const id = response?.Data?.id;

    course['ImageResourceUrl'] = imageResourceId 
        ? BACKEND_API_URL + `/file-resources/${imageResourceId}/download?disposition=inline`
        : null;

    const nestedModules = (course?.Modules || course?.modules || [])
        .filter((module) => module.CourseId === courseId);

    const modules = nestedModules.length > 0 
        ? nestedModules 
        : await (async () => {
            try {
                const modulesResponse = await searchModules(sessionId, {
                    courseId: courseId,
                    itemsPerPage: 100,
                    pageIndex: 0,
                    orderBy: "Name",
                    order: "ascending"
                });
                
                const modulesData = modulesResponse?.Data?.CourseModuleRecords;
                const allModules = modulesData?.Items ?? (Array.isArray(modulesData) ? modulesData : []);
                
                return allModules.filter((module) => module.CourseId === courseId);
            } catch (error) {
                console.error('Error fetching modules:', error);
                return [];
            }
        })();

    return {
        location: `${id}/edit`,
        course,
        modules,
        message: response?.Message || 'Course retrieved successfully',
        title:'Educational-Learning Journey-Courses View'
    };
};
