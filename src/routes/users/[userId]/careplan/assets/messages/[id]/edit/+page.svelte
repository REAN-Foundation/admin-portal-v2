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

	let { data, form }: { data: PageServerData; form: any } = $props();

	let errors: Record<string, string> = $state({});
	let promise = $state();
	let name = $state(data.message.Name);
	let description = $state(data.message.Description);
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

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="table-container">
			<form onsubmit={async (event) => (promise = handleSubmit(event))}>
				<table class="table-c">
					<thead>
						<tr>
							<th>Edit Message</th>
							<th class="text-end">
								<a href={viewRoute} class="health-system-btn variant-soft-secondary">
									<Icon icon="material-symbols:close-rounded" />
								</a>
							</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Name</td>
							<td>
								<input
									type="text"
									class="input {form?.errors?.Name ? 'input-text-error' : ''}"
									name="name"
									placeholder="Enter name here..."
									bind:value={name}
								/>
								{#if errors?.Name}
									<p class="text-error">{errors?.Name}</p>
								{/if}
							</td>
						</tr>

						<tr>
							<td>Description</td>
							<td>
								<input
									type="textarea"
									class="input {form?.errors?.Name ? 'input-text-error' : ''}"
									name="description"
									placeholder="Enter description here..."
									bind:value={description}
								/>
								{#if errors?.Name}
									<p class="text-error">{errors?.Name}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td>Message Type</td>
							<td>
								<select class="input" bind:value={messageType}>
									<option disabled value>Select message type</option>
									<option>Educational</option>
									<option>Status</option>
									<option>Unknown</option>
								</select>
							</td>
						</tr>
						<tr>
							<td>Template Name</td>
							<td>
								<input
									type="text"
									bind:value={templateName}
									placeholder="Enter Template Name..."
									class="input {errors?.TemplateName ? 'input-text-error' : ''}"
								/>
								{#if errors?.TemplateName}<p class="text-error">{errors?.TemplateName}</p>{/if}
							</td>
						</tr>
						<tr>
							<td class="align-top">Template Variables</td>
							<td>
								<textarea
									name="templateVariablesText"
									class="input w-full {errors?.Code ? 'border-error-300' : 'border-primary-200'}"
									bind:value={templateVariablesText}
									placeholder="Enter Template Variables here..."
								></textarea>
							</td>
						</tr>
						<tr>
							<td>Url</td>
							<td>
								<input
									type="url"
									name="url"
									bind:value={pathUrl}
									placeholder="Enter url here"
									class="input {errors?.Url ? 'input-text-error' : ''}"
								/>
								{#if errors?.Url}
									<p class="text-error">{errors?.Url}</p>
								{/if}
							</td>
						</tr>

						<tr class="">
							<td class="!py-3 align-top">Tags</td>
							<td>
								<InputChips
									bind:keywords
									name="keywords"
									id="keywords"
									keywordsChanged={onUpdateKeywords}
								/>
								<input type="hidden" name="keywordsStr" id="keywordsStr" bind:value={keywordsStr} />
								<!-- <InputChip chips="variant-filled-error rounded-2xl" name="tags"  /> -->
							</td>
						</tr>
						<tr>
							<td>Version</td>
							<td>
								<input
									type="text"
									bind:value={version}
									class="input"
									placeholder="V 1.0"
								/>
							</td>
						</tr>
					</tbody>
				</table>

				<div class="button-container">
					<button
						type="button"
						onclick={handleReset}
						class="health-system-btn variant-soft-secondary">Reset</button
					>
					{#await promise}
						<button type="submit" class="health-system-btn variant-soft-secondary" disabled>
							Submiting
						</button>
					{:then data}
						<button type="submit" class="health-system-btn variant-soft-secondary"> Submit </button>
					{/await}
				</div>
			</form>
		</div>
	</div>
</div>
