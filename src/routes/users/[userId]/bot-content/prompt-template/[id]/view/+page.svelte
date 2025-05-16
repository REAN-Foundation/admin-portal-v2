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
	let content = data.promptTemplate.Content;
	let subgroup = data.promptTemplate.SubGroup;
	let type = data.promptTemplate.Type;
	let category = data.promptTemplate.Category;
	let variable = data.promptTemplate.Variables;
    console.log('variable', variable);
    
	let version = data.promptTemplate.Version;

	const userId = page.params.userId;
	const editRoute = `/users/${userId}/bot-content/prompt-template/${id}/edit`;
	const viewRoute = `/users/${userId}/bot-content/prompt-template/${id}/view`;
	const promptsRoute = `/users/${userId}/bot-content/prompt-template`;

	const breadCrumbs = [
		{
			name: 'Prompt-Template',
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
								<Icon icon="material-symbols:close-rounded"/>
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
						<td>Content</td>
						<td>{content}</td>
					</tr>

					<tr>
						<td>SubGroup</td>
						<td>{subgroup}</td>
					</tr>
					<tr>
						<td>Type</td>
						<td>{type}</td>
					</tr>
					<tr>
						<td>Category</td>
						<td>{category}</td>
					</tr>
					<tr>
						<td>Variable</td>
						<td>{variable}</td>
					</tr>

					<tr>
						<td>Version</td>
						<td>{version}</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</div>
