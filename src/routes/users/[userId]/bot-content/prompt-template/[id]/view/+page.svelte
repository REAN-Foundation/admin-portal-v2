<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';

	////////////////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();

	let id = data.promptTemplate.id;
	let name = data.promptTemplate.Name;
	let description = data.promptTemplate.Description;
	let prompt = data.promptTemplate.Prompt;
	let model = data.promptTemplate.Model;
	let group = data.promptTemplate.Group;
	let useCaseType = data.promptTemplate.UseCaseType;
	let variable = data.promptTemplate.Variables;
	let temperature = data.promptTemplate.Temperature;
	let topP = data.promptTemplate.TopP;
	let frequencyPenalty = data.promptTemplate.FrequencyPenalty;
	let presencePenalty = data.promptTemplate.PresencePenalty;



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

<div class="px-6 py-4">
	<div class="flex flex-wrap justify-end gap-2 py-2">
		<a
			href={editRoute}
			class="health-system-btn variant-filled-secondary hover:!variant-soft-secondary"
		>
			<Icon icon="material-symbols:edit-outline" />
			<span>Edit</span>
		</a>
	</div>

	<div class="mx-auto">
		<div class="health-system-table-container">
			<table class="health-system-table">
				<thead>
					<tr>
						<th>View </th>
						<th class="text-end">
							<a href={promptsRoute} class="cancel-btn">
								<Icon icon="material-symbols:close-rounded" />
							</a>
						</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Name</td>
						<td>{name}</td>
					</tr>
					<tr>
						<td>Description</td>
						<td>{description}</td>
					</tr>

					<tr>
						<td>Model</td>
						<td>{model}</td>
					</tr>

					<tr>
						<td>Prompt</td>
						<td>{prompt}</td>
					</tr>

					<tr>
						<td>Variables</td>
						<td>{variable}</td>
					</tr>

					<tr>
						<td>Use Case Type</td>
						<td>{useCaseType}</td>
					</tr>
					<tr>
						<td>Group</td>
						<td>{group}</td>
					</tr>
					<tr>
						<td>Temperature</td>
						<td>{temperature}</td>
					</tr>
					<tr>
						<td>Top P</td>
						<td>{topP}</td>
					</tr>

					<tr>
						<td>Frequency Penalty</td>
						<td>{frequencyPenalty}</td>
					</tr>
					<tr>
						<td>Presence Penalty</td>
						<td>{presencePenalty}</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</div>
