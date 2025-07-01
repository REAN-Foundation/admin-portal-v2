<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import Button from '$lib/components/button/button.svelte';
	import Label from '$lib/components/label/label.svelte';
	import Heading from '$lib/components/heading/heading.svelte';
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
	let careplanCategory = carePlan.Category.Type;

	console.log('careplan', carePlan);
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
<div class="mx-auto w-full px-6 py-4">
	<div class="form-headers">
		<Heading text="View Care Plan" />
		<a href={healthSystemRoute} class="cancel-btn">
			<Icon icon="material-symbols:close-rounded" />
		</a>
	</div>

	<table class="w-full">
		<tbody>
			<tr class="tables-row">
				<Label text="Name" />
				<td class="table-data">{carePlanName}</td>
			</tr>
			<tr class="tables-row">
				<Label text="Code" />
				<td class="table-data">{code}</td>
			</tr>
			<tr class="tables-row">
				<Label text="Category" />
				<td class="table-data">{careplanCategory}</td>
			</tr>
			<tr class="tables-row">
				<Label text="Description" />
				<td class="table-data">{description}</td>
			</tr>
			<tr class="tables-row">
				<Label text="Version" />
				<td class="table-data">{version}</td>
			</tr>
			<tr class="tables-row">
				<Label text="Tags" />
				<td class="table-data">
					{#if tags.length <= 0}
						<span>Tags not specified</span>
					{:else}
						<span>{tags}</span>
					{/if}
				</td>
			</tr>
		</tbody>
	</table>

	<div class="btn-container mt-4 flex flex-wrap justify-end gap-2">
		<Button onclick={exportCareplan} text="Export" variant="primary" size="md" />
		<Button href={schedulingRoute} text="Scheduling" variant="primary" size="md" />
		<Button
			href={editRoute}
			text="Edit"
			iconBefore="material-symbols:edit-outline"
			iconSize="md"
			variant="primary"
			size="md"
		/>
	</div>
</div>
