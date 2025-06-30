<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import { toastMessage } from '$lib/components/toast/toast.store.js';
	import { goto } from '$app/navigation';
	import InputChips from '$lib/components/input-chips.svelte';
	import type { MessageCreateModel } from '$lib/types/message.type.js';
	import { createOrUpdateSchema } from '$lib/validation/message.schema.js';
	import Button from '$lib/components/button/button.svelte';
	import Input from '$lib/components/input/input.svelte';
	import Label from '$lib/components/label/label.svelte';
	import Textarea from '$lib/components/textarea/textarea.svelte';
	import Heading from '$lib/components/heading/heading.svelte';
	///////////////////////////////////////////////////////////////////////////////////////////
	let { data, form } = $props();

	let errors: Record<string, string> = $state({});
	let promise = $state();
	let name = $state('');
	let description = $state('');
	let messageType = $state('Unknown');
	let templateName = $state('');
	let pathUrl = $state(undefined);
	let version = $state('');
	let keywords: string[] = $state([]);
	let keywordsStr = $state('');
	let templateVariablesText = $state('{}');

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

	$effect(() => {
		keywordsStr = keywords?.join(', ');
	});
</script>

<BreadCrumbs crumbs={breadCrumbs} />
<div class="p-6">
	<form onsubmit={async (event) => (promise = handleSubmit(event))}>
		<div class="form-headers">
			<Heading text="Create Message" />
			<a href={assetRoute} class="form-cancel-btn">
				<Icon icon="material-symbols:close-rounded" />
			</a>
		</div>

		<table class="w-full">
			<tbody>
				<tr class="tables-row">
					<Label text="Name" required={true} />
					<td class="table-data">
						<Input
							name="name"
							type="text"
							placeholder="Enter name here..."
							bind:value={name}
							error={errors?.Name}
						/>
					</td>
				</tr>

				<tr class="tables-row">
					<Label text="Description" />
					<td class="table-data">
						<Textarea
							name="description"
							placeholder="Enter description here..."
							bind:value={description}
							error={errors?.Description}
							resize={false}
						/>
					</td>
				</tr>

				<tr class="tables-row">
					<Label text="Message Type" required={true} />
					<td class="table-data">
						<select
							class="input {errors?.MessageType ? 'input-text-error' : ''}"
							bind:value={messageType}
							name="messageType"
						>
							<option disabled value>Select message type</option>
							<option>Educational</option>
							<option>Status</option>
							<option>Unknown</option>
						</select>
						{#if errors?.MessageType}
							<p class="error-text">{errors?.MessageType}</p>
						{/if}
					</td>
				</tr>

				<tr class="tables-row">
					<Label text="Template Name" required={true} />
					<td class="table-data">
						<Input
							name="templateName"
							type="text"
							placeholder="Enter template name..."
							bind:value={templateName}
							error={errors?.TemplateName}
						/>
					</td>
				</tr>

				<tr class="tables-row">
					<Label text="Template Variables" />
					<td class="table-data">
						<Textarea
							name="templateVariablesText"
							placeholder="Enter template variables here..."
							bind:value={templateVariablesText}
							error={errors?.TemplateVariables}
							resize={false}
						/>
					</td>
				</tr>

				<tr class="tables-row">
					<Label text="URL" />
					<td class="table-data">
						<Input
							name="url"
							type="url"
							placeholder="Enter url here"
							bind:value={pathUrl}
							error={errors?.Url}
						/>
					</td>
				</tr>

				<tr class="tables-row">
					<Label text="Tags" />
					<td class="table-data">
						<InputChips bind:keywords name="keywords" id="keywords" />
						<input type="hidden" name="keywordsStr" id="keywordsStr" bind:value={keywordsStr} />
					</td>
				</tr>

				<tr class="tables-row">
					<Label text="Version" />
					<td class="table-data">
						<Input
							name="version"
							type="text"
							placeholder="V 1.0"
							bind:value={version}
							error={errors?.Version}
						/>
					</td>
				</tr>
			</tbody>
		</table>

		<div class="btn-container">
			{#await promise}
				<Button type="submit" text="Submitting" variant="primary" disabled={true} />
			{:then data}
				<Button type="submit" text="Submit" variant="primary" />
			{/await}
		</div>
	</form>
</div>
