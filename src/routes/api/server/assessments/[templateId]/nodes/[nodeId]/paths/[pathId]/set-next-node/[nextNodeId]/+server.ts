import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { setAssessmentPathNextNode, removeAssessmentPathNextNode } from '$routes/api/services/reancare/assessments/assessment-paths';

export const PUT: RequestHandler = async ({ params, locals }) => {
	try {
		const { templateId, nodeId, pathId, nextNodeId } = params;
		
		// Validate session
		const sessionUser = locals.sessionUser;
		if (!sessionUser?.sessionId) {
			return json({ Status: 'failure', Message: 'Unauthorized' }, { status: 401 });
		}

		// Validate template ID
		if (!templateId) {
			return json({ Status: 'failure', Message: 'Template ID is required' }, { status: 400 });
		}

		// Validate node ID
		if (!nodeId) {
			return json({ Status: 'failure', Message: 'Node ID is required' }, { status: 400 });
		}

		// Validate path ID
		if (!pathId) {
			return json({ Status: 'failure', Message: 'Path ID is required' }, { status: 400 });
		}

		// Validate next node ID
		if (!nextNodeId) {
			return json({ Status: 'failure', Message: 'Next Node ID is required' }, { status: 400 });
		}

		// Set the next node for the path
		const result = await setAssessmentPathNextNode(sessionUser.sessionId, templateId, pathId, nextNodeId);

		return json(result);
	} catch (error) {
		console.error('Error in PUT /api/server/assessments/[templateId]/nodes/[nodeId]/paths/[pathId]/set-next-node/[nextNodeId]:', error);
		return json(
			{ Status: 'failure', Message: 'Failed to set next node' },
			{ status: 500 }
		);
	}
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	try {
		const { templateId, nodeId, pathId } = params;
		
		// Validate session
		const sessionUser = locals.sessionUser;
		if (!sessionUser?.sessionId) {
			return json({ Status: 'failure', Message: 'Unauthorized' }, { status: 401 });
		}

		// Validate template ID
		if (!templateId) {
			return json({ Status: 'failure', Message: 'Template ID is required' }, { status: 400 });
		}

		// Validate node ID
		if (!nodeId) {
			return json({ Status: 'failure', Message: 'Node ID is required' }, { status: 400 });
		}

		// Validate path ID
		if (!pathId) {
			return json({ Status: 'failure', Message: 'Path ID is required' }, { status: 400 });
		}

		// Remove the next node from the path
		const result = await removeAssessmentPathNextNode(sessionUser.sessionId, templateId, pathId);

		return json(result);
	} catch (error) {
		console.error('Error in DELETE /api/server/assessments/[templateId]/nodes/[nodeId]/paths/[pathId]/set-next-node/[nextNodeId]:', error);
		return json(
			{ Status: 'failure', Message: 'Failed to remove next node' },
			{ status: 500 }
		);
	}
}; 