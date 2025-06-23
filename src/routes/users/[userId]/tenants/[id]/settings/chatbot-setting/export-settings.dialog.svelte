<script lang="ts">
	import { toastMessage } from "$lib/components/toast/toast.store";

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
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: jsonInput
			});
			const data = await res.json();

			if (res.ok) {
				alert('Configuration published successfully!');
				closeDialog();
			} else {
				alert(data?.Message || 'Failed to publish configuration');
			}
		} catch (err) {
			alert('Error publishing configuration');
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
			const data = await res.json();
			if (res.ok && data.secret) {
				jsonInput = typeof data.secret === 'string' ? data.secret : JSON.stringify(data.secret, null, 2);
				viewEditMode = 'view';
				toastMessage(res);
			} else {
				// alert(data?.Message || 'Failed to fetch secret');
				toastMessage(res);
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
</script>

{#if open}
	<!-- <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"> -->
	<!-- <div class="relative w-full max-w-md rounded-lg bg-white p-6 shadow-lg"> -->
	<!-- <button -->
	<!-- class="absolute top-2 right-2 text-gray-400 hover:text-gray-600" -->
	<!-- onclick={closeDialog} -->
	<!-- > -->
	<!-- &times; -->
	<!-- </button> -->
	<!-- <h2 class="mb-4 text-lg font-semibold">Export Settings</h2> -->
	<!-- <p class="mb-6 text-gray-600">Choose how you want to export the settings file:</p> -->
	<!-- <div class="mb-6 flex gap-4"> -->
	<!-- <button class="table-btn variant-filled-primary flex-1" onclick={() => handleExport('JSON')} -->
	<!-- >Export as JSON</button -->
	<!-- > -->
	<!-- <button -->
	<!-- class="table-btn variant-filled-secondary flex-1" -->
	<!-- onclick={() => handleExport('YAML')}>Export as YAML</button -->
	<!-- > -->
	<!-- </div> -->
	<!--  -->
	<!-- <div class="mt-4 text-xs text-gray-400"> -->
	<!-- <ul class="list-disc pl-5"> -->
	<!-- <li>Environment file creation</li> -->
	<!-- <li>AWS secret population and sync</li> -->
	<!-- <li>ECS Task definition updates</li> -->
	<!-- <li>ECS service creation and start</li> -->
	<!-- </ul> -->
	<!-- <div class="mt-2"> -->
	<!-- <strong>Lambdas:</strong> -->
	<!-- <ol class="list-decimal pl-5"> -->
	<!-- <li>Create environment - accepts settings json</li> -->
	<!-- <li>Read json</li> -->
	<!-- <li>Update json</li> -->
	<!-- <li>Create db schema for tenant in a given environment</li> -->
	<!-- </ol> -->
	<!-- </div> -->
	<!-- </div> -->
	<!-- </div> -->
	<!-- </div> -->
	<!-- <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"> -->
	<!-- <div class="h-[80%] w-[80%] overflow-auto rounded-lg bg-white p-6 shadow-lg"> -->
	<!-- <p class="mb-4 text-sm text-blue-600">Tenant settings &gt; configurations</p> -->

	<!-- {#if !isGenerated} -->
	<!-- <div> -->
	<!-- <button -->
	<!-- class="bg-blue-200 text-black px-4 py-2 rounded shadow hover:bg-blue-300 self-start w-64" -->
	<!-- onclick={toggleConfig}> -->
	<!-- Generate configuration file -->
	<!-- </button> -->
	<!-- </div> -->
	<!-- {:else} -->
	<!-- <div class="flex h-full flex-col gap-4"> -->
	<!-- <button -->
	<!-- class="self-start rounded bg-blue-200 px-4 py-2 text-black shadow hover:bg-blue-300" -->
	<!-- disabled -->
	<!-- > -->
	<!-- Edit Configuration file -->
	<!-- </button> -->

	<!-- <div class="relative flex-1 rounded border border-blue-300"> -->
	<!-- <div class="absolute top-1 right-3 text-xs text-blue-500">JSON</div> -->
	<!-- <textarea -->
	<!-- class="h-full w-full resize-none border-0 p-4 font-mono text-sm focus:outline-none" -->
	<!-- placeholder="JSON Validator" -->
	<!-- bind:value={jsonInput} -->
	<!-- oninput={handleJSONInput} -->
	<!-- ></textarea> -->
	<!-- {#if !isValidJSON} -->
	<!-- <p class="text-error text-red-600 mt-1">Invalid JSON format</p> -->
	<!-- {/if} -->
	<!-- </div> -->

	<!-- <button -->
	<!-- class="self-end rounded bg-blue-200 px-4 py-2 text-black shadow hover:bg-blue-300" -->
	<!-- onclick={publish} -->
	<!-- disabled={isPublishing} -->
	<!-- > -->
	<!-- {isPublishing ? 'Publishing...' : 'Publish'} -->
	<!-- </button> -->
	<!-- </div> -->
	<!-- {/if} -->
	<!-- </div> -->
	<!-- </div> -->

	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
		<!-- Dialog Box -->
		<div class="flex h-[80%] w-[80%] flex-col justify-start rounded-lg bg-white p-6 shadow-lg relative">
			<button
				class="absolute top-4 right-4 text-2xl text-gray-400 hover:text-gray-600 font-bold"
				onclick={closeDialog}
				aria-label="Close dialog"
			>
				&times;
			</button>
			<p class="mb-4 text-sm text-blue-600">
				<span class="cursor-pointer hover:underline" onclick={() => (isGenerated = false)}
					>Tenant settings</span
				>
				&gt; configurations
			</p>

			{#if !isGenerated}
				<div>
					<button
						class="w-64 self-start rounded bg-blue-200 px-4 py-2 text-black shadow hover:bg-blue-300"
						onclick={toggleConfig}
					>
						Generate configuration file
					</button>
				</div>
			{:else}
				<!-- Config Editor Layout -->
				<div class="flex flex-1 flex-col gap-4">
					{#if !showEditor}
						<button
							class="w-64 self-start rounded bg-blue-200 px-4 py-2 text-black shadow hover:bg-blue-300"
							onclick={() => showEditor = true}
						>
							Edit Configuration file
						</button>
						<!-- JSON Box -->
						<div class="relative flex-1 rounded border border-blue-300 mt-2">
							<div class="absolute top-1 right-3 text-xs text-blue-500">JSON</div>
							<textarea
								class="h-full w-full resize-none border-0 p-4 font-mono text-sm focus:outline-none"
								placeholder="JSON Validator"
								bind:value={jsonInput}
								oninput={handleJSONInput}
								disabled
							></textarea>
							{#if !isValidJSON}
								<p class="text-error mt-1 text-red-600">Invalid JSON format</p>
							{/if}
						</div>
						<button
							class="w-64 self-end rounded bg-blue-200 px-4 py-2 text-black shadow hover:bg-blue-300 mt-2"
							disabled
						>
							Publish
						</button>
					{:else}
						<div class="flex gap-2 mb-2">
							<button
								class="rounded bg-blue-100 px-4 py-1 text-black border border-blue-300 hover:bg-blue-200 disabled:opacity-60"
								onclick={handleViewSecret}
								disabled={isFetchingSecret || viewEditMode === 'view'}
							>
								{isFetchingSecret ? 'Loading...' : 'View'}
							</button>
							<button
								class="rounded bg-blue-100 px-4 py-1 text-black border border-blue-300 hover:bg-blue-200 disabled:opacity-60"
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
							class="w-64 self-end rounded bg-blue-200 px-4 py-2 text-black shadow hover:bg-blue-300 mt-2"
							onclick={publish}
							disabled={isPublishing || viewEditMode !== 'edit'}
						>
							{isPublishing ? 'Publishing...' : 'Publish'}
						</button>
					{/if}
				</div>
			{/if}
		</div>
	</div>
{/if}
