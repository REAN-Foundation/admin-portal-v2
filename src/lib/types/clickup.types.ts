export interface ClickUpConfig {
	Enabled: boolean;
	// AuthToken: string;
	// TeamId: string;
	ClickupAuthentication?: string; // Authentication record ID to retrieve credentials
	ClickupListId: string; // Primary list ID
	ClickupIssuesListId?: string; // Issues list ID
	ClickupCaseListId?: string; // Case list ID
	WebhookClickupClientUrlToken: string;
	Events: ClickUpEventType[];
	WebhookId?: string; // Primary list webhook ID
	IssuesWebhookId?: string; // Issues list webhook ID
	CaseWebhookId?: string; // Case list webhook ID
}

export type ClickUpEventType =
	| 'taskCreated'
	| 'taskUpdated'
	| 'taskDeleted'
	| 'taskStatusUpdated'
	| 'taskAssigneeUpdated'
	| 'taskDueDateUpdated'
	| 'taskPriorityUpdated'
	| 'taskCommentPosted'
	| 'taskCommentUpdated'
	| 'taskTimeTracked'
	| 'taskTimeEstimateUpdated'
	| 'listCreated'
	| 'listUpdated'
	| 'listDeleted'
	| 'folderCreated'
	| 'folderUpdated'
	| 'folderDeleted'
	| 'spaceCreated'
	| 'spaceUpdated'
	| 'spaceDeleted'
	| 'goalCreated'
	| 'goalUpdated'
	| 'goalDeleted'
	| 'keyResultCreated'
	| 'keyResultUpdated'
	| 'keyResultDeleted';

export interface ClickUpWebhookRequest {
	endpoint: string;
	events: ClickUpEventType[];
	list_id: string;
}

export interface ClickUpWebhookResponse {
	id: string;
	webhook: {
		id: string;
		userid: number;
		team_id: number;
		endpoint: string;
		client_id: string;
		events: string[];
		task_id: string;
		list_id: string;
		folder_id: string;
		space_id: string;
		health: {
			status: string;
			fail_count: number;
		};
		secret: string;
	};
}

export interface ClickUpTestConnectionResponse {
	success: boolean;
	message: string;
	details?: any;
}

export interface ClickUpAuthenticationRecord {
	id: string;
	AuthToken: string;
	TeamId: string;
}

export interface ClickUpWebhookDetails {
	id: string;
	webhook: {
		id: string;
		userid: number;
		team_id: string;
		endpoint: string;
		client_id: string;
		events: string[];
		task_id: string | null;
		list_id: string;
		folder_id: string | null;
		space_id: string | null;
		health: {
			status: string;
			fail_count: number;
		};
		secret: string;
	};
}

export interface ClickUpWebhooksList {
	webhooks: ClickUpWebhookDetails[];
}

export interface WebhookStatus {
	listId: string;
	listType: 'primary' | 'issues' | 'case';
	listName: string;
	webhookId?: string;
	exists: boolean;
	endpoint?: string;
	health?: {
		status: string;
		fail_count: number;
	};
	events?: string[];
}
