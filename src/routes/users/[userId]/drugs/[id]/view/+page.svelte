<script lang="ts">
	import { page } from '$app/stores';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import Button from '$lib/components/button/button.svelte';

	////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();
	let drug = $state(data.drug);
	let id = drug.id;
	let drugName = drug.DrugName;
	let genericName =
		drug.GenericName !== null && drug.GenericName !== '' ? drug.GenericName : 'Not specified';
	let ingredients =
		drug.Ingredients !== null && drug.Ingredients !== '' ? drug.Ingredients : 'Not specified';
	let strength = drug.Strength !== null && drug.Strength !== '' ? drug.Strength : 'Not specified';
	let commercialNames =
		drug.OtherCommercialNames !== null && drug.OtherCommercialNames !== ''
			? drug.OtherCommercialNames
			: 'Not specified';
	let manufacturer =
		drug.Manufacturer !== null && drug.Manufacturer !== '' ? drug.Manufacturer : 'Not specified';
	let otherInformation =
		drug.OtherInformation !== null && drug.OtherInformation !== ''
			? drug.OtherInformation
			: 'Not specified';

	const userId = $page.params.userId;
	const editRoute = `/users/${userId}/drugs/${id}/edit`;
	const viewRoute = `/users/${userId}/drugs/${id}/view`;
	const drugRoute = `/users/${userId}/drugs`;

	const breadCrumbs = [
		{
			name: 'Drugs',
			path: drugRoute
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
		<h2 class="form-titles">View Drug</h2>
		<a href={drugRoute} class="cancel-btn">
			<Icon icon="material-symbols:close-rounded" />
		</a>
	</div>
	<table class="w-full">
		<tbody>
			<tr class="tables-row">
				<td class="table-label">Name</td>
				<td class="table-data">{drugName}</td>
			</tr>
			<tr class="tables-row">
				<td class="table-label">Generic Name</td>
				<td class="table-data">{genericName}</td>
			</tr>
			<tr class="tables-row">
				<td class="table-label">Ingredients</td>
				<td class="table-data">{ingredients}</td>
			</tr>
			<tr class="tables-row">
				<td class="table-label">Strength</td>
				<td class="table-data">{strength}</td>
			</tr>
			<tr class="tables-row">
				<td class="table-label">Commercial Name</td>
				<td class="table-data">{commercialNames}</td>
			</tr>
			<tr class="tables-row">
				<td class="table-label">Manufacture</td>
				<td class="table-data">{manufacturer}</td>
			</tr>
			<tr class="tables-row">
				<td class="table-label">Other Information</td>
				<td class="table-data">{otherInformation}</td>
			</tr>
		</tbody>
	</table>
	<div class="btn-container">
		<Button
			size="md"
			href={editRoute}
			text="Edit"
			variant="primary"
			iconBefore="mdi:edit"
			iconSize="md"
		/>
	</div>
</div>
