<script lang="ts">
	import { page } from '$app/state';
	import type { PageServerData } from './$types';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import { toastMessage } from '$lib/components/toast/toast.store.js';
	import { goto } from '$app/navigation';
	import InputChips from '$lib/components/input-chips.svelte';
	import type { MessageUpdateModel } from '$lib/types/message.type';
	import { createOrUpdateSchema } from '$lib/validation/message.schema';
	import Button from '$lib/components/button/button.svelte';

	let { data, form }: { data: PageServerData; form: any } = $props();

	let errors: Record<string, string> = $state({});
	let promise = $state();
	let name = $state(data.message.Name);
	let description = $state(data.message.Description || undefined);
	let messageType = $state(data.message.MessageType);
	let templateName = $state(data.message.TemplateName);
	let pathUrl = $state(data.message.PathUrl);
	let version = $state(data.message.Version);
	let keywords: string[] = $state(data.message.Tags);
	let keywordsStr = $state('');
	let templateVariablesText = $state(
		data.message.TemplateVariables ? JSON.stringify(data.message.TemplateVariables, null, 2) : ''
	);

	const userId = page.params.userId;
	const tenantId = data.tenantId;
	var messageId = page.params.id;

	const assetRoute = `/users/${userId}/careplan/assets`;
	const editRoute = `/users/${userId}/careplan/assets/messages/${messageId}/edit`;
	const viewRoute = `/users/${userId}/careplan/assets/messages/${messageId}/view`;
	const messageRoute = `/users/${userId}/careplan/assets/messages`;

	const breadCrumbs = [
		{ name: 'Assets', path: assetRoute },
		{ name: 'Edit', path: editRoute }
	];

	const handleReset = () => {
		name = data?.message?.Name;
		messageId = page.params.id;
		description = data?.message?.Description;
		templateName = data?.message?.TemplateName;
		templateVariablesText = data.message.TemplateVariables
			? JSON.stringify(data.message.TemplateVariables, null, 2)
			: '';
		pathUrl = data?.message?.PathUrl;
		version = data?.message?.Version;
		keywords = data?.message?.Tags;

		errors = {};
	};

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const messageUpdateModel: MessageUpdateModel = {
				Name: name,
				Description: description,
				PathUrl: pathUrl,
				MessageType: messageType,
				TemplateName: templateName,
				Version: version,
				Tags: keywords,
				TenantId: tenantId,
				TemplateVariables: parseTemplateVariables(templateVariablesText)
			};

			const validationResult = createOrUpdateSchema.safeParse(messageUpdateModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/careplan/assets/messages/${messageId}`, {
				method: 'PUT',
				body: JSON.stringify(messageUpdateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				console.log('Full response:', response);
				await goto(`${messageRoute}/${response?.Data?.id}/view`);
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
	<form onsubmit={(event) => (promise = handleSubmit(event))}>
		<div class="form-headers">
			<h2 class="form-titles">Edit Message</h2>
			<a href={viewRoute} class="form-cancel-btn">
				<Icon icon="material-symbols:close-rounded" />
			</a>
		</div>

		<table class="w-full">
			<tbody>
				<tr class="tables-row">
					<td class="table-label">Name <span class="important-field">*</span></td>
					<td class="table-data">
						<input
							type="text"
							class="input {errors?.Name ? 'input-text-error' : ''}"
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
							class="input resize-none {errors?.Description ? 'input-text-error' : ''}"
							bind:value={description}
							placeholder="Enter description here..."
						></textarea>
						{#if errors?.Description}
							<p class="error-text">{errors?.Description}</p>
						{/if}
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label">Message Type</td>
					<td class="table-data">
						<select class="input" bind:value={messageType}>
							<option disabled value>Select message type</option>
							<option>Educational</option>
							<option>Status</option>
							<option>Unknown</option>
						</select>
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label">Template Name</td>
					<td class="table-data">
						<input
							type="text"
							bind:value={templateName}
							name="templateName"
							placeholder="Enter template name..."
							class="input {errors?.TemplateName ? 'input-text-error' : ''}"
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
						placeholder="Enter template variables here..."
						></textarea>
							{#if errors?.TemplateVariables}
							<p class="error-text">{errors.TemplateVariables}</p>
							{/if}
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">URL</td>
					<td class="table-data">
						<input
							type="url"
							name="url"
							bind:value={pathUrl}
							placeholder="Enter url here..."
							class="input {errors?.Url ? 'input-text-error' : ''}"
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
						<input type="hidden" name="keywordsStr" id="keywordsStr" bind:value={keywordsStr} />
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label">Version</td>
					<td class="table-data">
						<input
							type="text"
							name="version"
							bind:value={version}
							class="input {errors?.Version ? 'input-text-error' : ''}"
							placeholder="V 1.0"
						/>
						{#if errors?.Version}
							<p class="error-text">{errors?.Version}</p>
						{/if}
					</td>
				</tr>
			</tbody>
		</table>

		<div class="btn-container">
            <Button type="button" onclick={handleReset} text="Reset" variant="primary" />
            {#await promise}
                <Button type="submit" text="Submitting" variant="primary" disabled={true} />
            {:then data}
                <Button type="submit" text="Submit" variant="primary" />
            {/await}
		</div>
	</form>
</div>
