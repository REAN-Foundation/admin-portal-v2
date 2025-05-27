<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';

	////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();

	const userId = page.params.userId;
	var carePlanId = page.params.careplanId;
	var sessionId = $state(data.sessionId);

	const editRoute = `/users/${userId}/careplan/careplans/${carePlanId}/edit`;
	const viewRoute = `/users/${userId}/careplan/careplans/${carePlanId}/view`;
	const healthSystemRoute = `/users/${userId}/careplan/careplans`;
	const schedulingRoute = `/users/${userId}/careplan/careplans/${carePlanId}/scheduling`;

	let carePlan = $state(data.carePlan);
	let carePlanName = carePlan.Name;
	let code = carePlan.Code;
	let description = carePlan.Description;
	let version = carePlan.Version;
	let tags_ = data.carePlan.Tags;
	let tags = tags_.join(', ');

	const breadCrumbs = [
		{
			name: 'Careplans',
			path: healthSystemRoute
		},
		{
			name: 'View',
			path: viewRoute
		}
	];

	async function exportCareplan() {
		const response = await fetch(`/api/server/careplan/export`, {
			method: 'POST',
			body: JSON.stringify({
				sessionId,
				carePlanId
			}),
			headers: { 'content-type': 'application/json' }
		});
		if (!response.ok) {
			throw new Error(`Failed to export care plan: ${response.statusText}`);
		}

		const filename = `Careplan_${code}.json`;
		const blob = await response.blob();
		const a = document.createElement('a');
		a.href = URL.createObjectURL(blob);
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-6 py-4">
	<div class="flex flex-wrap justify-end gap-2 py-2">
		<button
			onclick={exportCareplan}
			class="health-system-btn variant-filled-secondary hover:!variant-soft-secondary"
			>Export</button
		>
		<a
			href={schedulingRoute}
			class="health-system-btn variant-filled-secondary hover:!variant-soft-secondary"
		>
			<span>Scheduling</span>
		</a>
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
						<th>View Care Plan</th>
						<th class="text-end">
							<a href={healthSystemRoute} class=" cancel-btn">
								<Icon icon="material-symbols:close-rounded" class="" />
							</a>
						</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Name</td>
						<td>{carePlanName}</td>
					</tr>
					<tr>
						<td>Code</td>
						<td>{code}</td>
					</tr>
					<tr>
						<td>Description</td>
						<td>{description}</td>
					</tr>
					<tr>
						<td>Version</td>
						<td>{version}</td>
					</tr>
					<tr>
						<td>Tags</td>
						<td>
							{#if tags.length <= 0}
								<span class="span">Tags not specified</span>
							{:else}
								<span class="span">{tags}</span>
							{/if}
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</div>
