<script lang="ts">
	import { addToast, toastMessage } from '$lib/components/toast/toast.store';
	import Button from '$lib/components/button/button.svelte';

	let { open = true, onclose, tenantId, tenantCode } = $props();

	function closeDialog() {
		onclose();
		isGenerated = false;
		showEditor = false;
		viewEditMode = null;
		jsonInput = '';
		isValidJSON = true;
		isPublishing = false;
		isFetchingSecret = false;
	}

	let isGenerated = $state(false);
	let jsonInput = $state('');
	let isValidJSON = $state(true);
	let isPublishing = $state(false);
	let viewEditMode = $state<'view' | 'edit' | null>(null);
	let isFetchingSecret = $state(false);
	let showEditor = $state(false);
	let hasSecrets = $state(false);
	let isCheckingSecrets = $state(false);
	let preservedDataBaseName = $state<string | null>(null);

	function handleJSONInput(event: Event) {
		const value = (event.target as HTMLTextAreaElement).value;
		jsonInput = value;
		try {
			JSON.parse(value);
			isValidJSON = true;
		} catch {
			isValidJSON = false;
		}
	}

	async function publish() {
		if (viewEditMode !== 'edit') {
			addToast({
				message: 'Nothing to publish. Enable edit mode first.',
				type: 'info',
				timeout: 3000
			});
			return;
		}
		if (!isValidJSON) {
			addToast({
				message: 'Invalid JSON!',
				type: 'error',
				timeout: 3000
			});
			return;
		}

		isPublishing = true;
		try {
			// Parse the JSON and restore the preserved DataBaseName
			const secretData = JSON.parse(jsonInput);
			if (preservedDataBaseName) {
				secretData.DataBaseName = preservedDataBaseName;
			}

			const res = await fetch(`/api/server/tenants/${tenantId}/secret`, {
				method: 'PUT',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(secretData)
			});
			const response = await res.json();
			console.log('This is response', response);
			if (res.ok) {
				toastMessage(response);
				closeDialog();
			} else {
				toastMessage(response);
			}
		} catch (err) {
			console.log('This is error', err);
			toastMessage('Error publishing configuration');
		} finally {
			isPublishing = false;
		}
	}

	function handleEditMode() {
		if (preservedDataBaseName && viewEditMode === 'view') {
			try {
				const currentData = JSON.parse(jsonInput);
				const { DataBaseName, ...editableData } = currentData;
				jsonInput = JSON.stringify(editableData, null, 2);
			} catch (err) {
				// If parsing fails, keep current value
			}
		}
		viewEditMode = 'edit';
	}

	function handleViewMode() {
		if (preservedDataBaseName && viewEditMode === 'edit') {
			try {
				const currentData = JSON.parse(jsonInput);
				const viewData = {
					...currentData,
					DataBaseName: preservedDataBaseName
				};
				jsonInput = JSON.stringify(viewData, null, 2);
			} catch (err) {
				// If parsing fails, keep current value
			}
		}
		viewEditMode = 'view';
	}

	async function checkExistingSecrets() {
		isCheckingSecrets = true;
		try {
			const res = await fetch(`/api/server/tenants/${tenantId}/secret`, {
				method: 'GET',
				headers: { 'content-type': 'application/json' }
			});
			const response = await res.json();
			console.log('This is check', response);
			if (response.HttpCode === 200 && response.Data) {
				hasSecrets = true;

				// Preserve DataBaseName
				const secretData = response.Data;
				if (secretData.DataBaseName) {
					preservedDataBaseName = secretData.DataBaseName;
				}

				// In view mode, show all data including DataBaseName
				jsonInput = JSON.stringify(secretData, null, 2);

				showEditor = true;
				viewEditMode = 'view';
			} else {
				hasSecrets = false;
			}
		} catch (err) {
			hasSecrets = false;
		} finally {
			isCheckingSecrets = false;
		}
	}

	async function createBotSchema() {
		try {
			if (!tenantCode || String(tenantCode).trim().length === 0) {
				toastMessage({ Status: 'failure', HttpCode: 400, Message: 'Tenant code is required' });
				return { ok: false };
			}
			const schemaRes = await fetch(`/api/server/tenants/${tenantId}/schema`, {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ tenantCode })
			});
			const schemaResponse = await schemaRes.json();
			if (
				!schemaRes.ok ||
				!(schemaResponse?.HttpCode === 200 || schemaResponse?.HttpCode === 201)
			) {
				toastMessage(schemaResponse);
				return { ok: false, data: schemaResponse };
			}
			return { ok: true, data: schemaResponse };
		} catch (err) {
			toastMessage({ Status: 'failure', HttpCode: 500, Message: 'Error creating bot schema' });
			return { ok: false };
		}
	}

	async function createSecrets() {
		isPublishing = true;
		try {
			const schemaResult = await createBotSchema();
			if (!schemaResult?.ok) {
				isPublishing = false;
				return;
			}

			// Then, create secrets
			const databaseName =  schemaResult?.data.Data.SchemaName
			preservedDataBaseName = databaseName;

			const res = await fetch(`/api/server/tenants/${tenantId}/secret`, {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					DataBaseName: databaseName
				})
			});
			const response = await res.json();
			if (response.HttpCode === 200 || response.HttpCode === 201) {
				hasSecrets = true;
				showEditor = true;
				viewEditMode = 'view';

				// In view mode, show all data including DataBaseName
				let secretData;
				if (response.Data) {
					secretData = response.Data;
				} else if (response.secret) {
					secretData = typeof response.secret === 'string' ? JSON.parse(response.secret) : response.secret;
				}

				if (secretData) {
					jsonInput = JSON.stringify(secretData, null, 2);
				}

				toastMessage(response);
			} else {
				toastMessage(response);
			}
		} catch (err) {
			toastMessage('Error creating secrets');
		} finally {
			isPublishing = false;
		}
	}

	// Check secrets when dialog opens
	$effect(() => {
		if (open) {
			checkExistingSecrets();
		}
	});
</script>

{#if open}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
		<!-- Dialog Box -->
		<div
			class="relative flex h-[80%] w-[80%] flex-col justify-start rounded-lg bg-[var(--color-primary)] p-6 shadow-lg"
		>
			<button
				class="absolute top-4 right-4 text-2xl font-bold text-[var(--color-info)] hover:text-gray-600"
				onclick={closeDialog}
				aria-label="Close dialog"
			>
				&times;
			</button>
			<p class="mb-4 text-sm text-[var(--color-info)]">
				<span> Tenant settings </span>
				&gt; configurations
			</p>

			{#if isCheckingSecrets}
				<div class="flex h-full items-center justify-center">
					<p class="text-[var(--color-info)]">Checking existing secrets...</p>
				</div>
			{:else if !hasSecrets}
				<div>
					<Button
						variant="primary"
						size="md"
						text={isPublishing ? 'Creating...' : 'Generate configuration file'}
						onclick={createSecrets}
						disabled={isPublishing}
					/>
				</div>
			{:else}
				<!-- Edit UI - Show directly if secrets exist -->
				<div class="flex flex-1 flex-col gap-4">
					<div class="mb-2 flex gap-2">
						<Button
							variant="primary"
							size="sm"
							text={isFetchingSecret ? 'Loading...' : 'View'}
							onclick={handleViewMode}
							disabled={isFetchingSecret}
							className={viewEditMode === 'view'
								? 'pointer-events-none'
								: 'opacity-60!'}
						/>
						<Button
							variant="primary"
							size="sm"
							text="Edit"
							onclick={handleEditMode}
							className={viewEditMode === 'edit'
								? 'pointer-events-none'
								: 'opacity-60!'}
						/>
					</div>
					<!-- JSON Box -->
					<div class="relative flex-1 rounded border border-[var(--color-info)]">
						<div class="absolute top-1 right-3 text-xs text-[var(--color-info)]">JSON</div>
						<textarea
							class="h-full w-full resize-none border-0 bg-[var(--color-primary)] p-4 font-mono text-sm text-[var(--color-info)] placeholder:text-[var(--color-info)] focus:outline-none"
							placeholder="JSON Validator"
							bind:value={jsonInput}
							oninput={handleJSONInput}
							disabled={viewEditMode !== 'edit'}
						></textarea>
						{#if !isValidJSON}
							<p class="text-error mt-1 text-red-600">Invalid JSON format</p>
						{/if}
					</div>
					<Button
						variant="primary"
						size="md"
						text={isPublishing ? 'Publishing...' : 'Publish'}
						onclick={publish}
						disabled={isPublishing || viewEditMode === 'view'}
						className="mt-2 w-64 self-end"
					/>
				</div>
			{/if}
		</div>
	</div>
{/if}
