<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import Button from '$lib/components/button/button.svelte';
	import Label from '$lib/components/label/label.svelte';
	import Heading from '$lib/components/heading/heading.svelte';

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
		<Heading text="View Prompt Template" />
		<a href={promptsRoute} class="cancel-btn">
			<Icon icon="material-symbols:close-rounded" />
		</a>
	</div>

	<table class="w-full">
		<tbody>
			<tr class="tables-row">
				<Label text="Name" />
				<td class="table-data">{name}</td>
			</tr>

			<tr class="tables-row">
				<Label text="Description" />
				<td class="table-data">{description}</td>
			</tr>

			<tr class="tables-row">
				<Label text="Model" />
				<td class="table-data">{model}</td>
			</tr>

			<tr class="tables-row">
				<Label text="Prompt" />
				<td class="table-data whitespace-pre-wrap">{prompt}</td>
			</tr>

			<tr class="tables-row">
				<Label text="Variables" />
				<td class="table-data">{variable}</td>
			</tr>

			<tr class="tables-row">
				<Label text="Use Case Type" />
				<td class="table-data">{useCaseType}</td>
			</tr>

			<tr class="tables-row">
				<Label text="Group" />
				<td class="table-data">{group}</td>
			</tr>

			<tr class="tables-row">
				<Label text="Temperature" />
				<td class="table-data">{temperature}</td>
			</tr>

			<tr class="tables-row">
				<Label text="Top P" />
				<td class="table-data">{topP}</td>
			</tr>

			<tr class="tables-row">
				<Label text="Frequency Penalty" />
				<td class="table-data">{frequencyPenalty}</td>
			</tr>

			<tr class="tables-row">
				<Label text="Presence Penalty" />
				<td class="table-data">{presencePenalty}</td>
			</tr>
		</tbody>
	</table>

	<div class="btn-container mt-4">
		<Button
			href={editRoute}
			text="Edit"
			variant="primary"
			iconBefore="material-symbols:edit-outline"
			iconSize="md"
			size="md"
		/>
	</div>
</div>
