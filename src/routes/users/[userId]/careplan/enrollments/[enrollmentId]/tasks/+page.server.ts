import { error, type RequestEvent } from '@sveltejs/kit';
import { redirect } from 'sveltekit-flash-message/server';
import { errorMessage } from '$lib/utils/message.utils';
import type { PageServerLoad } from './$types';
import { searchEnrollmentTask } from '$routes/api/services/careplan/enrollment.task';
import { searchParticipantActivities } from '$routes/api/services/careplan/participant.activity.response';
import { getEnrollmentById } from '$routes/api/services/careplan/enrollments';

////////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: RequestEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const userId = event.params.userId;
	const enrollmentId = event.params.enrollmentId;

	try {
		// Get enrollment details
		const enrollmentResp = await getEnrollmentById(sessionId, enrollmentId);
		if (enrollmentResp.Status === 'failure' || enrollmentResp.HttpCode !== 200) {
			throw error(enrollmentResp.HttpCode, enrollmentResp.Message);
		}

		const enrollment = enrollmentResp.Data;
		const participantId = enrollment?.ParticipantId;
		const careplanId = enrollment?.CareplanId;

		const searchParams = {
			careplanId,
			participantId,
			itemsPerPage: 10
		};

		// Get enrollment tasks
		const enrollmentTaskResp = await searchEnrollmentTask(sessionId, searchParams);
		const enrollmentTask = enrollmentTaskResp.Data;

		// Get participant responses
		const participantResp = await searchParticipantActivities(sessionId, participantId);
		const participantResponse = participantResp?.Data?.Items ?? [];

		return {
			enrollmentTask,
			enrollment,
			participantResponse
		};
	} catch (err: any) {
		console.error(`Error retrieving enrollment data: ${err.message}`);
		throw redirect(303, `/users/${userId}/home`, errorMessage('Error retrieving enrollment data'), event);
	}
};
