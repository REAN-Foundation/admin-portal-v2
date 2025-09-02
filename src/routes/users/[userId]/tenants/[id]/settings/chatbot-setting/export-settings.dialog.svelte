<script lang="ts">
	import { addToast, toastMessage } from '$lib/components/toast/toast.store';

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
			const res = await fetch(`/api/server/tenants/${tenantId}/secret`, {
				method: 'PUT',
				headers: { 'content-type': 'application/json' },
				body: jsonInput
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
		viewEditMode = 'edit';
	}

	// Check for existing secrets when dialog opens
	async function checkExistingSecrets() {
		// const schemaRes = await fetch(`/api/server/tenants/${tenantId}/schema`, {
		// 	method: 'POST',
		// 	headers: { 'content-type': 'application/json' },
		// 	body: JSON.stringify({ tenantCode })
		// });
		// const schemaResponse = await schemaRes.json();
		// console.log('This is schemaResponse', schemaResponse);

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
				jsonInput = JSON.stringify(response.Data, null, 2);
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
			const schemaRes = await fetch(`/api/server/tenants/${tenantId}/schema`, {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ tenantCode })
			});
			const schemaResponse = await schemaRes.json();
			console.log('This is schemaResponse', schemaResponse);
		} catch (err) {
			console.log('Error creating bot schema', err);
			// toastMessage('Error creating bot schema');
		} finally {
			isPublishing = true;
		}
	}
	async function createSecrets() {
		isPublishing = true;
		try {
			await createBotSchema();
			// First, create schema
			// const schemaRes = await fetch(`/api/server/tenants/${tenantId}/schema`, {
			// 	method: 'POST',
			// 	headers: { 'content-type': 'application/json' },
			// 	body: JSON.stringify({ tenantCode })
			// });
			// const schemaResponse = await schemaRes.json();
			// if (!schemaRes.ok) {
			// 	toastMessage(schemaResponse);
			// 	isPublishing = false;
			// 	return;
			// }

			// Then, create secrets
			const res = await fetch(`/api/server/tenants/${tenantId}/secret`, {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({})
			});
			const response = await res.json();
			if (response.HttpCode === 200 || response.HttpCode === 201) {
				hasSecrets = true;
				showEditor = true;
				viewEditMode = 'view';
				if (response.Data) {
					jsonInput = JSON.stringify(response.Data, null, 2);
				} else if (response.secret) {
					jsonInput =
						typeof response.secret === 'string'
							? response.secret
							: JSON.stringify(response.secret, null, 2);
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
					<p>Checking existing secrets...</p>
				</div>
			{:else if !hasSecrets}
				<div>
					<button
						class="variant-filled-secondary w-fit self-start rounded px-4 py-2 text-[var(--color-info)] shadow"
						onclick={createSecrets}
						disabled={isPublishing}
					>
						{isPublishing ? 'Creating...' : 'Generate configuration file'}
					</button>
				</div>
			{:else}
				<!-- Edit UI - Show directly if secrets exist -->
				<div class="flex flex-1 flex-col gap-4">
					<div class="mb-2 flex gap-2">
						<button
							class="rounded border variant-filled-secondary px-4 py-1 text-[var(--color-info)] 0 disabled:opacity-60"
							disabled={isFetchingSecret || viewEditMode === 'view'}
						>
							{isFetchingSecret ? 'Loading...' : 'View'}
						</button>
						<button
							class="rounded border variant-filled-secondary px-4 py-1 text-[var(--color-info)]  disabled:opacity-60"
							onclick={handleEditMode}
							disabled={viewEditMode === 'edit'}
						>
							Edit
						</button>
					</div>
					<!-- JSON Box -->
					<div class="relative flex-1 rounded border border-blue-300">
						<div class="absolute top-1 right-3 text-xs text-[var(--color-info)]">JSON</div>
						<textarea
							class="h-full w-full resize-none border-0 p-4 font-mono text-sm focus:outline-none"
							placeholder="JSON Validator"
							bind:value={jsonInput}
							oninput={handleJSONInput}
							disabled={viewEditMode !== 'edit'}
						></textarea>
						{#if !isValidJSON}
							<p class="text-error mt-1 text-red-600">Invalid JSON format</p>
						{/if}
					</div>
					<button
						class="mt-2 w-64 self-end rounded variant-filled-secondary px-4 py-2 text-[var(--color-info)] shadow "
						onclick={publish}
						disabled={isPublishing}
					>
						{isPublishing ? 'Publishing...' : 'Publish'}
					</button>
				</div>
			{/if}
		</div>
	</div>
{/if}
