import type { PageServerLoad } from '../../../../../../$types';
import type { ServerLoadEvent } from '@sveltejs/kit';
import { getEnrollmentById, getEnrollmentStats } from '$routes/api/services/careplan/enrollments';

////////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const enrollmentId = event.params.enrollmentId;

	const response = await getEnrollmentById(sessionId, enrollmentId);
	const enrollment = response?.Data;
	const participantId = enrollment?.ParticipantId;

	const statsResponse = await getEnrollmentStats(sessionId, participantId);
	const enrollmentStats = statsResponse?.Data;

	return {
		location: `${enrollmentId}/view`,
		enrollment,
		enrollmentStats,
		message: response?.Message || 'Enrollment retrieved successfully',
		title: 'Enrollment View'
	};
};
