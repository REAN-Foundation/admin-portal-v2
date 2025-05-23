import type { RequestEvent } from '@sveltejs/kit';
// import type { PageServerLoad } from './$types';
import { error} from '@sveltejs/kit';
import { searchEnrollments } from '$routes/api/services/careplan/enrollments';
import type { PageServerLoad } from './$types';

////////////////////////////////////////////////////////////////////////////

export interface Enrollment {
  Items: any[];
  TotalCount: number;
}

export const load: PageServerLoad = async (event: RequestEvent) => {
  const userId = event.params.userId;
  const sessionId = event.cookies.get('sessionId');
  
  if (!sessionId) {
    throw error(401, 'Unauthorized - No session found');
  }

  if (!userId) {
    throw error(400, 'Bad Request - No user ID provided');
  }

  try {
    const searchParams = {
      participantId: userId,
      // Add any additional search parameters if needed
    };
    
    const response = await searchEnrollments(sessionId, searchParams);
    if (response.Status === 'failure' || response.HttpCode !== 200) {
      throw error(response.HttpCode, response.Message);
    }
    const enrollments: Enrollment = response.Data;
    return {
      enrollments,
      sessionId,
      message: response.Message
    };
  } catch (err) {
    console.error('Error loading enrollments:', err);
    throw error(500, 'Failed to load enrollments');
  }
};
