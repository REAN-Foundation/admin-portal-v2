<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import { goto } from '$app/navigation';
	import type { PromptTemplateUpdateModel } from '$lib/types/prompt.template.types';
	import { createOrUpdateSchema } from '$lib/validation/prompt.template.schema';

	////////////////////////////////////////////////////////////////////////////////

	let { data, form }: { data: PageServerData; form: any } = $props();

	console.log('data', data);

	let name = $state(data.prompts.Name);
	let description = $state(data.prompts.Description);
	let content = $state(data.prompts.Content);
	let subgroup = $state(data.prompts.SubGroup);
	let type = $state(data.prompts.Type);
	let category = $state(data.prompts.Category);
	// let variables: string[] = $state(data.prompts.Variables);
	let variablesRaw = $state(data.prompts.Variables); // used only in declaration
	let variables: string[] = $derived(variablesRaw.split(',').map((v) => v.trim()));

	let variableStr: string = $state('');
	let version = $state(data.prompts.Version);

	let errors: Record<string, string> = $state({});
	let promise = $state();

	function updateVariables(event) {
		const inputValue = event.target.value;
		const matches = inputValue
			.split(',')
			.map((item) => item.trim())
			.filter((item) => item !== '');

		variables = matches;
		variableStr = variables?.join(', ');
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

	const userId = page.params.userId;
	var promptId = page.params.id;
	const createRoute = `/users/${userId}/bot-content/prompt-template/create`;
	const promptRoutes = `/users/${userId}/bot-content/prompt-template`;

	const breadCrumbs = [
		{ name: 'Prompt-template', path: promptRoutes },
		{ name: 'Edit', path: createRoute }
	];

	const handleReset = () => {
		name = data?.prompts?.Name;
		description = data?.prompts?.Description;
		(content = data?.prompts?.Content),
			(subgroup = data?.prompts?.SubGroup),
			(type = data?.prompts?.Type),
			// (variables = data?.prompts?.Variables),
			(version = data?.prompts?.Version),
			(category = data?.prompts?.Category),
			(errors = {});
	};

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const promptTemplateUpdateModel: PromptTemplateUpdateModel = {
				Name: name,
				Description: description,
				Content: content,
				Type: type,
				Category: category,
				SubGroup: subgroup,
				Variables: variables,
				Version: version
			};

			const validationResult = createOrUpdateSchema.safeParse(promptTemplateUpdateModel);
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

			const res = await fetch(`/api/server/prompt-template/${promptId}`, {
				method: 'PUT',
				body: JSON.stringify(promptTemplateUpdateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				goto(`${promptRoutes}/${response?.Data?.id}/view`);
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
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="health-system-table-container">
			<form onsubmit={(event) => (promise = handleSubmit(event))}>
				<table class="health-system-table">
					<thead>
						<tr>
							<th>Edit Prompt Template</th>
							<th class="text-end">
								<a href={promptRoutes} class=" cancel-btn">
									<Icon icon="material-symbols:close-rounded" />
								</a>
							</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Name <span class=" text-red-600">*</span></td>
							<td>
								<input
									type="text"
									name="name"
									placeholder="Enter name here..."
									class="health-system-input"
									bind:value={name}
								/>
							</td>
						</tr>
						<tr>
							<td class="align-top">Description <span class=" text-red-600">*</span></td>
							<td>
								<textarea
									name="description"
									required
									placeholder="Enter description here..."
									class="health-system-input"
									bind:value={description}
								></textarea>
							</td>
						</tr>
						<tr>
							<td>Version</td>
							<td>
								<input
									type="text"
									name="version"
									placeholder="Enter version here..."
									class="health-system-input"
									bind:value={version}
								/>
							</td>
						</tr>
						<tr>
							<td>Content <span class=" text-red-600">*</span></td>
							<td>
								<input
									class="health-system-input"
									bind:value={content}
									name="content"
									placeholder="Enter Content here..."
								/>
							</td>
						</tr>
						<tr>
							<td>SubGroup <span class=" text-red-600">*</span></td>
							<td>
								<textarea
									name="subgroup"
									bind:value={subgroup}
									placeholder="Enter Subgroup here..."
									class="health-system-input"
								></textarea>
							</td>
						</tr>
						<tr>
							<td>Type <span class=" text-red-600">*</span></td>
							<td>
								<input
									class="health-system-input"
									bind:value={type}
									name="type"
									placeholder="Enter type here..."
								/>
							</td>
						</tr>
						<tr>
							<td class="align-top">Category <span class=" text-red-600">*</span></td>
							<td>
								<input
									class="health-system-input"
									required
									bind:value={category}
									name="category"
									placeholder="Enter category here..."
								/>
							</td>
						</tr>
						<tr>
							<td class="align-top">Variables</td>
							<td class="">
								<div class="variables-container">
									<input
										name="variables"
										bind:value={variables}
										class="health-system-input"
										oninput={updateVariables}
									/>
								</div>
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
