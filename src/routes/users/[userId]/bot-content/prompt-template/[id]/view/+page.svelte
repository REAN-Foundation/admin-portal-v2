<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import Button from '$lib/components/button/button.svelte';

	////////////////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();

	let promptTemplate = data.promptTemplate;
	let id = promptTemplate.id;
	let name = promptTemplate.Name;
	let description =
		promptTemplate.Description !== null && promptTemplate.Description !== ''
			? promptTemplate.Description
			: 'Not specified';
	let prompt = promptTemplate.Prompt;
	let model = promptTemplate.Model;
	let group = promptTemplate.Group;
	let useCaseType = promptTemplate.UseCaseType;
	let variable = promptTemplate.Variables;
	let temperature = promptTemplate.Temperature;
	let topP = promptTemplate.TopP;
	let frequencyPenalty = promptTemplate.FrequencyPenalty;
	let presencePenalty = promptTemplate.PresencePenalty;

	const userId = page.params.userId;
	const editRoute = `/users/${userId}/bot-content/prompt-template/${id}/edit`;
	const viewRoute = `/users/${userId}/bot-content/prompt-template/${id}/view`;
	const promptsRoute = `/users/${userId}/bot-content/prompt-template`;

	const breadCrumbs = [
		{
			name: 'Prompt Template',
			path: promptsRoute
		},
		{
			name: 'View',
			path: viewRoute
		}
	];
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="mx-auto w-full px-6 py-4">
	<div class="form-headers">
		<h2 class="form-titles">View Prompt Template</h2>
		<a href={promptsRoute} class="cancel-btn">
			<Icon icon="material-symbols:close-rounded" />
		</a>
	</div>

	<table class="w-full">
				<tbody>
					<tr class="tables-row">
						<td class="table-label">Name</td>
						<td class="table-data">{name}</td>
					</tr>
					<tr class="tables-row">
						<td class="table-label">Description</td>
						<td class="table-data">{description}</td>
					</tr>

					<tr class="tables-row">
						<td class="table-label">Model</td>
						<td class="table-data">{model}</td>
					</tr>

					<tr class="tables-row">
						<td class="table-label">Prompt</td>
						<td class="table-data">{prompt}</td>
					</tr>

					<tr class="tables-row">
						<td class="table-label">Variables</td>
						<td class="table-data">{variable}</td>
					</tr>

					<tr class="tables-row">
						<td class="table-label">Use Case Type</td>
						<td class="table-data">{useCaseType}</td>
					</tr>
					<tr class="tables-row">
						<td class="table-label">Group</td>
						<td class="table-data">{group}</td>
					</tr>
					<tr class="tables-row">
						<td class="table-label">Temperature</td>
						<td class="table-data">{temperature}</td>
					</tr>
					<tr class="tables-row">
						<td class="table-label">Top P</td>
						<td class="table-data">{topP}</td>
					</tr>

					<tr class="tables-row">
						<td class="table-label">Frequency Penalty</td>
						<td class="table-data">{frequencyPenalty}</td>
					</tr>
					<tr class="tables-row">
						<td class="table-label">Presence Penalty</td>
						<td class="table-data">{presencePenalty}</td>
					</tr>
				</tbody>
			</table>
				<div class=" btn-container">
        			<Button href={editRoute} text="Edit" variant="primary" iconBefore="mdi:edit" iconSize="md"
        			></Button>
    			</div>
		</div>
