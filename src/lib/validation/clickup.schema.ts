import { z } from 'zod';

export const ClickUpEventTypeSchema = z.enum([
	'taskCreated',
	'taskUpdated',
	'taskDeleted',
	'taskStatusUpdated',
	'taskAssigneeUpdated',
	'taskDueDateUpdated',
	'taskPriorityUpdated',
	'taskCommentPosted',
	'taskCommentUpdated',
	'taskTimeTracked',
	'taskTimeEstimateUpdated',
	'listCreated',
	'listUpdated',
	'listDeleted',
	'folderCreated',
	'folderUpdated',
	'folderDeleted',
	'spaceCreated',
	'spaceUpdated',
	'spaceDeleted',
	'goalCreated',
	'goalUpdated',
	'goalDeleted',
	'keyResultCreated',
	'keyResultUpdated',
	'keyResultDeleted'
]);

export const ClickUpConfigSchema = z.object({
	Enabled: z.boolean().optional().default(true),
	AuthToken: z.string().optional(), // Comes from authentication record or environment variable
	TeamId: z.string().optional(), // Comes from authentication record or environment variable
	ClickupAuthentication: z.string().optional(), // Authentication record ID
	ClickupListId: z
		.string({
			required_error: 'Primary List ID is required'
		})
		.regex(/^\d+$/, 'Primary List ID must be numeric'),
	ClickupIssuesListId: z
		.string()
		.regex(/^\d+$/, 'Issues List ID must be numeric')
		.optional(),
	ClickupCaseListId: z
		.string()
		.regex(/^\d+$/, 'Case List ID must be numeric')
		.optional(),
	WebhookClickupClientUrlToken: z
		.string({
			required_error: 'Webhook Client URL Token is required'
		})
		.min(1, 'Webhook Client URL Token cannot be empty'),
	Events: z.array(ClickUpEventTypeSchema).min(1, 'At least one event must be selected'),
	WebhookId: z.string().optional(), // Primary list webhook ID
	IssuesWebhookId: z.string().optional(), // Issues list webhook ID
	CaseWebhookId: z.string().optional() // Case list webhook ID
});

export const ClickUpWebhookRequestSchema = z.object({
	endpoint: z.string().url(),
	events: z.array(z.string()),
	list_id: z.string()
});
