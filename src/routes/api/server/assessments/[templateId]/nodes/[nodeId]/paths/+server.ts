import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SessionManager } from '$lib/utils/session.utils';
import { createAssessmentPath, searchAssessmentPaths } from '$lib/api/services/reancare/assessments/assessment-paths';
import { createPathSchema } from '$lib/validation/assessment-path.schema';

export const GET: RequestHandler = async ({ params, url }) => {
	try {
		const { templateId, nodeId } = params;
		
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

		// Get search parameters
		const searchParams = new URLSearchParams(url.search);
		const parentNodeId = searchParams.get('parentNodeId') || nodeId;

		// Search paths
		const result = await searchAssessmentPaths({
			templateId,
			parentNodeId,
			...Object.fromEntries(searchParams)
		});

		return json(result);
	} catch (error) {
		console.error('Error in GET /api/server/assessments/[templateId]/nodes/[nodeId]/paths:', error);
		return json(
			{ Status: 'failure', Message: 'Failed to fetch assessment paths' },
			{ status: 500 }
		);
	}
};

export const POST: RequestHandler = async ({ params, request }) => {
	try {
		const { templateId, nodeId } = params;
		
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

		// Parse request body
		const body = await request.json();
		
		// Validate request body
		const validationResult = createPathSchema.safeParse(body);
		if (!validationResult.success) {
			return json(
				{ Status: 'failure', Message: 'Invalid request data', Errors: validationResult.error.errors },
				{ status: 400 }
			);
		}

		// Ensure the path is associated with the correct node
		const pathData = {
			...validationResult.data,
			ParentNodeId: nodeId
		};

		// Create assessment path
		const result = await createAssessmentPath({
			...pathData,
			templateId
		});

		return json(result);
	} catch (error) {
		console.error('Error in POST /api/server/assessments/[templateId]/nodes/[nodeId]/paths:', error);
		return json(
			{ Status: 'failure', Message: 'Failed to create assessment path' },
			{ status: 500 }
		);
	}
}; 