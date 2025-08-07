import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SessionManager } from '$lib/utils/session.utils';
import { getAssessmentPathById, updateAssessmentPath, deleteAssessmentPath } from '$lib/api/services/reancare/assessments/assessment-paths';
import { updatePathSchema } from '$lib/validation/assessment-path.schema';

export const GET: RequestHandler = async ({ params }) => {
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

		// Get assessment path by ID
		const result = await getAssessmentPathById(pathId, templateId);

		return json(result);
	} catch (error) {
		console.error('Error in GET /api/server/assessments/[templateId]/nodes/[nodeId]/paths/[pathId]:', error);
		return json(
			{ Status: 'failure', Message: 'Failed to fetch assessment path' },
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
		const validationResult = updatePathSchema.safeParse(body);
		if (!validationResult.success) {
			return json(
				{ Status: 'failure', Message: 'Invalid request data', Errors: validationResult.error.errors },
				{ status: 400 }
			);
		}

		// Ensure the path is associated with the correct node
		const pathData = {
			...validationResult.data,
			id: pathId,
			ParentNodeId: nodeId
		};

		// Update assessment path
		const result = await updateAssessmentPath(pathData, templateId);

		return json(result);
	} catch (error) {
		console.error('Error in PUT /api/server/assessments/[templateId]/nodes/[nodeId]/paths/[pathId]:', error);
		return json(
			{ Status: 'failure', Message: 'Failed to update assessment path' },
			{ status: 500 }
		);
	}
};

export const DELETE: RequestHandler = async ({ params }) => {
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

		// Delete assessment path
		const result = await deleteAssessmentPath(pathId, templateId);

		return json(result);
	} catch (error) {
		console.error('Error in DELETE /api/server/assessments/[templateId]/nodes/[nodeId]/paths/[pathId]:', error);
		return json(
			{ Status: 'failure', Message: 'Failed to delete assessment path' },
			{ status: 500 }
		);
	}
}; 