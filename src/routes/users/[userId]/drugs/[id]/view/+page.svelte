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

<div class="px-6 py-4">
	<div class="flex flex-wrap justify-end gap-2 py-2">
		<div class=" btn-container">
			<Button
				size="md"
				href={editRoute}
				text="Edit"
				variant="primary"
				iconBefore="mdi:edit"
				iconSize="md"
			></Button>
		</div>
	</div>
	<div class="mx-auto">
		<div class="table-container">
			<table class="table-c">
				<thead>
					<tr>
						<th>View Drug</th>
						<th class="text-end">
							<a href={drugRoute} class="cancel-btn">
								<Icon icon="material-symbols:close-rounded" />
							</a>
						</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Name</td>
						<td>{drugName}</td>
					</tr>
					<tr>
						<td>Generic Name</td>
						<td>{genericName}</td>
					</tr>
					<tr>
						<td>Ingredients</td>
						<td>{ingredients}</td>
					</tr>
					<tr>
						<td>Strength</td>
						<td>{strength}</td>
					</tr>
					<tr>
						<td>Commercial Name</td>
						<td>{commercialNames}</td>
					</tr>
					<tr>
						<td>Manufacture</td>
						<td>{manufacturer}</td>
					</tr>
					<tr>
						<td>Other Information</td>
						<td>{otherInformation}</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</div>
