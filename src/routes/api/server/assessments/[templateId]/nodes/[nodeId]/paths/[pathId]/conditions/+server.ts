import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SessionManager } from '$lib/utils/session.utils';
import { createAssessmentPathCondition, updateAssessmentPathCondition, deleteAssessmentPathCondition } from '$lib/api/services/reancare/assessments/assessment-paths';
import { assessmentPathConditionSchema } from '$lib/validation/assessment-path.schema';

export const POST: RequestHandler = async ({ params, request }) => {
	try {
		const { templateId, nodeId, pathId } = params;
		
		// Validate session
		const session = await SessionManager.getSession();
		if (!session) {
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

		// Parse request body
		const body = await request.json();
		
		// Validate request body
		const validationResult = assessmentPathConditionSchema.safeParse(body);
		if (!validationResult.success) {
			return json(
				{ Status: 'failure', Message: 'Invalid request data', Errors: validationResult.error.errors },
				{ status: 400 }
			);
		}

		// Ensure the condition is associated with the correct path and node
		const conditionData = {
			...validationResult.data,
			PathId: pathId,
			NodeId: nodeId
		};

		// Create assessment path condition
		const result = await createAssessmentPathCondition(conditionData, templateId);

		return json(result);
	} catch (error) {
		console.error('Error in POST /api/server/assessments/[templateId]/nodes/[nodeId]/paths/[pathId]/conditions:', error);
		return json(
			{ Status: 'failure', Message: 'Failed to create assessment path condition' },
			{ status: 500 }
		);
	}
};

export const PUT: RequestHandler = async ({ params, request }) => {
	try {
		const { templateId, nodeId, pathId } = params;
		
		// Validate session
		const session = await SessionManager.getSession();
		if (!session) {
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

		// Parse request body
		const body = await request.json();
		
		// Validate request body
		const validationResult = assessmentPathConditionSchema.safeParse(body);
		if (!validationResult.success) {
			return json(
				{ Status: 'failure', Message: 'Invalid request data', Errors: validationResult.error.errors },
				{ status: 400 }
			);
		}

		// Ensure the condition is associated with the correct path and node
		const conditionData = {
			...validationResult.data,
			PathId: pathId,
			NodeId: nodeId
		};

		// Update assessment path condition
		const result = await updateAssessmentPathCondition(conditionData, templateId);

		return json(result);
	} catch (error) {
		console.error('Error in PUT /api/server/assessments/[templateId]/nodes/[nodeId]/paths/[pathId]/conditions:', error);
		return json(
			{ Status: 'failure', Message: 'Failed to update assessment path condition' },
			{ status: 500 }
		);
	}
};

export const DELETE: RequestHandler = async ({ params, request }) => {
	try {
		const { templateId, nodeId, pathId } = params;
		
		// Validate session
		const session = await SessionManager.getSession();
		if (!session) {
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

		// Parse request body to get condition ID
		const body = await request.json();
		const conditionId = body.conditionId;

		if (!conditionId) {
			return json({ Status: 'failure', Message: 'Condition ID is required' }, { status: 400 });
		}

		// Delete assessment path condition
		const result = await deleteAssessmentPathCondition(conditionId, templateId);

		return json(result);
	} catch (error) {
		console.error('Error in DELETE /api/server/assessments/[templateId]/nodes/[nodeId]/paths/[pathId]/conditions:', error);
		return json(
			{ Status: 'failure', Message: 'Failed to delete assessment path condition' },
			{ status: 500 }
		);
	}
}; 