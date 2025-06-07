<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import { toastMessage } from '$lib/components/toast/toast.store.js';
	import { goto } from '$app/navigation';
	import InputChips from '$lib/components/input-chips.svelte';
	import type { MessageCreateModel } from '$lib/types/message.type.js';
	import { createOrUpdateSchema } from '$lib/validation/message.schema.js';

	let { data, form } = $props();

	let errors: Record<string, string> = $state({});
	let promise = $state();
	let name = $state('');
	let description = $state('');
	let messageType = $state('');
	let templateName = $state('');
	let pathUrl = $state(undefined);
	let version = $state('');
	let keywords: string[] = $state([]);
	let keywordsStr = $state('');
	let templateVariablesText = $state('');
	let templateVariables: { [key: string]: any } = $state({});

	data.title = 'Create Message';
	const userId = page.params.userId;
	const tenantId = data.sessionUser.tenantId;

	const assetRoute = `/users/${userId}/careplan/assets`;
	const createRoute = `/users/${userId}/careplan/assets/messages/create`;
	const messagesRoute = `/users/${userId}/careplan/assets/messages`;

	const breadCrumbs = [
		{ name: 'Assets', path: assetRoute },
		{ name: 'Create', path: createRoute }
	];

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const parsedTemplateVars = parseTemplateVariables(templateVariablesText);
			if (!parsedTemplateVars) {
			// If parse failed, do not continue
			return;
		}

			const messageCreateModel: MessageCreateModel = {
				Name: name,
				Description: description,
				MessageType: messageType,
				TemplateName: templateName,
				PathUrl: pathUrl,
				Version: version,
				Tags: keywords,
				TenantId: tenantId,
				TemplateVariables: parsedTemplateVars

			};

			const validationResult = createOrUpdateSchema.safeParse(messageCreateModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}
			console.log(messageCreateModel);
			const res = await fetch(`/api/server/careplan/assets/messages`, {
				method: 'POST',
				body: JSON.stringify(messageCreateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				console.log('Full response:', response);
				await goto(`${messagesRoute}/${response?.Data?.id}/view`);
			} else if (response.Errors) {
				errors = response?.Errors || {};
			} else {
				toastMessage(response);
			}
		} catch (error) {
			toastMessage();
		}
	};

	function parseTemplateVariables(text: string): Record<string, any> | null {
	try {
		const parsed = JSON.parse(text);
		if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
			throw new Error('Invalid object');
		}
		return parsed;
	} catch (e) {
		errors = {
			...errors,
			TemplateVariables: 'TemplateVariables must be a valid JSON object with key-value pairs'
		};
		return null;
	}
}

const onUpdateKeywords = (e: any) => {
		keywords = e.detail;
		keywordsStr = keywords?.join(', ');
	};
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="p-6">
	<form onsubmit={async (event) => (promise = handleSubmit(event))}>
		<div class="form-headers">
			<h2 class="form-titles">Create Message</h2>
			<a href={assetRoute} class="form-cancel-btn">
				<Icon icon="material-symbols:close-rounded" />
			</a>
		</div>

		<table class="w-full">
			<tbody>
				<tr class="tables-row">
					<td class="table-label">
						Name <span class="important-field">*</span>
					</td>
					<td class="table-data">
						<input
							type="text"
							class="input {form?.errors?.Name ? 'input-text-error' : ''}"
							name="name"
							placeholder="Enter name here..."
							bind:value={name}
						/>
						{#if errors?.Name}
							<p class="error-text">{errors?.Name}</p>
						{/if}
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label">Description</td>
					<td class="table-data">
						<textarea
							name="description"
							class="input resize-none {errors?.Code ? 'border-error-300' : 'border-primary-200'}"
							bind:value={description}
							placeholder="Enter description here..."
						></textarea>
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label">
						Message Type <span class="important-field">*</span>
					</td>
					<td class="table-data">
						<select
							class="input"
							bind:value={messageType}
						>
							<option disabled value>Select message type</option>
							<option>Educational</option>
							<option>Status</option>
							<option>Unknown</option>
						</select>
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label">
						Template Name <span class="important-field">*</span>
					</td>
					<td class="table-data">
						<input
							type="text"
							class="input {errors?.TemplateName ? 'input-text-error' : ''}"
							placeholder="Enter Template Name..."
							bind:value={templateName}
						/>
						{#if errors?.TemplateName}
							<p class="error-text">{errors?.TemplateName}</p>
						{/if}
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label">Template Variables</td>
					<td class="table-data">
						<textarea
							name="templateVariablesText"
							class="input resize-none {errors?.TemplateVariables ? 'border-error-300' : 'border-primary-200'}"
							bind:value={templateVariablesText}
							placeholder="Enter Template Variables here..."
						></textarea>
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label">Url</td>
					<td class="table-data">
						<input
							type="url"
							name="url"
							class="input {errors?.Url ? 'input-text-error' : ''}"
							placeholder="Enter url here"
							bind:value={pathUrl}
						/>
						{#if errors?.Url}
							<p class="error-text">{errors?.Url}</p>
						{/if}
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label align-top">Tags</td>
					<td class="table-data">
						<InputChips
							bind:keywords
							name="keywords"
							id="keywords"
							keywordsChanged={onUpdateKeywords}
						/>
						<input
							type="hidden"
							name="keywordsStr"
							id="keywordsStr"
							bind:value={keywordsStr}
						/>
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label">Version</td>
					<td class="table-data">
						<input
							type="text"
							class="input {form?.errors?.Version ? 'input-text-error' : ''}"
							name="version"
							placeholder="V 1.0"
							bind:value={version}
						/>
						{#if errors?.Version}
							<p class="error-text">{errors?.Version}</p>
						{/if}
					</td>
				</tr>
			</tbody>
		</table>

		<div class="btn-container">
			{#await promise}
				<button
					type="submit"
					class="table-btn variant-soft-secondary"
					disabled
				>
					Submitting
				</button>
			{:then data}
				<button
					type="submit"
					class="table-btn variant-soft-secondary"
				>
					Submit
				</button>
			{/await}
		</div>
	</form>
</div>
