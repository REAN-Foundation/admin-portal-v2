<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import { toastMessage } from '$lib/components/toast/toast.store.js';
	import type { PromptTemplateCreateModel } from '$lib/types/prompt.template.types.js';
	import { createOrUpdateSchema } from '$lib/validation/prompt.template.schema.js';
	import Icon from '@iconify/svelte';

	////////////////////////////////////////////////////////////////////////////////
	let { form } = $props();
	let errors: Record<string, string> = $state({});
	let promise = $state();

	const userId = page.params.userId;
	const createRoute = `/users/${userId}/bot-content/prompt-template/create`;
	const groupsRoute = `/users/${userId}/bot-content/prompt-template`;

	const breadCrumbs = [
		{ name: 'Prompt-Templates', path: groupsRoute },
		{ name: 'Create', path: createRoute }
	];

	let variables: string[] = $state([]);
	let variableInput = $state('');
	let name = $state('');
	let description = $state('');
	let content = $state('');
	let subgroup = $state('');
	let type = $state('');
	let category = $state('');
	let version = $state(undefined);

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const promptTemplateCreateModel: PromptTemplateCreateModel = {
				Name: name,
				Description: description,
				Content: content,
				Type: type,
				Category: category,
				SubGroup: subgroup,
				Variables: variables,
				Version: version
			};

			const validationResult = createOrUpdateSchema.safeParse(promptTemplateCreateModel);

			console.log('validation result', validationResult);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/prompt-template`, {
				method: 'POST',
				body: JSON.stringify(promptTemplateCreateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();
			console.log("response", response);
		

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				goto(`${groupsRoute}/${response?.Data?.id}/view`);
				return;
			}

			if (response.Errors) {
				errors = response?.Errors || {};
			} else {
				toastMessage(response);
			}
		} catch (error) {
			toastMessage();
		}
	};

	function updateVariables(event) {
    const inputValue = event.target.value;

	const matches = inputValue
        .split(',')
        .map(item => item.trim())
        .filter(item => item !== '');

    variables = matches
    console.log('Input value:', variables); 


}

	function getColorClass(temp) {
		if (temp >= 0 && temp < 0.25) {
			return 'bg-red-500';
		} else if (temp >= 0.25 && temp < 0.5) {
			return 'bg-yellow-500';
		} else if (temp >= 0.5 && temp < 0.75) {
			return 'bg-green-500';
		} else {
			return 'bg-blue-500';
		}
	}
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="health-system-table-container">
			<form onsubmit={async (event) => (promise = handleSubmit(event))}>
				<table class="health-system-table">
					<thead>
						<tr>
							<th>Create Prompt template</th>
							<th class="text-end">
								<a href={groupsRoute} class="health-system-btn variant-soft-secondary">
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
									name="name"
									bind:value={name}
									placeholder="Enter name here..."
									class="health-system-input"
								/>
								{#if errors?.Name}
									<p class="text-error">{errors?.Name}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td class="align-top">Description </td>
							<td>
								<textarea
									name="description"
									bind:value={description}
									placeholder="Enter description here..."
									class="health-system-input"
								></textarea>
							</td>
						</tr>

						<tr>
							<td>Content <span class="text-red-700">*</span></td>
							<td>
								<input
									class="health-system-input"
									name="content"
									bind:value={content}
									placeholder="Enter content here..."
								/>
							</td>
						</tr>
						<tr>
							<td>Type </td>
							<td>
								<input
									class="health-system-input"
									name="type"
									bind:value={type}
									placeholder="Enter type here..."
								/>
							</td>
						</tr>
						<tr>
							<td>Category </td>
							<td>
								<input
									class="health-system-input"
									name="category"
									bind:value={category}
									placeholder="Enter category here..."
								/>
							</td>
						</tr>
						<tr>
							<td>Sub-Group </td>
							<td>
								<textarea
									name="subgroup"
									bind:value={subgroup}
									placeholder="Enter sub-group here..."
									class="health-system-input"
								></textarea>
							</td>
						</tr>
						<tr>
							<td class="align-top">Variables</td>
							<td class="">
								<div class="">
									<textarea
										name="variable"
										bind:value={variableInput}
										class="health-system-input"
										oninput={updateVariables}
									placeholder="Enter variables here..."

									></textarea>
								</div>
							</td>
						</tr>
						<tr>
							<td>Version</td>
							<td>
								<input
									type="number"
									name="version"
									class="health-system-input"
									bind:value={version}
									placeholder="Enter version here..."
								/>
							</td>
						</tr>
					</tbody>
				</table>
				<div class="button-container">
					<!-- <button class="btn variant-filled-secondary">Test</button>
					<button type="submit" class="btn variant-filled-secondary">Save</button>

					<button type="submit" class="btn variant-filled-secondary">Publish</button> -->

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
