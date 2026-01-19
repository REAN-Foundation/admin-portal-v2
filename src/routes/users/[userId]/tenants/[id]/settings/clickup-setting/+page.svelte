<script lang="ts">
	import { page } from '$app/state';
	import Icon from '@iconify/svelte';
	import { addToast, toastMessage } from '$lib/components/toast/toast.store';
	import Confirmation from '$lib/components/confirmation.modal.svelte';
	import Button from '$lib/components/button/button.svelte';
	import type { PageServerData } from './$types';
	import type { ClickUpConfig, ClickUpEventType, WebhookStatus } from '$lib/types/clickup.types';

	///////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();

	const userId = page.params.userId;
	const tenantId = page.params.id;
	const tenantRoute = `/users/${userId}/tenants`;

	// Available ClickUp events
	const availableEvents: { value: ClickUpEventType; label: string }[] = [
		{ value: 'taskCreated', label: 'Task Created' },
		{ value: 'taskUpdated', label: 'Task Updated' },
		{ value: 'taskDeleted', label: 'Task Deleted' },
		{ value: 'taskStatusUpdated', label: 'Task Status Updated' },
		{ value: 'taskAssigneeUpdated', label: 'Task Assignee Updated' },
		{ value: 'taskCommentPosted', label: 'Task Comment Posted' },
		{ value: 'taskCommentUpdated', label: 'Task Comment Updated' },
		{ value: 'taskDueDateUpdated', label: 'Task Due Date Updated' },
		{ value: 'taskPriorityUpdated', label: 'Task Priority Updated' },
		{ value: 'taskTimeTracked', label: 'Task Time Tracked' },
		{ value: 'taskTimeEstimateUpdated', label: 'Task Time Estimate Updated' }
	];

	// Form state
	let formData = $state<ClickUpConfig>({
		Enabled: true,
		ClickupAuthentication: data.clickUpConfig?.ClickupAuthentication,
		ClickupListId: data.clickUpConfig?.ClickupListId || '',
		ClickupIssuesListId: data.clickUpConfig?.ClickupIssuesListId,
		ClickupCaseListId: data.clickUpConfig?.ClickupCaseListId,
		WebhookClickupClientUrlToken: data.clickUpConfig?.WebhookClickupClientUrlToken || '',
		Events: data.clickUpConfig?.Events || [
			'taskCreated',
			'taskStatusUpdated',
			'taskCommentPosted',
			'taskCommentUpdated'
		],
		WebhookId: data.clickUpConfig?.WebhookId,
		IssuesWebhookId: data.clickUpConfig?.IssuesWebhookId,
		CaseWebhookId: data.clickUpConfig?.CaseWebhookId
	});

	let webhookStatuses = $state<WebhookStatus[]>(data.webhookStatuses || []);

	console.log('webhookStatuses', webhookStatuses)
	let isFetchingStatus = $state(false);
	let promise = $state();
	let isTesting = $state(false);
	let isDeleting = $state(false);
	let showAuthToken = $state(false);
	let disabled = $state(true);
	let edit = $derived(disabled);

	// Confirmation modal state
	let openDeleteModal = $state(false);
	let idToBeDeleted = $state(null);

	const handleEditClick = async () => {
		if (disabled) {
			addToast({
				message: 'Edit mode enabled.',
				type: 'info',
				timeout: 3000
			});
			disabled = false;
		} else {
			addToast({
				message: 'Edit mode disabled.',
				type: 'info',
				timeout: 3000
			});
			disabled = true;
		}
	};

	// Toggle event selection
	function toggleEvent(event: ClickUpEventType) {
		const index = formData.Events.indexOf(event);
		if (index > -1) {
			formData.Events = formData.Events.filter((e) => e !== event);
		} else {
			formData.Events = [...formData.Events, event];
		}
	}

	// Test connection
	async function testConnection() {
		if (!formData.ClickupAuthentication) {
			addToast({
				message: 'ClickUp authentication is not configured. Please configure it in tenant settings first.',
				type: 'error',
				timeout: 4000
			});
			return;
		}

		isTesting = true;
		try {
			const res = await fetch(`/api/server/tenants/${tenantId}/clickup/test`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					authToken: formData.ClickupAuthentication,
				})
			});

			const response = await res.json();
			addToast({
				message: response.Message,
				type: response.Status === 'success' ? 'success' : 'error',
				timeout: 3000
			});
		} catch (err) {
			addToast({
				message: 'Failed to test connection',
				type: 'error',
				timeout: 3000
			});
		} finally {
			isTesting = false;
		}
	}

	// Fetch webhook status
	async function fetchWebhookStatus() {
		isFetchingStatus = true;
		try {
			const res = await fetch(`/api/server/tenants/${tenantId}/clickup/webhooks/status`);
			const response = await res.json();

			if (res.ok && response.Data) {
				webhookStatuses = response.Data;
				console.log('webhookStatuses',webhookStatuses)
			}
		} catch (err) {
			console.error('Failed to fetch webhook status:', err);
		} finally {
			isFetchingStatus = false;
		}
	}

	const handleDeleteClick = (id: string) => {
		openDeleteModal = true;
		idToBeDeleted = id;
	};

	const handleWebhookDelete = async (webhookId: string) => {
		try {
			const res = await fetch(
				`/api/server/tenants/${tenantId}/clickup/webhooks/${webhookId}`,
				{
					method: 'DELETE'
				}
			);

			const response = await res.json();

			if (res.ok) {
				toastMessage(response);
				// Refresh webhook status
				await fetchWebhookStatus();
			} else {
				toastMessage(response);
			}
		} catch (err) {
			toastMessage();
		}
	};

	const handleSubmit = async (event: Event) => {
		event.preventDefault();

		if (disabled) {
			addToast({
				message: 'Nothing to edit !',
				type: 'info',
				timeout: 3000
			});
			return;
		}

		if (!formData.ClickupListId) {
			addToast({
				message: 'Please provide at least the Primary List ID',
				type: 'error',
				timeout: 3000
			});
			return;
		}

		if (formData.Events.length === 0) {
			addToast({
				message: 'Please select at least one event',
				type: 'error',
				timeout: 3000
			});
			return;
		}

		try {
			const res = await fetch(`/api/server/tenants/${tenantId}/clickup/setup`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData)
			});

			const response = await res.json();

			if (res.ok) {
				toastMessage(response);
				// Update local state with webhook IDs
				if (response.Data?.config) {
					formData.WebhookId = response.Data.config.WebhookId;
					formData.IssuesWebhookId = response.Data.config.IssuesWebhookId;
					formData.CaseWebhookId = response.Data.config.CaseWebhookId;
				}
				disabled = true;
				// Refresh webhook status
				await fetchWebhookStatus();
			} else {
				toastMessage(response);
			}
		} catch (err) {
			toastMessage();
		}
	};

	// Delete webhook
	async function deleteWebhook() {
		if (
			!confirm(
				'Are you sure you want to delete the webhook? This will stop receiving ClickUp events.'
			)
		) {
			return;
		}

		isDeleting = true;
		try {
			const res = await fetch(`/api/server/tenants/${tenantId}/clickup/webhook`, {
				method: 'DELETE'
			});

			const response = await res.json();

			if (res.ok) {
				toastMessage(response);
				// Update local state
				formData.WebhookId = undefined;
			} else {
				toastMessage(response);
			}
		} catch (err) {
			toastMessage();
		} finally {
			isDeleting = false;
		}
	}
</script>

<div class="px-5 py-4">
	<div class="mx-auto my-6 border border-[var(--color-outline)]">
		<form onsubmit={async (event) => (promise = handleSubmit(event))}>
			<div
				class="flex items-center justify-between !rounded-b-none border bg-[var(--color-primary)] px-5 py-6"
			>
				<h1 class="text-xl text-[var(--color-info)]">ClickUp Webhook Configuration</h1>
				<div class="flex items-center gap-2 text-end">
					<button
						type="button"
						class="table-btn variant-filled-secondary gap-1"
						onclick={handleEditClick}
					>
						<Icon icon="material-symbols:edit-outline" />
					</button>
					<a
						href={tenantRoute}
						class="inline-flex items-center justify-center rounded-md border-[0.5px] border-[var(--color-outline)] px-2.5 py-1.5 text-sm font-medium text-red-600 hover:bg-red-200"
					>
						<Icon icon="material-symbols:close-rounded" class="h-5" />
					</a>
				</div>
			</div>

			<div class="flex flex-col space-y-4 px-5 py-4">
				{#if !formData.ClickupAuthentication}
					<div class="my-4 rounded-lg border border-orange-300 bg-orange-50 p-4">
						<div class="flex items-start gap-3">
							<Icon icon="material-symbols:warning" class="h-6 w-6 text-orange-600 shrink-0 mt-0.5" />
							<div>
								<h3 class="font-semibold text-orange-800">ClickUp Authentication Not Configured</h3>
								<p class="mt-1 text-sm text-orange-700">
									Before you can set up webhooks, you need to configure ClickUp authentication in the Chat bot secrete.
									Please add your ClickUp API token first.
								</p>
							</div>
						</div>
					</div>
				{/if}

				<div class="my-4 flex flex-col gap-2 md:flex-row md:items-center">
					<label
						for="clickupListId"
						class="mx-1 w-full font-medium text-[var(--color-info)] md:w-[30%]"
					>
						Primary List ID <span class="text-red-700">*</span>
					</label>
					<input
						id="clickupListId"
						type="text"
						bind:value={formData.ClickupListId}
						placeholder="Primary List ID to monitor"
						disabled={edit}
						class="input-field w-full md:w-[70%]"
					/>
				</div>

				<div class="my-4 flex flex-col gap-2 md:flex-row md:items-center">
					<label
						for="clickupIssuesListId"
						class="mx-1 w-full font-medium text-[var(--color-info)] md:w-[30%]"
					>
						Issues List Id
					</label>
					<input
						id="clickupIssuesListId"
						type="text"
						bind:value={formData.ClickupIssuesListId}
						placeholder="Issues List Id"
						disabled={edit}
						class="input-field w-full md:w-[70%]"
					/>
				</div>

				<div class="my-4 flex flex-col gap-2 md:flex-row md:items-center">
					<label
						for="clickupCaseListId"
						class="mx-1 w-full font-medium text-[var(--color-info)] md:w-[30%]"
					>
						Case List Id
					</label>
					<input
						id="clickupCaseListId"
						type="text"
						bind:value={formData.ClickupCaseListId}
						placeholder="Case List Id"
						disabled={edit}
						class="input-field w-full md:w-[70%]"
					/>
				</div>
				<div class="my-4 flex flex-col gap-2 md:flex-row md:items-center">
					<label
						for="webhookClickupClientUrlToken"
						class="mx-1 w-full font-medium text-[var(--color-info)] md:w-[30%]"
					>
						Webhook Client URL Token <span class="text-red-700">*</span>
					</label>
					<input
						id="webhookClickupClientUrlToken"
						type="text"
						bind:value={formData.WebhookClickupClientUrlToken}
						disabled={edit}
						placeholder="Enter webhook client URL token"
						class="input-field w-full md:w-[70%]"
					/>
				</div>
				<div class="my-4 flex flex-col gap-2 md:flex-row md:items-start">
					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label class="mx-1 w-full font-medium text-[var(--color-info)] md:w-[30%]">
						Events to Subscribe <span class="text-red-700">*</span>
					</label>
					<div class="input-field w-full md:w-[70%]">
						<div class="grid grid-cols-1 gap-2 md:grid-cols-2">
							{#each availableEvents as event}
								<label class="flex cursor-pointer items-center gap-2">
									<input
										type="checkbox"
										checked={formData.Events.includes(event.value)}
										onchange={() => toggleEvent(event.value)}
										disabled={edit}
										class="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
									/>
									<span class="text-sm text-[var(--color-info)]">{event.label}</span>
								</label>
							{/each}
						</div>
					</div>
				</div>

			</div>

			<hr class="border-t border-[0.5px] border-[var(--color-outline)]" />

			<!-- Submit Button -->
			<div class="button-container my-4">
				{#await promise}
					<Button
						type="submit"
						variant="primary"
						text="Submitting..."
						disabled={true}
					/>
				{:then data}
					<Button
						type="submit"
						variant="primary"
						text="Submit"
					/>
				{/await}
			</div>

			{#if webhookStatuses.length > 0}
				<div class="health-system-table-container my-4 shadow">
					<table class="health-system-table w-full">
						<thead>
							<tr>
								<th>Status</th>
								<th>List Type</th>
								<th>List ID</th>
								<th>Endpoint URL</th>
								<th>Health</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{#each webhookStatuses as status}
								<tr>
									<td>
										<div class="flex items-center gap-2">
											<Icon
												icon={status.exists
													? 'material-symbols:check-circle'
													: 'material-symbols:cancel'}
												class="h-5 w-5 {status.exists ? 'text-green-600' : 'text-gray-400'}"
											/>
											<span class="text-sm {status.exists ? 'text-green-600' : 'text-gray-500'}">
												{status.exists ? 'Active' : 'Not Created'}
											</span>
										</div>
									</td>
									<td>{status.listName}</td>
									<td>{status.listId}</td>
									<td>
										{#if status.endpoint}
											<span class="font-mono text-xs break-all">{status.endpoint}</span>
										{:else}
											<span class="text-gray-400">-</span>
										{/if}
									</td>
									<td>
										{#if status.health}
											<span class="{status.health.status === 'active' ? 'text-green-600' : 'text-orange-600'}">
												{status.health.status}
											</span>
										{:else}
											<span class="text-gray-400">-</span>
										{/if}
									</td>
									<td>
										<div class="flex flex-row space-x-2">
											{#if status.exists && status.webhookId}
												<Icon
													icon="material-symbols:delete-outline"
													class="cursor-pointer text-red-600 {!disabled ? '' : 'cursor-not-allowed opacity-50'}"
													onclick={() => !disabled && handleDeleteClick(status.webhookId)}
												/>
											{/if}
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</form>
	</div>
</div>

<!-- Confirmation Modal -->
<Confirmation
	bind:isOpen={openDeleteModal}
	title="Delete Webhook"
	message="Are you sure you want to delete this webhook? This action cannot be undone."
	onConfirm={handleWebhookDelete}
	id={idToBeDeleted}
/>
