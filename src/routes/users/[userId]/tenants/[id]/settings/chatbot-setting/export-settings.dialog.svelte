<script lang="ts">
	import { toastMessage } from '$lib/components/toast/toast.store';

	let { open = true, onclose, tenantId } = $props();

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

	function handleExport(type: string) {
		// Placeholder for export logic
		alert(`Export as ${type}`);
		closeDialog();
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

	function toggleConfig() {
		isGenerated = true;
	}

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
		if (!isValidJSON) {
			alert('Invalid JSON!');
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

			if (res.ok) {
				toastMessage(response);
				closeDialog();
			} else {
				toastMessage(response);
			}
		} catch (err) {
			toastMessage('Error publishing configuration');
		} finally {
			isPublishing = false;
		}
	}

	async function handleViewSecret() {
		isFetchingSecret = true;
		try {
			const res = await fetch(`/api/server/tenants/${tenantId}/secret`, {
				method: 'GET',
				headers: { 'content-type': 'application/json' }
			});
			const response = await res.json();
			if (response.HttpCode === 201 || response.HttpCode === 200) {
				if (response.Data) {
					jsonInput = JSON.stringify(response.Data, null, 2);
				} else if (typeof response.secret === 'string') {
					jsonInput = response.secret;
				} else {
					jsonInput = JSON.stringify(response.secret, null, 2);
				}
				viewEditMode = 'view';
				toastMessage(response);
			} else {
				toastMessage(response);
			}
		} catch (err) {
			alert('Error fetching secret');
		} finally {
			isFetchingSecret = false;
		}
	}

	function handleEditMode() {
		viewEditMode = 'edit';
	}

	// Check for existing secrets when dialog opens
	async function checkExistingSecrets() {
		isCheckingSecrets = true;
		try {
			const res = await fetch(`/api/server/tenants/${tenantId}/secret`, {
				method: 'GET',
				headers: { 'content-type': 'application/json' }
			});
			const response = await res.json();
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

	async function createSecrets() {
		isPublishing = true;
		try {
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
					jsonInput = typeof response.secret === 'string' 
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
			class="relative flex h-[80%] w-[80%] flex-col justify-start rounded-lg bg-white p-6 shadow-lg"
		>
			<button
				class="absolute top-4 right-4 text-2xl font-bold text-gray-400 hover:text-gray-600"
				onclick={closeDialog}
				aria-label="Close dialog"
			>
				&times;
			</button>
			<p class="mb-4 text-sm text-blue-600">
				<span
					class="cursor-pointer hover:underline"
					role="button"
					tabindex="0"
					onclick={() => (isGenerated = false)}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') isGenerated = false;
					}}
				>
					Tenant settings
				</span
				>
				&gt; configurations
			</p>

			{#if isCheckingSecrets}
				<div class="flex items-center justify-center h-full">
					<p>Checking existing secrets...</p>
				</div>
			{:else if !hasSecrets}
				<div>
					<button
						class="w-64 self-start rounded bg-blue-200 px-4 py-2 text-black shadow hover:bg-blue-300"
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
							class="rounded border border-blue-300 bg-blue-100 px-4 py-1 text-black hover:bg-blue-200 disabled:opacity-60"
							onclick={handleViewSecret}
							disabled={isFetchingSecret || viewEditMode === 'view'}
						>
							{isFetchingSecret ? 'Loading...' : 'View'}
						</button>
						<button
							class="rounded border border-blue-300 bg-blue-100 px-4 py-1 text-black hover:bg-blue-200 disabled:opacity-60"
							onclick={handleEditMode}
							disabled={viewEditMode === 'edit'}
						>
							Edit
						</button>
					</div>
					<!-- JSON Box -->
					<div class="relative flex-1 rounded border border-blue-300">
						<div class="absolute top-1 right-3 text-xs text-blue-500">JSON</div>
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
						class="mt-2 w-64 self-end rounded bg-blue-200 px-4 py-2 text-black shadow hover:bg-blue-300"
						onclick={publish}
						disabled={isPublishing || viewEditMode !== 'edit'}
					>
						{isPublishing ? 'Publishing...' : 'Publish'}
					</button>
				</div>
			{/if}
		</div>
	</div>
{/if}
