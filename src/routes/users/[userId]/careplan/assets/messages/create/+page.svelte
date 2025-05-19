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
	const assetRoute = `/users/${userId}/careplan/assets`;
	const createRoute = `/users/${userId}/careplan/assets/messages/create`;
	const messagesRoute = `/users/${userId}/careplan/assets/messages`;

	const breadCrumbs = [
		{ name: 'Assets', path: assetRoute },
		{ name: 'Message', path: messagesRoute },
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
				// TemplateVariables: templateVariables
				// TemplateVariables: parseTemplateVariables(templateVariablesText)
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


// 	function parseTemplateVariables(text: string): Record<string, any> | null {
// 		try {
// 		const parsed = JSON.parse(text);
// 		if (
// 			typeof parsed !== 'object' ||
// 			parsed === null ||
// 			Array.isArray(parsed)
// 		) {
// 			throw new Error('Not a valid object');
// 		}
// 		return parsed;
// 	} catch (e) {
// 		errors['TemplateVariables'] = 'TemplateVariables must be a valid JSON object with key-value pairs';
// 		return null;
// 	}
// }

	const onUpdateKeywords = (e: any) => {
		keywords = e.detail;
		keywordsStr = keywords?.join(', ');
	};
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="health-system-table-container">
			<form onsubmit={async (event) => (promise = handleSubmit(event))}>
				<table class="health-system-table">
					<thead>
						<tr>
							<th>Create Message</th>
							<th class="text-end">
								<a href={assetRoute} class="health-system-btn variant-soft-secondary">
									<Icon icon="material-symbols:close-rounded" />
								</a>
							</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Name <span class="text-red-700">*</span></td>
							<td>
								<input
									type="text"
									class="health-system-input {form?.errors?.Name ? 'input-text-error' : ''}"
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
							<td class="align-top">Description</td>
							<td>
								<textarea
									name="description"
									class="input w-full {errors?.Code ? 'border-error-300' : 'border-primary-200'}"
									bind:value={description}
									placeholder="Enter description here..."
								></textarea>
							</td>
						</tr>
						<tr>
						<td>Message Type<span class="text-red-700">*</span></td>
						<td>
							<select class="health-system-input" bind:value={messageType}>
								<option disabled value>Select message type</option>
								<option>Educational</option>
								<option>Status</option>
								<option>Unknown</option>
							</select>
						</td>
					</tr>
					<tr>
						<td>Template Name<span class="text-red-700">*</span></td>
						<td>
							<input
								type="text"
								bind:value={templateName}
								placeholder="Enter Template Name..."
								class="health-system-input {errors?.TemplateName ? 'input-text-error' : ''}"
							/>
							{#if errors?.TemplateName}<p class="text-error">{errors?.TemplateName}</p>{/if}
						</td>
					</tr>
					<!-- <tr>
						<td>Template Variables</td>
						<td>
							<input
								type="text"
								bind:value={templateVariablesText}
								placeholder="Enter Template Variables..."
								class="health-system-input {errors?.TemplateVariables ? 'input-text-error' : ''}"
							/>
							{#if errors?.TemplateVariables}<p class="text-error">{errors?.TemplateVariables}</p>{/if}
						</td>
					</tr> -->
					<tr>
							<td class="align-top">Template Variables</td>
							<td>
								<textarea
									name="templateVariablesText"
									class="input w-full {errors.TemplateVariables ? 'border-error-300' : 'border-primary-200'}"
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
                                    class="health-system-input {errors?.Url ? 'input-text-error' : ''}"
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
								<input type="text" bind:value={version} class="health-system-input" placeholder="V 1.0" />
							</td>
						</tr>
					</tbody>
				</table>

				<div class="button-container">
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
